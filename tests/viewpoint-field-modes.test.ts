import { describe, expect, it } from "vitest";
import fs from "node:fs";
import proj4 from "proj4";
import { Tin } from "@maplat/tin";
import {
  MapTransform,
  createProj4ProjectionEngine,
  mercs2MercViewpoint,
  wrapAngle,
  xy2SysCoord
} from "../src/index.ts";
import { createLayerSurface } from "../src/index.ts";
import type { MapData, PointSet, TinSurfaceData, Viewpoint, WorldFileSurfaceData } from "../src/index.ts";
import {
  deviationStats,
  interpolateGrid,
  judgeViewpointMode,
  collectGInSamples,
  meanCoefficients
} from "../src/viewpoint-field.ts";
import type { CoefficientGrid, ViewpointSample } from "../src/viewpoint-field.ts";
import { recommendViewpointMode } from "../src/recommend-viewpoint.ts";

const projectionEngine = createProj4ProjectionEngine(proj4);

function loadCompiled(key: string, ver: "v2" | "v3") {
  return JSON.parse(fs.readFileSync(`${__dirname}/compiled/${key}_${ver}.json`, "utf-8"));
}

// ─── AT-4: loose モード 2-2 の連続性・外周クランプ・±π 跨ぎ ───────────────────

describe("AT-4 loose モードの連続性・外周クランプ・±π 跨ぎ", () => {
  const looseMt = new MapTransform();
  looseMt.setMapData({ compiled: loadCompiled("18th_mapcontest_gp", "v3"), maxZoom: 5 });

  it("グリッド境界を跨いでも (s, θ) が飛び跳ねない（C0 連続）", () => {
    let maxRotStep = 0;
    let maxScaleStep = 0;
    let prev: { s: number; theta: number } | null = null;
    for (let x = 100; x <= 4100; x += 2) {
      const coef = looseMt.getViewpointCoefficients(0, [x, 2000], "xy2Merc");
      if (prev) {
        maxRotStep = Math.max(maxRotStep, Math.abs(wrapAngle(coef.theta - prev.theta)));
        maxScaleStep = Math.max(maxScaleStep, Math.abs(Math.log(coef.s / prev.s)));
      }
      prev = coef;
    }
    // 2px あたりの双線形補間の滑らかな勾配より大きくならない（段差なら桁違いに大きい）
    expect(maxRotStep).toBeLessThanOrEqual(0.01);
    expect(maxScaleStep).toBeLessThanOrEqual(0.01);
  });

  it("余白外パンでは端値クランプで有限かつ滑らかな値に留まる", () => {
    const inside = looseMt.getViewpointCoefficients(0, [-100000, -100000], "xy2Merc");
    const corner = looseMt.getViewpointCoefficients(0, [-100001, -100001], "xy2Merc");
    expect(Number.isFinite(inside.s)).toBe(true);
    expect(Number.isFinite(inside.theta)).toBe(true);
    // どちらもグリッドの同一の角へ clamp されるため一致する
    expect(Math.abs(inside.s - corner.s)).toBeLessThanOrEqual(1e-12);
    expect(Math.abs(wrapAngle(inside.theta - corner.theta))).toBeLessThanOrEqual(1e-12);
    const outside2 = looseMt.getViewpointCoefficients(0, [50000, 50000], "xy2Merc");
    expect(Number.isFinite(outside2.s)).toBe(true);
  });

  it("θ が +179° ↔ −179° を跨ぐ格子でも補間角が 0° 側へ反転しない", () => {
    const deg = Math.PI / 180;
    const a = 179 * deg;
    const b = -179 * deg;
    const grid: CoefficientGrid = {
      nx: 2,
      ny: 2,
      x0: 0,
      y0: 0,
      dx: 1,
      dy: 1,
      ls: new Float64Array([0, 0, 0, 0]),
      cs: new Float64Array([Math.cos(a), Math.cos(b), Math.cos(a), Math.cos(b)]),
      sn: new Float64Array([Math.sin(a), Math.sin(b), Math.sin(a), Math.sin(b)])
    };
    const middle = interpolateGrid(grid, 0.5, 0.5);
    // 180° を通り、0° 側へ反転しない
    expect(Math.abs(middle.theta)).toBeGreaterThan(3.0);
    // ±π 跨ぎの隣接でもラップ差は小さい（358° の跳びにならない）
    const left = interpolateGrid(grid, 0.4, 0.5);
    const right = interpolateGrid(grid, 0.6, 0.5);
    expect(Math.abs(wrapAngle(right.theta - left.theta))).toBeLessThanOrEqual(0.5 * deg);
  });
});

