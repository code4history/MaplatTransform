// Deno/JSR entry point with .ts extensions
// This file directly imports and re-exports to avoid import extension issues

// Main imports
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { featureCollection, point } from "@turf/helpers";
import { getCoords } from "@turf/invariant";
import { indexesToTri, normalizeNodeKey } from "./src/triangulation.ts";
import type { Feature, Polygon, Position, Point, FeatureCollection } from "geojson";
import { normalizeEdges } from "./src/edgeutils.ts";
import type { 
  WeightBuffer, Tins, VerticesParams, PropertyTriKey, 
  IndexedTins, Tri
} from "./src/geometry.ts";
import { unitCalc, transformArr } from "./src/geometry.ts";
import type { EdgeSet, EdgeSetLegacy } from "./src/edgeutils.ts";

// Re-export everything from index.ts content
export { Transform } from "./src/index.ts";
export type { 
  Compiled, 
  CompiledLegacy, 
  StrictMode, 
  StrictStatus, 
  YaxisMode,
  PointSet,
  BiDirectionKey,
  VertexMode,
  TinsBD,
  Centroid,
  CentroidBD,
  Kinks,
  KinksBD,
  WeightBufferBD,
  VerticesParamsBD,
  IndexedTinsBD
} from "./src/index.ts";

// Re-export from other modules
export type { Tins, Tri, PropertyTriKey } from "./src/geometry.ts";
export { transformArr } from "./src/geometry.ts";
export { rotateVerticesTriangle, counterTri } from "./src/triangulation.ts";
export type { Edge, EdgeSet, EdgeSetLegacy } from "./src/edgeutils.ts";
export { normalizeEdges } from "./src/edgeutils.ts";