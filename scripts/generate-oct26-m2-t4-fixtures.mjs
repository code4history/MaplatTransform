/**
 * scripts/generate-oct26-m2-t4-fixtures.mjs
 *
 * oct26-m2-t4（MaplatTransform#9）の合成 5 層 fixture を生成し、
 * tests/compiled/oct26_m2_t4_synthetic.json に保存する。
 *
 * - 手動実行: `node scripts/generate-oct26-m2-t4-fixtures.mjs`（pnpm を spawn しない）
 * - 定数は設計書 docs/superpowers/specs/2026-09-14-oct26-m2-t4-design.md §6.1 の表で固定。
 *   AC に合わせて動かしてはならない。
 * - 生成手順は設計検算 docs/superpowers/evidence/oct26-m2-t4/v3-probe/synthetic.mjs の
 *   mainCompiled / subCompiled と同一。
 *
 * 紙: 2048×1536 px。本図の紙座標 (x,y) ↔ メルカトル (14600000 + 2x, 3800000 − 2y)。
 * sub_map の層の紙座標 p ↔ 本図の紙座標 mainCenter + (p − center) × k。
 */

import { Tin } from "@maplat/tin";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, "..");
const outDir = join(root, "tests", "compiled");
const outFile = join(outDir, "oct26_m2_t4_synthetic.json");

const W = 2048;
const H = 1536;
const M0 = [14600000, 3800000];
const mainPx2Merc = ([x, y]) => [M0[0] + 2 * x, M0[1] - 2 * y];

/**
 * 層の定義（compiled に効くのは frame・center・mainCenter・k だけ。
 * priority / importance は setMapData 時に与えるので compiled には入らない）
 */
const LAYERS = {
  wide_station: {
    name: "駅前拡大図",
    frame: [[1400, 1000], [2000, 1500]],
    center: [1700, 1250],
    mainCenter: [700, 900],
    k: 1 / 8
  },
  wide_area: {
    name: "広域図",
    frame: [[1400, 40], [2000, 540]],
    center: [1700, 290],
    mainCenter: [1024, 768],
    k: 40
  },
  castle_a: {
    name: "城周辺図 A",
    frame: [[40, 1000], [640, 1500]],
    center: [340, 1250],
    mainCenter: [300, 400],
    k: 1 / 4
  },
  temple_b: {
    name: "寺町図 B",
    frame: [[500, 1150], [1000, 1500]],
    center: [750, 1325],
    mainCenter: [1100, 300],
    k: 1 / 4
  },
  // D-impTie / D-impPriTie: A の mainCenter を (700,900) へ移したもの
  castle_a_impTie: {
    name: "城周辺図 A（D-impTie: mainCenter を駅前と同じ地域へ）",
    frame: [[40, 1000], [640, 1500]],
    center: [340, 1250],
    mainCenter: [700, 900],
    k: 1 / 4
  },
  // D-6layer: 層 5「広域図 C」
  wide_area_c: {
    name: "広域図 C（D-6layer）",
    frame: [[40, 40], [640, 540]],
    center: [340, 290],
    mainCenter: [1024, 768],
    k: 40
  }
};

const layerPx2MainPx = (L, [x, y]) => [
  L.mainCenter[0] + (x - L.center[0]) * L.k,
  L.mainCenter[1] + (y - L.center[1]) * L.k
];

async function mainCompiled() {
  const t = new Tin({ wh: [W, H] });
  t.setWh([W, H]);
  const c = [[0, 0], [W, 0], [W, H], [0, H], [W / 2, H / 2]];
  t.setPoints(c.map(xy => [xy, mainPx2Merc(xy)]));
  await t.updateTinAsync();
  return t.getCompiled();
}

async function subCompiled(L) {
  const [[x0, y0], [x1, y1]] = L.frame;
  const b = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const t = new Tin({});
  t.setBounds(b);
  const pts = [...b, [(x0 + x1) / 2, (y0 + y1) / 2]];
  t.setPoints(pts.map(xy => [xy, mainPx2Merc(layerPx2MainPx(L, xy))]));
  await t.updateTinAsync();
  return t.getCompiled();
}

const out = {
  description:
    "oct26-m2-t4 合成 5 層 fixture（MaplatTransform#9）。scripts/generate-oct26-m2-t4-fixtures.mjs で生成。定数は設計書 §6.1。",
  paper: { width: W, height: H, mercOrigin: M0, mercPerPx: 2 },
  layers: {},
  main: await mainCompiled(),
  sub: {}
};
for (const [key, L] of Object.entries(LAYERS)) {
  out.layers[key] = L;
  out.sub[key] = await subCompiled(L);
}

mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, JSON.stringify(out, null, 2) + "\n");
console.log(`wrote ${outFile}`);