// ─── AT-5: パン時の滑らかさ（バタつき解消）────────────────────────────────────

/** 旧 V2 5 点都度計算のリファレンス（比較用の試験内複製。§6.2） */
function legacyViewpoint2Mercs(
  mt: MapTransform,
  viewpoint: Viewpoint,
  size: [number, number]
): number[][] {
  const mercs = MapTransform.mercViewpoint2Mercs(viewpoint.center, viewpoint.zoom, viewpoint.rotation, size);
  const xys = mercs.map(merc => MapTransform.sysCoord2Xy(merc, mt.maxxy));
  const centerResult = mt.xy2MercWithLayer(xys[0]);
  if (!centerResult) throw new Error("legacy: center point is out of bounds");
  const [centerIndex, centerMerc] = centerResult;
  return xys.map((xy, i) => {
    if (i === 0) return centerMerc;
    const merc = mt.getSurfaceTransform(centerIndex)!.transform(xy, false, centerIndex > 0);
    if (merc === false) throw new Error(`legacy: point ${i} is out of bounds`);
    return merc;
  });
}

describe("AT-5 パン時の滑らかさ（バタつき解消）", () => {
  it("三角網エッジ横断のパンで新方式は連続、旧 V2 リファレンスは上限超過になる", () => {
    const mt = new MapTransform();
    mt.setMapData({ compiled: loadCompiled("naramachi_yasui_revised", "v3"), maxZoom: 7 });
    const size: [number, number] = [1920, 1080];
    const zoom = 12;
    // この経路は複数の三角網エッジを横断する（旧 V2 は step 185 付近で 30° 超の跳び）
    const rotation = 0.7;
    const newSeries: { z: number; theta: number }[] = [];
    const legacySeries: { z: number; theta: number }[] = [];
    for (let step = 0; step < 200; step++) {
      const centerXy = [7000 + step * 2, 8000];
      const vp: Viewpoint = { center: xy2SysCoord(centerXy, mt.maxxy), zoom, rotation };
      const decodedNew = mercs2MercViewpoint(mt.viewpoint2Mercs(vp, size), size);
      const decodedLegacy = mercs2MercViewpoint(legacyViewpoint2Mercs(mt, vp, size), size);
      newSeries.push({ z: decodedNew.zoom, theta: decodedNew.rotation });
      legacySeries.push({ z: decodedLegacy.zoom, theta: decodedLegacy.rotation });
    }
    const maxStep = (series: { z: number; theta: number }[]) => {
      let maxRotDeg = 0;
      let maxDz = 0;
      for (let i = 1; i < series.length; i++) {
        maxRotDeg = Math.max(maxRotDeg, Math.abs(wrapAngle(series[i].theta - series[i - 1].theta)) * 180 / Math.PI);
        maxDz = Math.max(maxDz, Math.abs(series[i].z - series[i - 1].z));
      }
      return { maxRotDeg, maxDz };
    };
    const fresh = maxStep(newSeries);
    const legacy = maxStep(legacySeries);
    // 新方式: エッジ跨ぎでも階段状の跳びが無い
    expect(fresh.maxRotDeg).toBeLessThanOrEqual(0.05);
    expect(fresh.maxDz).toBeLessThanOrEqual(0.002);
    // 旧 V2 リファレンス: 同一経路で上限を超過する（真にエッジ跨ぎが発生する経路であることの確認）
    expect(legacy.maxRotDeg > 0.05 || legacy.maxDz > 0.002).toBe(true);
  });
});

