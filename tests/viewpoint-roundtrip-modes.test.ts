import { describe, expect, it } from "vitest";
import fs from "node:fs";
import { polygon } from "@turf/turf";
import proj4 from "proj4";
import {
  MapTransform,
  createProj4ProjectionEngine,
  worldFileToCrs,
  wrapAngle,
  xy2SysCoord,
  sysCoord2Xy
} from "../src/index.ts";
import type { MapData, Viewpoint, WorldFile, WorldFileSurfaceData } from "../src/index.ts";

// ─── ヘルパー ─────────────────────────────────────────────────────────────────

const SIZE: [number, number] = [800, 600];
const SIZE_LARGE: [number, number] = [1920, 1080];
/**
 * 同サイズ往復の受け入れ基準（§9.1）。
 * center は 1e-6 px（実測最大 1.1e-9 px で余裕あり）。
 * zoom / rotation は 5 点 mercs 中継の浮動小数点限界
 * （z=19・画面 400×300 で実測最大 1.9e-6。絶対値 1e7 級の座標から半径 0.02 級の
 * 差分を引く際の相殺落ち）に達しないため 5e-6。
 * 2026-11-28 実測で確定（根拠 docs/measurements/2026-11-28-viewpoint-field.md・設計書 §10.2）。
 */
const CENTER_TOL_PX = 1e-6;
const ZOOM_TOL = 5e-6;
const ROT_TOL = 5e-6;
const ZOOMS = [8, 12, 15, 19];
const ROTATIONS = [0, Math.PI - 0.01, -Math.PI + 0.01, Math.PI, -Math.PI, 3];

function loadCompiled(key: string, ver: "v2" | "v3") {
  return JSON.parse(fs.readFileSync(`${__dirname}/compiled/${key}_${ver}.json`, "utf-8"));
}

function must(coord: number[] | false): number[] {
  if (coord === false) throw new Error("変換に失敗しました");
  return coord;
}

function expectRoundTrip(
  mt: MapTransform,
  centerXy: number[],
  layerIndex: number | undefined,
  zooms: number[] = ZOOMS,
  rotations: number[] = ROTATIONS,
  size: [number, number] = SIZE
): void {
  for (const zoom of zooms) {
    for (const rotation of rotations) {
      const vp: Viewpoint = { center: xy2SysCoord(centerXy, mt.maxxy), zoom, rotation };
      const mercs = mt.viewpoint2Mercs(vp, size, layerIndex);
      const back = mt.mercs2Viewpoint(mercs, size, layerIndex);
      const backXy = sysCoord2Xy(back.center, mt.maxxy);
      const centerErr = Math.hypot(backXy[0] - centerXy[0], backXy[1] - centerXy[1]);
      const zoomErr = Math.abs(back.zoom - zoom);
      const rotErr = Math.abs(wrapAngle(back.rotation - rotation));
      expect(
        centerErr,
        `center err ${centerErr} (xy=${centerXy}, zoom=${zoom}, rot=${rotation}, layer=${layerIndex})`
      ).toBeLessThanOrEqual(CENTER_TOL_PX);
      expect(
        zoomErr,
        `zoom err ${zoomErr} (xy=${centerXy}, zoom=${zoom}, rot=${rotation}, layer=${layerIndex})`
      ).toBeLessThanOrEqual(ZOOM_TOL);
      expect(
        rotErr,
        `rotation err ${rotErr} (xy=${centerXy}, zoom=${zoom}, rot=${rotation}, layer=${layerIndex})`
      ).toBeLessThanOrEqual(ROT_TOL);
    }
  }
}

/** B（outerTransform: "worldFile"＋strict）。TIN 全面を world file のアフィンに一致させる */
function buildBFixture() {
  const compiled = structuredClone(loadCompiled("fushimijo_maplat", "v3")) as MapData["compiled"] & {
    outerTransform: string;
    worldFile: WorldFile;
    centroid_point: number[][];
    yaxisMode?: string;
  };
  const worldFile = { xScale: 2, xSkew: 0, xOrigin: 15000000.5, ySkew: 0, yScale: -2, yOrigin: 4000000.5 };
  const toMerc = (xy: number[]) => worldFileToCrs(worldFile, xy);
  compiled.outerTransform = "worldFile";
  compiled.worldFile = worldFile;
  compiled.points = compiled.points.map(([xy]) => [xy, toMerc(xy)]);
  compiled.vertices_points = compiled.vertices_points.map(([xy]) => [xy, toMerc(xy)]);
  compiled.centroid_point = [compiled.centroid_point[0], toMerc(compiled.centroid_point[0])];
  return compiled;
}

