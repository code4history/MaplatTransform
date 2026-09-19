/**
 * scripts/m12-regenerate-m2t4-constants.mjs
 *
 * oct26-m12-t1b（DES-M12-WEIGHTBUFFER-0919）: tests/map-transform.test.ts の m2-t4 系
 * 期待値を新 dist（weight_buffer を無視する純アフィン Transform）で再計算して書き換える。
 *
 * 使い方:
 *   node scripts/m12-regenerate-m2t4-constants.mjs --lib <dist/maplat_transform.js> --tests <tests ディレクトリ>
 *     検査のみ（1 件でも外れたら書き出さずに exit 1）
 *   … --write
 *     検査を全件通した場合のみ書き出す
 *   … --self-test
 *     層番号を 1 つ入れ替えた期待値を与えると検査 1 が exit 1 になる（識別力）ことを確かめる
 *
 * 書き換えてよい範囲（t1 設計 §6.2。これ以外の行が diff に出たら exit 1）:
 *   - 422 行 `const OCT26_CHARACTERIZATION = {…};`（1 行 JSON。snap() の 5 項目を
 *     synthetic・nobeoka の全要素で再計算）
 *   - 406〜409 行（「可視層 1932延岡」の 4 ケースの座標）
 *   - 489〜492 行（NOBEOKA_CURRENT の 4 行。r2 丸め）
 *   - 305〜311 行・473〜481 行（合成 5 層と DESIGN_CURRENT）は再計算して値が変わった場合だけ書き換える
 *   - 変更してはならない: 323〜325 行（Issue #9 再現コードの期待 [[2,[1716.9,302.05]]]）
 *
 * 検査（t1 設計 §6.2。外れたら書き出さずに exit 1）:
 *   1. 層番号の並びの不変（merc2XyWithLayer・merc2XyVisibleLayers の各要素の 0 番目が再計算前後で同一）
 *   2. 各 xy について、その層の Transform で順変換すると入力 merc に戻る
 *      （getLayerTransform(idx).transform(xy, false, idx > 0) と merc の差が相対 1e-9 以内）
 *
 * ヘルパーの写し元（tests/map-transform.test.ts の行）: 193-218（Ll2Merc/MainPx2Merc/LayerPx2MainPx）、
 * 221-245（OCT26_SUB/oct26Sub/OCT26_FIXTURES）、276-291（oct26SynMt/oct26NobeokaMt/OCT26_A570）、
 * 424-441（snap）、470-471（r2）。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dir, "..");

// ─── 引数解析 ────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const args = {
    lib: path.resolve(repoRoot, "dist", "maplat_transform.js"),
    tests: path.resolve(repoRoot, "tests"),
    write: false,
    selfTest: false
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--lib") args.lib = path.resolve(argv[++i]);
    else if (a === "--tests") args.tests = path.resolve(argv[++i]);
    else if (a === "--write") args.write = true;
    else if (a === "--self-test") args.selfTest = true;
  }
  return args;
}
const args = parseArgs(process.argv.slice(2));
const { MapTransform } = await import(args.lib);

const testFile = path.join(args.tests, "map-transform.test.ts");
const testText = fs.readFileSync(testFile, "utf-8");
const testLines = testText.split("\n");

function loadCompiled(key, ver) {
  return JSON.parse(
    fs.readFileSync(path.join(args.tests, "compiled", `${key}_${ver}.json`), "utf-8")
  );
}

// ─── ヘルパー（tests/map-transform.test.ts からの写し） ────────────────────────
const OCT26_R = 6378137;
const oct26Ll2Merc = ([lng, lat]) => [
  (OCT26_R * lng * Math.PI) / 180,
  OCT26_R * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))
];

const oct26Syn = JSON.parse(
  fs.readFileSync(path.join(args.tests, "compiled", "oct26_m2_t4_synthetic.json"), "utf-8")
);
const OCT26_M0 = [14600000, 3800000];
const oct26MainPx2Merc = ([x, y]) => [OCT26_M0[0] + 2 * x, OCT26_M0[1] - 2 * y];
const oct26LayerPx2MainPx = (L, [x, y]) => [
  L.mainCenter[0] + (x - L.center[0]) * L.k,
  L.mainCenter[1] + (y - L.center[1]) * L.k
];

const OCT26_SUB = {
  station: { key: "wide_station", priority: 2, importance: 1 },
  wide: { key: "wide_area", priority: 1, importance: -1 },
  a: { key: "castle_a", priority: 3, importance: 1 },
  b: { key: "temple_b", priority: 4, importance: 2 },
  c: { key: "wide_area_c", priority: 1, importance: -2 }
};
const oct26Sub = (s, over = {}) => ({
  compiled: oct26Syn.sub[over.key ?? s.key],
  priority: over.priority ?? s.priority,
  importance: over.importance ?? s.importance
});
const OCT26_FIXTURES = {
  base5: [oct26Sub(OCT26_SUB.station), oct26Sub(OCT26_SUB.wide), oct26Sub(OCT26_SUB.a), oct26Sub(OCT26_SUB.b)],
  "D-samepri": [oct26Sub(OCT26_SUB.station), oct26Sub(OCT26_SUB.wide), oct26Sub(OCT26_SUB.a), oct26Sub(OCT26_SUB.b, { priority: 3 })],
  "D-impTie": [oct26Sub(OCT26_SUB.station), oct26Sub(OCT26_SUB.wide), oct26Sub(OCT26_SUB.a, { key: "castle_a_impTie" }), oct26Sub(OCT26_SUB.b)],
  "D-impPriTie": [oct26Sub(OCT26_SUB.station), oct26Sub(OCT26_SUB.wide), oct26Sub(OCT26_SUB.a, { key: "castle_a_impTie", priority: 2 }), oct26Sub(OCT26_SUB.b)],
  "D-pri0": [oct26Sub(OCT26_SUB.station, { priority: 0 }), oct26Sub(OCT26_SUB.wide), oct26Sub(OCT26_SUB.a), oct26Sub(OCT26_SUB.b)],
  "D-4layer": [oct26Sub(OCT26_SUB.station), oct26Sub(OCT26_SUB.a), oct26Sub(OCT26_SUB.b)],
  "D-6layer": [oct26Sub(OCT26_SUB.station), oct26Sub(OCT26_SUB.wide), oct26Sub(OCT26_SUB.a), oct26Sub(OCT26_SUB.b), oct26Sub(OCT26_SUB.c)]
};
const oct26SynMt = (name) => {
  const mt = new MapTransform();
  mt.setMapData({ compiled: oct26Syn.main, maxZoom: 3, sub_maps: OCT26_FIXTURES[name] });
  return mt;
};
const oct26NobeokaMt = () => {
  const mt = new MapTransform();
  mt.setMapData({
    compiled: loadCompiled("1932_nobeoka", "v2"),
    maxZoom: 6,
    sub_maps: [{ compiled: loadCompiled("1932_nobeoka_sub0", "v2"), priority: 1, importance: -1 }]
  });
  return mt;
};
const OCT26_A570 = oct26MainPx2Merc(oct26LayerPx2MainPx(oct26Syn.layers.castle_a, [570, 1300]));

const SYN_MERC = {
  "(700,900)": oct26MainPx2Merc([700, 900]),
  "(1200,700)": oct26MainPx2Merc([1200, 700]),
  "(1700,1250)": oct26MainPx2Merc([1700, 1250]),
  "(1700,290)": oct26MainPx2Merc([1700, 290]),
  "A(570,1300)": OCT26_A570,
  "(-500,768)": oct26MainPx2Merc([-500, 768])
};
const SYN_MERC_TEXT = {
  "(700,900)": 'SYN_MERC["(700,900)"]',
  "(1200,700)": 'SYN_MERC["(1200,700)"]',
  "(1700,1250)": 'SYN_MERC["(1700,1250)"]',
  "(1700,290)": 'SYN_MERC["(1700,290)"]',
  "A(570,1300)": "OCT26_A570",
  "(-500,768)": 'SYN_MERC["(-500,768)"]'
};

const snap = (mt, merc) => {
  const mercs = MapTransform.mercViewpoint2Mercs(merc, 20, 0, [256, 256]);
  const safe = (f) => {
    try {
      return { value: f() };
    } catch (e) {
      return { error: String(e.message) };
    }
  };
  return {
    merc,
    merc2XyWithLayer: mt.merc2XyWithLayer(merc),
    merc2Xy: mt.merc2Xy(merc),
    mercs2SysCoords: safe(() => mt.mercs2SysCoords(mercs)),
    mercs2Viewpoint: safe(() => mt.mercs2Viewpoint(mercs, [256, 256]))
  };
};

const r2 = (a) =>
  Array.isArray(a) ? a.map(r2) : typeof a === "number" ? Math.round(a * 100) / 100 : a;

/** JS 配列リテラル整形（", " 区切り。tests/map-transform.test.ts の期待値と同じ書式） */
function fmt(v) {
  if (Array.isArray(v)) return "[" + v.map(fmt).join(", ") + "]";
  if (typeof v === "number") return String(v);
  return JSON.stringify(v);
}

