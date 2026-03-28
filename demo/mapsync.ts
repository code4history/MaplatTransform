/**
 * demo/mapsync.ts
 *
 * MapTransform — ビューポート同期デモ（処理3・4）
 *
 * ■ 機能
 *  - 館林御城図 ↔ 館林城下町図 の2枚の絵地図を並べて表示
 *  - viewpoint2Mercs / mercs2Viewpoint を使い、片方の操作をもう一方に伝搬
 *  - 各パネル: Envelope（外周）＋ 三角網（薄く）表示
 *  - マウスホイール = ズーム、ドラッグ = パン、Shift+ドラッグ = 回転
 *  - 中央固定の方角矢印＋スケール円
 */

import { MapTransform, xy2SysCoord, sysCoord2Xy } from "../src/index.ts";
import type { Compiled, Viewpoint } from "../src/index.ts";

// ─── 定数 ─────────────────────────────────────────────────────────────────────

const CANVAS_SIZE = 500;

// ─── 型定義 ───────────────────────────────────────────────────────────────────

type FormatVer = "v2" | "v3";

interface MapDef {
  label: string;
  v2: string;
  v3: string;
}

/**
 * 各パネルのビュー状態
 *  centerXY  : canvas 中心に対応する XY ピクセル座標
 *  scale     : 1 XY pixel = scale canvas pixels
 *  rotation  : ctx.rotate() に渡すラジアン（地図の傾き）
 */
interface MapViewState {
  centerXY: [number, number];
  scale: number;
  rotation: number;
}

interface LoadedMap {
  transform: MapTransform;
  wh: [number, number];
}

// ─── 地図定義 ─────────────────────────────────────────────────────────────────

const MAP_DEFS: MapDef[] = [
  {
    label: "館林御城図",
    v2: "../tests/compiled/tatebayashi_castle_akimoto_v2.json",
    v3: "../tests/compiled/tatebayashi_castle_akimoto_v3.json",
  },
  {
    label: "館林城下町図",
    v2: "../tests/compiled/tatebayashi_kaei_jokamachi_v2.json",
    v3: "../tests/compiled/tatebayashi_kaei_jokamachi_v3.json",
  },
];

// ─── 状態変数 ─────────────────────────────────────────────────────────────────

let currentVer: FormatVer = "v2";
let loadedMaps: LoadedMap[] | null = null;
let viewStates: MapViewState[] = [];

// ─── Viewpoint ↔ MapViewState 変換 ────────────────────────────────────────────

/**
 * MapViewState → Viewpoint（EPSG:3857 中心 + zoom + rotation）
 *
 * zoom の計算根拠:
 *   zoom2Radius(size, zoom) = floor(min(size)/4) × MERC_MAX / 128 / 2^zoom
 *   画面上の「半径相当距離（XYピクセル）」= floor(min(size)/4) / scale
 *   これを EPSG:3857 に換算: × 2×MERC_MAX / maxxy
 *   等号から: 2^zoom = scale × maxxy / 256
 *   → zoom = log2(scale × maxxy / 256)
 */
function stateToViewpoint(state: MapViewState, mt: MapTransform): Viewpoint {
  const sysCoord = xy2SysCoord(state.centerXY, mt.maxxy);
  const zoom = Math.log2(state.scale * mt.maxxy / 256);
  return { center: sysCoord, zoom, rotation: state.rotation };
}

/**
 * Viewpoint → MapViewState
 * scale = 2^zoom × 256 / maxxy（stateToViewpoint の逆）
 */
function viewpointToState(vp: Viewpoint, mt: MapTransform): MapViewState {
  const centerXY = sysCoord2Xy(vp.center, mt.maxxy) as [number, number];
  const scale = Math.pow(2, vp.zoom) * 256 / mt.maxxy;
  return { centerXY, scale, rotation: vp.rotation };
}

// ─── canvas 座標変換 ──────────────────────────────────────────────────────────