/** C（outerTransform: "extrapolate"＋strict）。補助頂点扇形は compiled のとおり */
function buildCFixture(): MapData["compiled"] {
  return structuredClone(loadCompiled("fushimijo_maplat", "v3"));
}

const fxSyn = JSON.parse(
  fs.readFileSync(`${__dirname}/compiled/visible_layers_synthetic.json`, "utf-8")
) as {
  main: MapData["compiled"];
  sub: Record<string, MapData["compiled"]>;
  layers: Record<string, { center: [number, number]; mainCenter: [number, number]; k: number }>;
};

/** 合成 5 層（本図＋駅前拡大図 k=1/8・広域図 k=40 など縮尺差 5 倍以上の sub_maps） */
function buildSyntheticMt(): MapTransform {
  const mt = new MapTransform();
  mt.setMapData({
    compiled: fxSyn.main,
    maxZoom: 3,
    sub_maps: [
      { compiled: fxSyn.sub.wide_station, priority: 2, importance: 1 },
      { compiled: fxSyn.sub.wide_area, priority: 1, importance: -1 },
      { compiled: fxSyn.sub.castle_a, priority: 3, importance: 1 },
      { compiled: fxSyn.sub.temple_b, priority: 4, importance: 2 }
    ]
  });
  return mt;
}

// ─── AT-6②（段 1 の最初に書く試験・n-6）────────────────────────────────────────
//
// 縮尺が 5 倍以上異なる sub_maps を持つ地図で、layerIndex を指定したときに
// sub_maps の重なる範囲・B の外周輪・C の補助頂点扇形を含む範囲外周で同サイズ往復が
// 成立するかを確かめる。外周・外側で落ちた場合は §4.2 の厳密往復保証を
// 「凸包の内側（副層は bounds との共通部分）」へ狭める（設計書 n-6）。