/** 行から期待値リテラル（[idx, [x, y]] の列）を抽出する。角括弧の全バランス区間を JSON として読み、形が合う最長を返す */
function extractLayerArray(line) {
  const candidates = [];
  const stack = [];
  for (let i = 0; i < line.length; i++) {
    if (line[i] === "[") {
      stack.push(i);
    } else if (line[i] === "]") {
      const start = stack.pop();
      if (start === undefined) continue;
      const span = line.slice(start, i + 1);
      let parsed;
      try {
        parsed = JSON.parse(span);
      } catch {
        continue;
      }
      if (
        Array.isArray(parsed) &&
        parsed.length >= 1 &&
        parsed.every(
          (r) =>
            r == null ||
            (Array.isArray(r) && typeof r[0] === "number" && Array.isArray(r[1]))
        )
      ) {
        candidates.push(span);
      }
    }
  }
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.length - a.length);
  return candidates[0];
}

// ─── 検査 1/2 の対象行を組み立てる ────────────────────────────────────────────
// row = { lineNo, label, kind, mt, merc, newFull }
const rows = [];

// 可視層 5層（305〜311。BASE5 = base5 fixture の merc2XyVisibleLayers）
const BASE5_VISIBLE = [
  ["(700,900) 駅前", [700, 900]],
  ["(1200,700) 市内", [1200, 700]],
  ["(1700,1250) 駅前拡大図の枠の下", [1700, 1250]],
  ["(1700,290) 広域図の枠の下", [1700, 290]],
  ["A の (570,1300) B の枠の下", null],
  ["#104 の本図 (-500,768) 紙外は判定しない", [-500, 768]]
];
const base5Mt = oct26SynMt("base5");
for (let i = 0; i < BASE5_VISIBLE.length; i++) {
  const [label, coord] = BASE5_VISIBLE[i];
  const merc = coord === null ? OCT26_A570 : oct26MainPx2Merc(coord);
  rows.push({
    lineNo: 306 + i,
    label,
    kind: "visible",
    mt: base5Mt,
    merc,
    newFull: base5Mt.merc2XyVisibleLayers(merc)
  });
}

