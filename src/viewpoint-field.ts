import type { Feature, Polygon } from "geojson";
import { booleanPointInPolygon, convex, featureCollection, point } from "@turf/turf";
import { Transform } from "./transform.ts";
import { wrapAngle } from "./viewpoint.ts";
import {
  JUDGE_STATISTIC,
  N_LONG,
  N_MARGIN,
  N_SHORT_MIN,
  PROBE_RADIUS_CELLS,
  ROTATION_THRESHOLD_DEG,
  SCALE_RATIO_THRESHOLD,
  UNIT_VECTOR_DEGENERATE_EPS2
} from "./viewpoint-constants.ts";
import type {
  PointSet,
  StrictStatus,
  SurfaceLike,
  ViewpointCoefficients,
  ViewpointMode
} from "./types.ts";

/** 層の strict / loose / strict_error の別（§4.1） */
export type LayerStrictness = StrictStatus;

/** 視点グリッド（ln s・cosθ・sinθ の 3 スカラー） */
export interface CoefficientGrid {
  /** 格子点数（x 方向） */
  nx: number;
  /** 格子点数（y 方向） */
  ny: number;
  /** 余白込みグリッドの左下端 */
  x0: number;
  y0: number;
  dx: number;
  dy: number;
  ls: Float64Array;
  cs: Float64Array;
  sn: Float64Array;
}

/** 紙側基準矩形（§2.1 1.） */
export interface PaperRect {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/** ViewpointField 構築の入力 */
export interface ViewpointFieldInput {
  surface: SurfaceLike;
  /** "grid"（モード 2）または "constant"（モード 1） */
  mode: "grid" | "constant";
  /** 層の strict / loose / strict_error の別 */
  strictness: LayerStrictness;
  /** 紙側基準矩形（省略時は surface から推定） */
  paperRect?: PaperRect;
  /** G_in 絞り込みの領域多角形（副層は subMap.bounds） */
  regionPolygon?: Feature<Polygon>;
  /** 紙座標を含む GCP 列（優先。無ければ surface.points） */
  gcps?: PointSet[];
  /**
   * 内側本体の長辺分割数（省略時は viewpoint-constants の N_LONG）。
   * 実測（§2.2 4.）で分割数を変えて比較するための口。既定値は変えない。
   */
  nLong?: number;
  /**
   * 4 点プローブの半径（セル数、省略時は PROBE_RADIUS_CELLS）。
   * 実測（§2.2 4.）で半径を変えて比較するための口。既定値は変えない。
   */
  probeRadiusCells?: number;
}

interface GridSpec {
  x0: number;
  y0: number;
  dx: number;
  dy: number;
  mx: number;
  my: number;
  nxInner: number;
  nyInner: number;
}

interface RawSample {
  paper: number[];
  s: number;
  theta: number;
}

/** 判定に使う偏差統計（§5.2） */
export interface DeviationStats {
  maxRotationDiffRad: number;
  p95RotationDiffRad: number;
  maxScaleRatioDiff: number;
  p95ScaleRatioDiff: number;
  sampleCount: number;
}

function finite2(coord: number[] | false | undefined): coord is number[] {
  return Array.isArray(coord) && coord.length >= 2 && Number.isFinite(coord[0]) && Number.isFinite(coord[1]);
}

function bboxOf(positions: number[][]): PaperRect {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of positions) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  if (!Number.isFinite(minX)) throw new Error("視点グリッドの範囲を有限な座標から決められません");
  return { minX, minY, maxX, maxY };
}

/**
 * 紙側基準矩形を決める（§2.1 1.）。
 * 副層の bounds 相当（overrideBounds）があればそれを外接矩形にし、
 * なければ surface の xy/wh、bounds、GCP 紙座標の順に落としこむ。
 */
export function paperRectOf(surface: SurfaceLike, overrideBounds?: number[][]): PaperRect {
  if (overrideBounds?.length) return bboxOf(overrideBounds);
  if (surface.xy && surface.wh) {
    return {
      minX: surface.xy[0],
      minY: surface.xy[1],
      maxX: surface.xy[0] + surface.wh[0],
      maxY: surface.xy[1] + surface.wh[1]
    };
  }
  if (surface.wh) return { minX: 0, minY: 0, maxX: surface.wh[0], maxY: surface.wh[1] };
  if (surface.bounds?.length) return bboxOf(surface.bounds);
  const pts = (surface as { points?: PointSet[] }).points;
  if (pts?.length) return bboxOf(pts.map(p => p[0] as number[]));
  throw new Error("視点グリッドの紙側基準矩形を決められません（wh / bounds / GCP がありません）");
}

