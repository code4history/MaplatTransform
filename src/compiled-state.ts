import { featureCollection, point } from "@turf/turf";
import type { Position } from "geojson";
import { normalizeEdges } from "./edgeutils.ts";
import { indexesToTri } from "./triangulation.ts";
import type { PropertyTriKey, VerticesParams } from "./geometry.ts";
import type {
  Compiled,
  CompiledLegacy,
  CompiledTransformData,
  LegacyStatePayload,
  ModernStatePayload,
  PointSet,
  StrictStatus,
  TinsBD,
  VerticesParamsBD
} from "./types.ts";

/** V2 フォーマット版。2.00704: weight_buffer を廃止（空 {} を書く・読み込み時は無視）。旧キー正規化の閾値 2.00703 は triangulation.ts / edgeutils.ts のリテラルで、この定数とは独立 */
export const FORMAT_VERSION = 2.00704;
/** V3 も weight_buffer 廃止に合わせて 3.00001 に揃える（表示上の整合。外部へは export されず比較にも使われない） */
export const FORMAT_VERSION_V3 = 3.00001;

/**
 * Type guard for discriminating modern compiled payloads.
 */
export function isModernCompiled(
  compiled: Compiled | CompiledLegacy
): compiled is Compiled {
  return Boolean(
    compiled.version !== undefined ||
    (!(compiled as CompiledLegacy).tins && compiled.points && compiled.tins_points)
  );
}

/**
 * Restore the in-memory state produced by modern compiled payloads.
 */
export function restoreModernState(compiled: Compiled): ModernStatePayload {
  return {
    points: compiled.points,
    strictStatus: deriveStrictStatus(compiled),
    verticesParams: buildVerticesParams(compiled),
    centroid: buildCentroid(compiled),
    edges: normalizeEdges(compiled.edges || []),
    edgeNodes: compiled.edgeNodes || [],
    tins: buildTins(compiled),
    kinks: buildKinks(compiled.kinks_points),
    yaxisMode: compiled.yaxisMode ?? "invert",
    strictMode: compiled.strictMode ?? "auto",
    vertexMode: compiled.vertexMode,
    bounds: compiled.bounds,
    boundsPolygon: compiled.boundsPolygon,
    wh: compiled.wh,
    xy: compiled.xy ?? [0, 0]
  };
}

/**
 * Restore the in-memory state produced by the legacy payloads.
 */
export function restoreLegacyState(
  rawCompiled: CompiledLegacy
): LegacyStatePayload {
  const normalized = normalizeLegacyStructure(rawCompiled);
  const tins = normalized.tins!;
  const verticesParams = normalized.vertices_params as
    | VerticesParamsBD
    | undefined;
  // vertices_params を持たない旧データは今までどおり読む（三角網の外の点だけが変換できない）
  if (verticesParams != null) assertVerticesParams(verticesParams);
  return {
    compiled: normalized,
    tins,
    points: rebuildLegacyPoints(tins),
    strictStatus: normalized.strict_status,
    verticesParams: verticesParams as VerticesParamsBD,
    centroid: normalized.centroid,
    kinks: normalized.kinks
  };
}

/** compiled から層の strict_status を決める（§4.1 の ViewpointField 判定でも使う） */
export function deriveStrictStatus(compiled: Compiled | CompiledTransformData): StrictStatus {
  if (compiled.strict_status) return compiled.strict_status;
  if (compiled.kinks_points) return "strict_error";
  if (compiled.tins_points.length === 2) return "loose";
  return "strict";
}

function buildVerticesParams(compiled: Compiled): VerticesParamsBD {
  if ("outerTransform" in compiled && compiled.outerTransform === "worldFile" && !compiled.vertices_params) {
    return { forw: [[], []], bakw: [[], []] };
  }
  // 頂点の三角形を作る数は vertices_points の長さで決まるので、作る前に配列であることを確かめる
  if (
    !Array.isArray(compiled.vertices_params) ||
    !Array.isArray(compiled.vertices_points)
  ) {
    throw new Error(
      "Invalid compiled data: vertices_params and vertices_points must be arrays"
    );
  }
  const params: VerticesParamsBD = {
    forw: [compiled.vertices_params[0]],
    bakw: [compiled.vertices_params[1]]
  };
  params.forw![1] = buildVertexTins(compiled, false);
  params.bakw![1] = buildVertexTins(compiled, true);
  assertVerticesParams(params);
  return params;
}

