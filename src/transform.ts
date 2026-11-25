import type { Feature, Polygon, Position } from "geojson";
import { booleanPointInPolygon, point, getCoords } from "@turf/turf";
import {
  MAX_INDEX_CELLS_PER_TRIANGLE,
  countIndexCells,
  hit,
  transformArr,
  unitCalc
} from "./geometry.ts";
import type { Tri } from "./geometry.ts";
import {
  FORMAT_VERSION,
  isModernCompiled,
  restoreLegacyState,
  restoreModernState
} from "./compiled-state.ts";
import type { EdgeSet } from "./edgeutils.ts";
import type {
  Compiled,
  CompiledLegacy,
  CompiledTransformData,
  CompiledWorldFileOuter,
  IndexedTinsBD,
  KinksBD,
  LegacyStatePayload,
  ModernStatePayload,
  PointSet,
  StrictMode,
  StrictStatus,
  TinsBD,
  VertexMode,
  VerticesParamsBD,
  WeightBufferBD,
  YaxisMode,
  CentroidBD
} from "./types.ts";
import type { WorldFile } from "./types.ts";
import { crsToWorldFilePixel, validateWorldFile, worldFileToCrs } from "./world-file.ts";

export const format_version = FORMAT_VERSION;

function pointInRing(coord: number[], vertices: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const [ax, ay] = vertices[j];
    const [bx, by] = vertices[i];
    const cross = (coord[0] - ax) * (by - ay) - (coord[1] - ay) * (bx - ax);
    const dx = bx - ax;
    const dy = by - ay;
    const qx = coord[0] - ax;
    const qy = coord[1] - ay;
    // 外積の誤差は座標の丸め幅と辺長の積で見積もり、絶対座標の二乗には比例させない。
    const coordinateTolerance = Number.EPSILON * 16 * Math.max(1, Math.abs(ax), Math.abs(ay), Math.abs(bx), Math.abs(by), Math.abs(coord[0]), Math.abs(coord[1]));
    const edgeLength = Math.hypot(dx, dy);
    const crossTolerance = coordinateTolerance * edgeLength + Number.EPSILON * 16 * (Math.abs(qx * dy) + Math.abs(qy * dx));
    if (
      Math.abs(cross) <= crossTolerance &&
      coord[0] >= Math.min(ax, bx) - coordinateTolerance &&
      coord[0] <= Math.max(ax, bx) + coordinateTolerance &&
      coord[1] >= Math.min(ay, by) - coordinateTolerance &&
      coord[1] <= Math.max(ay, by) + coordinateTolerance
    ) return true;
    if ((ay > coord[1]) !== (by > coord[1]) && coord[0] < (bx - ax) * (coord[1] - ay) / (by - ay) + ax) inside = !inside;
  }
  return inside;
}

/**
 * 座標変換の基本機能を提供するクラス
 *
 * 2つの座標系間の変換を、TINネットワークを使用して実現します。
 * このクラスは基本的な変換機能のみを提供し、
 * 設定ファイルの生成などの追加機能はTinクラスで提供されます。
 */
export class Transform {
  /**
   * 各種モードの定数定義
   * すべてreadonlyで、型安全性を確保
   */
  static VERTEX_PLAIN = "plain" as const;
  static VERTEX_BIRDEYE = "birdeye" as const;
  static MODE_STRICT = "strict" as const;
  static MODE_AUTO = "auto" as const;
  static MODE_LOOSE = "loose" as const;
  static STATUS_STRICT = "strict" as const;
  static STATUS_ERROR = "strict_error" as const;
  static STATUS_LOOSE = "loose" as const;
  static YAXIS_FOLLOW = "follow" as const;
  static YAXIS_INVERT = "invert" as const;

  points: PointSet[] = [];
  /** @deprecated 2.00704 以降、Transform はこのプロパティを設定も参照もしない。サブクラス（MaplatTin）は、旧 @maplat/transform と組まれたときの互換のため {} を入れる */
  pointsWeightBuffer?: WeightBufferBD;
  strict_status?: StrictStatus;
  vertices_params?: VerticesParamsBD;
  centroid?: CentroidBD;
  edgeNodes?: PointSet[];
  edges?: EdgeSet[];
  tins?: TinsBD;
  kinks?: KinksBD;
  yaxisMode: YaxisMode = Transform.YAXIS_INVERT;
  strictMode: StrictMode = Transform.MODE_AUTO;
  vertexMode?: VertexMode = Transform.VERTEX_PLAIN;
  bounds?: number[][];
  boundsPolygon?: Feature<Polygon>;
  wh?: number[];
  xy?: number[];
  indexedTins?: IndexedTinsBD;
  stateFull = false;
  stateTriangle?: Tri;
  stateBackward?: boolean;
  outerTransform: "extrapolate" | "worldFile" = "extrapolate";
  worldFile?: WorldFile;
  private outerVertices?: PointSet[];

