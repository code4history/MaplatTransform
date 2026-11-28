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
  CompiledLegacy,
  CompiledWorldFileOuter,
  CompiledExtrapolate,
  CompiledTransformData
} from "./types.ts";
export type { Tins, Tri, PropertyTriKey } from "./geometry.ts";
export { transformArr } from "./geometry.ts";
export { rotateVerticesTriangle, counterTri } from "./triangulation.ts";
export type { Edge, EdgeSet, EdgeSetLegacy } from "./edgeutils.ts";
export { normalizeEdges } from "./edgeutils.ts";
export { Transform, format_version } from "./transform.ts";
export { WorldFileSurface } from "./world-file-surface.ts";
export { builtinProjectionEngine, createProj4ProjectionEngine } from "./projection.ts";
export type { Proj4Factory } from "./projection.ts";
export type { WorldFileSurfaceOptions } from "./world-file-surface.ts";
export { worldFileToCrs, crsToWorldFilePixel, validateWorldFile } from "./world-file.ts";

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
export { recommendViewpointMode } from "./recommend-viewpoint.ts";
export type {
  Viewpoint,
  SubMapData,
  MapData,
  WorldFile,
  CrsObject,
  ProjectionEngine,
  SurfaceLike,
  TinSurfaceData,
  WorldFileSurfaceData,
  LayerSurfaceData,
  LayeredMapData,
  ViewpointMode,
  ViewpointCoefficients,
  RecommendViewpointModeResult,
  RecommendViewpointModeOptions
} from "./types.ts";
