/**
 * 視点変換 ViewpointField 実測（段 1 ②）本体。
 *
 * 使い方（リポジトリルートで）:
 *   sh bench/viewpoint-field/run.sh 0      # 環境と地図一覧
 *   sh bench/viewpoint-field/run.sh 1      # 局所差（§2.2 4.）
 *   sh bench/viewpoint-field/run.sh 2      # 滑らかさ
 *   sh bench/viewpoint-field/run.sh 3      # 往復誤差
 *   sh bench/viewpoint-field/run.sh 4      # 速度（§2.3）
 *   sh bench/viewpoint-field/run.sh 5      # 判定（§5.2）
 *
 * 結果は docs/measurements/2026-11-28-viewpoint-field.md の
 * `<!-- bench:… -->` 領域へ書き込む。vitest の通常実行には入らない。
 */
import fs from "node:fs";
import os from "node:os";
import { execFileSync } from "node:child_process";
import {
  ViewpointField,
  probeCoefficients
} from "../../src/viewpoint-field.ts";
import type { ViewpointFieldInput } from "../../src/viewpoint-field.ts";
import { MapTransform } from "../../src/map-transform.ts";
import { Transform } from "../../src/transform.ts";
import { MERC_MAX } from "../../src/constants.ts";
import { mercs2MercViewpoint, wrapAngle } from "../../src/viewpoint.ts";
import { sysCoord2Xy, xy2SysCoord } from "../../src/coord-utils.ts";
import { recommendViewpointMode } from "../../src/recommend-viewpoint.ts";
import type { Viewpoint, ViewpointCoefficients, RecommendViewpointModeResult } from "../../src/types.ts";
import {
  coefDiff, finite2, fmt, fmtMs, fmtSci, fmtUs, legacyCoefficientsAt, maxP95,
  mdTable, radiusPxAt, SEED, writeRegion, zoomForRadiusPx
} from "./lib.ts";
import { buildTargets, inventoryRows, samplesFor } from "./targets.ts";
import type { Target } from "./targets.ts";

const ROOT = process.env.BENCH_ROOT ?? process.cwd();
const DOC = "docs/measurements/2026-11-28-viewpoint-field.md";
const SIZE: [number, number] = [1920, 1080];
const SIZE_SMALL: [number, number] = [400, 300];
const N_LIST = [8, 16, 32, 64];
const R_LIST = [0.5, 1, 2];
const COMBOS: { nLong: number; probeRadiusCells: number; label: string }[] = [];
for (const n of N_LIST) for (const r of R_LIST) COMBOS.push({ nLong: n, probeRadiusCells: r, label: `N${n} r${r}` });
const DEFAULT_COMBO = COMBOS.find(c => c.nLong === 16 && c.probeRadiusCells === 1)!;

const SAMPLE_COUNT = 1000;
const RUNS = 10;
const ZOOMS_RT = [10, 15, 19];
const ROTS_RT = [0, 1.3, Math.PI - 0.01];
const CENTERS_RT = 30;
const PAN_ZOOM = 12;
const PAN_ROTATION = 0.7;

function now(): number {
  return performance.now();
}

// ─── 対象ごとの共通参照（組に依らない。1 回だけ測る） ─────────────────────────

interface TargetRefs {
  samples: number[][];
  local: (ViewpointCoefficients | null)[];
  legacy: { zoom: number; rPx: number; coefs: (ViewpointCoefficients | null)[] }[];
}

const refCache = new Map<string, TargetRefs>();

function refsOf(target: Target): TargetRefs {
  const cached = refCache.get(target.id);
  if (cached) return cached;
  const samples = samplesFor(target, SAMPLE_COUNT);
  const local = samples.map(p => probeCoefficients(target.surface, p, 1, false));
  const longSide = Math.max(
    target.paperRect.maxX - target.paperRect.minX,
    target.paperRect.maxY - target.paperRect.minY
  );
  const legacy = [1 / 8, 1 / 64, 1 / 512].map(ratio => {
    const rPx = longSide * ratio;
    const zoom = zoomForRadiusPx(rPx, SIZE, target.maxxy);
    return {
      zoom,
      rPx: radiusPxAt(zoom, SIZE, target.maxxy),
      coefs: samples.map(p => legacyCoefficientsAt(target.surface, p, zoom, SIZE, target.maxxy))
    };
  });
  const refs: TargetRefs = { samples, local, legacy };
  refCache.set(target.id, refs);
  return refs;
}

