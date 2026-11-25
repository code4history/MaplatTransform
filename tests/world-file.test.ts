import { describe, expect, it } from "vitest";
import fs from "node:fs";
import {
  crsToWorldFilePixel,
  validateWorldFile,
  worldFileToCrs,
  WorldFileSurface,
  MapTransform,
  Transform,
  MERC_MAX
} from "../src/index.ts";
import type { Compiled } from "../src/types.ts";

const compiledFixture = JSON.parse(
  fs.readFileSync(`${__dirname}/compiled/fushimijo_maplat_v2.json`, "utf8")
) as Compiled;

const worldFile = {
  xScale: 2,
  xSkew: 0.25,
  xOrigin: 100,
  ySkew: -0.1,
  yScale: -2,
  yOrigin: 200
};

describe("world file", () => {
  it("半画素を反映して往復変換する", () => {
    const xy = [12.25, 7.5];
    const crs = worldFileToCrs(worldFile, xy);
    expect(crs).toEqual([125.25, 184.825]);
    expect(crsToWorldFilePixel(worldFile, crs)[0]).toBeCloseTo(xy[0], 12);
    expect(crsToWorldFilePixel(worldFile, crs)[1]).toBeCloseTo(xy[1], 12);
  });

  it("非正則・鏡像・有限でない係数を拒否する", () => {
    expect(() => validateWorldFile({ ...worldFile, yScale: 2 })).toThrow(/鏡像/);
    expect(() => validateWorldFile({ ...worldFile, yScale: -0.0125 })).toThrow(/非正則/);
    expect(() => validateWorldFile({ ...worldFile, xScale: Infinity })).toThrow(/有限/);
  });
});

describe("WorldFileSurface", () => {
  it("EPSG:4326 の WorldFile を 3857 に変換して往復する", () => {
    const surface = new WorldFileSurface({
      crs: { epsg: 4326 },
      worldFile: { xScale: 0.01, xSkew: 0, xOrigin: 139, ySkew: 0, yScale: -0.01, yOrigin: 36 },
      wh: [1000, 1000]
    });
    const pixel = [200, 300];
    const merc = surface.transform(pixel);
    expect(merc).not.toBe(false);
    if (merc === false) throw new Error("変換失敗");
    const restored = surface.transform(merc, true);
    expect(restored).not.toBe(false);
    if (restored === false) throw new Error("逆変換失敗");
    expect(Math.hypot(restored[0] - pixel[0], restored[1] - pixel[1])).toBeLessThanOrEqual(1e-6);
    const outsideDomain = new WorldFileSurface({
      crs: { epsg: 4326 },
      worldFile: { xScale: 0.01, xSkew: 0, xOrigin: 0, ySkew: 0, yScale: -0.01, yOrigin: 86 },
      wh: [10, 10]
    });
    expect(outsideDomain.transform([0, 0])).toBe(false);
  });

  it.each([3857, 4326])("内蔵 CRS %s を受け付ける", epsg => {
    expect(() => new WorldFileSurface({ crs: { epsg }, worldFile, wh: [10, 10] })).not.toThrow();
  });

  it.each([6677, 4612, 0])("一期未対応の CRS %s を拒否する", epsg => {
    expect(() => new WorldFileSurface({ crs: { epsg }, worldFile, wh: [10, 10] })).toThrow(/CRS/);
  });

  it("3857・4326 の proj4 は許可リストに一致するものだけ受け付ける", () => {
    expect(() => new WorldFileSurface({
      crs: { epsg: 4326, proj4: "+proj=longlat +datum=WGS84 +no_defs +type=crs" },
      worldFile,
      wh: [10, 10]
    })).not.toThrow();
    expect(() => new WorldFileSurface({
      crs: { epsg: 3857, proj4: "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0 +x_0=0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +axis=enu" },
      worldFile,
      wh: [10, 10]
    })).not.toThrow();
    expect(() => new WorldFileSurface({ crs: { epsg: 4326, proj4: "+proj=merc" }, worldFile, wh: [10, 10] })).toThrow(/一致しない/);
    expect(() => new WorldFileSurface({ crs: { epsg: 4326, proj4: "+proj=longlat +datum=WGS84 +axis=neu" }, worldFile, wh: [10, 10] })).toThrow(/axis/);
    expect(() => new WorldFileSurface({ crs: { epsg: 4326, wkt: "GEOGCS[]" }, worldFile, wh: [10, 10] })).toThrow(/WKT/);
  });
});

