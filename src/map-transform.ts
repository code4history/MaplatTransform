import type { Feature, Polygon } from "geojson";
import { booleanPointInPolygon, point, polygon } from "@turf/turf";
import { Transform } from "./transform.ts";
import { zoom2Radius, mercViewpoint2Mercs, mercs2MercViewpoint, wrapAngle } from "./viewpoint.ts";
import { xy2SysCoord, sysCoord2Xy } from "./coord-utils.ts";
import { WorldFileSurface } from "./world-file-surface.ts";
import {
  builtinProjectionEngine, crsToMercator, layerCheckPoints, mercatorToCrs, validateLayerCrs
} from "./projection.ts";
import { deriveStrictStatus } from "./compiled-state.ts";
import {
  ViewpointField, classifyStrictness, paperRectOf, probeCoefficients
} from "./viewpoint-field.ts";
import type { LayerStrictness } from "./viewpoint-field.ts";
import { MERC_MAX } from "./constants.ts";
import type {
  CrsObject, LayerSurfaceData, LayeredMapData, MapData, ProjectionEngine, SurfaceLike,
  TinSurfaceData, Viewpoint, ViewpointCoefficients, ViewpointMode
} from "./types.ts";

/** Internal representation of a loaded sub-map TIN entry */
interface SubTinEntry {
  tin: SurfaceLike;
  priority: number;
  importance: number;
  xyBounds: Feature<Polygon>;
  mercBounds: Feature<Polygon>;
}

/** ViewpointField 遅延構築用の層メタデータ */
interface LayerFieldMeta {
  strictness: LayerStrictness;
  /** 副層の bounds（紙側基準矩形の上書き） */
  rectOverride?: number[][];
  /** 副層の bounds 多角形（G_in の ∩ subMap.bounds） */
  regionPolygon?: Feature<Polygon>;
}

function validateTinCrs(
  tin: Transform,
  crs: CrsObject,
  engine: ProjectionEngine,
  bounds: number[][] | undefined,
  toCrs: (coord: number[]) => number[] | false
): void {
  validateLayerCrs(crs, engine, () => {
    const extent = bounds ?? tin.bounds ?? (!tin.wh ? tin.points.map(([xy]) => xy) : undefined);
    const stateFull = tin.stateFull;
    tin.stateFull = false;
    try {
      return layerCheckPoints(tin.wh, tin.xy, extent).map(xy => {
        const coord = toCrs(xy);
        if (coord === false) throw new Error("epsg と proj4 の照合点を三角網で変換できません");
        return coord;
      });
    } finally {
      tin.stateFull = stateFull;
    }
  });
}

/** 三角網の出力と Web メルカトルの間に投影を挟む */
class ProjectedTinSurface extends Transform {
  private readonly layerBounds?: number[][];

  constructor(
    data: TinSurfaceData,
    private readonly crs: CrsObject,
    private readonly projectionEngine: ProjectionEngine
  ) {
    super();
    this.layerBounds = data.bounds;
    this.setCompiled(data.compiled);
  }

  protected override validateCompiledProjection(): void {
    validateTinCrs(this, this.crs, this.projectionEngine, this.layerBounds, xy =>
      super.transform(xy, false, true)
    );
    this.stateTriangle = undefined;
  }

  override transform(coord: number[], backward?: boolean, ignoreBounds?: boolean): number[] | false {
    if (backward) {
      const inCrs = mercatorToCrs(coord, this.crs, this.projectionEngine);
      return inCrs === false ? false : super.transform(inCrs, backward, ignoreBounds);
    }
    const inCrs = super.transform(coord, backward, ignoreBounds);
    return inCrs === false ? false : crsToMercator(inCrs, this.crs, this.projectionEngine);
  }
}

/** Tile size constant (same as MaplatCore) */
const TILE_SIZE = 256;

