import { MERC_MAX } from "./constants.ts";
import type { CrsObject, PointSet, ProjectionEngine, SurfaceLike, WorldFile } from "./types.ts";
import type { EdgeSet } from "./edgeutils.ts";
import { crsToWorldFilePixel, validateWorldFile, worldFileToCrs } from "./world-file.ts";

const EARTH_RADIUS = 6378137;
const MAX_MERCATOR_LATITUDE = (180 / Math.PI) * Math.atan(Math.sinh(Math.PI));

function finitePair(coord: number[]): boolean {
  return coord.length >= 2 && Number.isFinite(coord[0]) && Number.isFinite(coord[1]);
}

function validateCrs(crs: CrsObject): void {
  if (crs.epsg !== 3857 && crs.epsg !== 4326) {
    throw new Error(`一期では EPSG:${crs.epsg} の CRS に対応していません`);
  }
  if (crs.wkt && !crs.proj4) {
    throw new Error("一期では WKT だけの CRS 定義に対応していません");
  }
  if (!crs.proj4) return;
  const tokens = crs.proj4.trim().split(/\s+/).filter(Boolean).map(token => {
    const [rawKey, ...rawValue] = token.replace(/^\+/, "").split("=");
    const key = rawKey.toLowerCase();
    const value = rawValue.join("=");
    if (key === "axis" && value !== "enu") {
      throw new Error("worldFile は東・北の順で書き、+axis を外してください");
    }
    if (["no_defs", "type", "wktext"].includes(key) || (key === "axis" && value === "enu")) return "";
    if (key === "towgs84" && /^0(?:\.0+)?(?:,0(?:\.0+)?){2,6}$/.test(value)) return "";
    const normalized = value
      ? value.split(",").map(part => {
          const number = Number(part);
          return part.trim() !== "" && Number.isFinite(number) ? String(number) : part.toLowerCase();
        }).join(",")
      : "";
    return `+${key}${value ? `=${normalized}` : ""}`;
  }).filter(Boolean);
  const actual = [...new Set(tokens)].sort().join(" ");
  const accepted = crs.epsg === 4326
    ? ["+datum=wgs84 +proj=longlat", "+ellps=wgs84 +proj=longlat"]
    : ["+a=6378137 +b=6378137 +k=1 +lat_ts=0 +lon_0=0 +nadgrids=@null +proj=merc +units=m +x_0=0 +y_0=0"];
  if (!accepted.includes(actual)) {
    throw new Error(`epsg と proj4 が一致しないか、一期では判定できない CRS です（EPSG:${crs.epsg}）`);
  }
}

/** 3857 と 4326 の間を変換する内蔵投影エンジン */
export const builtinProjectionEngine: ProjectionEngine = {
  toLonLat(coord, crs) {
    if (!finitePair(coord)) return false;
    if (crs.epsg === 4326) return Math.abs(coord[1]) <= 90 ? coord.slice(0, 2) : false;
    if (crs.epsg !== 3857 || Math.abs(coord[0]) > MERC_MAX || Math.abs(coord[1]) > MERC_MAX) return false;
    return [
      (coord[0] / EARTH_RADIUS) * (180 / Math.PI),
      (2 * Math.atan(Math.exp(coord[1] / EARTH_RADIUS)) - Math.PI / 2) * (180 / Math.PI)
    ];
  },
  fromLonLat(coord, crs) {
    if (!finitePair(coord) || Math.abs(coord[0]) > 180 || Math.abs(coord[1]) > MAX_MERCATOR_LATITUDE) return false;
    if (crs.epsg === 4326) return coord.slice(0, 2);
    if (crs.epsg !== 3857) return false;
    const longitude = (coord[0] * Math.PI) / 180;
    const latitude = (coord[1] * Math.PI) / 180;
    const result = [EARTH_RADIUS * longitude, EARTH_RADIUS * Math.log(Math.tan(Math.PI / 4 + latitude / 2))];
    return result.every(Number.isFinite) ? result : false;
  }
};

export interface WorldFileSurfaceOptions {
  crs: CrsObject;
  worldFile: WorldFile;
  wh?: number[];
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
    validateCrs(options.crs);
    if (options.wh && (!Array.isArray(options.wh) || options.wh.length < 2 || !options.wh.slice(0, 2).every(Number.isFinite))) {
      throw new Error("WorldFileSurface の wh は有限な 2 要素以上の配列でなければなりません");
    }
    if (!options.wh && !options.bounds) throw new Error("WorldFileSurface には wh または bounds が必要です");
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
      this.xy = options.xy ?? [minX, minY];
    }
    this.bounds = options.bounds;
    this.priority = options.priority;
    this.importance = options.importance;
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
        return Math.abs(inCrs[0]) <= MERC_MAX && Math.abs(inCrs[1]) <= MERC_MAX ? inCrs : false;
      }
      const geographic = this.projectionEngine.toLonLat(inCrs, this.crs);
      return geographic === false ? false : this.projectionEngine.fromLonLat(geographic, { epsg: 3857 });
    }
    if (this.crs.epsg === 3857) {
      return Math.abs(coord[0]) <= MERC_MAX && Math.abs(coord[1]) <= MERC_MAX
        ? this.crsToXy(coord)
        : false;
    }
    const geographic = this.projectionEngine.toLonLat(coord, { epsg: 3857 });
    if (geographic === false) return false;
    const inCrs = this.projectionEngine.fromLonLat(geographic, this.crs);
    return inCrs === false ? false : this.crsToXy(inCrs);
  }
}
