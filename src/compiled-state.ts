import { featureCollection, point } from "@turf/turf";
import type { Position } from "geojson";
import { normalizeEdges } from "./edgeutils.ts";
import { indexesToTri, normalizeNodeKey } from "./triangulation.ts";
import type { PropertyTriKey } from "./geometry.ts";
import type {
  BiDirectionKey,
  Compiled,
  CompiledLegacy,
  LegacyStatePayload,
  ModernStatePayload,
  PointSet,
  StrictStatus,
  TinsBD,
  VerticesParamsBD,
  WeightBufferBD
} from "./types.ts";
import type { WeightBuffer } from "./geometry.ts";

export const FORMAT_VERSION = 2.00703;

/**
 * Type guard for discriminating modern compiled payloads.
 */
export function isModernCompiled(
  compiled: Compiled | CompiledLegacy
): compiled is Compiled {
  return Boolean(
    compiled.version ||
    (!(compiled as CompiledLegacy).tins && compiled.points && compiled.tins_points)
  );
}

/**
 * Restore the in-memory state produced by modern compiled payloads.
 */
export function restoreModernState(compiled: Compiled): ModernStatePayload {
  return {
    points: compiled.points,
    pointsWeightBuffer: normalizeWeightBuffer(compiled),
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
    xy: compiled.bounds ? compiled.xy : [0, 0]
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
  return {
    compiled: normalized,
    tins,
    points: rebuildLegacyPoints(tins),
    strictStatus: normalized.strict_status,
    pointsWeightBuffer: normalized.weight_buffer,
    verticesParams: normalized.vertices_params as VerticesParamsBD,
    centroid: normalized.centroid,
    kinks: normalized.kinks
  };
}

function normalizeWeightBuffer(compiled: Compiled): WeightBufferBD {
  if (!compiled.version || compiled.version < FORMAT_VERSION) {
    return (["forw", "bakw"] as BiDirectionKey[]).reduce((bd, forb) => {
      const base = compiled.weight_buffer[forb];
      if (base) {
        bd[forb] = Object.keys(base).reduce((buffer, key) => {
          const normKey = normalizeNodeKey(key);
          buffer[normKey] = base[key];
          return buffer;
        }, {} as WeightBuffer);
      }
      return bd;
    }, {} as WeightBufferBD);
  }
  return compiled.weight_buffer;
}

function deriveStrictStatus(compiled: Compiled): StrictStatus {
  if (compiled.strict_status) return compiled.strict_status;
  if (compiled.kinks_points) return "strict_error";
  if (compiled.tins_points.length === 2) return "loose";
  return "strict";
}

function buildVerticesParams(compiled: Compiled): VerticesParamsBD {
  const params: VerticesParamsBD = {
    forw: [compiled.vertices_params[0]],
    bakw: [compiled.vertices_params[1]]
  };
  params.forw![1] = buildVertexTins(compiled, false);
  params.bakw![1] = buildVertexTins(compiled, true);
  return params;
}

function buildVertexTins(compiled: Compiled, bakw: boolean) {
  return [0, 1, 2, 3].map(idx => {
    const idxNxt = (idx + 1) % 4;
    const tri = indexesToTri(
      ["c", `b${idx}`, `b${idxNxt}`],
      compiled.points,
      compiled.edgeNodes || [],
      compiled.centroid_point,
      compiled.vertices_points,
      bakw,
      FORMAT_VERSION
    );
    return featureCollection([tri]);
  });
}

function buildCentroid(compiled: Compiled) {
  return {
    forw: point(compiled.centroid_point[0], {
      target: {
        geom: compiled.centroid_point[1],
        index: "c"
      }
    }),
    bakw: point(compiled.centroid_point[1], {
      target: {
        geom: compiled.centroid_point[0],
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
          compiled.centroid_point,
          compiled.vertices_points,
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
          compiled.centroid_point,
          compiled.vertices_points,
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
    (["a", "b", "c"] as PropertyTriKey[]).map((key, idx) => {
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