/** TIN と world file の変換面を混在させて 1 層分の surface を作る */
export function createLayerSurface(data: LayerSurfaceData): SurfaceLike {
  if (data.kind === "worldFile") return new WorldFileSurface(data);
  if ("crs" in data && data.crs === null) throw new Error("三角網の層の CRS は null にできません");
  const crs = data.crs;
  const engine = data.projectionEngine ?? builtinProjectionEngine;
  if (crs !== undefined && crs.epsg !== 3857) return new ProjectedTinSurface(data, crs, engine);
  const transform = new Transform();
  transform.setCompiled(data.compiled);
  if (crs !== undefined) {
    validateTinCrs(transform, crs, engine, data.bounds, xy => transform.transform(xy, false, true));
  }
  return transform;
}

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
  private mainTin: SurfaceLike | null = null;
  private subTins: SubTinEntry[] = [];
  private _maxxy = 0;
  /** 視点変換モード（地図全体で共通。未指定は "grid"） */
  private _viewpointMode: ViewpointMode = "grid";
  /** 層ごとの ViewpointField 遅延構築スロット（§2.3。読み込み時には作らない） */
  private _fields: (ViewpointField | undefined)[] = [];
  private _layerMetas: LayerFieldMeta[] = [];

  // ─── 初期化 ────────────────────────────────────────────────────────────────

  /**
   * 地図データ（コンパイル済み TIN + sub_maps）をロードする
   *
   * @param mapData - メイン TIN と sub_maps の情報
   */
  setMapData(mapData: MapData): void {
    // 既定 API は従来の構築順と例外順を保つ。途中で例外が出ても古い格子を残さない。
    this._fields = [];
    this._layerMetas = [];
    const mainTin = new Transform();
    mainTin.setCompiled(mapData.compiled);
    this.mainTin = mainTin;
    if (mapData.maxZoom !== undefined) {
      this._maxxy = Math.pow(2, mapData.maxZoom) * TILE_SIZE;
    } else if (mapData.compiled.wh) {
      const maxDim = Math.max(mapData.compiled.wh[0], mapData.compiled.wh[1]);
      const maxZoom = Math.ceil(Math.log2(maxDim / TILE_SIZE));
      this._maxxy = Math.pow(2, maxZoom) * TILE_SIZE;
    }
    this.subTins = [];
    const layerMetas: LayerFieldMeta[] = [
      { strictness: classifyStrictness(mainTin, deriveStrictStatus(mapData.compiled)) }
    ];
    if (mapData.sub_maps) {
      for (const subMapData of mapData.sub_maps) {
        const tin = new Transform();
        tin.setCompiled(subMapData.compiled);
        const rawBounds = subMapData.bounds ?? subMapData.compiled.bounds;
        if (!rawBounds) throw new Error("SubMapData must have bounds or compiled.bounds to create xyBounds polygon");
        const xyBoundsCoords = [...rawBounds, rawBounds[0]];
        const mercBoundsCoords = xyBoundsCoords.map(xy => {
          const merc = tin.transform(xy, false);
          if (!merc) throw new Error("Failed to transform sub-map bounds to mercator");
          return merc;
        });
        const xyBounds = polygon([xyBoundsCoords]) as Feature<Polygon>;
        this.subTins.push({
          tin,
          priority: subMapData.priority,
          importance: subMapData.importance,
          xyBounds,
          mercBounds: polygon([mercBoundsCoords]) as Feature<Polygon>
        });
        layerMetas.push({
          strictness: classifyStrictness(tin, deriveStrictStatus(subMapData.compiled)),
          rectOverride: rawBounds,
          regionPolygon: xyBounds
        });
      }
    }
    this._layerMetas = layerMetas;
    this._viewpointMode = mapData.viewpointMode ?? "grid";
    this._fields = [];
  }

  /** TIN と world file の変換面を混在させて読み込む */
  setLayeredMapData(mapData: LayeredMapData): void {
    // 途中で例外が出ても古い格子を残さない（setMapData と同じ）
    this._fields = [];
    this._layerMetas = [];
    const mainTin = createLayerSurface(mapData.main);
    if (mapData.main.priority !== undefined) mainTin.priority = mapData.main.priority;
    if (mapData.main.importance !== undefined) mainTin.importance = mapData.main.importance;
    const mainWh = mapData.main.kind === "tin" ? mapData.main.compiled.wh : mainTin.wh;
    let maxxy = this._maxxy;
    if (mapData.maxZoom !== undefined) {
      maxxy = Math.pow(2, mapData.maxZoom) * TILE_SIZE;
    } else if (mainWh) {
      const maxDim = Math.max(mainWh[0], mainWh[1]);
      const maxZoom = Math.ceil(Math.log2(maxDim / TILE_SIZE));
      maxxy = Math.pow(2, maxZoom) * TILE_SIZE;
    }

    const subTins: SubTinEntry[] = [];
    const layerMetas: LayerFieldMeta[] = [
      {
        strictness: classifyStrictness(
          mainTin,
          mapData.main.kind === "tin" ? deriveStrictStatus(mapData.main.compiled) : undefined
        )
      }
    ];
    for (const subMapData of mapData.sub_maps ?? []) {
      const surface = createLayerSurface(subMapData);
      const rawBounds = subMapData.bounds ?? (subMapData.kind === "tin" ? subMapData.compiled.bounds : undefined);
      if (!rawBounds) throw new Error("副層には bounds または compiled.bounds が必要です");
      const xyBoundsCoords = [...rawBounds, rawBounds[0]];
      const mercBoundsCoords = xyBoundsCoords.map(xy => {
        const merc = surface.transform(xy, false);
        if (!merc) throw new Error("副層の bounds をメルカトル座標へ変換できません");
        return merc;
      });
      const xyBounds = polygon([xyBoundsCoords]) as Feature<Polygon>;
      subTins.push({
        tin: surface,
        priority: subMapData.priority ?? 0,
        importance: subMapData.importance ?? 0,
        xyBounds,
        mercBounds: polygon([mercBoundsCoords]) as Feature<Polygon>
      });
      layerMetas.push({
        strictness: classifyStrictness(
          surface,
          subMapData.kind === "tin" ? deriveStrictStatus(subMapData.compiled) : undefined
        ),
        rectOverride: rawBounds,
        regionPolygon: xyBounds
      });
    }
    this.mainTin = mainTin;
    this.subTins = subTins;
    this._maxxy = maxxy;
    this._layerMetas = layerMetas;
    this._viewpointMode = mapData.viewpointMode ?? "grid";
    this._fields = [];
  }

  /** 読み込み時の地図全体の視点変換モード（未指定は "grid"） */
  get viewpointMode(): ViewpointMode {
    return this._viewpointMode;
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
    const rawResults: ([SurfaceLike, number, number[]] | [SurfaceLike, number])[] =
      allTins.map(({ index, tin, isMain }) => {
        const xy = this._transformByIndex(merc, index, true);
        if (xy === false) return [tin, index] as [SurfaceLike, number];
        // メイン TIN（index 0）は常に有効、sub TIN はポリゴン内チェック
        if (isMain || booleanPointInPolygon(point(xy), this.subTins[index - 1].xyBounds)) {
          return [tin, index, xy] as [SurfaceLike, number, number[]];
        }
        return [tin, index] as [SurfaceLike, number];
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
        ret: (undefined | [number, number[], SurfaceLike])[],
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
                  (r): r is [number, number[], SurfaceLike] => r !== undefined
                );
                const newRet = [...visible, [index, xy, tin] as [number, number[], SurfaceLike]];
                return newRet
                  .sort((a, b) =>
                    (a[2].importance ?? 0) < (b[2].importance ?? 0) ? 1 : -1
                  )
                  .slice(0, 2) as (undefined | [number, number[], SurfaceLike])[]; // 上限を増やす場合はここも変更
              } else if (tinImportance < storedImportance) {
                return ret;
              } else {
                return [undefined, [index, xy, tin]] as (undefined | [number, number[], SurfaceLike])[];
              }
            } else {
              // ret が空なのに xyBounds 内 → 高優先 TIN が変換失敗しているだけ → visible として追加
              return [[index, xy, tin]] as (undefined | [number, number[], SurfaceLike])[];
            }
          }
        }

        if (!ret.length || !ret[0]) {
          return [[index, xy, tin]] as (undefined | [number, number[], SurfaceLike])[];
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
   * メルカトル座標 → 覆われていない対応層の一覧（GPS / POI の表示候補用）
   *
   * `merc2XyWithLayer` は視点換算・一般座標変換用で、本図を常に候補に含める。
   * GPS マーカー・POI ピンをどの層に描くかの判定には本メソッドを使う（MaplatTransform#9）。
   *
   * 1. 各層の TIN で逆変換し、sub_map は自身の `xyBounds` 内に入るものだけを対応層とする。
   *    本図（層 0）は紙の内外を判定せず常に対応層の候補とする（紙外の除外は呼び出し側が行う）
   * 2. 対応層の座標が、より priority の高い sub_map の `xyBounds` 内なら覆われている。
   *    その高 priority 層自身が当該地点に対応するかは関係しない。
   *    本図と sub_map がともに priority 0 の場合も、本図はその sub_map の `xyBounds` 内で覆われている
   * 3. 同じ priority の sub_map どうしは互いを覆わない
   * 4. 覆われていない対応層を importance 降順 → priority 降順 → 層番号昇順で並べ、上限を切らずに全件返す
   * 5. 覆われていない対応層が無ければ空配列（表現範囲外）。`undefined`（旧 hide 表現）は返さない
   *
   * @param merc - メルカトル座標 [x, y]
   * @returns [レイヤーインデックス, ピクセル座標] の配列（0 件以上・上限なし）
   */
  merc2XyVisibleLayers(merc: number[]): [number, number[]][] {
    this._assertMapData();

    const allTins = this._getAllTinsWithIndex();
    const prio = (index: number): number =>
      (index === 0 ? this.mainTin?.priority : this.subTins[index - 1].priority) ?? 0;
    const imp = (index: number): number =>
      (index === 0 ? this.mainTin?.importance : this.subTins[index - 1].importance) ?? 0;
    const inBounds = (index: number, xy: number[]): boolean =>
      index === 0 || booleanPointInPolygon(point(xy), this.subTins[index - 1].xyBounds);

    // 規則 1: 対応層
    const hits: { index: number; xy: number[] }[] = [];
    for (const { index } of allTins) {
      const xy = this._transformByIndex(merc, index, true);
      if (xy !== false && inBounds(index, xy)) hits.push({ index, xy });
    }

    // 規則 2・3: より priority の高い sub_map の枠の中なら覆われている（その層の対応は問わない）
    const isCovered = (hit: { index: number; xy: number[] }): boolean =>
      allTins.some(
        ({ index }) =>
          index !== 0 &&
          index !== hit.index &&
          (prio(index) > prio(hit.index) || (hit.index === 0 && prio(0) === 0 && prio(index) === 0)) &&
          inBounds(index, hit.xy)
      );

    // 規則 4・5: 一貫した比較器で並べ、上限を切らずに返す
    return hits
      .filter(hit => !isCovered(hit))
      .sort((a, b) => imp(b.index) - imp(a.index) || prio(b.index) - prio(a.index) || a.index - b.index)
      .map(hit => [hit.index, hit.xy] as [number, number[]]);
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
   * 中心と ViewpointField から理想相似 5 点をエンコードする（§7.1）。
   * 周囲 4 点の幾何は中心と同じ層の格子からだけ決める。
   *
   * @param viewpoint - ビューポート（center, zoom, rotation）
   * @param size - 画面サイズ [width, height]
   * @param layerIndex - 層番号（省略時は従来の層選択。指定時は範囲判定なしでその層を使い、範囲外は格子端へ clamp）
   * @returns TIN 変換後のメルカトル5点
   */
  viewpoint2Mercs(viewpoint: Viewpoint, size: [number, number], layerIndex?: number): number[][] {
    this._assertMapData();
    this._assertMaxxy();

    const c_xy = sysCoord2Xy(viewpoint.center, this._maxxy);
    let layerIdx: number;
    let c_merc: number[];
    if (layerIndex !== undefined) {
      this._assertLayerIndex(layerIndex, "viewpoint2Mercs");
      const surface = this.getSurfaceTransform(layerIndex)!;
      const transformed = surface.transform(c_xy, false, true);
      if (!transformed) {
        throw new Error(`viewpoint2Mercs: layer ${layerIndex} transform failed`);
      }
      layerIdx = layerIndex;
      c_merc = transformed;
    } else {
      const centerResult = this.xy2MercWithLayer(c_xy);
      if (!centerResult) throw new Error("viewpoint2Mercs: center point is out of bounds");
      [layerIdx, c_merc] = centerResult;
    }

    const { s, theta } = this._evalViewpointCoefficients(layerIdx, c_xy, c_merc, false);
    const alphaSys = (2 * MERC_MAX) / this._maxxy;
    const z_merc = viewpoint.zoom + Math.log2(alphaSys / s);
    const theta_merc = viewpoint.rotation + theta;

    return mercViewpoint2Mercs(c_merc, z_merc, theta_merc, size);
  }

  /**
   * TIN 適用後メルカトル5点 → ビューポート
   * histmap_tin.ts mercs2ViewpointAsync() の同期版
   *
   * 5 点を理想相似としてデコードし、中心と ViewpointField から復元する（§7.1）。
   *
   * @param mercs - TIN 適用後メルカトル5点
   * @param size - 画面サイズ [width, height]
   * @param layerIndex - 層番号（省略時は従来の層選択。指定時は範囲判定なしでその層を使い、範囲外は格子端へ clamp）
   * @returns ビューポート（center, zoom, rotation）
   */
  mercs2Viewpoint(mercs: number[][], size: [number, number], layerIndex?: number): Viewpoint {
    this._assertMapData();
    this._assertMaxxy();

    const mercVp = mercs2MercViewpoint(mercs, size);
    let layerIdx: number;
    let c_xy: number[];
    if (layerIndex !== undefined) {
      this._assertLayerIndex(layerIndex, "mercs2Viewpoint");
      const surface = this.getSurfaceTransform(layerIndex)!;
      const transformed = surface.transform(mercVp.center, true, true);
      if (!transformed) {
        throw new Error(`mercs2Viewpoint: layer ${layerIndex} transform failed`);
      }
      layerIdx = layerIndex;
      c_xy = transformed;
    } else {
      const centerResults = this.merc2XyWithLayer(mercVp.center);
      const result = centerResults[0] || centerResults[1];
      if (!result) throw new Error("mercs2Viewpoint: center point is out of bounds");
      [layerIdx, c_xy] = result;
    }

    const { s, theta } = this._evalViewpointCoefficients(layerIdx, c_xy, mercVp.center, true);
    const alphaSys = (2 * MERC_MAX) / this._maxxy;
    return {
      center: xy2SysCoord(c_xy, this._maxxy),
      zoom: mercVp.zoom - Math.log2(alphaSys / s),
      rotation: wrapAngle(mercVp.rotation - theta)
    };
  }

  /**
   * 層番号を指定して、その層の視点係数 (s, θ) を引く公開 API（§7.1 補助メソッド・M-5）。
   * デバッグ・単体試験・`setupMapParameter` 等から、層を 1 つに固定して
   * 中心 1 点の縮尺・向きを問い合わせるために使う。
   *
   * @param layerIndex - 0 = 本図、1 以上 = sub_maps[layerIndex - 1]。範囲外番号・非整数は例外
   * @param coord - 問い合わせ座標（direction が "xy2Merc" なら紙座標、"merc2Xy" ならメルカトル座標）
   * @param direction - "xy2Merc"（既定）= 紙 → 地理の係数参照、"merc2Xy" = 地理 → 紙
   * @returns 視点係数（s: 縮尺比 [3857 単位 / 地図画素]、theta: 局所回転角 [rad]）
   */
  getViewpointCoefficients(
    layerIndex: number,
    coord: number[],
    direction: "xy2Merc" | "merc2Xy" = "xy2Merc"
  ): ViewpointCoefficients {
    this._assertMapData();
    this._assertLayerIndex(layerIndex, "getViewpointCoefficients");
    const surface = this.getSurfaceTransform(layerIndex)!;
    if (direction === "xy2Merc") {
      const c_merc = surface.transform(coord, false, true);
      if (!c_merc) throw new Error("getViewpointCoefficients: transform failed");
      return this._evalViewpointCoefficients(layerIndex, coord, c_merc, false);
    }
    const c_xy = surface.transform(coord, true, true);
    if (!c_xy) throw new Error("getViewpointCoefficients: transform failed");
    return this._evalViewpointCoefficients(layerIndex, c_xy, coord, true);
  }

  /**
   * Core の既定ズーム（mercZoom が無い地図）のための口（§7.2 OQ-3）。
   * モード 2 では格子を作らずに紙の中心で測る: その層の面で紙の xy の十字 4 点
   * （半径 radiusPx、ignoreBounds = true）を測り、§1.2 の式で (s, theta) を返すだけ。
   * 視点グリッド（ViewpointField）は作らない（既存の probeCoefficients を使う）。
   *
   * @param layerIndex - 0 = 本図、1 以上 = sub_maps[layerIndex - 1]。範囲外番号・非整数は例外
   * @param xy - 紙座標（十字 4 点の中心）
   * @param radiusPx - 十字 4 点の半径（紙の画素単位。Core の既定値は 150）
   * @returns 視点係数（s: 縮尺比 [3857 単位 / 地図画素]、theta: 局所回転角 [rad]）
   */
  probeViewpointCoefficients(
    layerIndex: number,
    xy: [number, number],
    radiusPx: number
  ): { s: number; theta: number } {
    this._assertMapData();
    this._assertLayerIndex(layerIndex, "probeViewpointCoefficients");
    const surface = this.getSurfaceTransform(layerIndex)!;
    const coef = probeCoefficients(surface, xy, radiusPx, false);
    if (!coef) {
      throw new Error(
        `probeViewpointCoefficients: layer ${layerIndex} probe failed at [${xy[0]}, ${xy[1]}]`
      );
    }
    return coef;
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
        "MapData.maxZoom or compiled.wh must be set for viewpoint conversion (xy2SysCoord / sysCoord2Xy)"
      );
    }
  }

  /** 層番号の明示指定の検査（範囲外番号・負数・非整数は例外、§4.2 2.） */
  private _assertLayerIndex(layerIndex: number, fnName: string): void {
    if (!Number.isInteger(layerIndex) || layerIndex < 0 || layerIndex >= this.layerCount) {
      throw new Error(`${fnName}: invalid layerIndex ${layerIndex}`);
    }
  }

  /** 層の ViewpointField を遅延構築して返す（§2.3。読み込み時には作らない） */
  private _fieldFor(layerIndex: number): ViewpointField {
    const cached = this._fields[layerIndex];
    if (cached) return cached;
    const surface = this.getSurfaceTransform(layerIndex);
    if (!surface) throw new Error(`invalid layerIndex ${layerIndex}`);
    const meta = this._layerMetas[layerIndex];
    const field = ViewpointField.build({
      surface,
      mode: this._viewpointMode === "constant" ? "constant" : "grid",
      strictness: meta.strictness,
      paperRect: meta.rectOverride ? paperRectOf(surface, meta.rectOverride) : undefined,
      regionPolygon: meta.regionPolygon
    });
    this._fields[layerIndex] = field;
    return field;
  }

  /** 中心 1 点の視点係数を層の ViewpointField から引く */
  private _evalViewpointCoefficients(
    layerIndex: number,
    c_xy: number[],
    c_merc: number[],
    backward: boolean
  ): ViewpointCoefficients {
    return this._fieldFor(layerIndex).eval(c_xy, c_merc, backward);
  }

  /**
   * レイヤーインデックスに対応する Transform インスタンスを返す（三角網描画などの用途）
   *
   * @param idx - 0 = メイン TIN、1以上 = sub_maps[idx-1]
   * @returns 対応する Transform、または範囲外の場合は null
   */
  getLayerTransform(idx: number): Transform | null {
    if (idx === 0) return this.mainTin instanceof Transform ? this.mainTin : null;
    const sub = this.subTins[idx - 1];
    return sub?.tin instanceof Transform ? sub.tin : null;
  }

  /**
   * レイヤーインデックスに対応する変換面を返す。
   * 返した面を外で差し替えたら、地図を読み込み直すこと（視点の格子は作り直されない）。
   */
  getSurfaceTransform(idx: number): SurfaceLike | null {
    if (idx === 0) return this.mainTin;
    return this.subTins[idx - 1]?.tin ?? null;
  }

  /** レイヤー数を返す（メイン + sub 数） */
  get layerCount(): number {
    return 1 + this.subTins.length;
  }

  /**
   * viewpoint 変換に使用する最大ピクセル幅（2^maxZoom × 256）
   * stateToViewpoint / viewpointToState で zoom ↔ scale 変換に使用する
   * zoom = log2(scale × maxxy / 256) の関係
   */
  get maxxy(): number {
    return this._maxxy;
  }

  /** priority 降順でソートした [index, tin, isMain] の配列を返す */
  private _getTinsSortedByPriority(): { index: number; tin: SurfaceLike; isMain: boolean }[] {
    const all = this._getAllTinsWithIndex();
    return all.sort((a, b) => {
      const priA = a.tin.priority ?? 0;
      const priB = b.tin.priority ?? 0;
      return priA < priB ? 1 : -1;
    });
  }

  /** メイン TIN + 全 sub TIN を index 付きで返す */
  private _getAllTinsWithIndex(): { index: number; tin: SurfaceLike; isMain: boolean }[] {
    const result: { index: number; tin: SurfaceLike; isMain: boolean }[] = [
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
