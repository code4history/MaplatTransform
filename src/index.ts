import type { Feature, Polygon, Position } from "geojson";
import { booleanPointInPolygon, point, getCoords } from "@turf/turf";
import { unitCalc, transformArr } from "./geometry.ts";
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
export type {
  PointSet,
  BiDirectionKey,
  WeightBufferBD,
  VertexMode,
  StrictMode,
  StrictStatus,
  YaxisMode,
  CentroidBD,
  TinsBD,
  KinksBD,
  VerticesParamsBD,
  IndexedTinsBD,
  Compiled,
  CompiledLegacy
} from "./types.ts";
export type { Tins, Tri, PropertyTriKey } from "./geometry.ts";
export { transformArr } from "./geometry.ts";
export { rotateVerticesTriangle, counterTri } from "./triangulation.ts";
export type { Edge, EdgeSet, EdgeSetLegacy } from "./edgeutils.ts";
export { normalizeEdges } from "./edgeutils.ts";
export const format_version = FORMAT_VERSION;

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
  setCompiled(compiled: Compiled | CompiledLegacy): void {
    if (isModernCompiled(compiled)) {
      this.applyModernState(restoreModernState(compiled));
      return;
    }
    this.applyLegacyState(restoreLegacyState(compiled as CompiledLegacy));
  }

  private applyModernState(state: ModernStatePayload): void {
    this.points = state.points;
    this.pointsWeightBuffer = state.pointsWeightBuffer;
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
    this.pointsWeightBuffer = state.pointsWeightBuffer;
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
    const forwXUnit = (forwBound[1][0] - forwBound[0][0]) / gridNum;
    const forwYUnit = (forwBound[1][1] - forwBound[0][1]) / gridNum;
    const forwGridCache = forwEachBound.reduce(
      (prev: number[][][], bound: Position[], index: number) => {
        const normXMin = unitCalc(
          bound[0][0],
          forwBound[0][0],
          forwXUnit,
          gridNum
        );
        const normXMax = unitCalc(
          bound[1][0],
          forwBound[0][0],
          forwXUnit,
          gridNum
        );
        const normYMin = unitCalc(
          bound[0][1],
          forwBound[0][1],
          forwYUnit,
          gridNum
        );
        const normYMax = unitCalc(
          bound[1][1],
          forwBound[0][1],
          forwYUnit,
          gridNum
        );
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
    const bakwXUnit = (bakwBound[1][0] - bakwBound[0][0]) / gridNum;
    const bakwYUnit = (bakwBound[1][1] - bakwBound[0][1]) / gridNum;
    const bakwGridCache = bakwEachBound.reduce(
      (prev: number[][][], bound: Position[], index: number) => {
        const normXMin = unitCalc(
          bound[0][0],
          bakwBound[0][0],
          bakwXUnit,
          gridNum
        );
        const normXMax = unitCalc(
          bound[1][0],
          bakwBound[0][0],
          bakwXUnit,
          gridNum
        );
        const normYMin = unitCalc(
          bound[0][1],
          bakwBound[0][1],
          bakwYUnit,
          gridNum
        );
        const normYMax = unitCalc(
          bound[1][1],
          bakwBound[0][1],
          bakwYUnit,
          gridNum
        );
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
    if (backward && this.strict_status == Transform.STATUS_ERROR)
      throw 'Backward transform is not allowed if strict_status == "strict_error"';
    // if (!this.tins) this.updateTin();
    if (this.yaxisMode == Transform.YAXIS_FOLLOW && backward) {
      apoint = [apoint[0], -1 * apoint[1]];
    }
    const tpoint = point(apoint);
    if (this.bounds && !backward && !ignoreBounds) {
      if (!booleanPointInPolygon(tpoint, this.boundsPolygon!)) return false;
    }
    const tins = backward ? this.tins!.bakw : this.tins!.forw;
    const indexedTins = backward
      ? this.indexedTins!.bakw
      : this.indexedTins!.forw;
    const verticesParams = backward
      ? this.vertices_params!.bakw
      : this.vertices_params!.forw;
    const centroid = backward ? this.centroid!.bakw : this.centroid!.forw;
    const weightBuffer = backward
      ? this.pointsWeightBuffer!.bakw
      : this.pointsWeightBuffer!.forw;
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
      weightBuffer,
      stateTriangle,
      stateSetFunc
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