  /**
   * Optional properties for MaplatCore extension
   * These properties allow consuming applications to extend Transform instances
   * with additional metadata without requiring Module Augmentation
   */

  /** Layer priority for rendering order */
  priority?: number;

  /** Layer importance for display decisions */
  importance?: number;

  /** Bounds in XY (source) coordinate system */
  xyBounds?: Feature<Polygon>;

  /** Bounds in Mercator (Web Mercator) coordinate system */
  mercBounds?: Feature<Polygon>;

  constructor() { }

  /**
   * コンパイルされた設定を適用します
   *
   * @param compiled - コンパイルされた設定オブジェクト
   * @returns 変換に必要な主要なオブジェクトのセット
   *
   * 以下の処理を行います：
   * 1. バージョンに応じた設定の解釈
   * 2. 各種パラメータの復元
   * 3. TINネットワークの再構築
   * 4. インデックスの作成
   */
  setCompiled(compiled: CompiledTransformData | CompiledLegacy): void {
    const worldFileCompiled = "outerTransform" in compiled;
    const outerTransform = worldFileCompiled ? compiled.outerTransform : undefined;
    if (outerTransform !== undefined && outerTransform !== "extrapolate" && outerTransform !== "worldFile") {
      throw new Error("Invalid compiled data: outerTransform must be extrapolate or worldFile");
    }
    const nextWorldFile = worldFileCompiled ? compiled.worldFile : undefined;
    if (outerTransform === "worldFile") {
      if (!nextWorldFile) throw new Error('compiled.outerTransform が "worldFile" ですが worldFile がありません');
      validateWorldFile(nextWorldFile);
      const vertices = (compiled as CompiledWorldFileOuter).vertices_points;
      if (!Array.isArray(vertices) || vertices.length !== 4 || vertices.some(pair => !Array.isArray(pair) || pair.length < 2 || pair.some(coord => !Array.isArray(coord) || coord.length < 2 || !coord.slice(0, 2).every(Number.isFinite)))) {
        throw new Error('compiled.outerTransform が "worldFile" のとき vertices_points は有限な4頂点が必要です');
      }
    }
    const normalized = outerTransform === "worldFile"
      ? { ...compiled, centroid_point: compiled.centroid_point ?? [[0, 0], [0, 0]] } as Compiled
      : compiled as Compiled;
    const candidate = new Transform();
    if (isModernCompiled(normalized)) {
      candidate.applyModernState(restoreModernState(normalized));
    } else {
      candidate.applyLegacyState(restoreLegacyState(normalized as CompiledLegacy));
    }
    // 候補インスタンスで入力を検証し、成功時は旧版と同じ順でこのインスタンスへ適用する。
    const keys = ["points", "strict_status", "vertices_params", "centroid", "edges", "edgeNodes", "tins", "kinks", "yaxisMode", "vertexMode", "strictMode", "bounds", "boundsPolygon", "wh", "xy", "indexedTins", "outerTransform", "worldFile", "outerVertices"] as const;
    const previous = Object.fromEntries(keys.map(key => [key, this[key]]));
    try {
      if (isModernCompiled(normalized)) this.applyModernState(restoreModernState(normalized));
      else this.applyLegacyState(restoreLegacyState(normalized as CompiledLegacy));
      this.outerTransform = outerTransform ?? "extrapolate";
      this.worldFile = nextWorldFile;
      this.outerVertices = outerTransform === "worldFile" ? compiled.vertices_points : undefined;
    } catch (error) {
      Object.assign(this, previous);
      throw error;
    }
  }

  private applyModernState(state: ModernStatePayload): void {
    this.points = state.points;
    this.strict_status = state.strictStatus;
    this.vertices_params = state.verticesParams;
    this.centroid = state.centroid;
    this.edges = state.edges;
    this.edgeNodes = state.edgeNodes || [];
    this.tins = state.tins;
    this.addIndexedTin();
    this.kinks = state.kinks;
    this.yaxisMode = state.yaxisMode ?? Transform.YAXIS_INVERT;
    this.vertexMode = state.vertexMode ?? Transform.VERTEX_PLAIN;
    this.strictMode = state.strictMode ?? Transform.MODE_AUTO;
    if (state.bounds) {
      this.bounds = state.bounds;
      this.boundsPolygon = state.boundsPolygon;
      this.xy = state.xy;
      this.wh = state.wh;
    } else {
      this.bounds = undefined;
      this.boundsPolygon = undefined;
      this.xy = state.xy ?? [0, 0];
      if (state.wh) this.wh = state.wh;
    }
  }

  private applyLegacyState(state: LegacyStatePayload): void {
    this.tins = state.tins;
    this.addIndexedTin();
    this.strict_status = state.strictStatus;
    this.vertices_params = state.verticesParams;
    this.centroid = state.centroid;
    this.kinks = state.kinks;
    this.points = state.points;
  }

