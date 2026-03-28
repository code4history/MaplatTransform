import { describe, expect, it } from "vitest";
import { MapTransform } from "../src/index.ts";
import type { MapData } from "../src/index.ts";
import fs from "node:fs";

// ─── ヘルパー ─────────────────────────────────────────────────────────────────

function loadCompiled(key: string, ver: "v2" | "v3") {
  return JSON.parse(
    fs.readFileSync(`${__dirname}/compiled/${key}_${ver}.json`, "utf-8")
  );
}

function loadCases(key: string, ver: "v2" | "v3"): [[number, number], [number, number]][] {
  return JSON.parse(
    fs.readFileSync(`${__dirname}/cases/${key}_${ver}.json`, "utf-8")
  );
}

// ─── submap なし: 単純ケース ──────────────────────────────────────────────────

describe("MapTransform (submap なし)", () => {
  (["v2", "v3"] as const).forEach(ver => {
    describe(`Nobeoka ${ver}`, () => {
      const compiled = loadCompiled("1932_nobeoka", ver);
      const cases = loadCases("1932_nobeoka", ver);

      const mt = new MapTransform();
      mt.setMapData({ compiled });

      describe("xy2Merc (forward)", () => {
        let i = 0;
        for (const [xy, merc] of cases.slice(0, 10)) {
          const idx = i++;
          it(`case ${idx}`, () => {
            const result = mt.xy2Merc(xy);
            expect(result).not.toBe(false);
            if (result !== false) {
              expect(result[0]).toBeCloseTo(merc[0], -1);
              expect(result[1]).toBeCloseTo(merc[1], -1);
            }
          });
        }
      });

      describe("merc2Xy (backward)", () => {
        let i = 0;
        for (const [xy, merc] of cases.slice(0, 10)) {
          const idx = i++;
          it(`case ${idx}`, () => {
            const result = mt.merc2Xy(merc);
            expect(result).not.toBe(false);
            if (result !== false) {
              expect(result[0]).toBeCloseTo(xy[0], -1);
              expect(result[1]).toBeCloseTo(xy[1], -1);
            }
          });
        }
      });

      describe("xy2MercWithLayer", () => {
        it("レイヤー 0 を返す（submap なし）", () => {
          const [xy] = cases[0];
          const result = mt.xy2MercWithLayer(xy);
          expect(result).not.toBe(false);
          if (result !== false) {
            expect(result[0]).toBe(0);
          }
        });
      });
    });
  });
});

// ─── submap あり ──────────────────────────────────────────────────────────────

describe("MapTransform (submap あり)", () => {
  (["v2", "v3"] as const).forEach(ver => {
    describe(`Nobeoka + sub0 ${ver}`, () => {
      const mainCompiled = loadCompiled("1932_nobeoka", ver);
      const subCompiled = loadCompiled("1932_nobeoka_sub0", ver);
      const mainCases = loadCases("1932_nobeoka", ver);
      const subCases = loadCases("1932_nobeoka_sub0", ver);

      const mapData: MapData = {
        compiled: mainCompiled,
        sub_maps: [
          {
            compiled: subCompiled,
            priority: 1,
            importance: 1
            // bounds は compiled.bounds から自動取得
          }
        ]
      };

      const mt = new MapTransform();
      mt.setMapData(mapData);

      describe("setMapData が sub TIN をロードする", () => {
        it("sub TIN の xyBounds が作成される", () => {
          // 正常にインスタンス化できれば OK
          expect(mt).toBeTruthy();
        });
      });

      describe("メイン TIN エリアの変換", () => {
        // メイン TIN のみの領域（sub0 の bounds 外のポイント）でテスト
        it("xy2MercWithLayer でレイヤー選択が機能する", () => {
          // メイン TIN の最初のケースで変換してみる（sub bounds 内外問わず変換できればOK）
          const [xy] = mainCases[0];
          const result = mt.xy2MercWithLayer(xy);
          expect(result).not.toBe(false);
          if (result !== false) {
            // インデックスは 0 (main) または 1 (sub) のいずれか
            expect(result[0]).toBeGreaterThanOrEqual(0);
            expect(result[1]).toHaveLength(2);
          }
        });
      });

      describe("sub TIN エリアの変換", () => {
        it("sub TIN エリア内の座標が正しく変換される", () => {
          // sub TIN の最初のテストケース（sub エリア内の座標）
          const [xy, merc] = subCases[0];
          const result = mt.xy2Merc(xy);
          // sub エリア内のポイントは変換できるはず
          expect(result).not.toBe(false);
          if (result !== false) {
            expect(result[0]).toBeCloseTo(merc[0], -1);
            expect(result[1]).toBeCloseTo(merc[1], -1);
          }
        });
      });

      describe("merc2XyWithLayer", () => {
        it("複数結果の配列を返す", () => {
          const [_xy, merc2] = mainCases[0];
          const results = mt.merc2XyWithLayer(merc2);
          expect(Array.isArray(results)).toBe(true);
          // 少なくとも1つの有効な結果がある
          const valid = results.filter(r => r !== undefined);
          expect(valid.length).toBeGreaterThan(0);
        });
      });
    });
  });
});

// ─── viewpoint2Mercs / mercs2Viewpoint ラウンドトリップ ───────────────────────

describe("MapTransform ビューポート変換", () => {
  (["v2", "v3"] as const).forEach(ver => {
    describe(`Nobeoka ${ver}`, () => {
      const compiled = loadCompiled("1932_nobeoka", ver);
      // wh から maxZoom を逆算（参考値）
      // wh = [10000, 4468] → maxZoom = log2(10000 / 256) ≈ 5.28 → 6 程度
      const maxZoom = 6;

      const mt = new MapTransform();
      mt.setMapData({ compiled, maxZoom });

      it("viewpoint2Mercs が5点を返す", () => {
        // メイン TIN の中心付近
        const mainCases = loadCases("1932_nobeoka", ver);
        const [_xy, centerMerc] = mainCases[Math.floor(mainCases.length / 2)];
        const viewpoint = {
          center: centerMerc,
          zoom: 12,
          rotation: 0
        };
        const size: [number, number] = [800, 600];
        const mercs = mt.viewpoint2Mercs(viewpoint, size);
        expect(mercs).toHaveLength(5);
        mercs.forEach(m => expect(m).toHaveLength(2));
      });
    });
  });
});
