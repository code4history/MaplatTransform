import type { Feature, Polygon } from "geojson";
import { polygon } from "@turf/turf";
import { createLayerSurface } from "./map-transform.ts";
import { classifyStrictness, collectGInSamples, deviationStats, judgeViewpointMode, meanCoefficients } from "./viewpoint-field.ts";
import type { ViewpointFieldInput } from "./viewpoint-field.ts";
import { deriveStrictStatus } from "./compiled-state.ts";
import type {
  LayerSurfaceData,
  RecommendViewpointModeOptions,
  RecommendViewpointModeResult
} from "./types.ts";

function boundsPolygonOf(bounds?: number[][]): Feature<Polygon> | undefined {
  if (!bounds || bounds.length < 3) return undefined;
  const ring = bounds.map(pos => [pos[0], pos[1]]);
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) ring.push([first[0], first[1]]);
  try {
    return polygon([ring]);
  } catch {
    return undefined;
  }
}

/**
 * 1 層分の視点変換モード推奨（設計書 §5.3 1.）。
 *
 * 紙面上の均等標本を GCP 凸包内側（`gcps` 優先、無ければ `compiled.points`。
 * どちらも無ければ層の範囲）へ絞り、(s0, θ0) からの最大・95% 分位の回転偏差と
 * 相対縮尺偏差を算出して、閾値（§5.2。p95 回転 1.0°・p95 縮尺 3%）内なら "constant"、
 * 超過なら "grid" を返す。
 *
 * @param layerSurfaceData - A（WorldFileSurface）/ B / C のいずれの層データでもよい
 * @param options - `projectionEngine`（層の投影）、`gcps`（紙座標を含む GCP 列。Editor は Plan A でも必ず渡す）
 */
export function recommendViewpointMode(
  layerSurfaceData: LayerSurfaceData,
  options?: RecommendViewpointModeOptions
): RecommendViewpointModeResult {
  const surface = createLayerSurface({
    ...layerSurfaceData,
    projectionEngine: options?.projectionEngine ?? layerSurfaceData.projectionEngine
  });
  const strictness =
    layerSurfaceData.kind === "tin"
      ? classifyStrictness(surface, deriveStrictStatus(layerSurfaceData.compiled))
      : classifyStrictness(surface);
  const input: ViewpointFieldInput = {
    surface,
    mode: "grid",
    strictness,
    regionPolygon: boundsPolygonOf(layerSurfaceData.bounds),
    gcps: options?.gcps
  };
  const samples = collectGInSamples(input);
  const base = meanCoefficients(samples);
  const stats = deviationStats(samples, base);
  return {
    recommended: judgeViewpointMode(stats),
    maxRotationDiffDeg: (stats.maxRotationDiffRad * 180) / Math.PI,
    p95RotationDiffDeg: (stats.p95RotationDiffRad * 180) / Math.PI,
    maxScaleRatioDiff: stats.maxScaleRatioDiff,
    p95ScaleRatioDiff: stats.p95ScaleRatioDiff,
    sampleCount: stats.sampleCount
  };
}