describe("AT-6② layerIndex 指定の同サイズ往復（sub_maps 重なり域・範囲外周）", () => {
  it("縮尺差 5 倍以上の sub_maps の重なり域で、層ごとに同サイズ往復する", () => {
    const mt = buildSyntheticMt();
    // 本図紙座標 (700, 900) のメルカトルは本図・駅前拡大図（k=1/8）・広域図（k=40）が覆う
    const mainSurface = mt.getSurfaceTransform(0)!;
    const sharedMerc = must(mainSurface.transform([700, 900], false, true));
    // 縮尺差が 5 倍以上あること（駅前 k=1/8 と広域図 k=40 で 320 倍）
    const sMain = mt.getViewpointCoefficients(0, [700, 900], "xy2Merc").s;
    const sStation = mt.getViewpointCoefficients(1, [1700, 1250], "xy2Merc").s;
    expect(Math.abs(sMain / sStation)).toBeGreaterThanOrEqual(5);
    for (const layerIndex of [0, 1, 2]) {
      const surface = mt.getSurfaceTransform(layerIndex)!;
      const layerXy = must(surface.transform(sharedMerc, true, true));
      expectRoundTrip(mt, layerXy, layerIndex);
    }
  });

  it("B の外周輪と C の補助頂点扇形を含む範囲外周で layerIndex=0 の同サイズ往復", () => {
    for (const [label, compiled] of [
      ["B", buildBFixture()],
      ["C", buildCFixture()]
    ] as [string, MapData["compiled"]][]) {
      const mt = new MapTransform();
      mt.setMapData({ compiled, maxZoom: 3 });
      const ring = compiled.vertices_points.map(p => p[0]);
      const centroid = ring.reduce((sum, xy) => [sum[0] + xy[0] / ring.length, sum[1] + xy[1] / ring.length], [0, 0]);
      const probes: number[][] = [];
      for (const vertex of ring) probes.push(vertex);
      for (let i = 0; i < ring.length; i++) {
        const a = ring[i];
        const b = ring[(i + 1) % ring.length];
        const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        const outward = [mid[0] - centroid[0], mid[1] - centroid[1]];
        const len = Math.hypot(outward[0], outward[1]) || 1;
        for (const offset of [10, 50, 200]) {
          probes.push([mid[0] + (outward[0] / len) * offset, mid[1] + (outward[1] / len) * offset]);
        }
      }
      for (const probe of probes) {
        expectRoundTrip(mt, probe, 0, [12], [0, Math.PI - 0.01], SIZE);
      }
      expect(label).toMatch(/^[BC]$/);
    }
  });

  it("範囲外では格子の端値に張り付きつつ往復する", () => {
    const mt = buildSyntheticMt();
    for (const outside of [[-5000, -5000], [20000, 20000], [-1000, 3000]]) {
      expectRoundTrip(mt, outside, 0, [12], [0], SIZE);
      expectRoundTrip(mt, outside, 1, [12], [0], SIZE);
    }
  });

  it("本図に bounds があっても layerIndex=0 指定時は ignoreBounds で範囲外変換でき、往復する", () => {
    const compiled = buildCFixture() as MapData["compiled"] & {
      bounds: number[][];
      boundsPolygon: ReturnType<typeof polygon>;
    };
    compiled.bounds = [[100, 100], [900, 100], [900, 1800], [100, 1800]];
    compiled.boundsPolygon = polygon([[[100, 100], [900, 100], [900, 1800], [100, 1800], [100, 100]]]);
    const mt = new MapTransform();
    mt.setMapData({ compiled, maxZoom: 3 });
    const outside = [50, 50];
    // 既定の層選択では範囲外の中心は失敗する（現行の bounds 判定を維持）
    const vp: Viewpoint = { center: xy2SysCoord(outside, mt.maxxy), zoom: 12, rotation: 0 };
    expect(() => mt.viewpoint2Mercs(vp, SIZE)).toThrow(/center point is out of bounds/);
    // layerIndex=0 指定なら ignoreBounds で変換でき、往復も成立する
    expectRoundTrip(mt, outside, 0, [12], [0], SIZE);
  });

  it("範囲外番号（-1 / layerCount）や非整数（1.5 / NaN）の layerIndex は例外", () => {
    const mt = buildSyntheticMt();
    const vp: Viewpoint = { center: xy2SysCoord([700, 900], mt.maxxy), zoom: 12, rotation: 0 };
    for (const bad of [-1, mt.layerCount, 1.5, NaN]) {
      expect(() => mt.viewpoint2Mercs(vp, SIZE, bad)).toThrow(/invalid layerIndex/);
      expect(() => mt.mercs2Viewpoint([[0, 0], [0, 1], [1, 0], [0, -1], [-1, 0]], SIZE, bad)).toThrow(
        /invalid layerIndex/
      );
    }
  });

  it("既定の層選択では base5 相当の (700,900) で行き本図・帰り層 1 に入れ替わり、層ごとの格子のみを使う", () => {
    const mt = buildSyntheticMt();
    const c_xy = [700, 900];
    // 現行の層選択規則（xy2MercWithLayer は priority 降順先勝ち、merc2XyWithLayer は importance 降順）を
    // 期待値として固定する: 行きは本図（層 0）、帰りは駅前拡大図（層 1）が先頭
    const forward = mt.xy2MercWithLayer(c_xy);
    expect(forward).not.toBe(false);
    if (forward === false) throw new Error("層選択に失敗しました");
    expect(forward[0]).toBe(0);
    const sharedMerc = forward[1];
    const backward = mt.merc2XyWithLayer(sharedMerc);
    if (!backward[0]) throw new Error("層選択に失敗しました");
    expect(backward[0][0]).toBe(1);

    // 係数は中心の層の格子からだけ引き、他層とブレンドしない
    const s0 = mt.getViewpointCoefficients(0, c_xy, "xy2Merc");
    const s1 = mt.getViewpointCoefficients(1, sharedMerc, "merc2Xy");
    const alphaSys = (2 * 20037508.342789244) / mt.maxxy;
    for (const zoom of [12]) {
      for (const rotation of [0, 1.5]) {
        const vp: Viewpoint = { center: xy2SysCoord(c_xy, mt.maxxy), zoom, rotation };
        const mercs = mt.viewpoint2Mercs(vp, SIZE);
        const back = mt.mercs2Viewpoint(mercs, SIZE);
        const expected = {
          center: xy2SysCoord((backward[0] as [number, number[]])[1], mt.maxxy),
          zoom: zoom + Math.log2(alphaSys / s0.s) - Math.log2(alphaSys / s1.s),
          rotation: wrapAngle(rotation + s0.theta - s1.theta)
        };
        expect(Math.hypot(back.center[0] - expected.center[0], back.center[1] - expected.center[1])).toBeLessThanOrEqual(1e-6);
        expect(Math.abs(back.zoom - expected.zoom)).toBeLessThanOrEqual(ZOOM_TOL);
        expect(Math.abs(wrapAngle(back.rotation - expected.rotation))).toBeLessThanOrEqual(ROT_TOL);
      }
    }
  });
});

