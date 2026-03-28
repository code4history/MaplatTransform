/**
 * demo/submaps.ts
 *
 * MapTransform — submap 選択ロジック デモ
 *
 * ■ 機能
 *  - 複数 TIN（sub_maps）をもつ地図で、priority / importance に基づくレイヤー選択
 *  - 左: XY (ピクセル) 空間 ／ 右: Merc (EPSG:3857) 空間
 *  - 各 submap の envelope を色分け表示
 *  - XY クリック → merc 対応点 (選択されたレイヤー情報付き)
 *  - Merc クリック → XY 対応点 (複数レイヤー / priority・importance を視覚化)
 *  - v2 / v3 切り替え
 */

import { MapTransform } from "../src/index.ts";
import type { Compiled, MapData, Transform } from "../src/index.ts";

// ─── 型 ──────────────────────────────────────────────────────────────────────

type Pos = [number, number];
type FormatVer = "v2" | "v3";

interface SubMapDef {
  v2: string;
  v3: string;
  priority: number;
  importance: number;
}

interface MapGroupDef {
  label: string;
  mainV2: string;
  mainV3: string;
  subMaps: SubMapDef[];
}

interface LoadedGroup {
  mapTransform: MapTransform;
  mainCompiled: Compiled;
  subCompiledList: Compiled[];
  subDefs: SubMapDef[];
  wh: [number, number];
  /** Main TIN の4コーナーを Merc 変換した境界（閉じたポリゴン） */
  mainMercBounds: Pos[];
  /** Bounds of each sub-map in XY space (pixel coords) */
  xyBoundsPerSub: Pos[][];
  /** Bounds of each sub-map in Merc space */
  mercBoundsPerSub: Pos[][];
  /** Merc extent [minX, minY, maxX, maxY] */
  mercExtent: [number, number, number, number];
}

// ─── Map Group Definitions ────────────────────────────────────────────────────

const MAP_GROUPS: MapGroupDef[] = [
  {
    label: "延岡 1932 (nobeoka)",
    mainV2: "../tests/compiled/1932_nobeoka_v2.json",
    mainV3: "../tests/compiled/1932_nobeoka_v3.json",
    subMaps: [
      {
        v2: "../tests/compiled/1932_nobeoka_sub0_v2.json",
        v3: "../tests/compiled/1932_nobeoka_sub0_v3.json",
        priority: 1,
        importance: 1,
      },
    ],
  },
  {
    label: "第18回コンテスト 優秀賞 (ea)",
    mainV2: "../tests/compiled/18th_mapcontest_ea_v2.json",
    mainV3: "../tests/compiled/18th_mapcontest_ea_v3.json",
    subMaps: [
      {
        v2: "../tests/compiled/18th_mapcontest_ea_sub0_v2.json",
        v3: "../tests/compiled/18th_mapcontest_ea_sub0_v3.json",
        priority: 1,
        importance: 1,
      },
      {
        v2: "../tests/compiled/18th_mapcontest_ea_sub1_v2.json",
        v3: "../tests/compiled/18th_mapcontest_ea_sub1_v3.json",
        priority: 2,
        importance: 2,
      },
    ],
  },
  {
    label: "第18回コンテスト 最優秀賞 (gp)",
    mainV2: "../tests/compiled/18th_mapcontest_gp_v2.json",
    mainV3: "../tests/compiled/18th_mapcontest_gp_v3.json",
    subMaps: [
      {
        v2: "../tests/compiled/18th_mapcontest_gp_sub0_v2.json",
        v3: "../tests/compiled/18th_mapcontest_gp_sub0_v3.json",
        priority: 1,
        importance: 1,
      },
      {
        v2: "../tests/compiled/18th_mapcontest_gp_sub1_v2.json",
        v3: "../tests/compiled/18th_mapcontest_gp_sub1_v3.json",
        priority: 2,
        importance: 2,
      },
    ],
  },
];

// ─── Layer colors ─────────────────────────────────────────────────────────────