/** XY 座標 → canvas 座標 */
function xyToCanvas(xy: [number, number], state: MapViewState): [number, number] {
  const cos = Math.cos(state.rotation);
  const sin = Math.sin(state.rotation);
  const dx = xy[0] - state.centerXY[0];
  const dy = xy[1] - state.centerXY[1];
  return [
    CANVAS_SIZE / 2 + (cos * dx - sin * dy) * state.scale,
    CANVAS_SIZE / 2 + (sin * dx + cos * dy) * state.scale,
  ];
}

/** canvas 座標 → XY 座標 */
function canvasToXY(cx: number, cy: number, state: MapViewState): [number, number] {
  const cos = Math.cos(state.rotation);
  const sin = Math.sin(state.rotation);
  const dx = (cx - CANVAS_SIZE / 2) / state.scale;
  const dy = (cy - CANVAS_SIZE / 2) / state.scale;
  return [
    state.centerXY[0] + cos * dx + sin * dy,
    state.centerXY[1] - sin * dx + cos * dy,
  ];
}

/**
 * マウス位置を固定してズーム（マウス下の XY 座標が変わらないよう centerXY を調整）
 */
function zoomAround(mouseX: number, mouseY: number, factor: number, state: MapViewState): void {
  const mouseXY = canvasToXY(mouseX, mouseY, state);
  state.scale *= factor;
  // 新しい scale でマウス下 XY が同じ canvas 位置になるよう centerXY を補正
  const cos = Math.cos(state.rotation);
  const sin = Math.sin(state.rotation);
  const dx = (mouseX - CANVAS_SIZE / 2) / state.scale;
  const dy = (mouseY - CANVAS_SIZE / 2) / state.scale;
  state.centerXY = [
    mouseXY[0] - (cos * dx + sin * dy),
    mouseXY[1] - (-sin * dx + cos * dy),
  ];
}

// ─── ロード ────────────────────────────────────────────────────────────────────

async function loadMaps(ver: FormatVer): Promise<void> {
  const errEl = document.getElementById("error-msg") as HTMLElement;
  errEl.textContent = "";

  try {
    const results: LoadedMap[] = [];

    for (const def of MAP_DEFS) {
      const url = ver === "v2" ? def.v2 : def.v3;
      const compiled = (await fetch(url).then(r => r.json())) as Compiled;

      const transform = new MapTransform();
      transform.setMapData({ compiled });

      const wh = compiled.wh as [number, number];
      results.push({ transform, wh });
    }

    loadedMaps = results;
    viewStates = results.map(initViewState);
    currentVer = ver;

    updateVerButtons();
    // 左パネルを正位置で描画し、その地理的viewpointを基準に右パネルを同期する。
    // redrawAll()（両方を rotation=0 で独立描画）にすると初期状態で地理整合性がなく、
    // 初めて操作した瞬間に右パネルが180度近く反転する問題が起きるため、この順番が重要。
    drawPanel(0);
    syncFrom(0);
  } catch (e) {
    errEl.textContent = `エラー: ${e}`;
  }
}

function initViewState(loaded: LoadedMap): MapViewState {
  const [w, h] = loaded.wh;
  const padding = 30;
  const scaleX = (CANVAS_SIZE - padding * 2) / w;
  const scaleY = (CANVAS_SIZE - padding * 2) / h;
  const scale = Math.min(scaleX, scaleY);
  const centerXY: [number, number] = [w / 2, h / 2];

  return { centerXY, scale, rotation: 0 };
}

// ─── 描画 ─────────────────────────────────────────────────────────────────────