/** 格子評価（strict は地理側グリッド、loose / strict_error は紙側グリッド） */
function evalForward(
  target: Target,
  field: ViewpointField,
  p: number[]
): ViewpointCoefficients | null {
  if (target.strictness === "strict") {
    const m = target.surface.transform(p, false, true);
    if (!finite2(m)) return null;
    return field.eval(p, m, false);
  }
  return field.eval(p, p, false);
}

function gridInput(target: Target, nLong: number, probeRadiusCells: number): ViewpointFieldInput {
  return {
    surface: target.surface,
    mode: "grid",
    strictness: target.strictness,
    paperRect: target.paperRect,
    nLong,
    probeRadiusCells
  };
}

function mapTransformOf(target: Target): MapTransform {
  const mt = new MapTransform();
  if (target.layerData.kind === "tin") {
    mt.setMapData({ compiled: target.layerData.compiled, maxZoom: target.maxZoom });
  } else {
    mt.setLayeredMapData({ main: target.layerData, maxZoom: target.maxZoom });
  }
  return mt;
}

// ─── 表 1・環境 ───────────────────────────────────────────────────────────────

function writeEnv(): void {
  let head = "（git 不明）";
  try {
    head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: ROOT }).toString().trim();
  } catch { /* noop */ }
  const cpu = os.cpus();
  const body = [
    mdTable(
      ["項目", "値"],
      [
        ["計測日", "2026-11-28"],
        ["commit", head],
        ["CPU", `${cpu[0]?.model ?? "不明"} × ${cpu.length} コア`],
        ["メモリ", `${(os.totalmem() / 1024 ** 3).toFixed(1)} GB`],
        ["OS", `${os.platform()} ${os.release()} ${os.arch()}`],
        ["node", process.version],
        ["実行形", `esbuild で bundle した単一 ESM を node で実行（node_modules/.bin/esbuild）`],
        ["乱数種", `${SEED}（標本は再実行で同一）`],
        ["画面サイズ", `旧 5 点参照・滑らかさは ${SIZE.join("×")}、往復は ${SIZE_SMALL.join("×")}（float 相殺の最悪側）`]
      ]
    )
  ].join("\n");
  writeRegion(ROOT, DOC, "env", body);
}

function writeMaps(targets: Target[]): void {
  const rows = inventoryRows(ROOT, targets).map(r => [
    r.map, r.source, r.strictness, String(r.layers), r.gcps, r.wh, r.measured, r.note
  ]);
  const body = [
    mdTable(
      ["地図", "ファイル", "strict / loose", "層数", "GCP 数（主 / 副）", "紙サイズ(px)", "計測", "備考"],
      rows
    ),
    "",
    "計測は各 fixture の主層（`1932_nobeoka_sub0_v3` と AT 合成副層のみその層そのもの）を 1 層の地図として行った。",
    "旧 5 点参照の代表ズームは、5 点半径（画面短辺の 1/4）が紙の長辺の 1/8・1/64・1/512 になるよう各図ごとに決めた（表 3 に実半径を記載）。"
  ].join("\n");
  writeRegion(ROOT, DOC, "maps", body);
}

// ─── 1. 局所差（§2.2 4.） ────────────────────────────────────────────────────