// ─── AT-7: モード 1 算出・判定基準の境界 ─────────────────────────────────────

/** s0 = 2・θ0 = 45° の一様相似（紙 y 下向き → 地理 y 上向き） */
const S0 = 2;
const PHI0 = Math.PI / 4;
const affineMerc = ([x, y]: number[]): number[] => {
  const u = x;
  const v = -y;
  return [15000000 + S0 * (u * Math.cos(PHI0) - v * Math.sin(PHI0)), 4000000 + S0 * (u * Math.sin(PHI0) + v * Math.cos(PHI0))];
};

/** 左余白（x < 150）の GCP だけを大きく歪ませた歪み TIN */
async function distortedTin(): Promise<MapData["compiled"]> {
  const tin = new Tin({ wh: [1000, 1000] });
  tin.setWh([1000, 1000]);
  const points: PointSet[] = [];
  for (let i = 0; i <= 10; i++) {
    for (let j = 0; j <= 10; j++) {
      const xy = [i * 100, j * 100];
      const merc = affineMerc(xy);
      if (xy[0] < 50) {
        merc[0] += 400;
        merc[1] -= 300;
      }
      points.push([xy, merc]);
    }
  }
  tin.setPoints(points);
  await tin.updateTinAsync();
  return tin.getCompiled();
}