/**
 * 復元した頂点の表（向きごとに [角度の表, 頂点の三角形の表]）の形を確かめる。
 * 新形式・旧形式のどちらの読み込みもこの 1 つを通る。
 *
 * 三角網の外の点の変換は角度の表を端から端まで回るので、表が本物の配列で、
 * 長さが頂点の三角形の数と同じで、有限の数だけが並んでいることを読み込みで確かめる。
 * 長さの照合を先に行うので、要素を見る回数も頂点の三角形の数までになる
 */
function assertVerticesParams(params: VerticesParamsBD): void {
  if (typeof params !== "object") {
    throw new Error("Invalid compiled data: vertices_params has a wrong shape");
  }
  (["forw", "bakw"] as const).forEach(side => {
    const entry: VerticesParams | null | undefined = params[side];
    if (entry == null) return;
    const label = `vertices_params.${side}`;
    const radians: unknown = entry[0];
    const tins: unknown = entry[1];
    if (!Array.isArray(radians) || !Array.isArray(tins)) {
      throw new Error(`Invalid compiled data: ${label} must hold two arrays`);
    }
    if (radians.length !== tins.length) {
      throw new Error(
        `Invalid compiled data: ${label} must have one angle per vertex`
      );
    }
    for (let i = 0; i < radians.length; i++) {
      if (typeof radians[i] !== "number" || !Number.isFinite(radians[i])) {
        throw new Error(
          `Invalid compiled data: ${label} must contain only finite numbers`
        );
      }
    }
  });
}

function buildVertexTins(compiled: Compiled, bakw: boolean) {
  const N = compiled.vertices_points!.length;
  return Array.from({ length: N }, (_, idx) => {
    const idxNxt = (idx + 1) % N;
    const tri = indexesToTri(
      ["c", `b${idx}`, `b${idxNxt}`],
      compiled.points,
      compiled.edgeNodes || [],
      compiled.centroid_point!,
      compiled.vertices_points!,
      bakw,
      FORMAT_VERSION
    );
    return featureCollection([tri]);
  });
}

function buildCentroid(compiled: Compiled) {
  return {
    forw: point(compiled.centroid_point![0], {
      target: {
        geom: compiled.centroid_point![1],
        index: "c"
      }
    }),
    bakw: point(compiled.centroid_point![1], {
      target: {
        geom: compiled.centroid_point![0],
        index: "c"
      }
    })
  };
}

function buildTins(compiled: Compiled) {
  const bakwIndex = compiled.tins_points.length === 1 ? 0 : 1;
  return {
    forw: featureCollection(
      compiled.tins_points[0].map(idxes =>
        indexesToTri(
          idxes,
          compiled.points,
          compiled.edgeNodes || [],
          compiled.centroid_point!,
          compiled.vertices_points!,
          false,
          compiled.version
        )
      )
    ),
    bakw: featureCollection(
      compiled.tins_points[bakwIndex].map(idxes =>
        indexesToTri(
          idxes,
          compiled.points,
          compiled.edgeNodes || [],
          compiled.centroid_point!,
          compiled.vertices_points!,
          true,
          compiled.version
        )
      )
    )
  };
}

function buildKinks(kinksPoints?: Position[]) {
  if (!kinksPoints) return undefined;
  return {
    bakw: featureCollection(
      kinksPoints.map((coord: Position) => point(coord))
    )
  };
}

function normalizeLegacyStructure(
  compiled: CompiledLegacy
): CompiledLegacy {
  return JSON.parse(
    JSON.stringify(compiled)
      .replace('"cent"', '"c"')
      .replace(/"bbox(\d+)"/g, '"b$1"')
  );
}

function rebuildLegacyPoints(tins: TinsBD): PointSet[] {
  const points: PointSet[] = [];
  const features = tins.forw!.features;
  for (let i = 0; i < features.length; i++) {
    const tri = features[i];
    (["a", "b", "c"] as PropertyTriKey[]).forEach((key, idx) => {
      const forw = tri.geometry!.coordinates[0][idx];
      const bakw = tri.properties![key].geom;
      const pIdx = tri.properties![key].index;
      if (typeof pIdx === "number") {
        points[pIdx] = [forw, bakw];
      }
    });
  }
  return points;
}