function writeSection1(targets: Target[]): void {
  console.log("[1] 局所差: 参照（局所 r=1px・旧 5 点）を算出…");
  const perTarget = new Map<string, {
    gridRot: Map<string, { max: number; p95: number }>;
    gridSc: Map<string, { max: number; p95: number }>;
    legacyRows: { label: string; rPx: number; zoom: number; cells: string[] }[];
  }>();

  for (const target of targets) {
    const refs = refsOf(target);
    console.log(`  - ${target.id}`);
    const gridRot = new Map<string, { max: number; p95: number }>();
    const gridSc = new Map<string, { max: number; p95: number }>();
    let defaultGridCoefs: (ViewpointCoefficients | null)[] = [];
    for (const combo of COMBOS) {
      const field = ViewpointField.build(gridInput(target, combo.nLong, combo.probeRadiusCells));
      const rotDiffs: number[] = [];
      const scDiffs: number[] = [];
      const coefs: (ViewpointCoefficients | null)[] = [];
      for (let i = 0; i < refs.samples.length; i++) {
        const local = refs.local[i];
        const grid = evalForward(target, field, refs.samples[i]);
        coefs.push(grid);
        if (!local || !grid || !(local.s > 0) || !(grid.s > 0)) continue;
        const d = coefDiff(grid, local);
        rotDiffs.push(d.rotDeg);
        scDiffs.push(d.scaleRatio);
      }
      const rot = maxP95(rotDiffs);
      const sc = maxP95(scDiffs);
      gridRot.set(combo.label, rot);
      gridSc.set(combo.label, sc);
      if (combo.label === DEFAULT_COMBO.label) defaultGridCoefs = coefs;
    }

    // 旧 5 点:3 代表ズームごとに「旧 vs 局所」と「格子(既定) vs 旧」
    const legacyRows: { label: string; rPx: number; zoom: number; cells: string[] }[] = [];
    for (const leg of refs.legacy) {
      const oldRot: number[] = [], oldSc: number[] = [], gapRot: number[] = [], gapSc: number[] = [];
      for (let i = 0; i < refs.samples.length; i++) {
        const local = refs.local[i];
        const old = leg.coefs[i];
        const grid = defaultGridCoefs[i];
        if (local && old && local.s > 0 && old.s > 0) {
          const d = coefDiff(old, local);
          oldRot.push(d.rotDeg);
          oldSc.push(d.scaleRatio);
        }
        if (grid && old && grid.s > 0 && old.s > 0) {
          const d = coefDiff(grid, old);
          gapRot.push(d.rotDeg);
          gapSc.push(d.scaleRatio);
        }
      }
      const oR = maxP95(oldRot), oS = maxP95(oldSc), gR = maxP95(gapRot), gS = maxP95(gapSc);
      legacyRows.push({
        label: target.id,
        rPx: leg.rPx,
        zoom: leg.zoom,
        cells: [
          `${fmt(oR.max)}/${fmt(oR.p95)}`,
          `${fmt(oS.max * 100)}/${fmt(oS.p95 * 100)}`,
          `${fmt(gR.max)}/${fmt(gR.p95)}`,
          `${fmt(gS.max * 100)}/${fmt(gS.p95 * 100)}`
        ]
      });
    }
    perTarget.set(target.id, { gridRot, gridSc, legacyRows });
  }

  const header = ["地図", ...COMBOS.map(c => c.label)];
  const rotRows = targets.map(t => {
    const rec = perTarget.get(t.id)!;
    return [t.id, ...COMBOS.map(c => {
      const v = rec.gridRot.get(c.label)!;
      return `${fmt(v.max)}/${fmt(v.p95)}`;
    })];
  });
  const scRows = targets.map(t => {
    const rec = perTarget.get(t.id)!;
    return [t.id, ...COMBOS.map(c => {
      const v = rec.gridSc.get(c.label)!;
      return `${fmt(v.max * 100)}/${fmt(v.p95 * 100)}`;
    })];
  });
  const legacyTableRows: string[][] = [];
  for (const t of targets) {
    const rec = perTarget.get(t.id)!;
    rec.legacyRows.forEach((row, i) => {
      legacyTableRows.push([
        i === 0 ? t.id : "",
        fmt(row.zoom, 1),
        fmt(row.rPx, 1),
        ...row.cells
      ]);
    });
  }

  const body = [
    `標本: 各図 GCP 凸包（GCP が無い AT Plan A は紙基準矩形）の内側 ${SAMPLE_COUNT} 点（種 ${SEED}）。`,
    "差の基準: その点の局所値（半径 1 px の十字プローブ、§1.2 と同じ算出式）。セルは `最大/p95`。",
    "",
    "#### 表 2a 回転差（度・格子 vs 局所 r=1px）",
    mdTable(header, rotRows),
    "",
    "#### 表 2b 縮尺比差（%・格子 vs 局所 r=1px。|s格子/s局所 − 1|）",
    mdTable(header, scRows),
    "",
    `#### 表 2c 旧 5 点方式（V2 都度計算）との差（既定の組 ${DEFAULT_COMBO.label}）`,
    "各図 3 行 = 代表ズーム（5 点半径が紙の長辺の 1/8・1/64・1/512）。セルは `最大/p95`。",
    mdTable(
      ["地図", "zoom", "5点半径(px)", "旧 vs 局所 回転(°)", "旧 vs 局所 縮尺(%)", "格子 vs 旧 回転(°)", "格子 vs 旧 縮尺(%)"],
      legacyTableRows
    )
  ].join("\n");
  writeRegion(ROOT, DOC, "sec1", body);
  console.log("[1] 書き込み完了");
}