describe("AT-7 モード 1 算出・判定基準の境界", () => {
  it("① 45° 回転 Plan A の (s0, θ0) を定数モードで正しく出す", () => {
    const worldFile = {
      xScale: S0 * Math.cos(PHI0),
      xSkew: S0 * Math.sin(PHI0),
      xOrigin: 15000000,
      ySkew: S0 * Math.sin(PHI0),
      yScale: -S0 * Math.cos(PHI0),
      yOrigin: 4000000
    };
    const main: WorldFileSurfaceData = {
      kind: "worldFile",
      crs: { epsg: 3857 },
      worldFile,
      wh: [1526, 2048],
      projectionEngine
    };
    const mt = new MapTransform();
    mt.setLayeredMapData({ main, viewpointMode: "constant" });
    for (const xy of [[763, 1024], [200, 300], [1400, 1900]]) {
      const coef = mt.getViewpointCoefficients(0, xy, "xy2Merc");
      expect(Math.abs(coef.s - S0)).toBeLessThanOrEqual(1e-9);
      expect(Math.abs(wrapAngle(coef.theta - PHI0))).toBeLessThanOrEqual(1e-9);
    }
  });

  it("① GCP 凸包内側へ絞ると余白の歪みを除外して constant を維持する", async () => {
    const compiled = await distortedTin();
    const coreGcps: PointSet[] = [];
    for (let i = 3; i <= 7; i++) {
      for (let j = 3; j <= 7; j++) {
        coreGcps.push([[i * 100, j * 100], affineMerc([i * 100, j * 100])]);
      }
    }
    const data: TinSurfaceData = { kind: "tin", compiled };
    // gcps（凸包 300..700）で絞ると余白の大偏差が除外され constant 推奨を維持する
    const withGcps = recommendViewpointMode(data, { gcps: coreGcps });
    expect(withGcps.recommended).toBe("constant");
    expect(withGcps.maxRotationDiffDeg).toBeLessThanOrEqual(1.0);
    expect(withGcps.maxScaleRatioDiff).toBeLessThanOrEqual(0.03);
    // gcps 省略時は compiled.points（歪み含む）の凸包で判定し grid 推奨になる
    const withoutGcps = recommendViewpointMode(data);
    expect(withoutGcps.recommended).toBe("grid");
    // 共用の標本パイプラインでも、凸包内側の (s0, θ0) は一様相似そのもの
    const samples = collectGInSamples({
      surface: createLayerSurface(data),
      mode: "grid",
      strictness: "strict",
      gcps: coreGcps
    });
    const base = meanCoefficients(samples);
    expect(Math.abs(base.s - S0)).toBeLessThanOrEqual(1e-6);
    expect(Math.abs(wrapAngle(base.theta - PHI0))).toBeLessThanOrEqual(1e-6);
  });

  it("① 判定境界: p95 回転 1.0°・p95 縮尺 3.0% の内側で constant、外側で grid", () => {
    const sampleAt = (rotDeg: number, scaleRatio: number): ViewpointSample => ({
      paper: [0, 0],
      s: 2 * (1 + scaleRatio),
      theta: (rotDeg * Math.PI) / 180
    });
    const judge = (rotDeg: number, scaleRatio: number) => {
      const samples: ViewpointSample[] = [
        { paper: [0, 0], s: 2, theta: 0 },
        sampleAt(rotDeg, scaleRatio)
      ];
      return judgeViewpointMode(deviationStats(samples, { s: 2, theta: 0 }));
    };
    const judgeStats = (rotRad: number, scaleRatio: number) =>
      judgeViewpointMode({
        maxRotationDiffRad: rotRad,
        p95RotationDiffRad: rotRad,
        maxScaleRatioDiff: scaleRatio,
        p95ScaleRatioDiff: scaleRatio,
        sampleCount: 2
      });
    // 境界ちょうど（以内）は constant、僅かに外れたら grid
    expect(judgeStats((1.0 * Math.PI) / 180, 0)).toBe("constant");
    expect(judgeStats(0, 0.03)).toBe("constant");
    expect(judgeStats((1.0 * Math.PI) / 180 + 1e-12, 0)).toBe("grid");
    expect(judgeStats(0, 0.03 + 1e-12)).toBe("grid");
    // 標本経由でも僅か内外で同じ判定になる（浮動小数点の境界誤差を避けて僅か内側で確認）
    expect(judge(0.99, 0)).toBe("constant");
    expect(judge(0, 0.029)).toBe("constant");
    expect(judge(1.01, 0)).toBe("grid");
    expect(judge(0, 0.031)).toBe("grid");
    expect(judge(0.5, 0.01)).toBe("constant");
    expect(judge(2.0, 0.01)).toBe("grid");
    expect(judge(0.5, 0.031)).toBe("grid");
    // 判定統計は p95（2026-11-28 確定）。max が閾値超過でも p95 以内なら constant
    expect(
      judgeViewpointMode({
        maxRotationDiffRad: (2.0 * Math.PI) / 180,
        p95RotationDiffRad: (0.5 * Math.PI) / 180,
        maxScaleRatioDiff: 0.05,
        p95ScaleRatioDiff: 0.01,
        sampleCount: 100
      })
    ).toBe("constant");
    // p95 が超過なら max が以内でも grid
    expect(
      judgeViewpointMode({
        maxRotationDiffRad: 0,
        p95RotationDiffRad: (1.5 * Math.PI) / 180,
        maxScaleRatioDiff: 0,
        p95ScaleRatioDiff: 0,
        sampleCount: 100
      })
    ).toBe("grid");
  });

  it("① max / p95 の各指標を正しく計算する", () => {
    const samples: ViewpointSample[] = [];
    for (let i = 0; i < 95; i++) samples.push({ paper: [i, 0], s: 2, theta: 0 });
    for (let i = 0; i < 5; i++) {
      samples.push({ paper: [100 + i, 0], s: 2.2, theta: (10 * Math.PI) / 180 });
    }
    const stats = deviationStats(samples, { s: 2, theta: 0 });
    expect(stats.sampleCount).toBe(100);
    expect(stats.maxRotationDiffRad * 180 / Math.PI).toBeCloseTo(10, 9);
    expect(stats.maxScaleRatioDiff).toBeCloseTo(0.1, 9);
    // p95（近傍順位）は外れ値 5% を除外して 0
    expect(stats.p95RotationDiffRad).toBeCloseTo(0, 9);
    expect(stats.p95ScaleRatioDiff).toBeCloseTo(0, 9);
  });

  it("② gcps を渡す Plan A は凸包内側だけで、渡さない Plan A は層の範囲で評価する", () => {
    const main: WorldFileSurfaceData = {
      kind: "worldFile",
      crs: { epsg: 3857 },
      worldFile: {
        xScale: S0 * Math.cos(PHI0),
        xSkew: S0 * Math.sin(PHI0),
        xOrigin: 15000000,
        ySkew: S0 * Math.sin(PHI0),
        yScale: -S0 * Math.cos(PHI0),
        yOrigin: 4000000
      },
      wh: [1526, 2048],
      projectionEngine
    };
    const gcps: PointSet[] = [
      [[300, 300], affineMerc([300, 300])],
      [[1200, 300], affineMerc([1200, 300])],
      [[1200, 1700], affineMerc([1200, 1700])],
      [[300, 1700], affineMerc([300, 1700])]
    ];
    const withGcps = recommendViewpointMode(main, { gcps });
    const withoutGcps = recommendViewpointMode(main);
    // 凸包外の標本（余白）は除外される（件数が減る）
    expect(withGcps.sampleCount).toBeLessThan(withoutGcps.sampleCount);
    // gcps も compiled.points も無い層は層の範囲（wh 基準矩形）全体で評価する
    expect(withoutGcps.sampleCount).toBe(13 * 17);
    // 一様相似なのでどちらも指標はほぼゼロで constant
    expect(withGcps.recommended).toBe("constant");
    expect(withoutGcps.recommended).toBe("constant");
    expect(withGcps.maxRotationDiffDeg).toBeLessThanOrEqual(1e-6);
    expect(withoutGcps.maxScaleRatioDiff).toBeLessThanOrEqual(1e-6);
  });

  it("③ 実在図の判定（表 6 の値）: p95・3% で fushimijo 系は constant、miesan_ginza_map は grid のまま", () => {
    // map JSON（compiled 辞書入り）または compiled 単体のどちらでも読む
    const loadCompiledOf = (file: string): MapData["compiled"] => {
      const raw = JSON.parse(fs.readFileSync(file, "utf-8"));
      return raw && typeof raw === "object" && !Array.isArray(raw) && raw.compiled && typeof raw.compiled === "object"
        ? raw.compiled
        : raw;
    };
    // 実測の表 6（docs/measurements/2026-11-28-viewpoint-field.md、gcps なしの行）の値
    const TABLE6: {
      id: string;
      file: string;
      expected: "constant" | "grid";
      rotMaxDeg: number;
      rotP95Deg: number;
      scaleMaxPct: number;
      scaleP95Pct: number;
      sampleCount: number;
    }[] = [
      { id: "fushimijo_maplat_v2", file: `${__dirname}/compiled/fushimijo_maplat_v2.json`, expected: "constant", rotMaxDeg: 0.83, rotP95Deg: 0.50, scaleMaxPct: 2.73, scaleP95Pct: 2.19, sampleCount: 127 },
      { id: "fushimijo_maplat_v3", file: `${__dirname}/compiled/fushimijo_maplat_v3.json`, expected: "constant", rotMaxDeg: 0.65, rotP95Deg: 0.44, scaleMaxPct: 2.67, scaleP95Pct: 2.13, sampleCount: 127 },
      { id: "fushimijo_maplat_legacy", file: `${__dirname}/compiled/fushimijo_maplat.json`, expected: "constant", rotMaxDeg: 0.90, rotP95Deg: 0.69, scaleMaxPct: 3.63, scaleP95Pct: 2.05, sampleCount: 202 },
      { id: "miesan_ginza_map_v2", file: `${__dirname}/compiled/miesan_ginza_map_v2.json`, expected: "grid", rotMaxDeg: 1.68, rotP95Deg: 1.21, scaleMaxPct: 4.17, scaleP95Pct: 2.94, sampleCount: 106 },
      { id: "miesan_ginza_map_v3", file: `${__dirname}/compiled/miesan_ginza_map_v3.json`, expected: "grid", rotMaxDeg: 1.70, rotP95Deg: 0.91, scaleMaxPct: 5.75, scaleP95Pct: 4.02, sampleCount: 106 },
      { id: "miesan_ginza_map_legacy", file: `${__dirname}/miesan_ginza_map.json`, expected: "grid", rotMaxDeg: 1.73, rotP95Deg: 1.24, scaleMaxPct: 4.22, scaleP95Pct: 2.95, sampleCount: 106 }
    ];
    for (const row of TABLE6) {
      const data: TinSurfaceData = { kind: "tin", compiled: loadCompiledOf(row.file) };
      const result = recommendViewpointMode(data);
      // 指標は実測の表 6 と一致する（表は小数 2 桁のため ±0.05 で照合）
      expect(result.sampleCount, row.id).toBe(row.sampleCount);
      expect(result.maxRotationDiffDeg, row.id).toBeCloseTo(row.rotMaxDeg, 1);
      expect(result.p95RotationDiffDeg, row.id).toBeCloseTo(row.rotP95Deg, 1);
      expect(result.maxScaleRatioDiff * 100, row.id).toBeCloseTo(row.scaleMaxPct, 1);
      expect(result.p95ScaleRatioDiff * 100, row.id).toBeCloseTo(row.scaleP95Pct, 1);
      // 2026-11-28 確定の判定（p95・1.0° / 3%）: fushimijo 系は constant、miesan は grid
      expect(result.recommended, row.id).toBe(row.expected);
    }
  });
});