// ─── AT-1: B / A / C の同サイズ単体往復 ────────────────────────────────────────

const projectionEngine = createProj4ProjectionEngine(proj4);
/** 回転付き非 3857（旧日本測地系 IX 系相当） */
const CRS_6674 = {
  proj4: "+proj=tmerc +lat_0=36 +lon_0=139.833333333333 +k=0.9999 +ellps=GRS80 +units=m +no_defs"
};

/** Plan A（WorldFileSurface）の層データ。φ 回転・縮尺 s のアフィン world file */
function planAData(
  crs: WorldFileSurfaceData["crs"],
  s: number,
  phi: number,
  origin: [number, number],
  wh: number[] = [1526, 2048]
): WorldFileSurfaceData {
  const worldFile: WorldFile = {
    xScale: s * Math.cos(phi),
    xSkew: s * Math.sin(phi),
    xOrigin: origin[0],
    ySkew: s * Math.sin(phi),
    yScale: -s * Math.cos(phi),
    yOrigin: origin[1]
  };
  return { kind: "worldFile", crs, worldFile, wh, projectionEngine };
}

function singleLayerMt(compiled: MapData["compiled"], viewpointMode?: "constant" | "grid"): MapTransform {
  const mt = new MapTransform();
  mt.setMapData({ compiled, maxZoom: 3, viewpointMode });
  return mt;
}

describe("AT-1 B / A / C の同サイズ単体往復", () => {
  const cases: [string, () => MapTransform][] = [
    ["Plan A 3857 grid", () => {
      const mt = new MapTransform();
      mt.setLayeredMapData({ main: planAData({ epsg: 3857 }, 2, 0, [15000000, 4000000]), viewpointMode: "grid" });
      return mt;
    }],
    ["Plan A 3857 constant", () => {
      const mt = new MapTransform();
      mt.setLayeredMapData({ main: planAData({ epsg: 3857 }, 2, 0, [15000000, 4000000]), viewpointMode: "constant" });
      return mt;
    }],
    ["Plan A 6674 grid", () => {
      const mt = new MapTransform();
      mt.setLayeredMapData({ main: planAData(CRS_6674, 2, 0.3, [1000, -1000]), viewpointMode: "grid" });
      return mt;
    }],
    ["Plan A 6674 constant", () => {
      const mt = new MapTransform();
      mt.setLayeredMapData({ main: planAData(CRS_6674, 2, 0.3, [1000, -1000]), viewpointMode: "constant" });
      return mt;
    }],
    ["B grid", () => singleLayerMt(buildBFixture(), "grid")],
    ["B constant", () => singleLayerMt(buildBFixture(), "constant")],
    ["C grid", () => singleLayerMt(buildCFixture(), "grid")],
    ["C constant", () => singleLayerMt(buildCFixture(), "constant")]
  ];
  for (const [label, build] of cases) {
    it(`${label} がズーム 8..19・±π 跨ぎで同サイズ往復する`, () => {
      const mt = build();
      for (const centerXy of [[763, 1024], [300, 400]]) {
        for (let zoom = 8; zoom <= 19; zoom++) {
          expectRoundTrip(mt, centerXy, undefined, [zoom], [0, Math.PI - 0.01, -Math.PI + 0.01, Math.PI, -Math.PI, 3], SIZE);
          expectRoundTrip(mt, centerXy, undefined, [zoom], [0, Math.PI - 0.01, -Math.PI + 0.01, Math.PI, -Math.PI, 3], SIZE_LARGE);
        }
      }
    });
  }

  it("mercs2MercViewpoint の atan2 置換で 0・±π 近傍に acos の段差が出ない", () => {
    const center = [15000000, 4000000];
    for (const base of [0, Math.PI, -Math.PI]) {
      for (const eps of [1e-9, 1e-8, 1e-7, 1e-6]) {
        for (const sign of [1, -1]) {
          const rotation = base + sign * eps;
          const mercs = MapTransform.mercViewpoint2Mercs(center, 14, rotation, [800, 600]);
          const decoded = MapTransform.mercs2MercViewpoint(mercs, [800, 600]);
          const err = Math.abs(wrapAngle(decoded.rotation - rotation));
          // acos 版は 0 / ±π 近傍で約 1.5e-8 rad の段差を生じる。atan2 版は float 限界まで正確
          expect(err, `base=${base} eps=${eps} sign=${sign}`).toBeLessThanOrEqual(1e-12);
        }
      }
    }
  });
});