// ─── 2. 滑らかさ（AT-5 と同じ測り方） ────────────────────────────────────────

function writeSection2(targets: Target[]): void {
  console.log("[2] 滑らかさ: 1px パン…");
  const header = ["地図", ...COMBOS.map(c => c.label), "旧5点(参考)"];
  const rows: string[][] = [];

  for (const target of targets) {
    console.log(`  - ${target.id}`);
    const { minX, maxX, minY, maxY } = target.sampleBox;
    const y = (minY + maxY) / 2;
    const x0 = minX;
    const steps = Math.min(Math.round(maxX - minX), 40000);
    const centerSys = (x: number) => xy2SysCoord([x, y], target.maxxy);

    const maxStepOf = (series: { z: number; theta: number }[]) => {
      let maxRotDeg = 0, maxDz = 0;
      for (let i = 1; i < series.length; i++) {
        maxRotDeg = Math.max(maxRotDeg, Math.abs(wrapAngle(series[i].theta - series[i - 1].theta)) * 180 / Math.PI);
        maxDz = Math.max(maxDz, Math.abs(series[i].z - series[i - 1].z));
      }
      return { maxRotDeg, maxDz };
    };

    const cells: string[] = [];
    const mt = mapTransformOf(target);
    for (const combo of COMBOS) {
      mt.setViewpointFieldParams({ nLong: combo.nLong, probeRadiusCells: combo.probeRadiusCells });
      const series: { z: number; theta: number }[] = [];
      let failed = 0;
      for (let s = 0; s <= steps; s++) {
        const vp: Viewpoint = { center: centerSys(x0 + s), zoom: PAN_ZOOM, rotation: PAN_ROTATION };
        try {
          const mercs = mt.viewpoint2Mercs(vp, SIZE, 0);
          const decoded = mercs2MercViewpoint(mercs, SIZE);
          series.push({ z: decoded.zoom, theta: decoded.rotation });
        } catch {
          failed++;
          const last = series[series.length - 1];
          if (last) series.push(last);
        }
      }
      const m = maxStepOf(series);
      cells.push(`${fmt(m.maxRotDeg, 3)}/${fmt(m.maxDz, 4)}${failed ? `(${failed}点失敗)` : ""}`);
    }

    // 旧 5 点の参考（5 点半径 = 紙の長辺の 1/64）
    const longSide = Math.max(target.paperRect.maxX - target.paperRect.minX, target.paperRect.maxY - target.paperRect.minY);
    const legZoom = zoomForRadiusPx(longSide / 64, SIZE, target.maxxy);
    const alphaSys = (2 * MERC_MAX) / target.maxxy;
    const legSeries: { z: number; theta: number }[] = [];
    for (let s = 0; s <= steps; s++) {
      const coef = legacyCoefficientsAt(target.surface, [x0 + s, y], legZoom, SIZE, target.maxxy);
      if (coef) legSeries.push({ z: PAN_ZOOM + Math.log2(alphaSys / coef.s), theta: PAN_ROTATION + coef.theta });
      else legSeries.push(legSeries[legSeries.length - 1] ?? { z: PAN_ZOOM, theta: PAN_ROTATION });
    }
    const leg = maxStepOf(legSeries);
    rows.push([target.id, ...cells, `${fmt(leg.maxRotDeg, 3)}/${fmt(leg.maxDz, 4)}`]);
  }

  const body = [
    `AT-5 と同じ測り方。画面 ${SIZE.join("×")}・zoom ${PAN_ZOOM}・rotation ${PAN_ROTATION} で、`,
    "GCP 凸包の外接矩形の中段を 1 px 刻みでパンし、公開 API `viewpoint2Mercs` → `mercs2MercViewpoint` で復元した",
    "`(zoom, rotation)` の隣接ステップ差の最大を出す。セルは `最大Δ回転(°)/最大Δzoom`。",
    "旧 5 点は同じ経路を半径 紙の長辺/64 の 5 点で測った参考値（AT-5 の旧方式に相当）。",
    "",
    mdTable(header, rows)
  ].join("\n");
  writeRegion(ROOT, DOC, "sec2", body);
  console.log("[2] 書き込み完了");
}