// ─── probeViewpointCoefficients: Core の既定ズーム用の単発プローブ（M-1）────────

describe("probeViewpointCoefficients（既定ズーム用・格子を作らない）", () => {
  /** 45° Plan A（s0 = S0・θ0 = PHI0 の一様相似） */
  const planA45Data = (): WorldFileSurfaceData => ({
    kind: "worldFile",
    crs: { epsg: 3857 },
    worldFile: {
      xScale: S0 * Math.cos(PHI0),
      xSkew: S0 * Math.sin(PHI0),
      xOrigin: 15000000,
      ySkew: S0 * Math.sin(PHI0),
      yScale: -S0 * Math.cos(PHI0),
      yOrigin: 4000000
    },
    wh: [1526, 2048],
    projectionEngine
  });

  it("45° Plan A で既知の (s, θ) を返し、視点グリッドは作られない", () => {
    const mt = new MapTransform();
    mt.setLayeredMapData({ main: planA45Data() });
    const fields = (): unknown[] => (mt as unknown as { _fields: unknown[] })._fields;
    expect(fields().filter(Boolean)).toHaveLength(0);
    for (const xy of [[763, 1024], [200, 300], [1400, 1900]] as [number, number][]) {
      const coef = mt.probeViewpointCoefficients(0, xy, 150);
      expect(Math.abs(coef.s - S0), `s at ${xy}`).toBeLessThanOrEqual(1e-9);
      expect(Math.abs(wrapAngle(coef.theta - PHI0)), `theta at ${xy}`).toBeLessThanOrEqual(1e-9);
    }
    // 単発プローブのあとも視点グリッド（ViewpointField）は作られていない
    expect(fields().filter(Boolean)).toHaveLength(0);
  });

  it("layerIndex の検査は viewpoint2Mercs と同じ（範囲外番号・非整数は例外）", () => {
    const mt = new MapTransform();
    mt.setLayeredMapData({ main: planA45Data() });
    for (const bad of [-1, mt.layerCount, 1.5, NaN]) {
      expect(() => mt.probeViewpointCoefficients(bad, [763, 1024], 150)).toThrow(/invalid layerIndex/);
    }
  });
});
