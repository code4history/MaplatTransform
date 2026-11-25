import type { Compiled, MapData, WorldFileSurfaceData, LayeredMapData } from "../src/index.ts";

// 公開型の回帰を tsc で検査する。既存の Compiled と MapData は必須フィールドを保つ。
declare const compiled: Compiled;
declare const mapData: MapData;
compiled.vertices_points.map(pair => pair[0]);
compiled.vertices_params.map(value => value.length);
compiled.centroid_point.map(value => value[0]);
mapData.compiled.vertices_points.map(pair => pair[0]);

// bounds だけで面を作る場合は、3 頂点以上が必要。
const boundsOnly: WorldFileSurfaceData = {
  kind: "worldFile", crs: { epsg: 3857 },
  worldFile: { xScale: 1, xSkew: 0, xOrigin: 0, ySkew: 0, yScale: -1, yOrigin: 0 },
  bounds: [[0, 0], [1, 0], [1, 1]]
};
const layered: LayeredMapData = { main: boundsOnly };
void layered;
// @ts-expect-error wh か3頂点以上の bounds が必須。
const missingDimensions: WorldFileSurfaceData = {
  kind: "worldFile", crs: { epsg: 3857 },
  worldFile: { xScale: 1, xSkew: 0, xOrigin: 0, ySkew: 0, yScale: -1, yOrigin: 0 }
};
void missingDimensions;