/**
 * 層の strict / loose / strict_error を決める（§4.1）。
 * `Transform` 以外（WorldFileSurface 等）は可逆な strict 扱い。
 */
export function classifyStrictness(surface: SurfaceLike, resolved?: LayerStrictness): LayerStrictness {
  if (!(surface instanceof Transform)) return "strict";
  return surface.strict_status ?? resolved ?? "strict";
}


function gridSpec(rect: PaperRect, nLong: number = N_LONG): GridSpec {
  const lx = rect.maxX - rect.minX;
  const ly = rect.maxY - rect.minY;
  if (!(lx > 0) || !(ly > 0)) {
    throw new Error("視点グリッドの基準矩形に面積がありません");
  }
  const longSide = Math.max(lx, ly);
  const shortSide = Math.min(lx, ly);
  const nShort = Math.min(
    nLong,
    Math.max(N_SHORT_MIN, Math.round((nLong * shortSide) / longSide))
  );
  const nxInner = lx >= ly ? nLong : nShort;
  const nyInner = lx >= ly ? nShort : nLong;
  const dx = lx / nxInner;
  const dy = ly / nyInner;
  return {
    x0: rect.minX - N_MARGIN * dx,
    y0: rect.minY - N_MARGIN * dy,
    dx,
    dy,
    mx: nxInner + 2 * N_MARGIN,
    my: nyInner + 2 * N_MARGIN,
    nxInner,
    nyInner
  };
}

/**
 * 4 点プローブの材料を集める。
 * d は「Y 上向き」の入力変位で、紙側は (Δx, −Δy)、地理側は (ΔX, ΔY)（§1.1）。
 */
function collectProbes(
  surface: SurfaceLike,
  p0: number[],
  r: number,
  backward: boolean
): { valid: { d: [number, number]; out: number[] }[]; center: number[] | false } {
  const yFlip = !backward;
  const offsets: [number, number][] = [[r, 0], [-r, 0], [0, r], [0, -r]];
  const valid: { d: [number, number]; out: number[] }[] = [];
  for (const d of offsets) {
    const input = yFlip ? [p0[0] + d[0], p0[1] - d[1]] : [p0[0] + d[0], p0[1] + d[1]];
    const out = surface.transform(input, backward, true);
    if (finite2(out)) valid.push({ d, out });
  }
  return { valid, center: surface.transform(p0, backward, true) };
}

/** 出力を Y 上向き系（紙側は p̃ = (x, −y)）へそろえる */
function toYUp(out: number[], backward: boolean): [number, number] {
  return backward ? [out[0], -out[1]] : [out[0], out[1]];
}

/** 2×2 差分ヤコビ行列から s = sqrt(|det J|)・θ = atan2(J21−J12, J11+J22)（§1.2） */
function coefficientsFromJacobian(
  j11: number,
  j12: number,
  j21: number,
  j22: number
): ViewpointCoefficients | null {
  const det = j11 * j22 - j12 * j21;
  if (!(det > 0) || !Number.isFinite(det)) return null;
  const s = Math.sqrt(det);
  const theta = Math.atan2(j21 - j12, j11 + j22);
  return Number.isFinite(s) && Number.isFinite(theta) ? { s, theta } : null;
}

/** 同一直線 2 点のみの端ケース用 2D 相似最小二乗（§1.2 3.） */
function coefficientsFromSimilarity(
  probes: { d: [number, number]; out: number[] }[],
  centerUp: [number, number],
  backward: boolean
): ViewpointCoefficients | null {
  let numA = 0, numB = 0, denom = 0;
  for (const { d, out } of probes) {
    const [du, dv] = toYUp(out, backward);
    const u = d[0];
    const v = d[1];
    const duOut = du - centerUp[0];
    const dvOut = dv - centerUp[1];
    numA += u * duOut + v * dvOut;
    numB += u * dvOut - v * duOut;
    denom += u * u + v * v;
  }
  if (!(denom > 0)) return null;
  const a = numA / denom;
  const b = numB / denom;
  const scale = Math.hypot(a, b);
  if (!(scale > 0) || !Number.isFinite(scale)) return null;
  return backward
    ? { s: 1 / scale, theta: -Math.atan2(b, a) }
    : { s: scale, theta: Math.atan2(b, a) };
}

