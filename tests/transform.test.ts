import { describe, expect, it } from "vitest";
import { Transform } from "../src";
import fs from "node:fs";

// ─── データセット定義 ──────────────────────────────────────────────────────────
// [label, key, ver]
// caseFile:    tests/cases/{key}_{ver}.json    または tests/cases/{key}.json
// compiledFile: tests/compiled/{key}_{ver}.json または tests/compiled/{key}.json

type Dataset = [string, string, "v2" | "v3" | "legacy"];

const datasets: Dataset[] = [
  // 既存テスト（レガシー形式: { compiled: {...} } ラッパー付き）
  ["Nara (legacy)",    "naramachi_yasui_bunko", "legacy"],
  ["Fushimi (legacy)", "fushimijo_maplat",      "legacy"],
  ["Burari (legacy)",  "burakita-2024",          "legacy"],
  // V2/V3 形式テスト（MaplatTin feature/v3-boundary-algorithm 由来）
  ["Nara v2",                    "naramachi_yasui_bunko",        "v2"],
  ["Nara v3",                    "naramachi_yasui_bunko",        "v3"],
  ["Nara Revised v2",            "naramachi_yasui_revised",      "v2"],
  ["Nara Revised v3",            "naramachi_yasui_revised",      "v3"],
  ["Fushimi v2",                 "fushimijo_maplat",             "v2"],
  ["Fushimi v3",                 "fushimijo_maplat",             "v3"],
  ["Miesan v2",                  "miesan_ginza_map",             "v2"],
  ["Miesan v3",                  "miesan_ginza_map",             "v3"],
  ["Tatebayashi Castle v2",      "tatebayashi_castle_akimoto",   "v2"],
  ["Tatebayashi Castle v3",      "tatebayashi_castle_akimoto",   "v3"],
  ["Tatebayashi Jokamachi v2",   "tatebayashi_kaei_jokamachi",   "v2"],
  ["Tatebayashi Jokamachi v3",   "tatebayashi_kaei_jokamachi",   "v3"],
  ["Nobeoka v2",                 "1932_nobeoka",                 "v2"],
  ["Nobeoka v3",                 "1932_nobeoka",                 "v3"],
  ["Nobeoka Sub v2",             "1932_nobeoka_sub0",            "v2"],
  ["Nobeoka Sub v3",             "1932_nobeoka_sub0",            "v3"],
];

describe("Transform", () => {
  datasets.forEach(([label, key, ver]) => {
    describe(`${label}`, () => {
      // ファイルパスを決定
      const compiledPath = ver === "legacy"
        ? `${__dirname}/compiled/${key}.json`
        : `${__dirname}/compiled/${key}_${ver}.json`;
      const casePath = ver === "legacy"
        ? `${__dirname}/cases/${key}.json`
        : `${__dirname}/cases/${key}_${ver}.json`;

      // compiled データを読み込み（legacy は .compiled プロパティを使用）
      const rawCompiled = JSON.parse(fs.readFileSync(compiledPath, "utf-8"));
      const compiledData = ver === "legacy" ? rawCompiled.compiled : rawCompiled;

      const cases: [[[number, number], [number, number]]] = JSON.parse(
        fs.readFileSync(casePath, "utf-8"),
      );

      const tin = new Transform();
      tin.setCompiled(compiledData);

      describe("Forward transformation", () => {
        let i = 0;
        for (const [forw, bakw] of cases) {
          i++;
          const bakw_tr = tin.transform(forw) as [number, number];
          it(`Case ${i}`, () => {
            expect(bakw_tr[0]).toBeCloseTo(bakw[0]);
            expect(bakw_tr[1]).toBeCloseTo(bakw[1]);
          });
        }
      });

      if (compiledData.strict_status !== "strict_error" && !compiledData.bounds) {
        describe("Backward transformation", () => {
          let i = 0;
          for (const [forw, bakw] of cases) {
            i++;
            const forw_tr = tin.transform(bakw, true) as [number, number];
            it(`Case ${i}`, () => {
              expect(forw_tr[0]).toBeCloseTo(forw[0]);
              expect(forw_tr[1]).toBeCloseTo(forw[1]);
            });
          }
        });
      }
    });
  });
});
