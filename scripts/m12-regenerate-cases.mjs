/**
 * scripts/m12-regenerate-cases.mjs
 *
 * oct26-m12-t1b（DES-M12-WEIGHTBUFFER-0919）: tests/cases/*.json の期待値（逆方向の列
 * bakw）を、新 dist（weight_buffer を無視して三角形内・扇形外挿を純アフィンにする
 * Transform）で再計算して書き換える。
 *
 * 使い方:
 *   node scripts/m12-regenerate-cases.mjs --lib <dist/maplat_transform.js> --tests <tests ディレクトリ>
 *     検査のみ（1 件でも外れたら書き出さずに exit 1）
 *   … --write
 *     検査を全件通した場合のみ cases を書き出す
 *   … --self-test
 *     origin/master の cases（重み付きの旧出力）を検査 2 にかけて「外れが出る」ことを確かめる
 *
 * 検査（t1 設計 §6.1。1 件でも外れたら書き出さず exit 1）:
 *   1. forw の列が原本と JSON 値として Object.is 等価（対象ケースは forw を据え置く）
 *   2. bakw' = T.transform(forw) が独立アフィン参照（stateFull の stateTriangle、凸包外は
 *      扇形三角形のいずれか）と相対 1e-12 以内
 *   3. transform.test.ts が逆方向を検査する条件（strict_status !== "strict_error" && !bounds）の
 *      ケースは T.transform(bakw', true) が forw と各成分 0.005 未満
 *
 * 書き出し整形（t1 設計 §6.1）:
 *   原本が JSON.stringify(x, null, 2) と一致する整形ならその整形（末尾改行の有無は原本に合わせる）。
 *   そうでなければ 1 ケース 1 行（"[\n" + "  " + JSON.stringify(case) を ",\n" で連結 + "\n]"）。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dir = path.dirname(fileURLToPath(import.meta.url));

// ─── 引数解析 ────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const args = { lib: null, tests: null, write: false, selfTest: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--lib") args.lib = argv[++i];
    else if (a === "--tests") args.tests = argv[++i];
    else if (a === "--write") args.write = true;
    else if (a === "--self-test") args.selfTest = true;
  }
  return args;
}
const args = parseArgs(process.argv.slice(2));
if (!args.lib || !args.tests) {
  console.error("usage: node scripts/m12-regenerate-cases.mjs --lib <dist> --tests <dir> [--write] [--self-test]");
  process.exit(2);
}

const libPath = path.resolve(args.lib);
const testsDir = path.resolve(args.tests);
const { Transform } = await import(libPath);

// ─── ヘルパー（t1a テスト tests/m12-weight-buffer-removal.test.ts と同一の定義） ──
/** 独立アフィン参照（Cramer 式。geometry.ts の式を写さない） */
function independentAffine(tri, p) {
  const s = tri.geometry.coordinates[0];
  const a = s[0];
  const b = s[1];
  const c = s[2];
  const ga = tri.properties.a.geom;
  const gb = tri.properties.b.geom;
  const gc = tri.properties.c.geom;
  const ux = b[0] - a[0];
  const uy = b[1] - a[1];
  const vx = c[0] - a[0];
  const vy = c[1] - a[1];
  const det = ux * vy - uy * vx;
  const px = p[0] - a[0];
  const py = p[1] - a[1];
  const u = (px * vy - py * vx) / det;
  const v = (ux * py - uy * px) / det;
  const w = 1 - u - v;
  return [w * ga[0] + u * gb[0] + v * gc[0], w * ga[1] + u * gb[1] + v * gc[1]];
}

/** 「相対 X 以内」の分母: 対応点の両座標系を通じた座標絶対値の最大 */
function scaleOf(c) {
  let m = 0;
  for (const p of c.points) {
    for (const v of [p[0][0], p[0][1], p[1][0], p[1][1]]) {
      const a = Math.abs(v);
      if (a > m) m = a;
    }
  }
  return m;
}

function relErr(r, e, scale) {
  return Math.max(Math.abs(r[0] - e[0]), Math.abs(r[1] - e[1])) / scale;
}

