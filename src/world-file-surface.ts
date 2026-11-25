import { MERC_MAX } from "./constants.ts";
import type { CrsObject, PointSet, ProjectionEngine, SurfaceLike, WorldFile } from "./types.ts";
import type { EdgeSet } from "./edgeutils.ts";
import { crsToWorldFilePixel, validateWorldFile, worldFileToCrs } from "./world-file.ts";

const EARTH_RADIUS = 6378137;
const MAX_MERCATOR_LATITUDE = (180 / Math.PI) * Math.atan(Math.sinh(Math.PI));
function finitePair(coord: number[]): boolean {
  return coord.length >= 2 && Number.isFinite(coord[0]) && Number.isFinite(coord[1]);
}

export function validateCrs(crs: CrsObject): void {
  if (crs === null || typeof crs !== "object") throw new Error("CRS はオブジェクトで指定してください");
  if (crs.epsg !== 3857 && crs.epsg !== 4326) {
    throw new Error(`一期では EPSG:${crs.epsg} の CRS に対応していません`);
  }
  if (crs.wkt && !crs.proj4) {
    throw new Error("一期では WKT だけの CRS 定義に対応していません");
  }
  if (crs.proj4 === undefined) return;
  if (crs.proj4.trim() === "") throw new Error("空の proj4 は許可されていません");
  const tokens = crs.proj4.trim().split(/\s+/).map(token => {
    const [rawKey, ...rawValue] = token.replace(/^\+/, "").split("=");
    const key = rawKey.toLowerCase();
    const value = rawValue.join("=");
    const hasValue = rawValue.length > 0;
    if (key === "axis" && (!hasValue || value !== "enu")) {
      throw new Error("worldFile は東・北の順で書き、+axis を外してください");
    }
    if ((key === "no_defs" || key === "wktext") && !hasValue) return "";
    if (hasValue && value === "") throw new Error(`+${key}= は許可されていません`);
    if (key === "wktext") throw new Error("+wktext は許可されていません");
    if (key === "type" && !hasValue) throw new Error("+type は値が必要です");
    if (key === "type" && value.toLowerCase() === "crs") return "";
    if (key === "axis") return "";
    if (key === "towgs84") {
      const parts = value.split(",");
      if (!hasValue || parts.some(part => part.trim() === "")) throw new Error("+towgs84 は数値の値が必要です");
      const allZero = [3, 7].includes(parts.length) && parts.every(part => {
        const mantissa = part.trim().split(/[eE]/, 1)[0].replace(/[+\-.]/g, "");
        return Number.isFinite(Number(part)) && !/[1-9]/.test(mantissa);
      });
      if (allZero) return "";
    }
    const normalized = value
      ? value.split(",").map(part => {
          const number = Number(part);
          return part.trim() !== "" && Number.isFinite(number) ? (Object.is(number, -0) ? "0" : String(number)) : part.toLowerCase();
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
    if (crs.epsg === 4326) return Math.abs(coord[0]) <= 180 && Math.abs(coord[1]) <= 90 ? [coord[0], coord[1]] : false;
    if (crs.epsg !== 3857 || Math.abs(coord[0]) > MERC_MAX || Math.abs(coord[1]) > MERC_MAX) return false;
    const x = coord[0];
    const y = coord[1];
    return [
      Math.abs(x) === MERC_MAX ? Math.sign(x) * 180 : (x / EARTH_RADIUS) * (180 / Math.PI),
      Math.abs(y) === MERC_MAX ? Math.sign(y) * MAX_MERCATOR_LATITUDE : (2 * Math.atan(Math.exp(y / EARTH_RADIUS)) - Math.PI / 2) * (180 / Math.PI)
    ];
  },
  fromLonLat(coord, crs) {
    if (!finitePair(coord) || Math.abs(coord[0]) > 180) return false;
    const [lon, lat] = coord;
    if (crs.epsg === 4326) return Math.abs(lat) <= 90 ? [lon, lat] : false;
    if (crs.epsg !== 3857 || Math.abs(lat) > MAX_MERCATOR_LATITUDE) return false;
    const longitude = (lon * Math.PI) / 180;
    const latitude = (lat * Math.PI) / 180;
    const result = [Math.abs(lon) === 180 ? Math.sign(lon) * MERC_MAX : EARTH_RADIUS * longitude,
      Math.abs(lat) === MAX_MERCATOR_LATITUDE ? Math.sign(lat) * MERC_MAX : EARTH_RADIUS * Math.log(Math.tan(Math.PI / 4 + latitude / 2))];
    return result.every(Number.isFinite) ? result : false;
  }
};

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
    validateCrs(options.crs);
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
      const geographic = this.projectionEngine.toLonLat(inCrs, this.crs);
      if (geographic === false || !finitePair(geographic)) return false;
      const result = this.projectionEngine.fromLonLat(geographic, { epsg: 3857 });
      return result !== false && finitePair(result) ? result : false;
    }
    if (this.crs.epsg === 3857) {
      if (Math.abs(coord[0]) > MERC_MAX || Math.abs(coord[1]) > MERC_MAX) return false;
      const result = this.crsToXy(coord);
      return finitePair(result) ? result : false;
    }
    const geographic = this.projectionEngine.toLonLat(coord, { epsg: 3857 });
    if (geographic === false || !finitePair(geographic)) return false;
    const inCrs = this.projectionEngine.fromLonLat(geographic, this.crs);
    if (inCrs === false || !finitePair(inCrs)) return false;
    const result = this.crsToXy(inCrs);
    return finitePair(result) ? result : false;
  }
}