const LAYER_COLORS = [
  "#e74c3c", // sub0: red
  "#27ae60", // sub1: green
  "#8e44ad", // sub2: purple
  "#f39c12", // sub3: orange
];

const LAYER_LABELS = [
  "Sub-0",
  "Sub-1",
  "Sub-2",
  "Sub-3",
];

// ─── Canvas / rendering constants ────────────────────────────────────────────

const CANVAS_SIZE = 500;
const PADDING = 28;

// ─── Viewport ────────────────────────────────────────────────────────────────

interface ZoomState { scale: number; tx: number; ty: number; }
function initZoom(): ZoomState { return { scale: 1, tx: 0, ty: 0 }; }

class Viewport {
  readonly minX: number; readonly maxX: number;
  readonly minY: number; readonly maxY: number;
  readonly scale: number;
  readonly offX: number; readonly offY: number;
  readonly flipY: boolean;

  constructor(points: Pos[], flipY = false) {
    this.flipY = flipY;
    const xs = points.map(p => p[0]);
    const ys = points.map(p => p[1]);
    this.minX = Math.min(...xs); this.maxX = Math.max(...xs);
    this.minY = Math.min(...ys); this.maxY = Math.max(...ys);
    const rng = CANVAS_SIZE - 2 * PADDING;
    const dx = this.maxX - this.minX, dy = this.maxY - this.minY;
    this.scale = dx > 0 && dy > 0 ? Math.min(rng / dx, rng / dy) : 1;
    this.offX = PADDING + (rng - (this.maxX - this.minX) * this.scale) / 2;
    this.offY = PADDING + (rng - (this.maxY - this.minY) * this.scale) / 2;
  }

  toCanvas(p: Pos, zoom: ZoomState): Pos {
    let cx = (p[0] - this.minX) * this.scale + this.offX;
    let cy = this.flipY
      ? CANVAS_SIZE - ((p[1] - this.minY) * this.scale + this.offY)
      : (p[1] - this.minY) * this.scale + this.offY;
    cx = cx * zoom.scale + zoom.tx;
    cy = cy * zoom.scale + zoom.ty;
    return [cx, cy];
  }

  fromCanvas(cx: number, cy: number, zoom: ZoomState): Pos {
    const wx = (cx - zoom.tx) / zoom.scale;
    const wy = (cy - zoom.ty) / zoom.scale;
    const wx2 = (wx - this.offX) / this.scale + this.minX;
    const wy2 = this.flipY
      ? this.minY + (CANVAS_SIZE - wy - this.offY) / this.scale
      : (wy - this.offY) / this.scale + this.minY;
    return [wx2, wy2];
  }
}

// ─── State ───────────────────────────────────────────────────────────────────

let currentGroup: LoadedGroup | null = null;
let currentGroupIdx = 0;
let currentVer: FormatVer = "v2";

let vpXY: Viewport | null = null;
let vpMerc: Viewport | null = null;

let zoomXY: ZoomState = initZoom();
let zoomMerc: ZoomState = initZoom();

/** Clicked XY point → resulting merc point(s) */
interface XYClickResult {
  xy: Pos;
  layerIdx: number;   // 0=main, 1..n=sub
  merc: Pos;
}

/** Clicked Merc point → resulting XY point(s) */
interface MercClickResult {
  merc: Pos;
  results: Array<{
    layerIdx: number;
    xy: Pos;
    isHidden: boolean; // true = covered by higher priority layer
  }>;
}

let xyClickResult: XYClickResult | null = null;
let mercClickResult: MercClickResult | null = null;

// ─── Fetch helpers ───────────────────────────────────────────────────────────

async function fetchJSON(url: string): Promise<Compiled> {
  const r = await fetch(url);
  const ct = r.headers.get("content-type") ?? "";
  if (!r.ok || !ct.includes("json")) {
    throw new Error(`Failed to fetch ${url}: ${r.status} (${ct})`);
  }
  return r.json();
}

// ─── Load group ──────────────────────────────────────────────────────────────

