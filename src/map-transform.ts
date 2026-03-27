import type { Feature, Polygon } from "geojson";
import { booleanPointInPolygon, point, polygon } from "@turf/turf";
import { Transform } from "./transform.ts";
import { zoom2Radius, mercViewpoint2Mercs, mercs2MercViewpoint } from "./viewpoint.ts";
import { xy2SysCoord, sysCoord2Xy } from "./coord-utils.ts";
import type { MapData, Viewpoint } from "./types.ts";

/** Internal representation of a loaded sub-map TIN entry */
interface SubTinEntry {
  tin: Transform;
  priority: number;
  importance: number;
  xyBounds: Feature<Polygon>;
  mercBounds: Feature<Polygon>;
}

/** Tile size constant (same as MaplatCore) */
const TILE_SIZE = 256;

/**
 * MapTransform — 処理2・3・4を担う座標変換クラス
 *
 * - 処理2: submaps 属性を持つ地図で、複数 TIN のうちどれを適用するか判定・選択し座標変換
 * - 処理3: ビューポート ↔ メルカトル5点 変換
 * - 処理4: ビューポート ↔ TIN 適用後メルカトル5点 変換
 *
 * OpenLayers への依存ゼロ。ブラウザ・Node.js 両対応。
 */
export class MapTransform {
  private mainTin: Transform | null = null;
  private subTins: SubTinEntry[] = [];
  private _maxxy = 0;

  // ─── 初期化 ────────────────────────────────────────────────────────────────

  /**
   * 地図データ（コンパイル済み TIN + sub_maps）をロードする
   *
   * @param mapData - メイン TIN と sub_maps の情報
   */
  setMapData(mapData: MapData): void {
    // メイン TIN を構築
    const mainTin = new Transform();
    mainTin.setCompiled(mapData.compiled);
    this.mainTin = mainTin;

    // _maxxy を計算（maxZoom が指定されている場合）
    if (mapData.maxZoom !== undefined) {
      this._maxxy = Math.pow(2, mapData.maxZoom) * TILE_SIZE;
    }

    // sub_maps を構築
    this.subTins = [];
    if (mapData.sub_maps) {
      for (const subMapData of mapData.sub_maps) {
        const tin = new Transform();
        tin.setCompiled(subMapData.compiled);

        // bounds: SubMapData.bounds を優先し、なければ compiled.bounds を使用
        const rawBounds: number[][] | undefined =
          subMapData.bounds ?? subMapData.compiled.bounds;
        if (!rawBounds) {
          throw new Error(
            "SubMapData must have bounds or compiled.bounds to create xyBounds polygon"
          );
        }

        const xyBoundsCoords = [...rawBounds, rawBounds[0]];
        const mercBoundsCoords = xyBoundsCoords.map(xy => {
          const merc = tin.transform(xy, false);
          if (!merc) throw new Error("Failed to transform sub-map bounds to mercator");
          return merc;
        });

        this.subTins.push({
          tin,
          priority: subMapData.priority,
          importance: subMapData.importance,
          xyBounds: polygon([xyBoundsCoords]) as Feature<Polygon>,
          mercBounds: polygon([mercBoundsCoords]) as Feature<Polygon>
        });
      }
    }
  }

  // ─── 処理2: submap TIN 選択付き変換 ───────────────────────────────────────

  /**
   * ピクセル座標 → メルカトル座標（最適レイヤー選択）
   *
   * @param xy - ピクセル座標 [x, y]
   * @returns メルカトル座標、または範囲外の場合は false
   */
  xy2Merc(xy: number[]): number[] | false {
    const result = this.xy2MercWithLayer(xy);
    if (!result) return false;
    return result[1];
  }

  /**
   * メルカトル座標 → ピクセル座標（最適レイヤー選択）
   *
   * @param merc - メルカトル座標 [x, y]
   * @returns ピクセル座標、または範囲外の場合は false
   */
  merc2Xy(merc: number[]): number[] | false {
    const results = this.merc2XyWithLayer(merc);
    const first = results[0] || results[1];
    if (!first) return false;
    return first[1];
  }

