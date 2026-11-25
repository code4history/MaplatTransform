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

function crossProduct(a: number[], b: number[], p: number[]): number {
  return (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
}

function inSegmentBounds(p: number[], a: number[], b: number[], tolerance = 0): boolean {
  return p[0] >= Math.min(a[0], b[0]) - tolerance &&
    p[0] <= Math.max(a[0], b[0]) + tolerance &&
    p[1] >= Math.min(a[1], b[1]) - tolerance &&
    p[1] <= Math.max(a[1], b[1]) + tolerance;
}

function segmentsIntersect(a: number[], b: number[], c: number[], d: number[]): boolean {
  const abc = crossProduct(a, b, c);
  const abd = crossProduct(a, b, d);
  const cda = crossProduct(c, d, a);
  const cdb = crossProduct(c, d, b);
  if (
    (abc === 0 && inSegmentBounds(c, a, b)) ||
    (abd === 0 && inSegmentBounds(d, a, b)) ||
    (cda === 0 && inSegmentBounds(a, c, d)) ||
    (cdb === 0 && inSegmentBounds(b, c, d))
  ) return true;
  return Math.sign(abc) * Math.sign(abd) === -1 && Math.sign(cda) * Math.sign(cdb) === -1;
}

function ringWinding(vertices: number[][]): number {
  // 最初の頂点を基準にして、大きな絶対座標どうしの差し引きによる桁落ちを避ける。
  const area = vertices.reduce((sum, vertex, i) =>
    sum + crossProduct(vertices[0], vertex, vertices[(i + 1) % vertices.length]), 0);
  if (!Number.isFinite(area) || area === 0) {
    throw new Error('compiled.outerTransform が "worldFile" のとき vertices_points の輪は面積を持つ必要があります');
  }
  for (let i = 0; i < vertices.length; i++) {
    const a = vertices[i];
    const b = vertices[(i + 1) % vertices.length];
    if (a[0] === b[0] && a[1] === b[1]) {
      throw new Error('compiled.outerTransform が "worldFile" のとき vertices_points の輪に重複頂点は許可されません');
    }
    for (let j = i + 2; j < vertices.length; j++) {
      if (i === 0 && j === vertices.length - 1) continue;
      if (segmentsIntersect(a, b, vertices[j], vertices[(j + 1) % vertices.length])) {
        throw new Error('compiled.outerTransform が "worldFile" のとき vertices_points の輪に辺の交差は許可されません');
      }
    }
  }
  return Math.sign(area);
}

function classifyRingPoint(coord: number[], vertices: number[][]): "inside" | "edge" | "outside" {
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const a = vertices[j];
    const b = vertices[i];
    const [ax, ay] = a;
    const [bx, by] = b;
    const dx = bx - ax;
    const dy = by - ay;
    const qx = coord[0] - ax;
    const qy = coord[1] - ay;
    // 外積の誤差は座標の丸め幅と辺長の積で見積もり、絶対座標の二乗には比例させない。
    const coordinateTolerance = Number.EPSILON * 16 * Math.max(1, Math.abs(ax), Math.abs(ay), Math.abs(bx), Math.abs(by), Math.abs(coord[0]), Math.abs(coord[1]));
    const edgeLength = Math.hypot(dx, dy);
    const crossTolerance = coordinateTolerance * edgeLength + Number.EPSILON * 16 * (Math.abs(qx * dy) + Math.abs(qy * dx));
    if (
      Math.abs(crossProduct(a, b, coord)) <= crossTolerance &&
      inSegmentBounds(coord, a, b, coordinateTolerance)
    ) return "edge";
    if ((ay > coord[1]) !== (by > coord[1]) && coord[0] < (bx - ax) * (coord[1] - ay) / (by - ay) + ax) inside = !inside;
  }
  return inside ? "inside" : "outside";
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
  /** B の外周の輪（地図面・地理面）。変換のたびに作らないよう setCompiled で一度だけ作る */
  private outerRings?: { forw: number[][]; bakw: number[][] };

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
      // vertices_points は四辺形の上の補助頂点すべて（4 隅＋辺の上の点）を輪の順に並べたもの。4 点に決め打ちしない
      if (!Array.isArray(vertices) || vertices.length < 4 || vertices.some(pair => !Array.isArray(pair) || pair.length < 2 || pair.some(coord => !Array.isArray(coord) || coord.length < 2 || !coord.slice(0, 2).every(Number.isFinite)))) {
        throw new Error('compiled.outerTransform が "worldFile" のとき vertices_points は有限な 4 頂点以上の輪が必要です');
      }
      const mapWinding = ringWinding(vertices.map(pair => pair[0]));
      const geoWinding = ringWinding(vertices.map(pair => pair[1]));
      // follow の地理面は内部で y が反転済み。外部座標の規約では地図面と地理面の符号が逆になる。
      const externalGeoWinding = compiled.yaxisMode === Transform.YAXIS_FOLLOW ? -geoWinding : geoWinding;
      if (mapWinding === externalGeoWinding) {
        throw new Error('compiled.outerTransform が "worldFile" のとき vertices_points の両面の巻き方向が整合していません');
      }
    }
    const normalized = outerTransform === "worldFile"
      ? { ...compiled, centroid_point: compiled.centroid_point ?? [[0, 0], [0, 0]] } as Compiled
      : compiled as Compiled;
    const state = isModernCompiled(normalized)
      ? restoreModernState(normalized)
      : restoreLegacyState(normalized as CompiledLegacy);
    // 実インスタンスに従来の順で適用し、索引の構築などが失敗したら適用前に戻す。
    const keys = ["points", "strict_status", "vertices_params", "centroid", "edges", "edgeNodes", "tins", "kinks", "yaxisMode", "vertexMode", "strictMode", "bounds", "boundsPolygon", "wh", "xy", "indexedTins", "outerTransform", "worldFile", "outerVertices", "outerRings"] as const;
    const previous = Object.fromEntries(keys.map(key => [key, this[key]]));
    try {
      if ("compiled" in state) this.applyLegacyState(state);
      else this.applyModernState(state);
      this.outerTransform = outerTransform ?? "extrapolate";
      this.worldFile = nextWorldFile;
      this.outerVertices = outerTransform === "worldFile" ? compiled.vertices_points : undefined;
      this.outerRings = this.outerVertices
        ? { forw: this.outerVertices.map(pair => pair[0] as number[]), bakw: this.outerVertices.map(pair => pair[1] as number[]) }
        : undefined;
      this.validateCompiledProjection();
    } catch (error) {
      Object.assign(this, previous);
      throw error;
    }
  }

  /** 層固有の検査を、失敗時に compiled の適用を取り消せる位置で行う */
  protected validateCompiledProjection(): void {
    // 通常の三角網には投影定義がない。
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
    let triangle: Tri | undefined;
    if (this.outerTransform === "worldFile") {
      const boundaryVertices = backward ? this.outerRings?.bakw : this.outerRings?.forw;
      const location = boundaryVertices ? classifyRingPoint(tpoint.geometry.coordinates, boundaryVertices) : "outside";
      if (backward && this.strict_status == Transform.STATUS_ERROR && location !== "outside") {
        throw new Error('Backward transform is not allowed if strict_status == "strict_error"');
      }
      if (location === "inside" && tins) triangle = hit(tpoint, tins, indexedTins);
      if (!triangle) {
        // 外周では両方式が一致する。丸めなどで三角形が見つからなかった場合も world file に戻す。
        const ret = backward
          ? crsToWorldFilePixel(this.worldFile!, originalPoint)
          : worldFileToCrs(this.worldFile!, originalPoint);
        if (!ret.every(Number.isFinite)) return false;
        if (backward && this.bounds && !ignoreBounds && !booleanPointInPolygon(point(ret), this.boundsPolygon!)) return false;
        return ret;
      }
    }
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
