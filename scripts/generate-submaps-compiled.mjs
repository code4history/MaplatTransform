/**
 * scripts/generate-submaps-compiled.mjs
 *
 * 18th_mapcontest_ea.json, 18th_mapcontest_gp.json の
 * v2 compiled データから v3 を生成し、
 * tests/compiled/ に保存する。
 *
 * 注意: author フィールドは小学生受賞者のプライバシー保護のため空文字列にする。
 */

import { Tin } from "@maplat/tin";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, "..");
const compiledDir = join(root, "tests", "compiled");

mkdirSync(compiledDir, { recursive: true });

const MAPS = [
  { file: "18th_mapcontest_ea.json", key: "18th_mapcontest_ea" },
  { file: "18th_mapcontest_gp.json", key: "18th_mapcontest_gp" },
];

async function compiledV2toV3(compiledV2, strictMode = compiledV2.strictMode) {
  const isSubmap = !!compiledV2.bounds;
  const t = new Tin({
    strictMode,
    vertexMode: compiledV2.vertexMode,
    yaxisMode: compiledV2.yaxisMode,
    useV2Algorithm: false, // v3 アルゴリズムで再計算
  });

  if (isSubmap) {
    t.setBounds(compiledV2.bounds);
  } else {
    t.setWh(compiledV2.wh);
  }

  t.setPoints(compiledV2.points);
  if (compiledV2.edges && compiledV2.edges.length > 0) {
    t.setEdges(compiledV2.edges);
  }

  await t.updateTinAsync();
  const v3 = t.getCompiled();

  // v3 アルゴリズムで strict_error が出た場合は auto にフォールバック
  if (v3.strict_status === "strict_error") {
    if (strictMode !== "auto") {
      console.log(`    ⚠ strict_error → retrying with strictMode=auto`);
      return compiledV2toV3(compiledV2, "auto");
    }
    throw new Error(`strict_error even with strictMode=auto`);
  }
  return v3;
}

(async () => {
  for (const { file, key } of MAPS) {
    console.log(`\n=== Processing ${file} ===`);
    const raw = JSON.parse(readFileSync(join(root, file), "utf-8"));

    // author 匿名化
    if (raw.author) {
      console.log(`  author "${raw.author}" → "" (プライバシー保護)`);
      raw.author = "";
    }

    // main compiled: v2 そのまま保存 + v3 生成
    const mainV2 = raw.compiled;
    console.log(`  main v2: strict_status=${mainV2.strict_status}, version=${mainV2.version}`);
    writeFileSync(
      join(compiledDir, `${key}_v2.json`),
      JSON.stringify(mainV2, null, 2),
      "utf-8"
    );

    const mainV3 = await compiledV2toV3(mainV2);
    console.log(`  main v3: strict_status=${mainV3.strict_status}, version=${mainV3.version}, tins_points[0].length=${mainV3.tins_points?.[0]?.length}`);
    writeFileSync(
      join(compiledDir, `${key}_v3.json`),
      JSON.stringify(mainV3, null, 2),
      "utf-8"
    );

    // sub_maps
    if (raw.sub_maps) {
      for (let i = 0; i < raw.sub_maps.length; i++) {
        const subV2 = raw.sub_maps[i].compiled;
        console.log(`  sub${i} v2: strict_status=${subV2.strict_status}, version=${subV2.version}`);
        writeFileSync(
          join(compiledDir, `${key}_sub${i}_v2.json`),
          JSON.stringify(subV2, null, 2),
          "utf-8"
        );

        const subV3 = await compiledV2toV3(subV2);
        console.log(`  sub${i} v3: strict_status=${subV3.strict_status}, version=${subV3.version}, tins_points[0].length=${subV3.tins_points?.[0]?.length}`);
        writeFileSync(
          join(compiledDir, `${key}_sub${i}_v3.json`),
          JSON.stringify(subV3, null, 2),
          "utf-8"
        );
      }
    }

    // 匿名化したマップJSONも保存（デモ用）
    writeFileSync(
      join(root, "demo", `${key}.json`),
      JSON.stringify(raw, null, 2),
      "utf-8"
    );
    console.log(`  → demo/${key}.json (author anonymized)`);
  }

  console.log("\n✅ Done.");
})();
