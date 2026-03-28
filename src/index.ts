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
export { Transform, format_version } from "./transform.ts";

// New exports: constants, pure functions, MapTransform
export { MERC_MAX, MERC_CROSSMATRIX } from "./constants.ts";
export {
  zoom2Radius,
  rotateMatrix,
  mercViewpoint2Mercs,
  mercs2MercViewpoint
} from "./viewpoint.ts";
export { xy2SysCoord, sysCoord2Xy } from "./coord-utils.ts";
export { MapTransform } from "./map-transform.ts";
export type {
  Viewpoint,
  SubMapData,
  MapData
} from "./types.ts";