function invertCoefficients(coef: ViewpointCoefficients | null): ViewpointCoefficients | null {
  if (!coef) return null;
  return { s: 1 / coef.s, theta: -coef.theta };
}

/**
 * 1 格子点の係数を 4 点プローブで求める（§1.2）。
 * 全プローブ失敗・境界外れ・det ≤ 0 のときは null（無効印）。
 * 実測（§2.2 4. の局所値の基準）でも使うため公開する。
 */
export function probeCoefficients(
  surface: SurfaceLike,
  p0: number[],
  r: number,
  backward: boolean
): ViewpointCoefficients | null {
  const { valid, center } = collectProbes(surface, p0, r, backward);
  const centerUp = finite2(center) ? toYUp(center, backward) : null;
  const find = (u: number, v: number): [number, number] | undefined => {
    const hitProbe = valid.find(p => p.d[0] === u && p.d[1] === v);
    return hitProbe ? toYUp(hitProbe.out, backward) : undefined;
  };
  if (valid.length >= 4) {
    const east = find(r, 0)!, west = find(-r, 0)!, north = find(0, r)!, south = find(0, -r)!;
    const jac = coefficientsFromJacobian(
      (east[0] - west[0]) / (2 * r),
      (north[0] - south[0]) / (2 * r),
      (east[1] - west[1]) / (2 * r),
      (north[1] - south[1]) / (2 * r)
    );
    return backward ? invertCoefficients(jac) : jac;
  }
  if (!centerUp) return null;
  const isX = (d: [number, number]): boolean => d[1] === 0;
  const xProbes = valid.filter(p => isX(p.d));
  const yProbes = valid.filter(p => !isX(p.d));
  const orthogonal = xProbes.length >= 1 && yProbes.length >= 1;
  if (valid.length >= 3 || (valid.length === 2 && orthogonal)) {
    // 生きている軸は中心差分、片側だけの軸は中心からの片側差分で各列を作る（§1.2 3.）
    const column = (plus?: [number, number], minus?: [number, number]): [number, number] | null => {
      if (plus && minus) return [(plus[0] - minus[0]) / (2 * r), (plus[1] - minus[1]) / (2 * r)];
      if (plus) return [(plus[0] - centerUp[0]) / r, (plus[1] - centerUp[1]) / r];
      if (minus) return [(centerUp[0] - minus[0]) / r, (centerUp[1] - minus[1]) / r];
      return null;
    };
    const colX = column(find(r, 0), find(-r, 0));
    const colY = column(find(0, r), find(0, -r));
    if (!colX || !colY) return null;
    const jac = coefficientsFromJacobian(colX[0], colY[0], colX[1], colY[1]);
    return backward ? invertCoefficients(jac) : jac;
  }
  if (valid.length === 2) {
    return coefficientsFromSimilarity(valid, centerUp, backward);
  }
  return null;
}

/** 双線形補間（ln s・単位ベクトル＋端値クランプ、§1.3） */
export function interpolateGrid(grid: CoefficientGrid, x: number, y: number): ViewpointCoefficients {
  const xi = Math.min(Math.max((x - grid.x0) / grid.dx, 0), grid.nx - 1);
  const eta = Math.min(Math.max((y - grid.y0) / grid.dy, 0), grid.ny - 1);
  const i0 = Math.min(Math.floor(xi), grid.nx - 2);
  const j0 = Math.min(Math.floor(eta), grid.ny - 2);
  const fx = xi - i0;
  const fy = eta - j0;
  const w: [number, number, number, number] = [
    (1 - fx) * (1 - fy),
    fx * (1 - fy),
    (1 - fx) * fy,
    fx * fy
  ];
  const at = (arr: Float64Array, i: number, j: number): number => arr[j * grid.nx + i];
  const corners: [number, number][] = [[i0, j0], [i0 + 1, j0], [i0, j0 + 1], [i0 + 1, j0 + 1]];
  let l = 0, c = 0, d = 0;
  for (let k = 0; k < 4; k++) {
    const [i, j] = corners[k];
    l += w[k] * at(grid.ls, i, j);
    c += w[k] * at(grid.cs, i, j);
    d += w[k] * at(grid.sn, i, j);
  }
  const s = Math.exp(l);
  const theta =
    c * c + d * d > UNIT_VECTOR_DEGENERATE_EPS2
      ? Math.atan2(d, c)
      : Math.atan2(at(grid.sn, i0, j0), at(grid.cs, i0, j0));
  return { s, theta };
}