async function loadGroup(def: MapGroupDef, ver: FormatVer): Promise<LoadedGroup> {
  const mainPath = ver === "v2" ? def.mainV2 : def.mainV3;
  const mainCompiled = await fetchJSON(mainPath);

  const subCompiledList: Compiled[] = [];
  for (const sub of def.subMaps) {
    subCompiledList.push(await fetchJSON(ver === "v2" ? sub.v2 : sub.v3));
  }

  // Build MapData
  const mapData: MapData = {
    compiled: mainCompiled,
    sub_maps: def.subMaps.map((sub, i) => ({
      compiled: subCompiledList[i],
      priority: sub.priority,
      importance: sub.importance,
    })),
  };

  const mapTransform = new MapTransform();
  mapTransform.setMapData(mapData);

  // Main TIN wh
  const wh = (mainCompiled.wh ?? [512, 512]) as [number, number];

  // Build xyBounds and mercBounds for each sub
  const xyBoundsPerSub: Pos[][] = [];
  const mercBoundsPerSub: Pos[][] = [];

  for (let i = 0; i < def.subMaps.length; i++) {
    const subCompiled = subCompiledList[i];
    const rawBounds: number[][] = (subCompiled as any).bounds ?? [];

    // XY bounds (close the polygon)
    const xyBounds = [...rawBounds, rawBounds[0]] as Pos[];
    xyBoundsPerSub.push(xyBounds);

    // Merc bounds: transform each corner
    const mercBounds: Pos[] = xyBounds.map(xy => {
      // Use sub TIN directly for transform
      const subMapTransform = new MapTransform();
      subMapTransform.setMapData({ compiled: subCompiledList[i] });
      const merc = subMapTransform.xy2Merc(xy);
      return merc !== false ? merc as Pos : xy as Pos;
    });
    mercBoundsPerSub.push(mercBounds);
  }

  // Main TIN の4コーナーを Merc 変換（envelope）
  const mainCorners: Pos[] = [
    [0, 0], [wh[0], 0], [wh[0], wh[1]], [0, wh[1]],
  ];
  const mainMercCorners: Pos[] = mainCorners
    .map(c => mapTransform.xy2Merc(c))
    .filter((m): m is number[] => m !== false) as Pos[];
  const mainMercBounds: Pos[] =
    mainMercCorners.length > 0
      ? [...mainMercCorners, mainMercCorners[0]] // 閉じたポリゴン
      : [];

  // Compute merc extent from all bounds + main corners
  const allMercPts: Pos[] = [...mainMercCorners];
  for (const bounds of mercBoundsPerSub) {
    allMercPts.push(...bounds);
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of allMercPts) {
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
  const mercExtent: [number, number, number, number] = [minX, minY, maxX, maxY];

  return {
    mapTransform,
    mainCompiled,
    subCompiledList,
    subDefs: def.subMaps,
    wh,
    mainMercBounds,
    xyBoundsPerSub,
    mercBoundsPerSub,
    mercExtent,
  };
}

// ─── Build viewports ─────────────────────────────────────────────────────────

function buildViewports(grp: LoadedGroup) {
  const [w, h] = grp.wh;
  vpXY = new Viewport([[0, 0], [w, h]], false); // Y: down
  const [minX, minY, maxX, maxY] = grp.mercExtent;
  vpMerc = new Viewport([[minX, minY], [maxX, maxY]], true); // Y: up (flip)
}

// ─── Triangle net helper ─────────────────────────────────────────────────────

/**
 * TIN の三角網を薄く描画する
 * @param backward - false=XY空間（forw TIN）, true=Merc空間（bakw TIN）
 */
function drawTriangleNet(
  ctx: CanvasRenderingContext2D,
  transform: Transform,
  vp: Viewport,
  zm: ZoomState,
  color: string,
  backward: boolean
): void {
  const tins = backward ? transform.tins?.bakw : transform.tins?.forw;
  if (!tins) return;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.2;
  ctx.beginPath();

  for (const feature of tins.features) {
    const coords = (feature.geometry as { coordinates: number[][][] }).coordinates[0];
    if (coords.length < 3) continue;
    const [x0, y0] = vp.toCanvas(coords[0] as Pos, zm);
    const [x1, y1] = vp.toCanvas(coords[1] as Pos, zm);
    const [x2, y2] = vp.toCanvas(coords[2] as Pos, zm);
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
  }

  ctx.stroke();
  ctx.restore();
}

// ─── Drawing ─────────────────────────────────────────────────────────────────

function drawXY(canv: HTMLCanvasElement) {
  const ctx = canv.getContext("2d")!;
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  if (!currentGroup || !vpXY) return;

  const grp = currentGroup;
  const vp = vpXY;
  const zm = zoomXY;

  // Background
  ctx.fillStyle = "#f5f7fa";
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Main TIN border
  const [w, h] = grp.wh;
  const corners: Pos[] = [[0,0],[w,0],[w,h],[0,h]];
  ctx.strokeStyle = "#1a2744";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  corners.forEach((p, i) => {
    const [cx, cy] = vp.toCanvas(p, zm);
    i === 0 ? ctx.moveTo(cx, cy) : ctx.lineTo(cx, cy);
  });
  ctx.closePath();
  ctx.stroke();
  ctx.setLineDash([]);

  // Label "Main"
  {
    const [cx, cy] = vp.toCanvas([4, 4], zm);
    ctx.fillStyle = "#1a274488";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText("Main TIN", cx + 4, cy + 14);
  }

  // 三角網（薄く重ねて表示）
  {
    const mainT = grp.mapTransform.getLayerTransform(0);
    if (mainT) drawTriangleNet(ctx, mainT, vp, zm, "#1a2744", false);
    for (let i = 0; i < grp.subDefs.length; i++) {
      const subT = grp.mapTransform.getLayerTransform(i + 1);
      if (subT) drawTriangleNet(ctx, subT, vp, zm, LAYER_COLORS[i] ?? "#999", false);
    }
  }

  // Sub-maps bounds
  for (let i = 0; i < grp.xyBoundsPerSub.length; i++) {
    const bounds = grp.xyBoundsPerSub[i];
    const color = LAYER_COLORS[i] ?? "#999";
    const def = grp.subDefs[i];

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.fillStyle = color + "22";
    ctx.beginPath();
    bounds.forEach((p, j) => {
      const [cx, cy] = vp.toCanvas(p, zm);
      j === 0 ? ctx.moveTo(cx, cy) : ctx.lineTo(cx, cy);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Centroid label
    const cx = bounds.slice(0, -1).reduce((s, p) => s + p[0], 0) / (bounds.length - 1);
    const cy = bounds.slice(0, -1).reduce((s, p) => s + p[1], 0) / (bounds.length - 1);
    const [lcx, lcy] = vp.toCanvas([cx, cy], zm);
    ctx.fillStyle = color;
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${LAYER_LABELS[i]}`, lcx, lcy);
    ctx.font = "10px sans-serif";
    ctx.fillText(`pri=${def.priority} imp=${def.importance}`, lcx, lcy + 13);
    ctx.textAlign = "left";
  }

  // ── XY click result: show clicked XY + selected layer indicator ──
  if (xyClickResult) {
    const [cx, cy] = vp.toCanvas(xyClickResult.xy, zm);
    const li = xyClickResult.layerIdx;
    const color = li === 0 ? "#1a2744" : (LAYER_COLORS[li - 1] ?? "#999");
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Layer label
    ctx.fillStyle = color;
    ctx.font = "bold 11px sans-serif";
    ctx.fillText(li === 0 ? "Main" : LAYER_LABELS[li - 1], cx + 9, cy + 4);
  }

  // ── Merc click result: show projected XY points ──
  if (mercClickResult) {
    for (const res of mercClickResult.results) {
      const [cx, cy] = vp.toCanvas(res.xy, zm);
      const li = res.layerIdx;
      const color = li === 0 ? "#1a2744" : (LAYER_COLORS[li - 1] ?? "#999");

      if (res.isHidden) {
        // Hollow circle = hidden by higher-priority layer
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(cx, cy, 7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(cx, cy, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      const label = li === 0 ? "Main" : LAYER_LABELS[li - 1];
      ctx.fillStyle = color;
      ctx.font = `${res.isHidden ? "italic " : "bold "}11px sans-serif`;
      ctx.fillText(
        `${label}${res.isHidden ? " (hidden)" : ""}`,
        cx + 9, cy + 4
      );
    }
  }
}

function drawMerc(canv: HTMLCanvasElement) {
  const ctx = canv.getContext("2d")!;
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  if (!currentGroup || !vpMerc) return;

  const grp = currentGroup;
  const vp = vpMerc;
  const zm = zoomMerc;

  // Background
  ctx.fillStyle = "#e8f4f8";
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Main TIN envelope（破線ポリゴン）
  if (grp.mainMercBounds.length > 1) {
    ctx.strokeStyle = "#1a2744";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    grp.mainMercBounds.forEach((p, i) => {
      const [cx, cy] = vp.toCanvas(p, zm);
      i === 0 ? ctx.moveTo(cx, cy) : ctx.lineTo(cx, cy);
    });
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);
    // ラベル
    const [lx, ly] = vp.toCanvas(grp.mainMercBounds[0], zm);
    ctx.fillStyle = "#1a274488";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText("Main TIN", lx + 4, ly + 14);
  }

  // 三角網（薄く重ねて表示）
  {
    const mainT = grp.mapTransform.getLayerTransform(0);
    if (mainT) drawTriangleNet(ctx, mainT, vp, zm, "#1a2744", true);
    for (let i = 0; i < grp.subDefs.length; i++) {
      const subT = grp.mapTransform.getLayerTransform(i + 1);
      if (subT) drawTriangleNet(ctx, subT, vp, zm, LAYER_COLORS[i] ?? "#999", true);
    }
  }

  // Sub-maps merc bounds
  for (let i = 0; i < grp.mercBoundsPerSub.length; i++) {
    const bounds = grp.mercBoundsPerSub[i];
    const color = LAYER_COLORS[i] ?? "#999";
    const def = grp.subDefs[i];

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.fillStyle = color + "22";
    ctx.beginPath();
    bounds.forEach((p, j) => {
      const [cx, cy] = vp.toCanvas(p, zm);
      j === 0 ? ctx.moveTo(cx, cy) : ctx.lineTo(cx, cy);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Centroid label
    const mcx = bounds.slice(0, -1).reduce((s, p) => s + p[0], 0) / (bounds.length - 1);
    const mcy = bounds.slice(0, -1).reduce((s, p) => s + p[1], 0) / (bounds.length - 1);
    const [lcx, lcy] = vp.toCanvas([mcx, mcy], zm);
    ctx.fillStyle = color;
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${LAYER_LABELS[i]}`, lcx, lcy);
    ctx.font = "10px sans-serif";
    ctx.fillText(`pri=${def.priority} imp=${def.importance}`, lcx, lcy + 13);
    ctx.textAlign = "left";
  }

  // ── XY click result: show merc point ──
  if (xyClickResult) {
    const [cx, cy] = vp.toCanvas(xyClickResult.merc, zm);
    const li = xyClickResult.layerIdx;
    const color = li === 0 ? "#1a2744" : (LAYER_COLORS[li - 1] ?? "#999");
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // ── Merc click result: show clicked merc ──
  if (mercClickResult) {
    const [cx, cy] = vp.toCanvas(mercClickResult.merc, zm);
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 9, cy); ctx.lineTo(cx + 9, cy);
    ctx.moveTo(cx, cy - 9); ctx.lineTo(cx, cy + 9);
    ctx.stroke();
  }
}

function redraw() {
  drawXY(canvXY);
  drawMerc(canvMerc);
}

// ─── Load + init ──────────────────────────────────────────────────────────────

let statusEl: HTMLElement;
let canvXY: HTMLCanvasElement;
let canvMerc: HTMLCanvasElement;

async function loadAndRender() {
  statusEl.textContent = "読み込み中…";
  xyClickResult = null;
  mercClickResult = null;
  try {
    const def = MAP_GROUPS[currentGroupIdx];
    const grp = await loadGroup(def, currentVer);
    currentGroup = grp;
    buildViewports(grp);
    zoomXY = initZoom();
    zoomMerc = initZoom();
    statusEl.textContent = `${def.label} [${currentVer.toUpperCase()}] — ${def.subMaps.length} submaps`;
    updateLegend();
    redraw();
  } catch (e: any) {
    statusEl.textContent = `エラー: ${e.message}`;
    console.error(e);
  }
}

function updateLegend() {
  const el = document.getElementById("legend")!;
  if (!currentGroup) { el.textContent = ""; return; }
  const grp = currentGroup;
  const rows: string[] = [
    `<span style="color:#1a2744;font-weight:bold">■ Main TIN</span>: メイン（全域フォールバック）`,
    ...grp.subDefs.map((def, i) => {
      const c = LAYER_COLORS[i] ?? "#999";
      return `<span style="color:${c};font-weight:bold">■ ${LAYER_LABELS[i]}</span>: priority=${def.priority}, importance=${def.importance}`;
    }),
    "<hr style='border:none;border-top:1px solid #ddd;margin:4px 0'>",
    "<b>XY クリック</b>: 選択されたレイヤーで merc 変換 → 右パネルに表示",
    "<b>Merc クリック</b>: 全レイヤーで XY 逆変換 → 左パネルに複数表示（実線=表示, 点線=隠れ）",
  ];
  el.innerHTML = rows.join("<br>");
}

// ─── Zoom / pan ──────────────────────────────────────────────────────────────

function setupZoomPan(
  canv: HTMLCanvasElement,
  getZoom: () => ZoomState,
  setZoom: (z: ZoomState) => void
) {
  let dragging = false;
  let lastX = 0, lastY = 0;

  canv.addEventListener("wheel", e => {
    e.preventDefault();
    const zm = getZoom();
    const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    const rect = canv.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    setZoom({
      scale: zm.scale * factor,
      tx: mx + (zm.tx - mx) * factor,
      ty: my + (zm.ty - my) * factor,
    });
    redraw();
  }, { passive: false });

  canv.addEventListener("mousedown", e => {
    if (e.button === 1 || e.altKey) {
      dragging = true; lastX = e.clientX; lastY = e.clientY;
      e.preventDefault();
    }
  });
  window.addEventListener("mousemove", e => {
    if (!dragging) return;
    const zm = getZoom();
    setZoom({ scale: zm.scale, tx: zm.tx + e.clientX - lastX, ty: zm.ty + e.clientY - lastY });
    lastX = e.clientX; lastY = e.clientY;
    redraw();
  });
  window.addEventListener("mouseup", () => { dragging = false; });
  canv.addEventListener("contextmenu", e => { e.preventDefault(); });
}

// ─── Click handlers ───────────────────────────────────────────────────────────

function handleXYClick(e: MouseEvent) {
  if (!currentGroup || !vpXY) return;
  const rect = canvXY.getBoundingClientRect();
  const cx = (e.clientX - rect.left) * (CANVAS_SIZE / canvXY.offsetWidth);
  const cy = (e.clientY - rect.top) * (CANVAS_SIZE / canvXY.offsetHeight);
  const worldPos = vpXY.fromCanvas(cx, cy, zoomXY);

  const mt = currentGroup.mapTransform;
  const result = mt.xy2MercWithLayer(worldPos);
  if (result === false) {
    statusEl.textContent = "その点は変換範囲外です";
    xyClickResult = null;
  } else {
    const [layerIdx, merc] = result;
    xyClickResult = { xy: worldPos, layerIdx, merc: merc as Pos };
    const layerName = layerIdx === 0 ? "Main" : LAYER_LABELS[layerIdx - 1];
    const def = layerIdx > 0 ? currentGroup.subDefs[layerIdx - 1] : null;
    statusEl.textContent = `XY→Merc: ${layerName}${def ? ` (pri=${def.priority} imp=${def.importance})` : ""} → (${merc[0].toFixed(0)}, ${merc[1].toFixed(0)})`;
  }
  mercClickResult = null;
  redraw();
}

function handleMercClick(e: MouseEvent) {
  if (!currentGroup || !vpMerc) return;
  const rect = canvMerc.getBoundingClientRect();
  const cx = (e.clientX - rect.left) * (CANVAS_SIZE / canvMerc.offsetWidth);
  const cy = (e.clientY - rect.top) * (CANVAS_SIZE / canvMerc.offsetHeight);
  const worldPos = vpMerc.fromCanvas(cx, cy, zoomMerc);

  const mt = currentGroup.mapTransform;
  const rawResults = mt.merc2XyWithLayer(worldPos as [number, number]);

  // rawResults の解釈:
  //   rawResults[0] = undefined → そのスロットは「hidden」（より高優先度のレイヤーに覆われた点）
  //   rawResults[0] = [layerIdx, xy] → visible な最優先レイヤー
  //   rawResults[1] = [layerIdx, xy] → 2番目のレイヤー（rawResults[0] が undefined なら hidden）
  const results: MercClickResult["results"] = [];
  const firstValid = rawResults[0];
  for (let i = 0; i < rawResults.length; i++) {
    const r = rawResults[i];
    if (!r) continue;
    // rawResults[0] が undefined のとき → rawResults[1] は hidden
    const isHidden = !firstValid && i > 0;
    results.push({ layerIdx: r[0], xy: r[1] as Pos, isHidden });
  }

  if (results.length === 0) {
    statusEl.textContent = "その点は変換範囲外です";
    mercClickResult = null;
  } else {
    mercClickResult = { merc: worldPos as Pos, results };
    const desc = results.map(r => {
      const ln = r.layerIdx === 0 ? "Main" : LAYER_LABELS[r.layerIdx - 1];
      return `${ln}(${r.isHidden ? "hidden" : "visible"})`;
    }).join(", ");
    statusEl.textContent = `Merc→XY: ${desc}`;
  }
  xyClickResult = null;
  redraw();
}

// ─── Entry point ─────────────────────────────────────────────────────────────

window.addEventListener("DOMContentLoaded", () => {
  statusEl = document.getElementById("status")!;
  canvXY = document.getElementById("canvas-xy") as HTMLCanvasElement;
  canvMerc = document.getElementById("canvas-merc") as HTMLCanvasElement;

  canvXY.width = canvMerc.width = CANVAS_SIZE;
  canvXY.height = canvMerc.height = CANVAS_SIZE;

  // Map select
  const mapSel = document.getElementById("map-select") as HTMLSelectElement;
  MAP_GROUPS.forEach((g, i) => {
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = g.label;
    mapSel.appendChild(opt);
  });
  mapSel.addEventListener("change", () => {
    currentGroupIdx = Number(mapSel.value);
    loadAndRender();
  });

  // v2/v3 buttons
  document.querySelectorAll<HTMLButtonElement>(".ver-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentVer = btn.dataset.ver as FormatVer;
      document.querySelectorAll(".ver-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      loadAndRender();
    });
  });

  // Zoom / pan
  setupZoomPan(canvXY,  () => zoomXY,   z => { zoomXY = z; });
  setupZoomPan(canvMerc, () => zoomMerc, z => { zoomMerc = z; });

  // Click handlers
  canvXY.addEventListener("click", e => {
    if (e.altKey) return; // pan mode
    handleXYClick(e);
  });
  canvMerc.addEventListener("click", e => {
    if (e.altKey) return;
    handleMercClick(e);
  });

  // Initial load
  loadAndRender();
});