  /**
   * ピクセル座標 → メルカトル座標（レイヤーID付き）
   * histmap_tin.ts xy2MercAsync_returnLayer() の同期版
   *
   * @param xy - ピクセル座標 [x, y]
   * @returns [レイヤーインデックス, メルカトル座標] または false
   */
  xy2MercWithLayer(xy: number[]): [number, number[]] | false {
    this._assertMapData();

    // priority 降順にソート（index 0 はメイン TIN）
    const tinSorted = this._getTinsSortedByPriority();

    for (let i = 0; i < tinSorted.length; i++) {
      const { index, isMain } = tinSorted[i];

      // メイン TIN（index 0）は常にマッチ、sub TIN はポリゴン内チェック
      if (isMain || booleanPointInPolygon(point(xy), this.subTins[index - 1].xyBounds)) {
        const merc = this._transformByIndex(xy, index, false);
        if (merc === false) continue;
        return [index, merc];
      }
    }
    return false;
  }

  /**
   * メルカトル座標 → ピクセル座標（複数レイヤー結果）
   * histmap_tin.ts merc2XyAsync_returnLayer() の同期版
   *
   * 現在は MaplatCore の仕様に合わせ、最大2レイヤーまで返す。
   * 3レイヤー以上返したい場合は、下記の .slice(0, 2) および .filter(i < 2) の
   * 上限値を増やすか、引数で上限を指定できるようにすること。
   *
   * @param merc - メルカトル座標 [x, y]
   * @returns 最大2要素の配列。各要素は [レイヤーインデックス, ピクセル座標] または undefined
   */
  merc2XyWithLayer(merc: number[]): ([number, number[]] | undefined)[] {
    this._assertMapData();

    // 全 TIN で逆変換を実行し、各結果が xyBounds 内かを確認
    const allTins = this._getAllTinsWithIndex();
    const rawResults: ([Transform, number, number[]] | [Transform, number])[] =
      allTins.map(({ index, tin, isMain }) => {
        const xy = this._transformByIndex(merc, index, true);
        if (xy === false) return [tin, index] as [Transform, number];
        // メイン TIN（index 0）は常に有効、sub TIN はポリゴン内チェック
        if (isMain || booleanPointInPolygon(point(xy), this.subTins[index - 1].xyBounds)) {
          return [tin, index, xy] as [Transform, number, number[]];
        }
        return [tin, index] as [Transform, number];
      });

    // priority 降順でソート
    const sorted = rawResults.sort((a, b) => {
      const priA = a[0].priority ?? 0;
      const priB = b[0].priority ?? 0;
      return priA < priB ? 1 : -1;
    });

    // importance と優先度で最大2レイヤーを選択
    const result = sorted.reduce(
      (
        ret: (undefined | [number, number[], Transform])[],
        current,
        priIndex,
        arry
      ) => {
        const tin = current[0];
        const index = current[1];
        const xy = current[2] as number[] | undefined;
        if (!xy) return ret;

        // より高優先レイヤーの xyBounds 内にあるか確認
        for (let i = 0; i < priIndex; i++) {
          const targetIndex = arry[i][1];
          const isTargetMain = targetIndex === 0;
          // 高優先 TIN が変換失敗している場合はスキップ
          if (!arry[i][2]) continue;
          if (
            isTargetMain ||
            booleanPointInPolygon(point(xy), this.subTins[targetIndex - 1].xyBounds)
          ) {
            if (ret.length) {
              const hide = !ret[0];
              const storedTin = hide ? ret[1]![2] : ret[0]![2];
              const tinImportance = tin.importance ?? 0;
              const storedImportance = storedTin.importance ?? 0;
              if (!hide) {
                // visible な stored TIN が既に存在 → current を 2番目要素として追加
                const visible = ret.filter(
                  (r): r is [number, number[], Transform] => r !== undefined
                );
                const newRet = [...visible, [index, xy, tin] as [number, number[], Transform]];
                return newRet
                  .sort((a, b) =>
                    (a[2].importance ?? 0) < (b[2].importance ?? 0) ? 1 : -1
                  )
                  .slice(0, 2) as (undefined | [number, number[], Transform])[]; // 上限を増やす場合はここも変更
              } else if (tinImportance < storedImportance) {
                return ret;
              } else {
                return [undefined, [index, xy, tin]] as (undefined | [number, number[], Transform])[];
              }
            } else {
              // ret が空なのに xyBounds 内 → 高優先 TIN が変換失敗しているだけ → visible として追加
              return [[index, xy, tin]] as (undefined | [number, number[], Transform])[];
            }
          }
        }

        if (!ret.length || !ret[0]) {
          return [[index, xy, tin]] as (undefined | [number, number[], Transform])[];
        } else {
          ret.push([index, xy, tin]);
          return ret
            .sort((a, b) => {
              const impA = a![2].importance ?? 0;
              const impB = b![2].importance ?? 0;
              return impA < impB ? 1 : -1;
            })
            .filter((_row, i) => i < 2); // 上限を増やす場合はここも変更（例: i < 3）
        }
      },
      []
    );

    return result.map(row => {
      if (!row) return undefined;
      return [row[0], row[1]] as [number, number[]];
    });
  }