function buildGrid(
  surface: SurfaceLike,
  rect: PaperRect,
  backward: boolean,
  probeRadiusCells: number = PROBE_RADIUS_CELLS,
  nLong?: number
): CoefficientGrid {
  const spec = gridSpec(rect, nLong);
  const nx = spec.mx + 1;
  const ny = spec.my + 1;
  const ls = new Float64Array(nx * ny);
  const cs = new Float64Array(nx * ny);
  const sn = new Float64Array(nx * ny);
  const validMask = new Uint8Array(nx * ny);
  const r = probeRadiusCells * Math.min(spec.dx, spec.dy);
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const p0 = [spec.x0 + i * spec.dx, spec.y0 + j * spec.dy];
      const coef = probeCoefficients(surface, p0, r, backward);
      const idx = j * nx + i;
      if (coef && coef.s > 0 && Number.isFinite(coef.s)) {
        ls[idx] = Math.log(coef.s);
        cs[idx] = Math.cos(coef.theta);
        sn[idx] = Math.sin(coef.theta);
        validMask[idx] = 1;
      }
    }
  }
  // 無効ノードは有効な最近傍ノードの値で埋める（§1.2 3.）。全滅時は単位フォールバック。
  const validIndices: number[] = [];
  for (let idx = 0; idx < validMask.length; idx++) if (validMask[idx]) validIndices.push(idx);
  if (validIndices.length === 0) {
    ls.fill(0);
    cs.fill(1);
    sn.fill(0);
  } else {
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const idx = j * nx + i;
        if (validMask[idx]) continue;
        let best = validIndices[0];
        let bestDist = Infinity;
        for (const cand of validIndices) {
          const ci = cand % nx;
          const cj = (cand - ci) / nx;
          const dist = (ci - i) * (ci - i) + (cj - j) * (cj - j);
          if (dist < bestDist) {
            bestDist = dist;
            best = cand;
          }
        }
        ls[idx] = ls[best];
        cs[idx] = cs[best];
        sn[idx] = sn[best];
      }
    }
  }
  return { nx, ny, x0: spec.x0, y0: spec.y0, dx: spec.dx, dy: spec.dy, ls, cs, sn };
}

function mercRectOf(surface: SurfaceLike, rect: PaperRect): PaperRect {
  // 紙の基準矩形の外周 4 辺（各辺 8 分割・計 32 点）＋内部 3×3 標本点（§2.1 2.）
  const samples: number[][] = [];
  for (let k = 0; k <= 8; k++) {
    const t = k / 8;
    samples.push([rect.minX + (rect.maxX - rect.minX) * t, rect.minY]);
    samples.push([rect.minX + (rect.maxX - rect.minX) * t, rect.maxY]);
    samples.push([rect.minX, rect.minY + (rect.maxY - rect.minY) * t]);
    samples.push([rect.maxX, rect.minY + (rect.maxY - rect.minY) * t]);
  }
  for (let k = 1; k <= 3; k++) {
    for (let m = 1; m <= 3; m++) {
      samples.push([
        rect.minX + ((rect.maxX - rect.minX) * k) / 4,
        rect.minY + ((rect.maxY - rect.minY) * m) / 4
      ]);
    }
  }
  const outputs: number[][] = [];
  for (const xy of samples) {
    const out = surface.transform(xy, false, true);
    if (finite2(out)) outputs.push(out);
  }
  if (!outputs.length) {
    throw new Error("視点グリッドの地理側範囲を決められません（有効な標本点がありません）");
  }
  return bboxOf(outputs);
}

function nodeValue(grid: CoefficientGrid, i: number, j: number): ViewpointCoefficients {
  const idx = j * grid.nx + i;
  return { s: Math.exp(grid.ls[idx]), theta: Math.atan2(grid.sn[idx], grid.cs[idx]) };
}

function gcpPaperPoints(input: ViewpointFieldInput): number[][] {
  if (input.gcps?.length) return input.gcps.map(g => (g[0] as number[]).slice(0, 2));
  const pts = (input.surface as { points?: PointSet[] }).points;
  return pts?.map(p => (p[0] as number[]).slice(0, 2)) ?? [];
}

function hullOf(points: number[][]): Feature<Polygon> | null {
  if (points.length < 3) return null;
  return convex(featureCollection(points.map(p => point([p[0], p[1]]))));
}

function inFeature(pos: number[], feature: Feature<Polygon>): boolean {
  return booleanPointInPolygon(point([pos[0], pos[1]]), feature, { ignoreBoundary: false });
}