// ─── 3. 往復誤差 ─────────────────────────────────────────────────────────────

function writeSection3(targets: Target[]): void {
  console.log("[3] 往復誤差…");
  const header = ["地図", ...COMBOS.map(c => c.label)];
  const rows: string[][] = [];

  for (const target of targets) {
    console.log(`  - ${target.id}`);
    const refs = refsOf(target);
    const centers = refs.samples.slice(0, CENTERS_RT);
    const cells: string[] = [];
    const mt = mapTransformOf(target);
    for (const combo of COMBOS) {
      if (target.strictness === "strict_error") {
        cells.push("—");
        continue;
      }
      mt.setViewpointFieldParams({ nLong: combo.nLong, probeRadiusCells: combo.probeRadiusCells });
      let maxC = 0, maxZ = 0, maxR = 0, ok = 0, failed = 0;
      for (const c of centers) {
        for (const zoom of ZOOMS_RT) {
          for (const rot of ROTS_RT) {
            const vp: Viewpoint = { center: xy2SysCoord(c, target.maxxy), zoom, rotation: rot };
            try {
              const mercs = mt.viewpoint2Mercs(vp, SIZE_SMALL, 0);
              const back = mt.mercs2Viewpoint(mercs, SIZE_SMALL, 0);
              const backXy = sysCoord2Xy(back.center, target.maxxy);
              maxC = Math.max(maxC, Math.hypot(backXy[0] - c[0], backXy[1] - c[1]));
              maxZ = Math.max(maxZ, Math.abs(back.zoom - zoom));
              maxR = Math.max(maxR, Math.abs(wrapAngle(back.rotation - rot)));
              ok++;
            } catch {
              failed++;
            }
          }
        }
      }
      cells.push(ok ? `${fmtSci(maxC)}/${fmtSci(maxZ)}/${fmtSci(maxR)}${failed ? `(${failed}失敗)` : ""}` : "—");
    }
    rows.push([target.id, ...cells]);
  }

  const body = [
    `セルは \`center(px)/zoom/rotation\` の往復誤差の最大（同サイズ ${SIZE_SMALL.join("×")} 往復、`,
    `中心 ${CENTERS_RT} 点 × ズーム ${ZOOMS_RT.join("・")} × 回転 ${ROTS_RT.map(r => fmt(r, 2)).join("・")}、層 0 固定）。`,
    "`strict_error` は逆変換が例外のため往復の対象外（—）。",
    "",
    mdTable(header, rows)
  ].join("\n");
  writeRegion(ROOT, DOC, "sec3", body);
  console.log("[3] 書き込み完了");
}

// ─── 4. 速度（§2.3） ─────────────────────────────────────────────────────────