// 可視層 1932延岡（406〜409）
const NOBEOKA_VISIBLE = [
  ["#9 地点 [131.658501,32.600698]", [131.658501, 32.600698]],
  ["#104 地点 [131.635619,32.569472]", [131.635619, 32.569472]],
  ["紙内地点 [131.655753,32.556258]", [131.655753, 32.556258]],
  ["表現範囲外地点 [131.644679,32.613064]", [131.644679, 32.613064]]
];
const nobeokaMt = oct26NobeokaMt();
for (let i = 0; i < NOBEOKA_VISIBLE.length; i++) {
  const [label, lnglat] = NOBEOKA_VISIBLE[i];
  const merc = oct26Ll2Merc(lnglat);
  rows.push({
    lineNo: 406 + i,
    label,
    kind: "visible",
    mt: nobeokaMt,
    merc,
    newFull: nobeokaMt.merc2XyVisibleLayers(merc)
  });
}

// DESIGN_CURRENT（473〜481。r2(merc2XyWithLayer)）
const DESIGN_CURRENT = [
  ["base5", "(700,900)"],
  ["base5", "(1200,700)"],
  ["base5", "(1700,1250)"],
  ["base5", "(1700,290)"],
  ["base5", "A(570,1300)"],
  ["base5", "(-500,768)"],
  ["D-4layer", "(1700,1250)"],
  ["D-impTie", "(700,900)"]
];
const designLineNos = [473, 474, 475, 476, 477, 478, 479, 481];
const designMts = {};
for (let i = 0; i < DESIGN_CURRENT.length; i++) {
  const [fx, label] = DESIGN_CURRENT[i];
  if (!designMts[fx]) designMts[fx] = oct26SynMt(fx);
  const mt = designMts[fx];
  const merc = SYN_MERC[label];
  rows.push({
    lineNo: designLineNos[i],
    label: `${fx} ${label}`,
    kind: "withLayer",
    mt,
    merc,
    newFull: mt.merc2XyWithLayer(merc)
  });
}