  /**
   * メルカトル5点 → システム座標（複数レイヤー）
   * histmap_tin.ts mercs2SysCoordsAsync_multiLayer() の同期版
   *
   * @param mercs - 5点のメルカトル座標配列（中心＋上下左右）
   * @returns 各レイヤーのシステム座標配列（または undefined）
   */
  mercs2SysCoords(mercs: number[][]): (number[][] | undefined)[] {
    this._assertMapData();
    const centerResults = this.merc2XyWithLayer(mercs[0]);

    let hide = false;
    return centerResults.map((result, i) => {
      if (!result) {
        hide = true;
        return undefined;
      }
      const index = result[0];
      const centerXy = result[1];

      if (i !== 0 && !hide) return [this.xy2SysCoordInternal(centerXy)];

      const xys = mercs.map((merc, j) => {
        if (j === 0) return centerXy;
        return this._transformByIndex(merc, index, true) as number[];
      });
      return xys.map(xy => this.xy2SysCoordInternal(xy));
    });
  }

  // ─── 処理3: ビューポート変換 ───────────────────────────────────────────────

  /**
   * ビューポート → TIN 適用後メルカトル5点
   * histmap_tin.ts viewpoint2MercsAsync() の同期版
   *
   * @param viewpoint - ビューポート（center, zoom, rotation）
   * @param size - 画面サイズ [width, height]
   * @returns TIN 変換後のメルカトル5点
   */
  viewpoint2Mercs(viewpoint: Viewpoint, size: [number, number]): number[][] {
    this._assertMapData();
    this._assertMaxxy();

    // ビューポート → メルカトル5点（処理3の純粋関数）
    const mercs = mercViewpoint2Mercs(viewpoint.center, viewpoint.zoom, viewpoint.rotation, size);

    // メルカトル → ピクセル座標（sysCoord2Xy）
    const xys = mercs.map(merc => sysCoord2Xy(merc, this._maxxy));

    // ピクセル中心 → TIN 変換 → メルカトル中心
    const centerResult = this.xy2MercWithLayer(xys[0]);
    if (!centerResult) throw new Error("viewpoint2Mercs: center point is out of bounds");

    const centerIndex = centerResult[0];
    const centerMerc = centerResult[1];

    // 残り4点を同じレイヤーで変換
    const resultMercs: number[][] = xys.map((xy, i) => {
      if (i === 0) return centerMerc;
      const merc = this._transformByIndex(xy, centerIndex, false);
      if (merc === false) throw new Error(`viewpoint2Mercs: point ${i} is out of bounds`);
      return merc;
    });

    return resultMercs;
  }