describe("MapTransform layered data", () => {
  it("world file の main layer を surface API で取得し視点換算する", () => {
    const map = new MapTransform();
    const pixelScale = (2 * MERC_MAX) / 1024;
    map.setLayeredMapData({
      main: {
        kind: "worldFile",
        crs: { epsg: 3857 },
        worldFile: {
          xScale: pixelScale,
          xSkew: 0,
          xOrigin: -MERC_MAX + pixelScale / 2,
          ySkew: 0,
          yScale: -pixelScale,
          yOrigin: MERC_MAX - pixelScale / 2
        },
        wh: [1000, 1000]
      },
      maxZoom: 1
    });
    expect(map.getSurfaceTransform(0)).toBeInstanceOf(WorldFileSurface);
    expect(map.layerCount).toBe(1);
    const original = { center: [1000, 2000], zoom: 3, rotation: 0.2 };
    const mercs = map.viewpoint2Mercs(original, [800, 600]);
    expect(mercs).toHaveLength(5);
    const restored = map.mercs2Viewpoint(mercs, [800, 600]);
    expect(restored.center[0]).toBeCloseTo(original.center[0], 6);
    expect(restored.center[1]).toBeCloseTo(original.center[1], 6);
    expect(restored.zoom).toBeCloseTo(original.zoom, 6);
    expect(restored.rotation).toBeCloseTo(original.rotation, 6);
  });

  it("TIN の main と world file の sub を同じ層選択に載せる", () => {
    const map = new MapTransform();
    map.setLayeredMapData({
      main: { kind: "tin", compiled: structuredClone(compiledFixture) },
      sub_maps: [{
        kind: "worldFile",
        crs: { epsg: 3857 },
        worldFile: { xScale: 2, xSkew: 0, xOrigin: 15114600, ySkew: 0, yScale: -2, yOrigin: 4156000 },
        wh: [100, 100],
        bounds: [[0, 0], [100, 0], [100, 100], [0, 100]],
        priority: 3,
        importance: 2
      }]
    });
    expect(map.layerCount).toBe(2);
    expect(map.getLayerTransform(0)).toBeInstanceOf(Transform);
    expect(map.getSurfaceTransform(1)).toBeInstanceOf(WorldFileSurface);
    expect(map.getLayerTransform(1)).toBeNull();
    const selected = map.xy2MercWithLayer([50, 50]);
    expect(selected).not.toBe(false);
    if (selected === false) throw new Error("副層の変換失敗");
    expect(selected[0]).toBe(1);
  });
});

describe("compiled outerTransform", () => {
  it("三角網の辺で補間と world file の出力が一致する", () => {
    const compiled = structuredClone(compiledFixture);
    const baseline = new Transform();
    baseline.setCompiled(structuredClone(compiledFixture));
    const triangle = baseline.tins!.forw!.features[0];
    const edgeStart = triangle.geometry.coordinates[0][0];
    const edgeEnd = triangle.geometry.coordinates[0][1];
    const wf = { xScale: 2, xSkew: 0, xOrigin: 500, ySkew: 0, yScale: -2, yOrigin: 500 };
    const toMerc = (xy: number[]) => [500 + 2 * (xy[0] - 0.5), 500 - 2 * (xy[1] - 0.5)];
    compiled.points = compiled.points.map(([xy]) => [xy, toMerc(xy)]);
    compiled.vertices_points = compiled.vertices_points!.map(([xy]) => [xy, toMerc(xy)]);
    compiled.centroid_point = [compiled.centroid_point![0], toMerc(compiled.centroid_point![0])];
    compiled.outerTransform = "worldFile";
    compiled.worldFile = wf;
    const transform = new Transform();
    transform.setCompiled(compiled);
    const edge = [(edgeStart[0] + edgeEnd[0]) / 2, (edgeStart[1] + edgeEnd[1]) / 2];
    expect(transform.transform(edge, false, true)).toEqual(toMerc(edge));
  });

  it("outerTransform が省略された compiled は従来の外挿結果を保つ", () => {
    const legacy = new Transform();
    legacy.setCompiled(structuredClone(compiledFixture));
    const explicit = new Transform();
    explicit.setCompiled({ ...structuredClone(compiledFixture), outerTransform: "extrapolate" });
    const xy = [-12345, -6789];
    expect(legacy.transform(xy, false, true)).toEqual(explicit.transform(xy, false, true));
  });

  it("四辺形の外を world file で順逆変換し、頂点外挿データなしで読み込む", () => {
    const compiled = structuredClone(compiledFixture);
    compiled.outerTransform = "worldFile";
    compiled.strict_status = "strict_error";
    compiled.worldFile = { xScale: 2, xSkew: 0, xOrigin: 500, ySkew: 0, yScale: -2, yOrigin: 500 };
    delete compiled.vertices_params;
    delete compiled.centroid_point;
    const transform = new Transform();
    transform.setCompiled(compiled);
    const xy = [-12345, -6789];
    const merc = transform.transform(xy, false, true);
    expect(merc).toEqual([500 + 2 * (xy[0] - 0.5), 500 - 2 * (xy[1] - 0.5)]);
    if (merc === false) throw new Error("変換失敗");
    const restored = transform.transform(merc, true, true);
    expect(restored).not.toBe(false);
    if (restored === false) throw new Error("逆変換失敗");
    expect(Math.hypot(restored[0] - xy[0], restored[1] - xy[1])).toBeLessThanOrEqual(1e-6);
  });

  it("worldFile モードの compiled に worldFile がなければ拒否する", () => {
    const compiled = { ...structuredClone(compiledFixture), outerTransform: "worldFile" as const };
    delete compiled.worldFile;
    expect(() => new Transform().setCompiled(compiled)).toThrow(/worldFile がありません/);
  });
});
