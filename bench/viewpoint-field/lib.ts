/**
 * 視点変換 ViewpointField 実測（段 1 ②）の共通ヘルパー。
 * 実測専用。vitest の通常実行には入らない（vitest.config.ts の include は tests/ 配下のみ）。
 */
import fs from "node:fs";
import type { Feature, Polygon } from "geojson";
import { booleanPointInPolygon, convex, featureCollection, point } from "@turf/turf";
import { MERC_MAX } from "../../src/constants.ts";
import { mercViewpoint2Mercs, mercs2MercViewpoint, wrapAngle } from "../../src/viewpoint.ts";
import { sysCoord2Xy, xy2SysCoord } from "../../src/coord-utils.ts";
import type { SurfaceLike, ViewpointCoefficients } from "../../src/types.ts";

// ─── 乱数（種固定） ────────────────────────────────────────────────────────────

/** 実測標本の乱数種（日付から。§2.2 4.「乱数は種を固定」） */
export const SEED = 20261128;

/** mulberry32。種を変えずに再実行すると同じ標本になる */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── 統計 ─────────────────────────────────────────────────────────────────────

/** viewpoint-field.ts の percentile95 と同じ定義（ceil(0.95n)−1 番目） */
export function percentile95(sorted: number[]): number {
  if (!sorted.length) return 0;
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil(0.95 * sorted.length) - 1))];
}

export interface MaxP95 {
  max: number;
  p95: number;
  n: number;
}

export function maxP95(values: number[]): MaxP95 {
  const sorted = [...values].sort((a, b) => a - b);
  return {
    max: sorted[sorted.length - 1] ?? 0,
    p95: percentile95(sorted),
    n: sorted.length
  };
}

// ─── 係数の差 ─────────────────────────────────────────────────────────────────

export interface CoefDiff {
  rotDeg: number;
  scaleRatio: number;
}

/** 回転差（度）と縮尺比差 |s_a/s_b − 1| */
export function coefDiff(a: ViewpointCoefficients, b: ViewpointCoefficients): CoefDiff {
  return {
    rotDeg: Math.abs(wrapAngle(a.theta - b.theta)) * 180 / Math.PI,
    scaleRatio: Math.abs(a.s / b.s - 1)
  };
}

// ─── 旧 5 点方式（V2 都度計算）の参照値 ────────────────────────────────────────

export function finite2(coord: number[] | false | undefined): coord is number[] {
  return Array.isArray(coord) && coord.length >= 2 && Number.isFinite(coord[0]) && Number.isFinite(coord[1]);
}

/**
 * 旧 V2 5 点方式が「今の画面のズーム」で出す (s, θ)（§6.2 の比較対象）。
 * 理想 5 点十字を紙へ写して surface で変換し、mercs2MercViewpoint で復元した
 * (z_merc, θ_merc) から s = α_sys / 2^(z_merc − z)、θ = θ_merc として求める。
 */
export function legacyCoefficientsAt(
  surface: SurfaceLike,
  p: number[],
  zoom: number,
  size: [number, number],
  maxxy: number
): ViewpointCoefficients | null {
  const centerSys = xy2SysCoord(p, maxxy);
  const mercs = mercViewpoint2Mercs(centerSys, zoom, 0, size);
  const out: number[][] = [];
  for (const merc of mercs) {
    const xy = sysCoord2Xy(merc, maxxy);
    const transformed = surface.transform(xy, false, true);
    if (!finite2(transformed)) return null;
    out.push(transformed);
  }
  const vp = mercs2MercViewpoint(out, size);
  const alphaSys = (2 * MERC_MAX) / maxxy;
  const s = alphaSys / Math.pow(2, vp.zoom - zoom);
  if (!(s > 0) || !Number.isFinite(s)) return null;
  return { s, theta: wrapAngle(vp.rotation) };
}

/** 画面短辺 1/4 の 5 点半径（画素）から代表ズームを決める（zoom2Radius の逆） */
export function zoomForRadiusPx(radiusPx: number, size: [number, number], maxxy: number): number {
  const arm = Math.floor(Math.min(size[0], size[1]) / 4);
  // paper radius = arm * maxxy / (256 * 2^zoom)  →  zoom = log2(arm * maxxy / (256 * r))
  return Math.log2((arm * maxxy) / (256 * radiusPx));
}

/** 5 点半径（画素）: radius = floor(min(size)/4) * 2^(maxZoom − zoom) 相当 */
export function radiusPxAt(zoom: number, size: [number, number], maxxy: number): number {
  const arm = Math.floor(Math.min(size[0], size[1]) / 4);
  return (arm * maxxy) / (256 * Math.pow(2, zoom));
}

// ─── 凸包・標本 ───────────────────────────────────────────────────────────────

export function hullOfGcps(paperPoints: number[][]): Feature<Polygon> | null {
  if (paperPoints.length < 3) return null;
  return convex(featureCollection(paperPoints.map(p => point([p[0], p[1]]))));
}

export interface SampleBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export function boxOf(positions: number[][]): SampleBox {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of positions) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  return { minX, minY, maxX, maxY };
}

/** 凸包（無ければ外接矩形）の内側へ種固定で一様標本する */
export function samplePointsIn(
  hull: Feature<Polygon> | null,
  box: SampleBox,
  count: number,
  rng: () => number
): number[][] {
  const points: number[][] = [];
  let guard = 0;
  while (points.length < count && guard < count * 200) {
    guard++;
    const x = box.minX + rng() * (box.maxX - box.minX);
    const y = box.minY + rng() * (box.maxY - box.minY);
    if (hull && !booleanPointInPolygon(point([x, y]), hull, { ignoreBoundary: false })) continue;
    points.push([x, y]);
  }
  return points;
}

// ─── 数値整形 ─────────────────────────────────────────────────────────────────

export function fmt(v: number, digits = 2): string {
  if (!Number.isFinite(v)) return "—";
  return v.toFixed(digits);
}

export function fmtSci(v: number): string {
  if (!Number.isFinite(v)) return "—";
  if (v === 0) return "0";
  return v.toExponential(1);
}

export function fmtMs(v: number): string {
  if (!Number.isFinite(v)) return "—";
  return v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2);
}

export function fmtUs(v: number): string {
  if (!Number.isFinite(v)) return "—";
  return v >= 100 ? v.toFixed(0) : v.toFixed(1);
}

// ─── Markdown ─────────────────────────────────────────────────────────────────

export function mdTable(header: string[], rows: string[][]): string {
  const lines = [
    `| ${header.join(" | ")} |`,
    `|${header.map(() => "---").join("|")}|`,
    ...rows.map(row => `| ${row.join(" | ")} |`)
  ];
  return lines.join("\n");
}

/** `<!-- bench:NAME -->` … `<!-- /bench:NAME -->` の中身を差し替える */
export function replaceRegion(doc: string, name: string, body: string): string {
  const start = `<!-- bench:${name} -->`;
  const end = `<!-- /bench:${name} -->`;
  const i = doc.indexOf(start);
  const j = doc.indexOf(end);
  if (i < 0 || j < 0 || j < i) {
    throw new Error(`docs/measurements の領域マーカーが見つかりません: ${name}`);
  }
  return doc.slice(0, i + start.length) + "\n" + body + "\n" + doc.slice(j);
}

export function writeRegion(root: string, docPath: string, name: string, body: string): void {
  const full = `${root}/${docPath}`;
  const doc = fs.readFileSync(full, "utf-8");
  fs.writeFileSync(full, replaceRegion(doc, name, body));
}