// ─── 整形の検出と再直列化 ─────────────────────────────────────────────────────
/** 原本テキストから整形スタイル（"pretty" | "oneline"）と末尾改行を判定 */
function detectStyle(origText, parsed) {
  if (origText === JSON.stringify(parsed, null, 2) + "\n") return { style: "pretty", nl: true };
  if (origText === JSON.stringify(parsed, null, 2)) return { style: "pretty", nl: false };
  return { style: "oneline", nl: origText.endsWith("\n") };
}
function serializeCases(cases, style) {
  if (style.style === "pretty") {
    return JSON.stringify(cases, null, 2) + (style.nl ? "\n" : "");
  }
  const body = cases.map((c) => "  " + JSON.stringify(c)).join(",\n");
  return "[\n" + body + "\n]" + (style.nl ? "\n" : "");
}

// ─── 1 ファイル分の検査と（任意で）書き出し ──────────────────────────────────
/**
 * @returns {{ ok: boolean, n: number, forwDiffCount: number, check2MaxRel: number,
 *             check3MaxAbs: number | null, moveMax: number }}
 */
function processFile(caseFile, mode) {
  const name = path.basename(caseFile);
  const compiledFile = path.join(testsDir, "compiled", name);
  if (!fs.existsSync(compiledFile)) {
    throw new Error(`${name}: 対応する compiled が無い（${compiledFile}）`);
  }
  const rawCompiled = JSON.parse(fs.readFileSync(compiledFile, "utf-8"));
  const c = rawCompiled.compiled ?? rawCompiled;

  const origText = fs.readFileSync(caseFile, "utf-8");
  const cases = JSON.parse(origText);
  const style = detectStyle(origText, cases);
  const scale = scaleOf(c);

  const tPlain = new Transform();
  tPlain.setCompiled(c);
  const tFull = new Transform();
  tFull.setCompiled(c);
  tFull.stateFull = true;
  const fan = tFull.vertices_params.forw[1];

  // transform.test.ts の逆方向検査条件
  const backTested = c.strict_status !== "strict_error" && !c.bounds;

  const newCases = [];
  let forwDiffCount = 0;
  let check2MaxRel = 0;
  let check3MaxAbs = null;
  let moveMax = 0;
  let failed = false;

  for (const [forwOld, bakwOld] of cases) {
    // 検査 1: forw は据え置き。書き出す値（forwNew）が読み取った値（forwOld）と
    // JSON 値として Object.is 等価であることを確認する（差分が生じる実装は無いため通常 0）。
    const forwNew = forwOld.slice();
    if (!Object.is(forwNew[0], forwOld[0]) || !Object.is(forwNew[1], forwOld[1])) forwDiffCount++;

    // テストと同じ呼び方（第 2・第 3 引数なし）で逆方向の列を作り直す
    const bakwNew = tPlain.transform(forwNew);
    if (bakwNew === false) {
      console.error(`  ${name}: forw=${JSON.stringify(forwNew)} が bounds 外で transform が false`);
      failed = true;
      break;
    }

    // 検査 2 のための独立アフィン参照（stateFull の stateTriangle / 扇形三角形）
    tFull.stateTriangle = undefined;
    tFull.stateBackward = undefined;
    tFull.transform(forwNew, false, true);
    const tri = tFull.stateTriangle;
    let check2Rel;
    if (tri) {
      check2Rel = relErr(bakwNew, independentAffine(tri, forwNew), scale);
    } else {
      // 凸包外: 扇形三角形のいずれかのアフィン外挿と一致すればよい
      check2Rel = Infinity;
      for (const fanTin of fan) {
        const rel = relErr(bakwNew, independentAffine(fanTin.features[0], forwNew), scale);
        if (rel < check2Rel) check2Rel = rel;
      }
    }
    check2MaxRel = Math.max(check2MaxRel, check2Rel);
    if (check2Rel > 1e-12) failed = true;

    // 検査 3
    if (backTested) {
      const r = tPlain.transform(bakwNew, true);
      if (r === false) {
        console.error(`  ${name}: 逆変換 bakw=${JSON.stringify(bakwNew)} が false`);
        failed = true;
        break;
      }
      const d = Math.max(Math.abs(r[0] - forwNew[0]), Math.abs(r[1] - forwNew[1]));
      check3MaxAbs = check3MaxAbs === null ? d : Math.max(check3MaxAbs, d);
      if (d >= 0.005) failed = true;
    }

    // 旧期待値からの移動量（参考値）
    moveMax = Math.max(moveMax, Math.hypot(bakwNew[0] - bakwOld[0], bakwNew[1] - bakwOld[1]));

    newCases.push([forwNew, bakwNew]);
  }

  const result = {
    ok: !failed,
    n: cases.length,
    forwDiffCount,
    check2MaxRel,
    check3MaxAbs: backTested ? check3MaxAbs : null,
    moveMax
  };

  if (mode === "write" && result.ok) {
    fs.writeFileSync(caseFile, serializeCases(newCases, style), "utf-8");
    // 書き出し後の同一性（冪等確認用に read-back で JSON 値一致を確認）
    const reread = JSON.parse(fs.readFileSync(caseFile, "utf-8"));
    if (JSON.stringify(reread) !== JSON.stringify(newCases)) {
      throw new Error(`${name}: 書き出し後の read-back が一致しない`);
    }
  }
  return result;
}