  /**
   * TINネットワークのインデックスを作成します
   *
   * インデックスは変換処理を高速化するために使用されます。
   * グリッド形式のインデックスを作成し、各グリッドに
   * 含まれる三角形を記録します。
   * セル数が MAX_INDEX_CELLS_PER_TRIANGLE で決まる上限を超えるデータは
   * 索引を作らず、変換時に全三角形を線形に探します。
   */
  addIndexedTin() {
    const tins = this.tins!;
    const forw = tins.forw;
    const bakw = tins.bakw;
    const gridNum = Math.ceil(Math.sqrt(forw!.features.length));
    if (gridNum < 3) {
      this.indexedTins = undefined;
      return;
    }
    let forwBound: Position[] = [];
    let bakwBound: Position[] = [];
    const forwEachBound = forw!.features.map((tri: Tri) => {
      let eachBound: Position[] = [];
      getCoords(tri)[0].map((point: Position) => {
        if (forwBound.length === 0)
          forwBound = [Array.from(point), Array.from(point)];
        else {
          if (point[0] < forwBound[0][0]) forwBound[0][0] = point[0];
          if (point[0] > forwBound[1][0]) forwBound[1][0] = point[0];
          if (point[1] < forwBound[0][1]) forwBound[0][1] = point[1];
          if (point[1] > forwBound[1][1]) forwBound[1][1] = point[1];
        }
        if (eachBound.length === 0)
          eachBound = [Array.from(point), Array.from(point)];
        else {
          if (point[0] < eachBound[0][0]) eachBound[0][0] = point[0];
          if (point[0] > eachBound[1][0]) eachBound[1][0] = point[0];
          if (point[1] < eachBound[0][1]) eachBound[0][1] = point[1];
          if (point[1] > eachBound[1][1]) eachBound[1][1] = point[1];
        }
      });
      return eachBound;
    });
    const bakwEachBound = bakw!.features.map((tri: Tri) => {
      let eachBound: Position[] = [];
      getCoords(tri)[0].map((point: Position) => {
        if (bakwBound.length === 0)
          bakwBound = [Array.from(point), Array.from(point)];
        else {
          if (point[0] < bakwBound[0][0]) bakwBound[0][0] = point[0];
          if (point[0] > bakwBound[1][0]) bakwBound[1][0] = point[0];
          if (point[1] < bakwBound[0][1]) bakwBound[0][1] = point[1];
          if (point[1] > bakwBound[1][1]) bakwBound[1][1] = point[1];
        }
        if (eachBound.length === 0)
          eachBound = [Array.from(point), Array.from(point)];
        else {
          if (point[0] < eachBound[0][0]) eachBound[0][0] = point[0];
          if (point[0] > eachBound[1][0]) eachBound[1][0] = point[0];
          if (point[1] < eachBound[0][1]) eachBound[0][1] = point[1];
          if (point[1] > eachBound[1][1]) eachBound[1][1] = point[1];
        }
      });
      return eachBound;
    });
    const indexCells = Math.max(
      countIndexCells(forwEachBound, forwBound, gridNum),
      countIndexCells(bakwEachBound, bakwBound, gridNum)
    );
    if (indexCells > MAX_INDEX_CELLS_PER_TRIANGLE * forw!.features.length) {
      this.indexedTins = undefined;
      return;
    }
    const forwXUnit = (forwBound[1][0] - forwBound[0][0]) / gridNum;
    const forwYUnit = (forwBound[1][1] - forwBound[0][1]) / gridNum;
    const forwGridCache = forwEachBound.reduce(
      (prev: number[][][], bound: Position[], index: number) => {
        const normXMin = unitCalc(bound[0][0], forwBound[0][0], forwXUnit, gridNum);
        const normXMax = unitCalc(bound[1][0], forwBound[0][0], forwXUnit, gridNum);
        const normYMin = unitCalc(bound[0][1], forwBound[0][1], forwYUnit, gridNum);
        const normYMax = unitCalc(bound[1][1], forwBound[0][1], forwYUnit, gridNum);
        for (let cx = normXMin; cx <= normXMax; cx++) {
          if (!prev[cx]) prev[cx] = [];
          for (let cy = normYMin; cy <= normYMax; cy++) {
            if (!prev[cx][cy]) prev[cx][cy] = [];
            prev[cx][cy].push(index);
          }
        }
        return prev;
      },
      []
    );
    const bakwXUnit = (bakwBound[1][0] - bakwBound[0][0]) / gridNum;
    const bakwYUnit = (bakwBound[1][1] - bakwBound[0][1]) / gridNum;
    const bakwGridCache = bakwEachBound.reduce(
      (prev: number[][][], bound: Position[], index: number) => {
        const normXMin = unitCalc(bound[0][0], bakwBound[0][0], bakwXUnit, gridNum);
        const normXMax = unitCalc(bound[1][0], bakwBound[0][0], bakwXUnit, gridNum);
        const normYMin = unitCalc(bound[0][1], bakwBound[0][1], bakwYUnit, gridNum);
        const normYMax = unitCalc(bound[1][1], bakwBound[0][1], bakwYUnit, gridNum);
        for (let cx = normXMin; cx <= normXMax; cx++) {
          if (!prev[cx]) prev[cx] = [];
          for (let cy = normYMin; cy <= normYMax; cy++) {
            if (!prev[cx][cy]) prev[cx][cy] = [];
            prev[cx][cy].push(index);
          }
        }
        return prev;
      },
      []
    );
    this.indexedTins = {
      forw: {
        gridNum,
        xOrigin: forwBound[0][0],
        yOrigin: forwBound[0][1],
        xUnit: forwXUnit,
        yUnit: forwYUnit,
        gridCache: forwGridCache
      },
      bakw: {
        gridNum,
        xOrigin: bakwBound[0][0],
        yOrigin: bakwBound[0][1],
        xUnit: bakwXUnit,
        yUnit: bakwYUnit,
        gridCache: bakwGridCache
      }
    };
  }