// NOBEOKA_CURRENT（489〜492。r2(merc2XyWithLayer)）
for (let i = 0; i < NOBEOKA_VISIBLE.length; i++) {
  const [, lnglat] = NOBEOKA_VISIBLE[i];
  const merc = oct26Ll2Merc(lnglat);
  rows.push({
    lineNo: 489 + i,
    label: `nobeoka ${lnglat.join(",")}`,
    kind: "withLayer",
    mt: nobeokaMt,
    merc,
    newFull: nobeokaMt.merc2XyWithLayer(merc)
  });
}

// ─── 検査 1: 層番号の並びの不変 ──────────────────────────────────────────────
// 旧期待値の層番号列（原本からパース）と新しい層番号列（r2 前の newFull）を比較する。
function indexColumn(list) {
  return list.map((r) => (r == null ? r : r[0]));
}
function checkLayerOrderOverRows(rowsArr, oldByLine) {
  let changed = 0;
  for (const row of rowsArr) {
    const old = oldByLine.get(row.lineNo);
    if (!old) {
      throw new Error(`行 ${row.lineNo} の旧期待値が見つからない`);
    }
    const oldIdx = indexColumn(old);
    const newIdx = indexColumn(row.newFull);
    if (JSON.stringify(oldIdx) !== JSON.stringify(newIdx)) {
      changed++;
      console.error(
        `  [検査1 NG] 行 ${row.lineNo} ${row.label}: 層番号 旧=${JSON.stringify(oldIdx)} 新=${JSON.stringify(newIdx)}`
      );
    }
  }
  return changed === 0;
}

// ─── 検査 2: 各 xy がその層の順変換で入力 merc に戻る（自己整合） ────────────
function checkSelfConsistency(rowsArr) {
  let bad = 0;
  for (const row of rowsArr) {
    const mt = row.mt;
    const merc = row.merc;
    const scale = Math.max(Math.abs(merc[0]), Math.abs(merc[1]));
    for (const entry of row.newFull) {
      if (entry == null) continue;
      const [idx, xy] = entry;
      const tr = mt.getLayerTransform(idx);
      if (!tr) {
        bad++;
        console.error(`  [検査2 NG] 行 ${row.lineNo}: getLayerTransform(${idx}) が null`);
        continue;
      }
      const back = tr.transform(xy, false, idx > 0);
      if (back === false) {
        bad++;
        console.error(`  [検査2 NG] 行 ${row.lineNo}: transform(xy, false, ${idx > 0}) が false`);
        continue;
      }
      const rel = Math.max(Math.abs(back[0] - merc[0]), Math.abs(back[1] - merc[1])) / scale;
      if (rel > 1e-9) {
        bad++;
        console.error(`  [検査2 NG] 行 ${row.lineNo} 層 ${idx}: 相対誤差 ${rel.toExponential(3)}`);
      }
    }
  }
  return bad === 0;
}

// ─── 旧期待値のパース（検査 1 用） ────────────────────────────────────────────
const oldByLine = new Map();
for (const row of rows) {
  const line = testLines[row.lineNo - 1];
  const arr = extractLayerArray(line);
  if (arr === null) throw new Error(`行 ${row.lineNo} で期待値配列を抽出できない: ${line}`);
  oldByLine.set(row.lineNo, JSON.parse(arr));
}

// ─── 検査実行 ──────────────────────────────────────────────────────────────────
if (args.selfTest) {
  // 層番号を 1 つ入れ替えた「改ざん期待値」を作り、検査 1 が検出する（=識別力がある）ことを確認
  const tamperedRows = rows.map((row) => {
    const full = row.newFull.map((r) => (r == null ? r : [r[0], r[1]]));
    if (full.length >= 2 && full[0] != null && full[1] != null) {
      const tmp = full[0][0];
      full[0][0] = full[1][0];
      full[1][0] = tmp;
    }
    return { ...row, newFull: full };
  });
  const detected = !checkLayerOrderOverRows(tamperedRows, oldByLine);
  if (detected) {
    console.log("self-test: 層番号を入れ替えると検査 1 が検出する（識別力あり）");
    process.exit(0);
  } else {
    console.error("self-test: 層番号を入れ替えても検査 1 が検出しなかった（判定器が無力）");
    process.exit(1);
  }
}