interface BuiltLayer {
  rect: PaperRect;
  spec: GridSpec;
  paper?: CoefficientGrid;
  merc?: CoefficientGrid;
}

function buildLayerGrids(input: ViewpointFieldInput): BuiltLayer {
  const rect = input.paperRect ?? paperRectOf(input.surface);
  const spec = gridSpec(rect, input.nLong);
  const paper =
    input.strictness === "strict"
      ? undefined
      : buildGrid(input.surface, rect, false, input.probeRadiusCells, input.nLong);
  const merc =
    input.strictness === "strict_error"
      ? undefined
      : buildGrid(
          input.surface,
          mercRectOf(input.surface, rect),
          true,
          input.probeRadiusCells,
          input.nLong
        );
  return { rect, spec, paper, merc };
}

function evaluateAt(built: BuiltLayer, input: ViewpointFieldInput, paperPos: number[]): ViewpointCoefficients | null {
  if (input.strictness === "loose" || input.strictness === "strict_error") {
    return built.paper ? interpolateGrid(built.paper, paperPos[0], paperPos[1]) : null;
  }
  const out = input.surface.transform(paperPos, false, true);
  if (!finite2(out) || !built.merc) return null;
  return interpolateGrid(built.merc, out[0], out[1]);
}

/** 紙面上の均等標本（内側本体の格子点）を集める（§5.1 1.） */
function collectInnerSamples(input: ViewpointFieldInput, built: BuiltLayer): RawSample[] {
  const samples: RawSample[] = [];
  for (let j = 0; j <= built.spec.nyInner; j++) {
    for (let i = 0; i <= built.spec.nxInner; i++) {
      const pi = N_MARGIN + i;
      const pj = N_MARGIN + j;
      const paperPos = [built.spec.x0 + pi * built.spec.dx, built.spec.y0 + pj * built.spec.dy];
      if (input.strictness === "loose" || input.strictness === "strict_error") {
        if (built.paper) samples.push({ paper: paperPos, ...nodeValue(built.paper, pi, pj) });
        continue;
      }
      const out = input.surface.transform(paperPos, false, true);
      if (!finite2(out) || !built.merc) continue;
      const coef = interpolateGrid(built.merc, out[0], out[1]);
      if (coef.s > 0 && Number.isFinite(coef.s) && Number.isFinite(coef.theta)) {
        samples.push({ paper: paperPos, s: coef.s, theta: coef.theta });
      }
    }
  }
  return samples;
}

/**
 * G_in（GCP 凸包内側、副層は ∩ subMap.bounds）の抽出（§5.1 2.・3.）。
 * gcps も compiled.points も無い場合は層の範囲（regionPolygon、無ければ紙の基準矩形）。
 * フィルタ後に |G_in| < 9 ならフィルタ領域の外接矩形 9×9 分割標本へ差し替える。
 */
export function filterInnerSamples(
  input: ViewpointFieldInput,
  built: BuiltLayer,
  samples: RawSample[]
): RawSample[] {
  const hull = hullOf(gcpPaperPoints(input));
  const region = input.regionPolygon;
  const keep = (pos: number[]): boolean => {
    if (hull && !inFeature(pos, hull)) return false;
    if (region && !inFeature(pos, region)) return false;
    return true;
  };
  const filtered = samples.filter(sample => keep(sample.paper));
  if (filtered.length >= 9) return filtered;

  // 安全網（§5.1 3.）: フィルタ領域の外接矩形 9×9 分割標本
  const regionBox = hull
    ? bboxOf(hull.geometry.coordinates[0])
    : region
      ? bboxOf(region.geometry.coordinates[0])
      : bboxOf(samples.map(s => s.paper));
  const grid9: RawSample[] = [];
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const pos = [
        regionBox.minX + ((regionBox.maxX - regionBox.minX) * (i + 0.5)) / 9,
        regionBox.minY + ((regionBox.maxY - regionBox.minY) * (j + 0.5)) / 9
      ];
      if (!keep(pos)) continue;
      const coef = evaluateAt(built, input, pos);
      if (coef && coef.s > 0 && Number.isFinite(coef.s)) grid9.push({ paper: pos, ...coef });
    }
  }
  if (grid9.length) return grid9;
  if (filtered.length) return filtered;
  return samples;
}

