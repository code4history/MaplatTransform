import { MERC_MAX } from "./constants.ts";
import type { CrsObject, PointSet, ProjectionEngine, SurfaceLike, WorldFile } from "./types.ts";
import {
  builtinProjectionEngine, crsToMercator, finitePair, layerCheckPoints, mercatorToCrs,
  validateLayerCrs
} from "./projection.ts";
import type { EdgeSet } from "./edgeutils.ts";
import { crsToWorldFilePixel, validateWorldFile, worldFileToCrs } from "./world-file.ts";

type WorldFileSurfaceDimensions = { wh: number[]; bounds?: number[][] } | { wh?: undefined; bounds: [number[], number[], number[], ...number[][]] };

export type WorldFileSurfaceOptions = WorldFileSurfaceDimensions & {
  crs: CrsObject;
  worldFile: WorldFile;
  xy?: number[];
  bounds?: number[][];
  priority?: number;
  importance?: number;
  points?: PointSet[];
  edges?: EdgeSet[];
  projectionEngine?: ProjectionEngine;
}

/** world file と CRS の投影を束ねて 3857 との変換を行う */
export class WorldFileSurface implements SurfaceLike {
  readonly crs: CrsObject;
  readonly worldFile: WorldFile;
  readonly projectionEngine: ProjectionEngine;
  wh: number[];
  xy?: number[];
  bounds?: number[][];
  priority?: number;
  importance?: number;
  points: PointSet[] = [];
  edges: EdgeSet[] = [];

  constructor(options: WorldFileSurfaceOptions) {
    validateWorldFile(options.worldFile);
    if (!options.wh && !options.bounds) throw new Error("WorldFileSurface には wh または bounds が必要です");
    if (options.wh && (!Array.isArray(options.wh) || options.wh.length < 2 || !options.wh.slice(0, 2).every(Number.isFinite))) {
      throw new Error("WorldFileSurface の wh は有限な 2 要素以上の配列でなければなりません");
    }
    if (options.bounds && (options.bounds.length < 3 || options.bounds.some(vertex => !Array.isArray(vertex) || vertex.length < 2 || !vertex.slice(0, 2).every(Number.isFinite)))) throw new Error("WorldFileSurface の bounds は有限な頂点を3つ以上必要とします");
    this.crs = options.crs;
    this.worldFile = options.worldFile;
    this.projectionEngine = options.projectionEngine ?? builtinProjectionEngine;
    const bounds = options.bounds;
    if (options.wh) {
      this.wh = options.wh;
      this.xy = options.xy;
    } else {
      const xs = bounds!.map(position => position[0]);
      const ys = bounds!.map(position => position[1]);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      this.wh = [Math.max(...xs) - minX, Math.max(...ys) - minY];
      if (!this.wh.every(Number.isFinite)) throw new Error("WorldFileSurface の bounds から算出した寸法は有限でなければなりません");
      this.xy = options.xy ?? [minX, minY];
    }
    this.bounds = options.bounds;
    this.priority = options.priority;
    this.importance = options.importance;
    validateLayerCrs(this.crs, this.projectionEngine, () =>
      layerCheckPoints(options.wh, this.xy, options.wh ? undefined : this.bounds)
        .map(xy => this.xyToCrs(xy))
    );
  }

  /** 画素座標を指定 CRS に変換する */
  xyToCrs(xy: number[]): number[] {
    return worldFileToCrs(this.worldFile, xy);
  }

  /** 指定 CRS 座標を画素座標に変換する */
  crsToXy(crs: number[]): number[] {
    return crsToWorldFilePixel(this.worldFile, crs);
  }

  /** 地図画素と EPSG:3857 の間を変換する */
  transform(coord: number[], backward = false, _ignoreBounds = false): number[] | false {
    if (!finitePair(coord)) return false;
    if (!backward) {
      const inCrs = this.xyToCrs(coord);
      if (this.crs.epsg === 3857) {
        return inCrs.every(value => Math.abs(value) <= MERC_MAX) ? inCrs : false;
      }
      return crsToMercator(inCrs, this.crs, this.projectionEngine);
    }
    if (this.crs.epsg === 3857) {
      if (Math.abs(coord[0]) > MERC_MAX || Math.abs(coord[1]) > MERC_MAX) return false;
      const result = this.crsToXy(coord);
      return finitePair(result) ? result : false;
    }
    const inCrs = mercatorToCrs(coord, this.crs, this.projectionEngine);
    if (inCrs === false) return false;
    const result = this.crsToXy(inCrs);
    return finitePair(result) ? result : false;
  }
}