// ─── メイン ────────────────────────────────────────────────────────────────────
const caseFiles = fs
  .readdirSync(path.join(testsDir, "cases"))
  .filter((f) => f.endsWith(".json"))
  .sort()
  .map((f) => path.join(testsDir, "cases", f));
if (caseFiles.length !== 19) {
  console.error(`cases の件数が 19 でない: ${caseFiles.length}`);
  process.exit(1);
}

let allOk = true;
for (const caseFile of caseFiles) {
  const r = processFile(caseFile, args.write ? "write" : "check");
  const n = path.basename(caseFile);
  console.log(
    `${n}\t件数=${r.n}\tforw差分=${r.forwDiffCount}\t検査2最大相対誤差=${r.check2MaxRel.toExponential(3)}` +
      `${r.check3MaxAbs === null ? "" : `\t検査3最大誤差=${r.check3MaxAbs.toExponential(3)}`}` +
      `\t旧期待値からの移動量最大=${r.moveMax.toFixed(4)}`
  );
  if (!r.ok) {
    allOk = false;
    console.error(`  ${n}: 検査に外れた（書き出さない）`);
  }
}

if (args.selfTest) {
  // 旧出力（重み付き）を検査 2 にかけて「外れが出る」＝判定器が識別力を持つことを確認
  let discriminated = false;
  for (const caseFile of caseFiles) {
    const name = path.basename(caseFile);
    const compiledFile = path.join(testsDir, "compiled", name);
    const rawCompiled = JSON.parse(fs.readFileSync(compiledFile, "utf-8"));
    const c = rawCompiled.compiled ?? rawCompiled;
    const cases = JSON.parse(fs.readFileSync(caseFile, "utf-8"));
    const scale = scaleOf(c);
    const tFull = new Transform();
    tFull.setCompiled(c);
    tFull.stateFull = true;
    const fan = tFull.vertices_params.forw[1];
    for (const [forw, bakwOld] of cases) {
      tFull.stateTriangle = undefined;
      tFull.stateBackward = undefined;
      tFull.transform(forw, false, true);
      const tri = tFull.stateTriangle;
      let rel = Infinity;
      if (tri) {
        rel = relErr(bakwOld, independentAffine(tri, forw), scale);
      } else {
        for (const fanTin of fan) {
          rel = Math.min(rel, relErr(bakwOld, independentAffine(fanTin.features[0], forw), scale));
        }
      }
      if (rel > 1e-12) {
        discriminated = true;
        break;
      }
    }
    if (discriminated) {
      console.log(`self-test: ${name} で旧出力は独立アフィン参照から外れる（識別力あり）`);
      break;
    }
  }
  if (discriminated) {
    process.exit(0);
  } else {
    console.error("self-test: 旧出力が独立アフィン参照と 1e-12 以内に収まった（判定器が無力）");
    process.exit(1);
  }
}

if (!allOk) {
  console.error("一部のファイルで検査に外れたため exit 1（--write があっても書き出していない）");
  process.exit(1);
}
console.log("all cases pass");
process.exit(0);