/** 標本群から (s0, θ0) の均等平均（§5.1 算出式） */
export function meanCoefficients(samples: RawSample[]): ViewpointCoefficients {
  if (!samples.length) throw new Error("視点係数の標本がありません");
  let l = 0, c = 0, d = 0;
  for (const sample of samples) {
    l += Math.log(sample.s);
    c += Math.cos(sample.theta);
    d += Math.sin(sample.theta);
  }
  const n = samples.length;
  return { s: Math.exp(l / n), theta: Math.atan2(d / n, c / n) };
}

function percentile95(sorted: number[]): number {
  if (!sorted.length) return 0;
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil(0.95 * sorted.length) - 1))];
}

/** (s0, θ0) からの回転・縮尺偏差の統計（§5.2） */
export function deviationStats(samples: RawSample[], base: ViewpointCoefficients): DeviationStats {
  const rotations: number[] = [];
  const scales: number[] = [];
  for (const sample of samples) {
    rotations.push(Math.abs(wrapAngle(sample.theta - base.theta)));
    scales.push(Math.abs(sample.s / base.s - 1));
  }
  rotations.sort((a, b) => a - b);
  scales.sort((a, b) => a - b);
  return {
    maxRotationDiffRad: rotations[rotations.length - 1] ?? 0,
    p95RotationDiffRad: percentile95(rotations),
    maxScaleRatioDiff: scales[scales.length - 1] ?? 0,
    p95ScaleRatioDiff: percentile95(scales),
    sampleCount: samples.length
  };
}

/** 判定統計（仮定数 JUDGE_STATISTIC）が仮閾値内なら "constant"、超過なら "grid"（§5.2） */
export function judgeViewpointMode(stats: DeviationStats): ViewpointMode {
  const rotationDiff =
    JUDGE_STATISTIC === "max" ? stats.maxRotationDiffRad : stats.p95RotationDiffRad;
  const scaleDiff = JUDGE_STATISTIC === "max" ? stats.maxScaleRatioDiff : stats.p95ScaleRatioDiff;
  return rotationDiff <= (ROTATION_THRESHOLD_DEG * Math.PI) / 180 &&
    scaleDiff <= SCALE_RATIO_THRESHOLD
    ? "constant"
    : "grid";
}

/** G_in 標本の一式（モード 1 平均と recommendViewpointMode の共用） */
export function collectGInSamples(input: ViewpointFieldInput): RawSample[] {
  const built = buildLayerGrids(input);
  return filterInnerSamples(input, built, collectInnerSamples(input, built));
}

export type { RawSample as ViewpointSample };

/**
 * 層ごとの視点係数（遅延構築・§2.3）。
 * モード 2 は紙側／地理側グリッド、モード 1 は G_in 平均の単一値 (s0, θ0) を持つ。
 */
export class ViewpointField {
  readonly mode: "grid" | "constant";
  readonly strictness: LayerStrictness;
  private paperGrid?: CoefficientGrid;
  private mercGrid?: CoefficientGrid;
  private constant?: ViewpointCoefficients;

  private constructor(mode: "grid" | "constant", strictness: LayerStrictness) {
    this.mode = mode;
    this.strictness = strictness;
  }

  static build(input: ViewpointFieldInput): ViewpointField {
    const field = new ViewpointField(input.mode, input.strictness);
    const built = buildLayerGrids(input);
    if (input.mode === "constant") {
      const samples = filterInnerSamples(input, built, collectInnerSamples(input, built));
      field.constant = meanCoefficients(samples);
    } else {
      field.paperGrid = built.paper;
      field.mercGrid = built.merc;
    }
    return field;
  }

  /**
   * 中心 1 点の (s, θ) を引く（§7.1）。
   * - constant: 全体の (s0, θ0)
   * - strict / Plan A: 両方向とも地理側グリッド
   * - loose: 順方向は紙側グリッド、逆方向は地理側グリッド
   * - strict_error: 紙側グリッドのみ（逆方向の例外は呼び出し側の逆変換が担う）
   */
  eval(paper: number[], merc: number[], backward: boolean): ViewpointCoefficients {
    if (this.mode === "constant") return this.constant!;
    if (this.strictness === "strict") {
      return interpolateGrid(this.mercGrid!, merc[0], merc[1]);
    }
    if (this.strictness === "loose") {
      return backward
        ? interpolateGrid(this.mercGrid!, merc[0], merc[1])
        : interpolateGrid(this.paperGrid!, paper[0], paper[1]);
    }
    return interpolateGrid(this.paperGrid!, paper[0], paper[1]);
  }
}
