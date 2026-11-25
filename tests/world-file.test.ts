import { describe, expect, it } from "vitest";
import fs from "node:fs";
import { polygon } from "@turf/turf";
import {
  crsToWorldFilePixel,
  validateWorldFile,
  worldFileToCrs,
  WorldFileSurface,
  MapTransform,
  Transform,
  MERC_MAX
} from "../src/index.ts";
import type { Compiled, CompiledWorldFileOuter, CompiledExtrapolate, CompiledLegacy, MapData } from "../src/types.ts";

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

  it("bounds だけで作る面は有限な3頂点以上を要求する", () => {
    expect(() => new WorldFileSurface({
      crs: { epsg: 3857 }, worldFile,
      bounds: [[0, 0], [1, 0]]
    } as unknown as ConstructorParameters<typeof WorldFileSurface>[0])).toThrow(/3つ以上/);
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

  it("PROJ の type と towgs84 は指定された正規形だけを除外する", () => {
    const valid = "+proj=longlat +datum=WGS84 +type=crs +towgs84=+0,0e0,-0 +no_defs";
    expect(() => new WorldFileSurface({ crs: { epsg: 4326, proj4: valid }, worldFile, wh: [10, 10] })).not.toThrow();
    expect(() => new WorldFileSurface({ crs: { epsg: 4326, proj4: "+proj=longlat +datum=WGS84 +type=bogus" }, worldFile, wh: [10, 10] })).toThrow(/一致しない/);
    expect(() => new WorldFileSurface({ crs: { epsg: 4326, proj4: "+proj=longlat +datum=WGS84 +towgs84=0,0,0,0" }, worldFile, wh: [10, 10] })).toThrow(/一致しない/);
    expect(() => new WorldFileSurface({ crs: { epsg: 4326, proj4: "+proj=longlat +datum=WGS84 +no_defs=bad" }, worldFile, wh: [10, 10] })).toThrow(/一致しない/);
  });

  it("投影範囲の端で丸め誤差を吸収して往復し、非有限値は false にする", () => {
    const maxLat = (180 / Math.PI) * Math.atan(Math.sinh(Math.PI));
    const edge = new WorldFileSurface({
      crs: { epsg: 4326 },
      worldFile: { xScale: 0.01, xSkew: 0, xOrigin: 180, ySkew: 0, yScale: -0.01, yOrigin: maxLat },
      wh: [100, 100]
    });
    const xy = [0.5, 0.5];
    const merc = edge.transform(xy);
    expect(merc).not.toBe(false);
    if (merc === false) throw new Error("端点変換失敗");
    const restored = edge.transform(merc, true);
    expect(restored).not.toBe(false);
    if (restored === false) throw new Error("端点逆変換失敗");
    expect(Math.hypot(restored[0] - xy[0], restored[1] - xy[1])).toBeLessThanOrEqual(1e-6);
    const mercatorEdge = new WorldFileSurface({
      crs: { epsg: 3857 },
      worldFile: { xScale: 1, xSkew: 0, xOrigin: MERC_MAX, ySkew: 0, yScale: -1, yOrigin: MERC_MAX },
      wh: [10, 10]
    });
    const mercatorMaximum = mercatorEdge.transform([0.5, 0.5]);
    expect(mercatorMaximum).toEqual([MERC_MAX, MERC_MAX]);
    if (mercatorMaximum === false) throw new Error("3857 端点変換失敗");
    expect(mercatorEdge.transform(mercatorMaximum, true)).toEqual([0.5, 0.5]);
    const nonFiniteEngine = { toLonLat: () => [NaN, Infinity], fromLonLat: () => [NaN, Infinity] };
    const invalid = new WorldFileSurface({ crs: { epsg: 4326 }, worldFile, wh: [10, 10], projectionEngine: nonFiniteEngine });
    expect(invalid.transform([1, 1])).toBe(false);
  });

  it.each([3857, 4326])("EPSG:%s の world file を内外格子で1e-6画素以内に往復する", epsg => {
    const size = 1000;
    const scale = epsg === 3857 ? (2 * MERC_MAX) / size : 0.01;
    const surface = new WorldFileSurface({
      crs: { epsg },
      worldFile: epsg === 3857
        ? { xScale: scale, xSkew: 0, xOrigin: -MERC_MAX + scale / 2, ySkew: 0, yScale: -scale, yOrigin: MERC_MAX - scale / 2 }
        : { xScale: scale, xSkew: 0, xOrigin: -175, ySkew: 0, yScale: -scale, yOrigin: 70 },
      wh: [size, size]
    });
    let maxError = 0;
    for (let x = -1000; x <= 2000; x += 250) {
      for (let y = -1000; y <= 2000; y += 250) {
        const xy = [x + 0.5, y + 0.5];
        const crsXY = worldFileToCrs(surface.worldFile, xy);
        const lat = epsg === 3857 ? crsXY[1] : crsXY[1];
        const representable = epsg === 4326
          ? Math.abs(crsXY[0]) <= 180 && Math.abs(lat) <= (180 / Math.PI) * Math.atan(Math.sinh(Math.PI))
          : Math.abs(crsXY[0]) <= MERC_MAX && Math.abs(crsXY[1]) <= MERC_MAX;
        const result = surface.transform(xy);
        if (!representable) {
          expect(result).toBe(false);
          continue;
        }
        expect(result).not.toBe(false);
        if (result === false) throw new Error("格子の変換失敗");
        const restored = surface.transform(result, true);
        expect(restored).not.toBe(false);
        if (restored === false) throw new Error("格子の逆変換失敗");
        const error = Math.hypot(restored[0] - xy[0], restored[1] - xy[1]);
        maxError = Math.max(maxError, error);
        expect(error).toBeLessThanOrEqual(1e-6);
      }
    }
    expect(maxError).toBeLessThanOrEqual(1e-6);
    expect(surface.transform([-1500.5, -1500.5])).toBe(false);
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

  it("TIN の層で 3857 以外の CRS を拒否し、priority は初回選択後に設定する", () => {
    const map = new MapTransform();
    expect(() => map.setLayeredMapData({ main: { kind: "tin", compiled: compiledFixture, crs: { epsg: 4326 } } })).toThrow(/三角網の層の3857以外/);
    map.setMapData({ compiled: compiledFixture, sub_maps: [{ compiled: compiledFixture, priority: 7, importance: 5, bounds: [[0, 0], [10, 0], [10, 10]] }] });
    expect(map.getLayerTransform(1)?.priority).toBeUndefined();
    map.xy2MercWithLayer([0, 0]);
    expect(map.getLayerTransform(1)?.priority).toBe(7);
  });

  it("旧形式の wh から maxxy を決め、追加 kind で TIN 判別子を上書きしない", () => {
    const source = new Transform();
    source.setCompiled(compiledFixture);
    const legacy = JSON.parse(JSON.stringify({
      tins: source.tins, strict_status: source.strict_status, weight_buffer: {},
      vertices_params: source.vertices_params, centroid: source.centroid, wh: [5000, 3000]
    })) as CompiledLegacy & { wh: number[] };
    const subWithExtraKind = { compiled: compiledFixture, priority: 1, importance: 2,
      bounds: [[0, 0], [10, 0], [10, 10]], kind: "worldFile" };
    const map = new MapTransform();
    map.setMapData({ compiled: legacy, sub_maps: [subWithExtraKind] } as unknown as MapData);
    expect(map.maxxy).toBe(8192);
    expect(map.getSurfaceTransform(1)).toBeInstanceOf(Transform);
  });
});

describe("compiled outerTransform", () => {
  it("三角網の辺で補間と world file の出力が一致する", () => {
    const compiled = structuredClone(compiledFixture) as CompiledWorldFileOuter;
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

  it("四辺形の外周4辺で順逆変換が world file と連続する", () => {
    const compiled = structuredClone(compiledFixture) as CompiledWorldFileOuter;
    const wf = { xScale: 2, xSkew: 0, xOrigin: 500, ySkew: 0, yScale: -2, yOrigin: 500 };
    const toMerc = (xy: number[]) => worldFileToCrs(wf, xy);
    compiled.outerTransform = "worldFile";
    compiled.worldFile = wf;
    compiled.points = compiled.points.map(([xy]) => [xy, [toMerc(xy)[0] + 10, toMerc(xy)[1] - 10]]);
    compiled.vertices_points = compiled.vertices_points.map(([xy]) => [xy, toMerc(xy)]);
    const transform = new Transform();
    transform.setCompiled(compiled);
    const ring = compiled.vertices_points.map(pair => pair[0]);
    const center = ring.reduce((sum, xy) => [sum[0] + xy[0] / ring.length, sum[1] + xy[1] / ring.length], [0, 0]);
    for (let i = 0; i < ring.length; i++) {
      const a = ring[i], b = ring[(i + 1) % ring.length];
      const edgeTriangles = transform.tins!.forw!.features.filter(tri => {
        const corners = tri.geometry.coordinates[0].slice(0, 3);
        return corners.some(point => point[0] === a[0] && point[1] === a[1]) && corners.some(point => point[0] === b[0] && point[1] === b[1]);
      });
      expect(edgeTriangles).toHaveLength(1);
      const midpoint = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const toward = [center[0] - midpoint[0], center[1] - midpoint[1]];
      const length = Math.hypot(toward[0], toward[1]);
      const inside = [midpoint[0] + toward[0] / length * 1e-10, midpoint[1] + toward[1] / length * 1e-10];
      const outside = [midpoint[0] - toward[0] / length * 1e-10, midpoint[1] - toward[1] / length * 1e-10];
      for (const xy of [midpoint, inside, outside]) {
        const actual = transform.transform(xy, false, true);
        expect(actual).not.toBe(false);
        if (actual === false) throw new Error("外周の順変換失敗");
        const expected = toMerc(xy);
        expect(Math.hypot(...crsToWorldFilePixel(wf, actual).map((v, axis) => v - crsToWorldFilePixel(wf, expected)[axis]))).toBeLessThanOrEqual(1e-9);
        const restored = transform.transform(actual, true, true);
        expect(restored).not.toBe(false);
        if (restored === false) throw new Error("外周の逆変換失敗");
        expect(Math.hypot(restored[0] - xy[0], restored[1] - xy[1])).toBeLessThanOrEqual(1e-7);
      }
    }
  });

  it("outerTransform が省略された compiled は従来の外挿結果を保つ", () => {
    const legacy = new Transform();
    legacy.setCompiled(structuredClone(compiledFixture));
    const explicit = new Transform();
    explicit.setCompiled({ ...structuredClone(compiledFixture), outerTransform: "extrapolate" } as CompiledExtrapolate);
    const xy = [-12345, -6789];
    expect(legacy.transform(xy, false, true)).toEqual(explicit.transform(xy, false, true));
  });

  it("既定の外挿経路では strict_error の逆変換を引き続き拒否する", () => {
    const compiled = { ...structuredClone(compiledFixture), strict_status: "strict_error" as const };
    const transform = new Transform();
    transform.setCompiled(compiled);
    expect(() => transform.transform([0, 0], true, true)).toThrow(/strict_error/);
  });

  it("四辺形の外を world file で順逆変換し、頂点外挿データなしで読み込む", () => {
    const compiled = structuredClone(compiledFixture) as CompiledWorldFileOuter;
    compiled.outerTransform = "worldFile";
    compiled.strict_status = "strict_error";
    compiled.worldFile = { xScale: 2, xSkew: 0, xOrigin: 500, ySkew: 0, yScale: -2, yOrigin: 500 };
    const toMerc = (xy: number[]) => [500 + 2 * (xy[0] - 0.5), 500 - 2 * (xy[1] - 0.5)];
    compiled.points = compiled.points.map(([xy]) => [xy, toMerc(xy)]);
    compiled.vertices_points = compiled.vertices_points.map(([xy]) => [xy, toMerc(xy)]);
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
    expect(() => transform.transform(compiled.vertices_points[0][1], true, true)).toThrow(/strict_error/);
  });

  it("worldFile モードの compiled に worldFile がなければ拒否する", () => {
    const compiled = { ...structuredClone(compiledFixture), outerTransform: "worldFile" as const } as unknown as CompiledWorldFileOuter;
    expect(() => new Transform().setCompiled(compiled)).toThrow(/worldFile がありません/);
  });

  it("鏡像 world file の失敗後も直前の正常な B を保持する", () => {
    const compiled = { ...structuredClone(compiledFixture), outerTransform: "worldFile" as const, worldFile: { xScale: 2, xSkew: 0, xOrigin: 500, ySkew: 0, yScale: -2, yOrigin: 500 } } as CompiledWorldFileOuter;
    const transform = new Transform();
    transform.setCompiled(compiled);
    const before = transform.transform([-12345, -6789], false, true);
    expect(() => transform.setCompiled({ ...compiled, worldFile: { ...worldFile, yScale: 2 } })).toThrow(/鏡像/);
    expect(transform.transform([-12345, -6789], false, true)).toEqual(before);
  });

  it("B の逆変換にも bounds を適用し、ignoreBounds だけで外側を許可する", () => {
    const compiled = structuredClone(compiledFixture) as CompiledWorldFileOuter;
    compiled.outerTransform = "worldFile";
    compiled.worldFile = { xScale: 2, xSkew: 0, xOrigin: 500, ySkew: 0, yScale: -2, yOrigin: 500 };
    compiled.bounds = [[0, 0], [100, 0], [100, 100], [0, 100]];
    compiled.boundsPolygon = polygon([[[0, 0], [100, 0], [100, 100], [0, 100], [0, 0]]]);
    const transform = new Transform();
    transform.setCompiled(compiled);
    const xy = [-12345, -6789];
    const merc = transform.transform(xy, false, true);
    expect(merc).not.toBe(false);
    if (merc === false) throw new Error("B の順変換失敗");
    expect(transform.transform(merc, true)).toBe(false);
    expect(transform.transform(merc, true, true)).toEqual(xy);
  });
});