const ok1 = checkLayerOrderOverRows(rows, oldByLine);
const ok2 = checkSelfConsistency(rows);
if (!ok1 || !ok2) {
  console.error("検査 1/2 に外れたため exit 1（--write があっても書き出していない）");
  process.exit(1);
}
console.log("検査 1（層番号不変）: pass");
console.log("検査 2（自己整合）: pass");

// ─── 各行の新しいテキストを組み立てる ─────────────────────────────────────────
const newLineByNo = new Map();

// 各ブロックの最終データ行は末尾カンマなし（次の行が `];` のため）。それ以外はカンマあり。
const NO_TRAILING_COMMA = new Set([311, 409, 481, 492]);
for (const row of rows) {
  const n = row.lineNo;
  if (n === 422) continue;
  const comma = NO_TRAILING_COMMA.has(n) ? "" : ",";
  if (row.lineNo >= 306 && row.lineNo <= 311) {
    const i = row.lineNo - 306;
    const [label] = BASE5_VISIBLE[i];
    const [, coord] = BASE5_VISIBLE[i];
    const mercExpr = coord === null ? "OCT26_A570" : `oct26MainPx2Merc(${fmt(coord)})`;
    const issueTop2 = row.newFull.slice(0, 2).map((r) => r[0]);
    newLineByNo.set(
      n,
      `    [${JSON.stringify(label)}, ${mercExpr}, ${fmt(r2(row.newFull))}, ${fmt(issueTop2)}]${comma}`
    );
  } else if (row.lineNo >= 406 && row.lineNo <= 409) {
    const i = row.lineNo - 406;
    const [label, lnglat] = NOBEOKA_VISIBLE[i];
    newLineByNo.set(n, `    [${JSON.stringify(label)}, ${fmt(lnglat)}, ${fmt(r2(row.newFull))}]${comma}`);
  } else if (row.lineNo >= 473 && row.lineNo <= 481) {
    const i = designLineNos.indexOf(row.lineNo);
    const [fx, label] = DESIGN_CURRENT[i];
    newLineByNo.set(
      n,
      `    [${JSON.stringify(fx)}, ${JSON.stringify(label)}, ${SYN_MERC_TEXT[label]}, ${fmt(r2(row.newFull))}]${comma}`
    );
  } else if (row.lineNo >= 489 && row.lineNo <= 492) {
    const i = row.lineNo - 489;
    const [, lnglat] = NOBEOKA_VISIBLE[i];
    newLineByNo.set(n, `    [${fmt(lnglat)}, ${fmt(r2(row.newFull))}]${comma}`);
  }
}

// OCT26_CHARACTERIZATION（422 行。再計算して全体を再直列化）
const oct26CharMatch = testLines[421].match(/const OCT26_CHARACTERIZATION = (\{.*\});/);
if (!oct26CharMatch) {
  console.error("422 行の OCT26_CHARACTERIZATION をパースできない");
  process.exit(1);
}
const oldChar = JSON.parse(oct26CharMatch[1]);

const syntheticNew = oldChar.synthetic.map((c) => {
  const merc = SYN_MERC[c.label];
  const s = snap(oct26SynMt(c.fixture), merc);
  return { fixture: c.fixture, label: c.label, ...s };
});
const nobeokaCharMt = oct26NobeokaMt();
const nobeokaNew = oldChar.nobeoka.map((c) => {
  const merc = oct26Ll2Merc(c.lnglat);
  const s = snap(nobeokaCharMt, merc);
  return { lnglat: c.lnglat, ...s };
});
const newChar = { synthetic: syntheticNew, nobeoka: nobeokaNew };
newLineByNo.set(422, `const OCT26_CHARACTERIZATION = ${JSON.stringify(newChar)};`);