function drawPanel(idx: number): void {
  const canv = document.getElementById(`canvas-${idx}`) as HTMLCanvasElement;
  if (!canv || !loadedMaps) return;

  const ctx = canv.getContext("2d")!;
  const loaded = loadedMaps[idx];
  const state = viewStates[idx];
  const [w, h] = loaded.wh;

  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // 背景
  ctx.fillStyle = idx === 0 ? "#f5f7fa" : "#e8f4f8";
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // canvas 変換を設定（XY座標系 → canvas座標系）
  ctx.save();
  ctx.translate(CANVAS_SIZE / 2, CANVAS_SIZE / 2);
  ctx.rotate(state.rotation);
  ctx.scale(state.scale, state.scale);
  ctx.translate(-state.centerXY[0], -state.centerXY[1]);

  // --- 三角網（XY空間 forw TIN） ---
  const mainT = loaded.transform.getLayerTransform(0);
  if (mainT?.tins?.forw) {
    ctx.strokeStyle = "#1a2744";
    ctx.lineWidth = 0.7 / state.scale;
    ctx.globalAlpha = 0.15;
    ctx.beginPath();
    for (const feature of mainT.tins.forw.features) {
      const coords = (feature.geometry as { coordinates: number[][][] }).coordinates[0];
      if (coords.length < 3) continue;
      ctx.moveTo(coords[0][0], coords[0][1]);
      ctx.lineTo(coords[1][0], coords[1][1]);
      ctx.lineTo(coords[2][0], coords[2][1]);
      ctx.closePath();
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // --- Envelope（外周 dashed） ---
  ctx.strokeStyle = "#1a2744";
  ctx.lineWidth = 1.5 / state.scale;
  ctx.setLineDash([5 / state.scale, 5 / state.scale]);
  ctx.strokeRect(0, 0, w, h);
  ctx.setLineDash([]);

  ctx.restore();

  // 地図名ラベル（canvas固定）
  ctx.fillStyle = "#1a2744cc";
  ctx.font = "bold 13px sans-serif";
  ctx.fillText(MAP_DEFS[idx].label, 10, 22);

  // --- 方向基準（canvas中央固定） ---
  drawCompass(ctx);
}

/**
 * canvas 中央に固定の円と真上方向の基準線を描画。
 * 地図のズーム・パン・回転に関わらず画面上で固定。
 * 真上（画面の上端方向）への線が基準となる。
 */
function drawCompass(ctx: CanvasRenderingContext2D): void {
  const cx = CANVAS_SIZE / 2;
  const cy = CANVAS_SIZE / 2;
  const r = 32;

  ctx.save();
  ctx.translate(cx, cy);

  // 円
  ctx.strokeStyle = "rgba(60,60,60,0.35)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();

  // 真上への基準線（画面固定）
  ctx.strokeStyle = "rgba(60,80,180,0.6)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -(r - 4));
  ctx.stroke();

  ctx.restore();
}

function redrawAll(): void {
  for (let i = 0; i < MAP_DEFS.length; i++) {
    drawPanel(i);
  }
}

// ─── ビューポート同期 ─────────────────────────────────────────────────────────

let syncing = false;

/**
 * srcIdx のパネルを操作したとき、反対側を同期する
 *
 * 手順:
 *   1. 操作側の MapViewState → Viewpoint（仮想 EPSG:3857 + zoom + rotation）
 *   2. viewpoint2Mercs: XY → TIN → 実際の EPSG:3857 5点
 *   3. mercs2Viewpoint: EPSG:3857 5点 → TIN逆変換 → 相手の Viewpoint
 *   4. Viewpoint → 相手の MapViewState → 再描画
 */
function syncFrom(srcIdx: number): void {
  if (syncing || !loadedMaps) return;

  const dstIdx = 1 - srcIdx;
  const src = loadedMaps[srcIdx];
  const dst = loadedMaps[dstIdx];

  try {
    syncing = true;
    const vp = stateToViewpoint(viewStates[srcIdx], src.transform);
    const mercs = src.transform.viewpoint2Mercs(vp, [CANVAS_SIZE, CANVAS_SIZE]);
    const dstVp = dst.transform.mercs2Viewpoint(mercs, [CANVAS_SIZE, CANVAS_SIZE]);
    viewStates[dstIdx] = viewpointToState(dstVp, dst.transform);
    drawPanel(dstIdx);
  } catch (e) {
    // 変換失敗（範囲外など）はスキップ
    console.warn("Sync failed:", e);
  } finally {
    syncing = false;
  }
}

// ─── マウスインタラクション ────────────────────────────────────────────────────

interface DragInfo {
  active: boolean;
  lastX: number;
  lastY: number;
  mode: "pan" | "rotate";
  startAngle: number;
  startRotation: number;
}

function setupCanvasEvents(idx: number): void {
  const canv = document.getElementById(`canvas-${idx}`) as HTMLCanvasElement;
  if (!canv) return;

  const drag: DragInfo = {
    active: false, lastX: 0, lastY: 0,
    mode: "pan", startAngle: 0, startRotation: 0,
  };

  // ホイール: マウス位置を固定したズーム
  canv.addEventListener("wheel", (e) => {
    e.preventDefault();
    if (!loadedMaps) return;

    const factor = e.deltaY > 0 ? 1 / 1.15 : 1.15;
    const rect = canv.getBoundingClientRect();
    zoomAround(e.clientX - rect.left, e.clientY - rect.top, factor, viewStates[idx]);
    drawPanel(idx);
    syncFrom(idx);
  }, { passive: false });

  // マウスダウン: ドラッグ開始
  canv.addEventListener("mousedown", (e) => {
    if (!loadedMaps) return;
    const rect = canv.getBoundingClientRect();
    drag.active = true;
    drag.lastX = e.clientX - rect.left;
    drag.lastY = e.clientY - rect.top;

    if (e.shiftKey) {
      drag.mode = "rotate";
      drag.startAngle = Math.atan2(
        drag.lastY - CANVAS_SIZE / 2,
        drag.lastX - CANVAS_SIZE / 2
      );
      drag.startRotation = viewStates[idx].rotation;
      canv.style.cursor = "crosshair";
    } else {
      drag.mode = "pan";
      canv.style.cursor = "grabbing";
    }
  });

  // マウスムーブ: パン or 回転
  canv.addEventListener("mousemove", (e) => {
    if (!drag.active || !loadedMaps) return;
    const rect = canv.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const state = viewStates[idx];

    if (drag.mode === "pan") {
      const dx = x - drag.lastX;
      const dy = y - drag.lastY;
      const cos = Math.cos(state.rotation);
      const sin = Math.sin(state.rotation);
      // canvas差分 → XY差分（回転の逆変換）してからパン
      state.centerXY[0] -= (cos * dx + sin * dy) / state.scale;
      state.centerXY[1] -= (-sin * dx + cos * dy) / state.scale;
    } else {
      // Shift+ドラッグ: canvas中心基準の回転
      const angle = Math.atan2(y - CANVAS_SIZE / 2, x - CANVAS_SIZE / 2);
      state.rotation = drag.startRotation + (angle - drag.startAngle);
    }

    drag.lastX = x;
    drag.lastY = y;
    drawPanel(idx);
    syncFrom(idx);
  });

  const stopDrag = () => {
    drag.active = false;
    canv.style.cursor = "grab";
  };
  canv.addEventListener("mouseup", stopDrag);
  canv.addEventListener("mouseleave", stopDrag);
  canv.style.cursor = "grab";
}

// ─── バージョンボタン ──────────────────────────────────────────────────────────

function updateVerButtons(): void {
  document.getElementById("btn-v2")?.classList.toggle("active", currentVer === "v2");
  document.getElementById("btn-v3")?.classList.toggle("active", currentVer === "v3");
}

// ─── 初期化 ────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btn-v2")?.addEventListener("click", () => loadMaps("v2"));
  document.getElementById("btn-v3")?.addEventListener("click", () => loadMaps("v3"));

  for (let i = 0; i < MAP_DEFS.length; i++) {
    setupCanvasEvents(i);
  }

  loadMaps("v2");
});