function timeRuns(fn: () => void, runs: number): { median: number; max: number } {
  const times: number[] = [];
  fn(); // ウォームアップ
  for (let i = 0; i < runs; i++) {
    const t0 = now();
    fn();
    times.push(now() - t0);
  }
  times.sort((a, b) => a - b);
  return {
    median: times[Math.floor(times.length / 2)],
    max: times[times.length - 1]
  };
}

const SPEED_MAP_IDS = [
  "naramachi_yasui_revised_v3",
  "naramachi_yasui_bunko_v3",
  "18th_mapcontest_gp_v3",
  "fushimijo_maplat_v3",
  "AT_synthetic_main"
];

function writeSection4(targets: Target[]): void {
  const picked = SPEED_MAP_IDS.map(id => targets.find(t => t.id === id)!).filter(Boolean);
  console.log("[4] 速度…");
  const gridRows: string[][] = [];
  const startupRows: string[][] = [];
  const convRows: string[][] = [];

  for (const target of picked) {
    console.log(`  - ${target.id}`);
    for (const nLong of N_LIST) {
      const indexed = timeRuns(() => {
        ViewpointField.build(gridInput(target, nLong, 1));
      }, RUNS);
      // 索引を強制無効にした面（線形探索）で作り直す
      let plain: { median: number; max: number } | null = null;
      if (target.layerData.kind === "tin") {
        const plainSurface = new Transform();
        plainSurface.setCompiled(target.layerData.compiled as never);
        plainSurface.indexedTins = undefined;
        plain = timeRuns(() => {
          ViewpointField.build({ ...gridInput(target, nLong, 1), surface: plainSurface });
        }, RUNS);
      }
      gridRows.push([
        target.id,
        String(nLong),
        `${fmtMs(indexed.median)} / ${fmtMs(indexed.max)}`,
        plain ? `${fmtMs(plain.median)} / ${fmtMs(plain.max)}` : "—"
      ]);
    }

    // モード 1 起動時（1 層分の ViewpointField 構築 + s0 算出、既定定数）
    const startup = timeRuns(() => {
      ViewpointField.build({
        surface: target.surface,
        mode: "constant",
        strictness: target.strictness,
        paperRect: target.paperRect
      });
    }, RUNS);
    startupRows.push([target.id, `${fmtMs(startup.median)} / ${fmtMs(startup.max)}`]);

    // 1 回の視点変換（格子構築後）
    const mt = mapTransformOf(target);
    const refs = refsOf(target);
    const warm = refs.samples[0];
    mt.viewpoint2Mercs({ center: xy2SysCoord(warm, target.maxxy), zoom: 12, rotation: 0 }, SIZE, 0);
    const batch = (fn: (i: number) => void, n: number) => {
      const t0 = now();
      for (let i = 0; i < n; i++) fn(i);
      return (now() - t0) * 1000 / n;
    };
    const n = 20000;
    const fwdTimes: number[] = [];
    const bwdTimes: number[] = [];
    for (let rep = 0; rep < 5; rep++) {
      fwdTimes.push(batch(i => {
        const p = refs.samples[i % refs.samples.length];
        mt.viewpoint2Mercs({ center: xy2SysCoord(p, target.maxxy), zoom: 12, rotation: 0 }, SIZE, 0);
      }, n));
      const mercsCache = refs.samples.slice(0, 200).map(p =>
        mt.viewpoint2Mercs({ center: xy2SysCoord(p, target.maxxy), zoom: 12, rotation: 0 }, SIZE, 0)
      );
      bwdTimes.push(batch(i => {
        mt.mercs2Viewpoint(mercsCache[i % mercsCache.length], SIZE, 0);
      }, n));
    }
    fwdTimes.sort((a, b) => a - b);
    bwdTimes.sort((a, b) => a - b);
    convRows.push([
      target.id,
      fmtUs(fwdTimes[2]),
      fmtUs(bwdTimes[2])
    ]);
  }

  const body = [
    `セルは ms（中央値 / 最大・${RUNS} 回）。索引なしは \`indexedTins = undefined\` の線形探索。`,
    "「1 層の格子」はモード 2（grid）1 面分（loose は紙・地理 2 面）。「モード 1 起動時」は既定定数で 1 層分を構築して s0 を出すまで。",
    "",
    "#### 表 6a 1 層の格子構築時間（ms）",
    mdTable(["地図", "N_long", "索引あり", "索引なし"], gridRows),
    "",
    "#### 表 6b モード 1 起動時（1 層構築 + s0、既定定数 N16 r1）",
    mdTable(["地図", "中央値 / 最大 (ms)"], startupRows),
    "",
    "#### 表 6c 視点変換 1 回（格子構築後・既定定数。µs/回、5 バッチ × 20000 回の中央値）",
    mdTable(["地図", "viewpoint2Mercs", "mercs2Viewpoint"], convRows)
  ].join("\n");
  writeRegion(ROOT, DOC, "sec4", body);
  console.log("[4] 書き込み完了");
}