// ─── AT-2: 地図間往復（Map A ↔ Map B ↔ Map A）────────────────────────────────

describe("AT-2 地図間往復（Plan A 3857 ↔ Plan A 6674）", () => {
  it("2 段階往復で元の (center, zoom, rotation) に戻る", () => {
    // 共通の地理域（東京付近）を覆う 2 枚の Plan A を作る
    const targetMerc = [15545000, 4250000];
    const mapA = new MapTransform();
    mapA.setLayeredMapData({
      main: planAData({ epsg: 3857 }, 2, 0, [targetMerc[0] - 2 * 763, targetMerc[1] + 2 * 1024])
    });
    const mapB = new MapTransform();
    const targetLonLat = must(projectionEngine.toLonLat(targetMerc, { epsg: 3857 }));
    const native = must(projectionEngine.fromLonLat(targetLonLat, CRS_6674));
    mapB.setLayeredMapData({
      main: planAData(CRS_6674, 2, 0.3, [native[0] - 2 * 763 * Math.cos(0.3), native[1] + 2 * 1024 * Math.cos(0.3)])
    });

    const sA: [number, number] = [400, 300];
    const sB: [number, number] = [800, 600];
    for (const zoom of [8, 12, 16, 19]) {
      for (const rotation of [0, Math.PI - 0.01, -Math.PI + 0.01, 3]) {
        const vp: Viewpoint = { center: xy2SysCoord([763, 1024], mapA.maxxy), zoom, rotation };
        const out = mapA.mercs2Viewpoint(
          mapB.viewpoint2Mercs(mapB.mercs2Viewpoint(mapA.viewpoint2Mercs(vp, sA), sB), sB),
          sA
        );
        const backXy = sysCoord2Xy(out.center, mapA.maxxy);
        expect(Math.hypot(backXy[0] - 763, backXy[1] - 1024), `zoom=${zoom} rot=${rotation}`).toBeLessThanOrEqual(CENTER_TOL_PX);
        expect(Math.abs(out.zoom - zoom), `zoom=${zoom} rot=${rotation}`).toBeLessThanOrEqual(ZOOM_TOL);
        expect(Math.abs(wrapAngle(out.rotation - rotation)), `zoom=${zoom} rot=${rotation}`).toBeLessThanOrEqual(ROT_TOL);
      }
    }
  });
});

// ─── AT-3: 異なる画面サイズ・ズーム不変・大変倍率アウト耐性 ────────────────────