  /**
   * 座標変換を実行します
   *
   * @param apoint - 変換する座標
   * @param backward - 逆方向の変換かどうか
   * @param ignoreBounds - 境界チェックを無視するかどうか
   * @returns 変換後の座標、または境界外の場合はfalse
   *
   * @throws {Error} 逆方向変換が許可されていない状態での逆変換時
   */
  transform(apoint: number[], backward?: boolean, ignoreBounds?: boolean): number[] | false {
    if (!this.tins)
      throw new Error("setCompiled() must be called before transform()");
    if (backward && this.strict_status == Transform.STATUS_ERROR && this.outerTransform !== "worldFile")
      throw new Error('Backward transform is not allowed if strict_status == "strict_error"');
    const originalPoint = apoint;
    if (this.yaxisMode == Transform.YAXIS_FOLLOW && backward) {
      apoint = [apoint[0], -1 * apoint[1]];
    }
    const tpoint = point(apoint);
    if (this.bounds && !backward && !ignoreBounds) {
      if (!booleanPointInPolygon(tpoint, this.boundsPolygon!)) return false;
    }
    const tins = backward ? this.tins!.bakw : this.tins!.forw;
    const indexedTins = backward
      ? this.indexedTins?.bakw
      : this.indexedTins?.forw;
    const boundaryVertices = this.outerVertices?.map(pair => backward ? pair[1] : pair[0]);
    const inBoundary = boundaryVertices && pointInRing(tpoint.geometry.coordinates, boundaryVertices);
    const triangle = this.outerTransform === "worldFile" && tins ? hit(tpoint, tins, indexedTins) : undefined;
    if (this.outerTransform === "worldFile" && tins && !inBoundary) {
      // B では四辺形の外だけ大域モデルを許す。四辺形内は従来どおり strict_error。
      const ret = backward
        ? crsToWorldFilePixel(this.worldFile!, originalPoint)
        : worldFileToCrs(this.worldFile!, originalPoint);
      if (!ret.every(Number.isFinite)) return false;
      if (backward && this.bounds && !ignoreBounds && !booleanPointInPolygon(point(ret), this.boundsPolygon!)) return false;
      return ret;
    }
    if (backward && this.strict_status == Transform.STATUS_ERROR)
      throw new Error('Backward transform is not allowed if strict_status == "strict_error"');
    if (this.outerTransform === "worldFile" && !triangle) return false;
    const verticesParams = backward
      ? this.vertices_params!.bakw
      : this.vertices_params!.forw;
    const centroid = backward ? this.centroid!.bakw : this.centroid!.forw;
    let stateTriangle = undefined,
      stateSetFunc = undefined;
    if (this.stateFull) {
      if (this.stateBackward == backward) {
        stateTriangle = this.stateTriangle;
      } else {
        this.stateBackward = backward;
        this.stateTriangle = undefined;
      }
      stateSetFunc = (tri?: Tri) => {
        this.stateTriangle = tri;
      };
    }
    let ret = transformArr(
      tpoint,
      tins!,
      indexedTins,
      verticesParams,
      centroid,
      undefined,
      stateTriangle,
      stateSetFunc,
      triangle
    );
    if (this.bounds && backward && !ignoreBounds) {
      const rpoint = point(ret);
      if (!booleanPointInPolygon(rpoint, this.boundsPolygon!)) return false;
    } else if (this.yaxisMode == Transform.YAXIS_FOLLOW && !backward) {
      ret = [ret[0], -1 * ret[1]];
    }
    return ret;
  }
}