// OCT26_CHARACTERIZATION の merc2XyWithLayer の層番号列も検査 1 の対象
{
  let okChar = true;
  for (let i = 0; i < oldChar.synthetic.length; i++) {
    const oldIdx = oldChar.synthetic[i].merc2XyWithLayer.map((r) => (r == null ? r : r[0]));
    const newIdx = syntheticNew[i].merc2XyWithLayer.map((r) => (r == null ? r : r[0]));
    if (JSON.stringify(oldIdx) !== JSON.stringify(newIdx)) {
      okChar = false;
      console.error(`  [検査1 NG] OCT26_CHARACTERIZATION.synthetic[${i}] 層番号`);
    }
  }
  for (let i = 0; i < oldChar.nobeoka.length; i++) {
    const oldIdx = oldChar.nobeoka[i].merc2XyWithLayer.map((r) => (r == null ? r : r[0]));
    const newIdx = nobeokaNew[i].merc2XyWithLayer.map((r) => (r == null ? r : r[0]));
    if (JSON.stringify(oldIdx) !== JSON.stringify(newIdx)) {
      okChar = false;
      console.error(`  [検査1 NG] OCT26_CHARACTERIZATION.nobeoka[${i}] 層番号`);
    }
  }
  if (!okChar) {
    console.error("OCT26_CHARACTERIZATION の層番号が不変でないため exit 1");
    process.exit(1);
  }
  // 自己検証: merc / fixture / label / lnglat は不変（SYN_MERC・oct26Ll2Merc の写しが正しければ一致する）
  for (let i = 0; i < oldChar.synthetic.length; i++) {
    if (
      syntheticNew[i].fixture !== oldChar.synthetic[i].fixture ||
      syntheticNew[i].label !== oldChar.synthetic[i].label ||
      JSON.stringify(syntheticNew[i].merc) !== JSON.stringify(oldChar.synthetic[i].merc)
    ) {
      console.error(`[自己検証 NG] OCT26_CHARACTERIZATION.synthetic[${i}] の不変フィールドが不一致`);
      process.exit(1);
    }
  }
  for (let i = 0; i < oldChar.nobeoka.length; i++) {
    if (
      JSON.stringify(nobeokaNew[i].lnglat) !== JSON.stringify(oldChar.nobeoka[i].lnglat) ||
      JSON.stringify(nobeokaNew[i].merc) !== JSON.stringify(oldChar.nobeoka[i].merc)
    ) {
      console.error(`[自己検証 NG] OCT26_CHARACTERIZATION.nobeoka[${i}] の不変フィールドが不一致`);
      process.exit(1);
    }
  }
  console.log("OCT26_CHARACTERIZATION 層番号: pass／不変フィールド（merc・fixture・label・lnglat）: pass");
}

// ─── 差分を検証して書き出し ────────────────────────────────────────────────────
const changedLineNos = [...newLineByNo.keys()].filter(
  (n) => newLineByNo.get(n) !== testLines[n - 1]
);
const allowed = new Set([
  305, 306, 307, 308, 309, 310, 311,
  406, 407, 408, 409,
  422,
  473, 474, 475, 476, 477, 478, 479, 480, 481,
  489, 490, 491, 492
]);
const forbiddenChange = changedLineNos.filter((n) => !allowed.has(n));
if (forbiddenChange.length > 0) {
  console.error(`許可外の行が変更された: ${forbiddenChange.join(", ")}`);
  process.exit(1);
}
// 323〜325 行（Issue #9 再現）が変更されていてはならない
for (const n of [323, 324, 325]) {
  if (newLineByNo.has(n)) {
    console.error(`変更してはならない 323-325 行が対象に含まれる: ${n}`);
    process.exit(1);
  }
}

const finalLines = testLines.slice();
for (const [n, text] of newLineByNo) {
  finalLines[n - 1] = text;
}
const newText = finalLines.join("\n");

let changed = "";
let changedCount = 0;
for (const n of changedLineNos) {
  const old = testLines[n - 1];
  const neu = newLineByNo.get(n);
  changed += `--- 行 ${n}\n-${old}\n+${neu}\n`;
  changedCount++;
}
console.log(`変更対象行数: ${changedLineNos.length}`);
console.log(changed);

if (changedLineNos.length === 0) {
  console.log("変更なし（既に最新）");
  process.exit(0);
}

if (!args.write) {
  // 検査のみ。322 行が新しい（差分あり）のに --write が無い場合も exit 0（検査は通過）
  console.log(`検査のみ（--write なし）: 差分 ${changedCount} 行を表示した。`);
  process.exit(0);
}

fs.writeFileSync(testFile, newText, "utf-8");
console.log(`wrote ${testFile}（${changedCount} 行を書き換え）`);
process.exit(0);