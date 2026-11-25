import { describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import { polygon } from "@turf/turf";
import {
  crsToWorldFilePixel,
  builtinProjectionEngine,
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

const compiledV3Fixture = JSON.parse(
  fs.readFileSync(`${__dirname}/compiled/fushimijo_maplat_v3.json`, "utf8")
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
    for (const proj4 of ["", "+proj=longlat +datum=WGS84 +no_defs=", "+proj=longlat +datum=WGS84 +no_defs +axis=", "+proj=longlat +datum=WGS84 +towgs84=1e-324,0,0"]) {
      expect(() => new WorldFileSurface({ crs: { epsg: 4326, proj4 }, worldFile, wh: [10, 10] })).toThrow();
    }
    expect(() => new WorldFileSurface({ crs: { epsg: 4326, proj4: "+proj=longlat +datum=WGS84 +no_defs" }, worldFile, wh: [10, 10] })).not.toThrow();
  });

  it("projinfo の EPSG:3857 定義を受け、値付き wktext と大文字の軸を拒否する", () => {
    const proj4 = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs +type=crs";
    const create = (definition: string) =>
      new WorldFileSurface({ crs: { epsg: 3857, proj4: definition }, worldFile, wh: [10, 10] });
    expect(() => create(proj4)).not.toThrow();
    expect(() => create(proj4.replace("+wktext", "+wktext="))).toThrow(/wktext/);
    expect(() => create(proj4.replace("+wktext", "+wktext=yes"))).toThrow();
    expect(() => create(proj4.replace("+wktext", "+axis=enu"))).not.toThrow();
    expect(() => create(proj4.replace("+wktext", "+axis=ENU"))).toThrow(/axis/);
  });

  it("内蔵エンジンの 4326 は極まで往復でき、3857 への投影で緯度を制限する", () => {
    const geographic = { epsg: 4326 };
    const mercator = { epsg: 3857 };
    for (const lonLat of [[0, 89], [180, 90], [-180, -90]]) {
      expect(builtinProjectionEngine.toLonLat(lonLat, geographic)).toEqual(lonLat);
      expect(builtinProjectionEngine.fromLonLat(lonLat, geographic)).toEqual(lonLat);
      expect(builtinProjectionEngine.fromLonLat(lonLat, mercator)).toBe(false);
    }
    for (const lonLat of [[0, 90.001], [0, -90.001], [180.001, 0]]) {
      expect(builtinProjectionEngine.toLonLat(lonLat, geographic)).toBe(false);
      expect(builtinProjectionEngine.fromLonLat(lonLat, geographic)).toBe(false);
    }
  });

  it("3857 のアフィン結果は範囲内でそのまま返し、端点のすぐ外を拒否する", () => {
    const surface = new WorldFileSurface({
      crs: { epsg: 3857 },
      worldFile: { xScale: 0.01, xSkew: 0, xOrigin: MERC_MAX, ySkew: 0, yScale: -0.01, yOrigin: -MERC_MAX },
      wh: [10, 10]
    });
    const xy = [0.499997, 0.499997];
    const merc = surface.transform(xy);
    expect(merc).toEqual([MERC_MAX - 3e-8, -MERC_MAX + 3e-8]);
    if (merc === false) throw new Error("端点近傍の順変換失敗");
    const restored = surface.transform(merc, true);
    expect(restored).not.toBe(false);
    if (restored === false) throw new Error("端点近傍の逆変換失敗");
    expect(Math.hypot(restored[0] - xy[0], restored[1] - xy[1])).toBeLessThanOrEqual(1e-6);
    expect(surface.transform([0.500003, 0.5])).toBe(false);
    expect(surface.transform([0.5, 0.500003])).toBe(false);
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
    expect(mercatorEdge.transform([MERC_MAX + 3e-8, 0], true)).toBe(false);
    const nonFiniteEngine = { toLonLat: () => [NaN, Infinity], fromLonLat: () => [NaN, Infinity] };
    const invalid = new WorldFileSurface({ crs: { epsg: 4326 }, worldFile, wh: [10, 10], projectionEngine: nonFiniteEngine });
    expect(invalid.transform([1, 1])).toBe(false);
    expect(new WorldFileSurface({ crs: { epsg: 3857 }, worldFile: { xScale: 1e-310, xSkew: 0, xOrigin: 0, ySkew: 0, yScale: -2, yOrigin: 0 }, wh: [10, 10] }).transform([1, 0], true)).toBe(false);
    const narrow = new WorldFileSurface({ crs: { epsg: 3857 }, worldFile: { xScale: 1e-5, xSkew: 0, xOrigin: 0, ySkew: 0, yScale: -1e-5, yOrigin: 0 }, wh: [10, 10] });
    const narrowMerc = narrow.transform([0.503, 0.5]);
    expect(narrowMerc).toEqual([expect.closeTo(3e-8, 20), 0]);
    expect(narrow.transform(narrowMerc as number[], true)).toEqual([expect.closeTo(0.503, 12), 0.5]);
    expect(builtinProjectionEngine.toLonLat([MERC_MAX + 3e-8, 0], { epsg: 3857 })).toBe(false);
    expect(builtinProjectionEngine.fromLonLat([180 + 5e-11, 0], { epsg: 3857 })).toBe(false);
    expect(builtinProjectionEngine.fromLonLat([0, maxLat + 5e-11], { epsg: 3857 })).toBe(false);
    expect(builtinProjectionEngine.fromLonLat([-180, -maxLat], { epsg: 3857 })).toEqual([-MERC_MAX, -MERC_MAX]);
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

  it("新 API のメイン層の priority と importance を選択に反映する", () => {
    const map = new MapTransform();
    map.setLayeredMapData({
      main: { kind: "tin", compiled: structuredClone(compiledFixture), priority: 10, importance: 9 },
      sub_maps: [{ kind: "tin", compiled: structuredClone(compiledFixture), priority: 1, bounds: [[0, 0], [100, 0], [100, 100], [0, 100]] }]
    });
    expect(map.xy2MercWithLayer([10, 10])).toMatchObject([0, expect.any(Array)]);
    expect(map.getLayerTransform(0)?.priority).toBe(10);
    expect(map.getLayerTransform(0)?.importance).toBe(9);
  });

  it.each([
    [10, 9, 0, [0, 1]],
    [0, 9, 1, [1]],
    [-1, 9, 1, [1]],
    [10, -1, 0, [1, 0]]
  ] as const)(
    "表示候補の被覆と順序にメイン層の priority %s と importance %s を使う",
    (priority, importance, expectedForwardLayer, expectedVisibleLayers) => {
      const map = new MapTransform();
      const bounds = [[0, 0], [100, 0], [100, 100], [0, 100]];
      const options = { crs: { epsg: 3857 }, worldFile, wh: [100, 100] };
      map.setLayeredMapData({
        main: { kind: "worldFile", ...options, priority, importance },
        sub_maps: [{ kind: "worldFile", ...options, priority: 0, importance: 2, bounds }]
      });
      const xy = [50, 50];
      const merc = worldFileToCrs(worldFile, xy);
      const forwardLayer = map.xy2MercWithLayer(xy);
      const backLayers = map.merc2XyWithLayer(merc);
      const visible = map.merc2XyVisibleLayers(merc);
      expect(visible.map(([index]) => index)).toEqual(expectedVisibleLayers);
      expect(forwardLayer).toEqual([expectedForwardLayer, merc]);
      expect(visible).toEqual(backLayers.filter(result => result && visible.some(([index]) => index === result[0])));
    }
  );
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

  it.each([
    ["V2（4 隅）", () => compiledFixture],
    ["V3（4 隅＋辺の上の補助頂点 36 点）", () => compiledV3Fixture]
  ] as const)("四辺形の外周の辺で順逆変換が world file と連続する: %s", (_label, fixture) => {
    const compiled = structuredClone(fixture()) as CompiledWorldFileOuter;
    const wf = { xScale: 1, xSkew: 0, xOrigin: 15000000.5, ySkew: 0, yScale: -1, yOrigin: 4000000.5 };
    const toMerc = (xy: number[]) => worldFileToCrs(wf, xy);
    compiled.outerTransform = "worldFile";
    compiled.worldFile = wf;
    compiled.points = compiled.points.map(([xy]) => [xy, toMerc(xy)]);
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
      for (let sample = 1; sample <= 9; sample++) {
        const t = sample / 10;
        const edgePoint = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
        const toward = [center[0] - edgePoint[0], center[1] - edgePoint[1]];
        const length = Math.hypot(toward[0], toward[1]);
        const probes = [
          edgePoint,
          [edgePoint[0] + toward[0] / length * 1e-4, edgePoint[1] + toward[1] / length * 1e-4],
          [edgePoint[0] - toward[0] / length * 1e-4, edgePoint[1] - toward[1] / length * 1e-4]
        ];
        for (const xy of probes) {
          const actual = transform.transform(xy, false, true);
          expect(actual).not.toBe(false);
          if (actual === false) throw new Error("外周の順変換失敗");
          const expected = toMerc(xy);
          expect(Math.hypot(...crsToWorldFilePixel(wf, actual).map((v, axis) => v - crsToWorldFilePixel(wf, expected)[axis]))).toBeLessThanOrEqual(1e-8);
          const restored = transform.transform(actual, true, true);
          expect(restored).not.toBe(false);
          if (restored === false) throw new Error("外周の逆変換失敗");
          expect(Math.hypot(restored[0] - xy[0], restored[1] - xy[1])).toBeLessThanOrEqual(1e-7);
        }
      }
    }
  });

  it("回転した V3 の外周 3,564 点と両側で順逆に往復する", () => {
    const compiled = structuredClone(compiledV3Fixture) as CompiledWorldFileOuter;
    const wf = { xScale: 1.7, xSkew: 0.8, xOrigin: 15000000.5, ySkew: 0.8, yScale: -1.7, yOrigin: 4000000.5 };
    const toMerc = (xy: number[]) => worldFileToCrs(wf, xy);
    compiled.outerTransform = "worldFile";
    compiled.worldFile = wf;
    compiled.points = compiled.points.map(([xy]) => [xy, toMerc(xy)]);
    compiled.vertices_points = compiled.vertices_points.map(([xy]) => [xy, toMerc(xy)]);
    const transform = new Transform();
    transform.setCompiled(compiled);
    const ring = compiled.vertices_points.map(pair => pair[0]);
    const distance = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1]);
    let edgeProbes = 0;
    let edgeFailures = 0;
    let roundTripFailures = 0;
    let maxError = 0;
    for (let i = 0; i < ring.length; i++) {
      const [ax, ay] = ring[i];
      const [bx, by] = ring[(i + 1) % ring.length];
      const length = Math.hypot(bx - ax, by - ay);
      for (let sample = 1; sample < 100; sample++) {
        const t = sample / 100;
        for (const offset of [0, -1e-4, 1e-4]) {
          const xy = [ax + (bx - ax) * t - (by - ay) * offset / length, ay + (by - ay) * t + (bx - ax) * offset / length];
          const merc = toMerc(xy);
          const backward = transform.transform(merc, true, true);
          if (offset === 0) {
            edgeProbes++;
            if (backward === false) edgeFailures++;
          }
          const forward = transform.transform(xy, false, true);
          const backThenForward = backward !== false && transform.transform(backward, false, true);
          const forwardThenBack = forward !== false && transform.transform(forward, true, true);
          if (backward === false || forward === false || backThenForward === false || forwardThenBack === false) {
            roundTripFailures++;
            continue;
          }
          maxError = Math.max(maxError, distance(xy, backward), distance(xy, forwardThenBack),
            distance(xy, crsToWorldFilePixel(wf, backThenForward)), distance(xy, crsToWorldFilePixel(wf, forward)));
        }
      }
    }
    expect(edgeProbes).toBe(3564);
    expect(edgeFailures).toBe(0);
    expect(roundTripFailures).toBe(0);
    expect(maxError).toBeLessThanOrEqual(1e-7);
  });

  it.each([0, 1] as const)("B の輪の面 %s で隣り合わない辺が交差すると拒否する", side => {
    const compiled: CompiledWorldFileOuter = { ...structuredClone(compiledV3Fixture), outerTransform: "worldFile", worldFile };
    const ring = compiled.vertices_points;
    [ring[0][side], ring[10][side]] = [ring[10][side], ring[0][side]];
    expect(() => new Transform().setCompiled(compiled)).toThrow(/交差/);
  });

  it("follow の地理面の y を内部規約にそろえた輪だけを受け入れる", () => {
    const compiled: CompiledWorldFileOuter = { ...structuredClone(compiledV3Fixture), outerTransform: "worldFile", worldFile, yaxisMode: "follow" };
    const toInternal = (xy: number[]) => {
      const [x, y] = worldFileToCrs(worldFile, xy);
      return [x, -y];
    };
    compiled.points = compiled.points.map(([xy]) => [xy, toInternal(xy)]);
    compiled.vertices_points = compiled.vertices_points.map(([xy]) => [xy, toInternal(xy)]);
    const transform = new Transform();
    expect(() => transform.setCompiled(compiled)).not.toThrow();
    for (const xy of [compiled.vertices_points[0][0], [-12345, -6789]]) {
      const merc = worldFileToCrs(worldFile, xy);
      expect(transform.transform(xy, false, true)).toEqual(merc);
      expect(transform.transform(merc, true, true)).toEqual(xy.map(value => expect.closeTo(value, 8)));
    }
    compiled.vertices_points = compiled.vertices_points.map(([xy, [x, y]]) => [xy, [x, -y]]);
    expect(() => new Transform().setCompiled(compiled)).toThrow(/巻き方向/);
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

  it("worldFile モードの vertices_points は 4 頂点以上で面積を持つ輪を要求する", () => {
    const base = structuredClone(compiledV3Fixture) as CompiledWorldFileOuter;
    base.outerTransform = "worldFile";
    base.worldFile = worldFile;
    expect(base.vertices_points.length).toBeGreaterThan(4);
    expect(() => new Transform().setCompiled(structuredClone(base))).not.toThrow();
    const three = structuredClone(base);
    three.vertices_points = three.vertices_points.slice(0, 3);
    expect(() => new Transform().setCompiled(three)).toThrow(/4 頂点以上/);
    const flat = structuredClone(base);
    flat.vertices_points = flat.vertices_points.map(([, merc], i) => [[i, 0], merc]);
    expect(() => new Transform().setCompiled(flat)).toThrow(/面積/);
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

  it("既定経路の strict_error は座標に触れる前に判定する", () => {
    const transform = new Transform();
    transform.setCompiled({ ...structuredClone(compiledFixture), strict_status: "strict_error" });
    expect(() => transform.transform([], true, true)).toThrow(/strict_error/);
    transform.setCompiled({ ...structuredClone(compiledFixture), strict_status: "strict_error", yaxisMode: "follow" });
    expect(() => transform.transform([], true, true)).toThrow(/strict_error/);
  });

  it("三角網の復元と上書きされた索引構築をそれぞれ 1 回だけ行う", () => {
    const compiled = structuredClone(compiledFixture);
    const readTriangles = vi.spyOn(compiled.tins_points[0], "map");
    const baseIndex = vi.spyOn(Transform.prototype, "addIndexedTin");
    class HookTransform extends Transform {
      override addIndexedTin() {
        expect(this.tins?.forw?.features).toHaveLength(compiled.tins_points[0].length);
        expect(this.yaxisMode).toBe("invert");
        super.addIndexedTin();
      }
    }
    const transform = new HookTransform();
    compiled.yaxisMode = "follow";
    const overriddenIndex = vi.spyOn(transform, "addIndexedTin");
    try {
      transform.setCompiled(compiled);
      expect(readTriangles).toHaveBeenCalledTimes(compiled.tins_points.length === 1 ? 2 : 1);
      expect(overriddenIndex).toHaveBeenCalledTimes(1);
      expect(baseIndex).toHaveBeenCalledTimes(1);
      expect(transform.yaxisMode).toBe("follow");
    } finally {
      baseIndex.mockRestore();
    }
  });

  it("setCompiled の成功時に modern の wh 保持と legacy の旧フィールド更新順を保つ", () => {
    const transform = new Transform();
    const withWh = { ...structuredClone(compiledFixture), wh: [123, 456] };
    transform.setCompiled(withWh);
    const withoutWh = structuredClone(compiledFixture);
    delete withoutWh.wh;
    transform.setCompiled(withoutWh);
    expect(transform.wh).toEqual([123, 456]);
    const bounds = [[0, 0], [100, 0], [100, 100], [0, 100]];
    transform.setCompiled({ ...structuredClone(compiledFixture), bounds, boundsPolygon: polygon([[...bounds, bounds[0]]]), wh: [200, 200] });
    const oldBounds = transform.bounds;
    const legacyBase = new Transform();
    legacyBase.setCompiled(structuredClone(compiledFixture));
    const legacy = { tins: legacyBase.tins, strict_status: legacyBase.strict_status, vertices_params: legacyBase.vertices_params, centroid: legacyBase.centroid, wh: [50, 50] } as unknown as CompiledLegacy;
    transform.setCompiled(legacy);
    expect(transform.bounds).toBe(oldBounds);
    expect(transform.transform([1000, 1000])).toBe(false);
    class HookTransform extends Transform { called = false; override addIndexedTin() { this.called = true; super.addIndexedTin(); } }
    const hooked = new HookTransform();
    hooked.setCompiled(structuredClone(compiledFixture));
    expect(hooked.called).toBe(true);
    class FailingHookTransform extends Transform { fail = false; override addIndexedTin() { super.addIndexedTin(); if (this.fail) throw new Error("索引失敗"); } }
    const rollback = new FailingHookTransform();
    rollback.setCompiled(structuredClone(compiledFixture));
    const oldValue = rollback.transform([0, 0], false, true);
    rollback.fail = true;
    expect(() => rollback.setCompiled({ ...structuredClone(compiledFixture), yaxisMode: "follow" })).toThrow(/索引失敗/);
    expect(rollback.transform([0, 0], false, true)).toEqual(oldValue);
  });

  it("明示 null の CRS、寸法なし、非有限 bounds 寸法を入力エラーにする", () => {
    const map = new MapTransform();
    expect(() => map.setLayeredMapData({ main: { kind: "tin", compiled: structuredClone(compiledFixture), crs: null } as never })).toThrow(/CRS/);
    expect(() => new WorldFileSurface({ crs: null, worldFile, wh: [10, 10] } as never)).toThrow(/CRS/);
    expect(() => new WorldFileSurface({ crs: { epsg: 3857 }, worldFile, bounds: undefined } as never)).toThrow(/wh または bounds/);
    expect(() => new WorldFileSurface({ crs: { epsg: 3857 }, worldFile, bounds: [[-Number.MAX_VALUE, 0], [Number.MAX_VALUE, 0], [0, 1]] })).toThrow(/有限/);
  });
});