  /**
   * TIN 適用後メルカトル5点 → ビューポート
   * histmap_tin.ts mercs2ViewpointAsync() の同期版
   *
   * @param mercs - TIN 変換後のメルカトル5点
   * @param size - 画面サイズ [width, height]
   * @returns ビューポート（center, zoom, rotation）
   */
  mercs2Viewpoint(mercs: number[][], size: [number, number]): Viewpoint {
    this._assertMapData();
    this._assertMaxxy();

    // メルカトル中心 → TIN 逆変換 → ピクセル中心
    const centerResults = this.merc2XyWithLayer(mercs[0]);
    const result = centerResults[0] || centerResults[1];
    if (!result) throw new Error("mercs2Viewpoint: center point is out of bounds");

    const centerIndex = result[0];
    const centerXy = result[1];

    // 残り4点を同じレイヤーで TIN 逆変換
    const xys: number[][] = mercs.map((merc, i) => {
      if (i === 0) return centerXy;
      const xy = this._transformByIndex(merc, centerIndex, true);
      if (xy === false) throw new Error(`mercs2Viewpoint: point ${i} is out of bounds`);
      return xy;
    });

    // ピクセル → システム座標（xy2SysCoord）
    const sysCoords = xys.map(xy => xy2SysCoord(xy, this._maxxy));

    // システム座標5点 → ビューポート（mercs2MercViewpoint）
    return mercs2MercViewpoint(sysCoords, size);
  }

  // ─── ユーティリティ（静的メソッド）────────────────────────────────────────

  /** zoom2Radius の静的ラッパー */
  static zoom2Radius(size: [number, number], zoom: number): number {
    return zoom2Radius(size, zoom);
  }

  /** mercViewpoint2Mercs の静的ラッパー */
  static mercViewpoint2Mercs(
    center: number[],
    zoom: number,
    rotation: number,
    size: [number, number]
  ): number[][] {
    return mercViewpoint2Mercs(center, zoom, rotation, size);
  }

  /** mercs2MercViewpoint の静的ラッパー */
  static mercs2MercViewpoint(mercs: number[][], size: [number, number]): Viewpoint {
    return mercs2MercViewpoint(mercs, size);
  }

  /** xy2SysCoord の静的ラッパー */
  static xy2SysCoord(xy: number[], maxxy: number): number[] {
    return xy2SysCoord(xy, maxxy);
  }

  /** sysCoord2Xy の静的ラッパー */
  static sysCoord2Xy(sysCoord: number[], maxxy: number): number[] {
    return sysCoord2Xy(sysCoord, maxxy);
  }

  // ─── 内部ヘルパー ──────────────────────────────────────────────────────────

  private _assertMapData(): void {
    if (!this.mainTin) {
      throw new Error("setMapData() must be called before transformation");
    }
  }

  private _assertMaxxy(): void {
    if (this._maxxy === 0) {
      throw new Error(
        "MapData.maxZoom must be set for viewpoint conversion (xy2SysCoord / sysCoord2Xy)"
      );
    }
  }

  /** priority 降順でソートした [index, tin, isMain] の配列を返す */
  private _getTinsSortedByPriority(): { index: number; tin: Transform; isMain: boolean }[] {
    const all = this._getAllTinsWithIndex();
    return all.sort((a, b) => {
      const priA = a.tin.priority ?? 0;
      const priB = b.tin.priority ?? 0;
      return priA < priB ? 1 : -1;
    });
  }

  /** メイン TIN + 全 sub TIN を index 付きで返す */
  private _getAllTinsWithIndex(): { index: number; tin: Transform; isMain: boolean }[] {
    const result: { index: number; tin: Transform; isMain: boolean }[] = [
      { index: 0, tin: this.mainTin!, isMain: true }
    ];
    this.subTins.forEach((entry, i) => {
      // priority/importance を Transform インスタンスに反映（ソート・比較に使用）
      entry.tin.priority = entry.priority;
      entry.tin.importance = entry.importance;
      result.push({ index: i + 1, tin: entry.tin, isMain: false });
    });
    return result;
  }

  /**
   * 指定レイヤーインデックスで TIN 変換を実行する
   * index 0 → mainTin, index 1..n → subTins[index-1]
   */
  private _transformByIndex(
    coord: number[],
    index: number,
    backward: boolean
  ): number[] | false {
    if (index === 0) {
      return this.mainTin!.transform(coord, backward);
    }
    const subEntry = this.subTins[index - 1];
    if (!subEntry) return false;
    return subEntry.tin.transform(coord, backward, true);
  }

  /** 内部用 xy2SysCoord（_maxxy を使用） */
  private xy2SysCoordInternal(xy: number[]): number[] {
    return xy2SysCoord(xy, this._maxxy);
  }
}