// ─── 5. 判定（§5.2） ─────────────────────────────────────────────────────────

function writeSection5(targets: Target[]): void {
  console.log("[5] 判定（recommendViewpointMode）…");
  const rows: string[][] = [];
  const judge = (stat: "max" | "p95", stats: RecommendViewpointModeResult) => {
    const r = stat === "max" ? stats.maxRotationDiffDeg : stats.p95RotationDiffDeg;
    const s = stat === "max" ? stats.maxScaleRatioDiff : stats.p95ScaleRatioDiff;
    return r <= 1.0 && s <= 0.02 ? "constant" : "grid";
  };

  for (const target of targets) {
    console.log(`  - ${target.id}`);
    const variants: [string, boolean][] = [["gcps なし", false], ["gcps あり", true]];
    for (const [label, withGcps] of variants) {
      if (withGcps && !target.recommendGcps) {
        rows.push([target.id, label, "—", "—", "—", "—", "—", "—", "—", "GCP なし"]);
        continue;
      }
      const result = recommendViewpointMode(
        target.layerData,
        withGcps ? { gcps: target.recommendGcps } : undefined
      );
      const judgedMax = judge("max", result);
      const judgedP95 = judge("p95", result);
      rows.push([
        target.id,
        label,
        fmt(result.maxRotationDiffDeg),
        fmt(result.p95RotationDiffDeg),
        fmt(result.maxScaleRatioDiff * 100),
        fmt(result.p95ScaleRatioDiff * 100),
        String(result.sampleCount),
        judgedMax,
        judgedP95,
        judgedMax === judgedP95 ? "" : "判定が分かれる"
      ]);
    }
  }

  const body = [
    "既定定数（N16 r1）の `recommendViewpointMode` の出力。閾値は回転 1.0°・縮尺 2.0%。",
    "「max 判定」は最大値で、「p95 判定」は 95% 分位で閾値を当てたときの推奨（§5.2 の max vs p95 選定材料）。",
    "「gcps あり」は紙座標つき GCP を明示渡ししたとき（TIN は compiled.points と同じ。AT 合成歪み TIN のみ中央 5×5）。",
    "",
    mdTable(
      ["地図", "GCP", "回転max(°)", "回転p95(°)", "縮尺max(%)", "縮尺p95(%)", "標本数", "max判定", "p95判定", "備考"],
      rows
    )
  ].join("\n");
  writeRegion(ROOT, DOC, "sec5", body);
  console.log("[5] 書き込み完了");
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const wanted = args.length ? args : ["0", "1", "2", "3", "4", "5"];
  console.log(`root: ${ROOT}`);
  const targets = await buildTargets(ROOT);
  writeEnv();
  if (wanted.includes("0") || wanted.includes("maps")) {
    writeMaps(targets);
    console.log("[0] 環境・地図一覧を書き込み完了");
  }
  if (wanted.includes("1")) writeSection1(targets);
  if (wanted.includes("2")) writeSection2(targets);
  if (wanted.includes("3")) writeSection3(targets);
  if (wanted.includes("4")) writeSection4(targets);
  if (wanted.includes("5")) writeSection5(targets);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