describe("AT-3 画面サイズ不変・大変倍率アウト耐性", () => {
  it("① ズームアウトしても 4 本足のはみ出し例外にならない", () => {
    const mt = singleLayerMt(buildCFixture());
    // 画面短辺 1/4 が地図外へ大きくはみ出すほどズームアウトしても中心さえあれば成功する
    for (const zoom of [8, 6, 4, 2]) {
      for (const size of [SIZE, SIZE_LARGE] as [number, number][]) {
        const vp: Viewpoint = { center: xy2SysCoord([763, 1024], mt.maxxy), zoom, rotation: 0 };
        expect(() => mt.viewpoint2Mercs(vp, size)).not.toThrow();
      }
    }
  });

  it("② z_merc − vp.zoom と θ_merc − vp.rotation が画面サイズ・ズームに依らず一定", () => {
    const mt = singleLayerMt(buildCFixture());
    const dzs: number[] = [];
    const dts: number[] = [];
    for (const zoom of [8, 12, 15, 19]) {
      for (const size of [SIZE, SIZE_LARGE] as [number, number][]) {
        const vp: Viewpoint = { center: xy2SysCoord([763, 1024], mt.maxxy), zoom, rotation: 1.2 };
        const mercs = mt.viewpoint2Mercs(vp, size);
        const decoded = MapTransform.mercs2MercViewpoint(mercs, size);
        dzs.push(decoded.zoom - vp.zoom);
        dts.push(wrapAngle(decoded.rotation - vp.rotation));
      }
    }
    for (const dz of dzs) expect(Math.abs(dz - dzs[0])).toBeLessThanOrEqual(ROT_TOL);
    for (const dt of dts) expect(Math.abs(wrapAngle(dt - dts[0]))).toBeLessThanOrEqual(ROT_TOL);
  });

  it("③ 異なるサイズ間の復号は log2(rB/rA) だけズームが変わる", () => {
    const mt = singleLayerMt(buildCFixture());
    const sizeA: [number, number] = [400, 300];
    const sizeB: [number, number] = [1920, 1080];
    const rA = Math.floor(Math.min(...sizeA) / 4);
    const rB = Math.floor(Math.min(...sizeB) / 4);
    for (const zoom of [8, 12, 19]) {
      const vp: Viewpoint = { center: xy2SysCoord([763, 1024], mt.maxxy), zoom, rotation: 0.7 };
      const out = mt.mercs2Viewpoint(mt.viewpoint2Mercs(vp, sizeA), sizeB);
      expect(Math.abs(out.zoom - (zoom + Math.log2(rB / rA))), `zoom=${zoom}`).toBeLessThanOrEqual(ZOOM_TOL);
    }
  });
});

// ─── AT-6①③（strict_error・yaxisMode follow・非 3857）─────────────────────────

describe("AT-6① strict_error の従来どおりの例外挙動", () => {
  it("読み込み成功・紙側 viewpoint2Mercs 正常・mercs2Viewpoint は例外を維持", () => {
    const mt = singleLayerMt(loadCompiled("naramachi_yasui_bunko", "v2"));
    const vp: Viewpoint = { center: xy2SysCoord([7000, 8000], mt.maxxy), zoom: 12, rotation: 0 };
    const mercs = mt.viewpoint2Mercs(vp, SIZE);
    expect(mercs).toHaveLength(5);
    expect(() => mt.mercs2Viewpoint(mercs, SIZE)).toThrow(/strict_error/);
    expect(() => mt.mercs2Viewpoint(mercs, SIZE, 0)).toThrow(/strict_error/);
  });
});

describe("AT-6③ yaxisMode follow と回転付き非 3857 の符号", () => {
  it("① yaxisMode: follow の B で同サイズ往復する", () => {
    const compiled = buildBFixture();
    const toInternal = (xy: number[]): number[] => [xy[0], -xy[1]];
    compiled.yaxisMode = "follow";
    compiled.points = compiled.points.map(([xy, merc]) => [xy, toInternal(merc)]);
    compiled.vertices_points = compiled.vertices_points.map(([xy, merc]) => [xy, toInternal(merc)]);
    compiled.centroid_point = [compiled.centroid_point[0], toInternal(compiled.centroid_point[1])];
    const mt = singleLayerMt(compiled);
    for (const centerXy of [[763, 1024], [200, 300], [1400, 1900]]) {
      expectRoundTrip(mt, centerXy, 0, [12], [0, 1.2, Math.PI - 0.01], SIZE);
    }
  });

  it("② 回転付き非 3857（6674）の Plan A で同サイズ往復する", () => {
    const mt = new MapTransform();
    mt.setLayeredMapData({ main: planAData(CRS_6674, 1.5, 0.8, [2000, -500]) });
    for (const centerXy of [[763, 1024], [300, 400]]) {
      expectRoundTrip(mt, centerXy, undefined, [12, 17], [0, 1.2, Math.PI - 0.01], SIZE);
    }
  });
});
