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

// ─── GPS / POI 用の可視層判定 merc2XyVisibleLayers（MaplatTransform#9）─────────────
//
// fixture:
// - tests/compiled/visible_layers_synthetic.json — 合成 5 層（紙 2048×1536）と派生で使う層の compiled。
//   scripts/generate-visible-layers-fixtures.mjs で生成（定数は固定の表の値）。
//
// - tests/compiled/1932_nobeoka_v2.json / 1932_nobeoka_sub0_v2.json — 1932 延岡（sub_map は
//   Issue の記載どおり priority 1 / importance -1。上の既存 suite の importance 1 は流用しない）。
// 期待値は小数 2 桁へ丸めた値（各成分の差 0.01 未満で一致とする）。

type LayerXy = [number, [number, number]];

const FX_R = 6378137;
const fxLl2Merc = ([lng, lat]: [number, number]): number[] => [
  (FX_R * lng * Math.PI) / 180,
  FX_R * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))
];

interface FxLayerDef {
  center: [number, number];
  mainCenter: [number, number];
  k: number;
}
const fxSyn = JSON.parse(
  fs.readFileSync(`${__dirname}/compiled/visible_layers_synthetic.json`, "utf-8")
) as {
  main: MapData["compiled"];
  sub: Record<string, MapData["compiled"]>;
  layers: Record<string, FxLayerDef>;
};
const FX_M0 = [14600000, 3800000];
const fxMainPx2Merc = ([x, y]: [number, number]): number[] => [
  FX_M0[0] + 2 * x,
  FX_M0[1] - 2 * y
];
const fxLayerPx2MainPx = (L: FxLayerDef, [x, y]: [number, number]): [number, number] => [
  L.mainCenter[0] + (x - L.center[0]) * L.k,
  L.mainCenter[1] + (y - L.center[1]) * L.k
];

interface FxSubDef {
  key: string;
  priority: number;
  importance: number;
}
const FX_SUB: Record<"station" | "wide" | "a" | "b" | "c", FxSubDef> = {
  station: { key: "wide_station", priority: 2, importance: 1 },
  wide: { key: "wide_area", priority: 1, importance: -1 },
  a: { key: "castle_a", priority: 3, importance: 1 },
  b: { key: "temple_b", priority: 4, importance: 2 },
  c: { key: "wide_area_c", priority: 1, importance: -2 }
};
const fxSub = (s: FxSubDef, over: Partial<FxSubDef> = {}) => ({
  compiled: fxSyn.sub[over.key ?? s.key],
  priority: over.priority ?? s.priority,
  importance: over.importance ?? s.importance
});
/** 基準 5 層（層 1=駅前, 2=広域図, 3=A, 4=B）と派生 */
const FX_FIXTURES: Record<string, MapData["sub_maps"]> = {
  base5: [fxSub(FX_SUB.station), fxSub(FX_SUB.wide), fxSub(FX_SUB.a), fxSub(FX_SUB.b)],
  "D-samepri": [
    fxSub(FX_SUB.station),
    fxSub(FX_SUB.wide),
    fxSub(FX_SUB.a),
    fxSub(FX_SUB.b, { priority: 3 })
  ],
  "D-impTie": [
    fxSub(FX_SUB.station),
    fxSub(FX_SUB.wide),
    fxSub(FX_SUB.a, { key: "castle_a_impTie" }),
    fxSub(FX_SUB.b)
  ],
  "D-impPriTie": [
    fxSub(FX_SUB.station),
    fxSub(FX_SUB.wide),
    fxSub(FX_SUB.a, { key: "castle_a_impTie", priority: 2 }),
    fxSub(FX_SUB.b)
  ],
  "D-pri0": [
    fxSub(FX_SUB.station, { priority: 0 }),
    fxSub(FX_SUB.wide),
    fxSub(FX_SUB.a),
    fxSub(FX_SUB.b)
  ],
  // 広域図を除く（層番号は 1=駅前, 2=A, 3=B へ詰まる）
  "D-4layer": [fxSub(FX_SUB.station), fxSub(FX_SUB.a), fxSub(FX_SUB.b)],
  // 層 5「広域図 C」を追加
  "D-6layer": [
    fxSub(FX_SUB.station),
    fxSub(FX_SUB.wide),
    fxSub(FX_SUB.a),
    fxSub(FX_SUB.b),
    fxSub(FX_SUB.c)
  ]
};
const fxSynMt = (name: string): MapTransform => {
  const mt = new MapTransform();
  mt.setMapData({ compiled: fxSyn.main, maxZoom: 3, sub_maps: FX_FIXTURES[name] });
  return mt;
};
const fxNobeokaMt = (): MapTransform => {
  const mt = new MapTransform();
  mt.setMapData({
    compiled: loadCompiled("1932_nobeoka", "v2"),
    maxZoom: 6,
    sub_maps: [{ compiled: loadCompiled("1932_nobeoka_sub0", "v2"), priority: 1, importance: -1 }]
  });
  return mt;
};
/** A の紙座標 (570,1300) は層 3（A）の対応式で本図の紙座標へ写してからメルカトル化する */
const FX_A570 = fxMainPx2Merc(fxLayerPx2MainPx(fxSyn.layers.castle_a, [570, 1300]));

function expectLayersClose(actual: [number, number[]][], expected: LayerXy[]): void {
  expect(actual.map(([idx]) => idx)).toEqual(expected.map(([idx]) => idx));
  actual.forEach(([, xy], i) => {
    expect(xy).toHaveLength(2);
    expect(Math.abs(xy[0] - expected[i][1][0])).toBeLessThan(0.01);
    expect(Math.abs(xy[1] - expected[i][1][1])).toBeLessThan(0.01);
  });
}

describe("可視層 5層", () => {
  const mt = fxSynMt("base5");
  // [ラベル, メルカトル, 新メソッドの期待, Issue #9 の 6 地点表の期待（先頭 2 件の層番号）]
  const cases: [string, number[], LayerXy[], number[]][] = [
    ["(700,900) 駅前", fxMainPx2Merc([700, 900]), [[1, [1700, 1250]], [0, [700, 900]], [2, [1691.9, 293.3]]], [1, 0]],
    ["(1200,700) 市内", fxMainPx2Merc([1200, 700]), [[0, [1200, 700]], [2, [1704.4, 288.3]]], [0, 2]],
    ["(1700,1250) 駅前拡大図の枠の下", fxMainPx2Merc([1700, 1250]), [[2, [1716.9, 302.05]]], [2]],
    ["(1700,290) 広域図の枠の下", fxMainPx2Merc([1700, 290]), [[2, [1716.9, 278.05]]], [2]],
    ["A の (570,1300) B の枠の下", FX_A570, [[0, [357.5, 412.5]], [2, [1683.34, 281.11]]], [0, 2]],
    ["#104 の本図 (-500,768) 紙外は判定しない", fxMainPx2Merc([-500, 768]), [[0, [-500, 768]], [2, [1661.9, 290]]], [0, 2]]
  ];
  for (const [label, merc, expected, issueTop2] of cases) {
    it(label, () => {
      const result = mt.merc2XyVisibleLayers(merc);
      expectLayersClose(result, expected);
      expect(result.slice(0, 2).map(([idx]) => idx)).toEqual(issueTop2);
      // hide 表現（undefined placeholder）を返さない
      expect(result.every(r => Array.isArray(r))).toBe(true);
    });
  }

  it("Issue #9 再現コードの期待: (1700,1250) → [[2,[1716.9,302.05]]]", () => {
    expectLayersClose(mt.merc2XyVisibleLayers(fxMainPx2Merc([1700, 1250])), [[2, [1716.9, 302.05]]]);
  });

  it("D-4layer の (1700,1250) は可視対応層なし = 空配列（表現範囲外）", () => {
    const mt4 = fxSynMt("D-4layer");
    expect(mt4.merc2XyVisibleLayers(fxMainPx2Merc([1700, 1250]))).toEqual([]);
  });

  it("setMapData 前は例外（既存メソッドと同じ前提）", () => {
    // メソッドが無いときの TypeError で緑にならないよう、メッセージまで照合する
    expect(() => new MapTransform().merc2XyVisibleLayers([0, 0])).toThrow(
      "setMapData() must be called before transformation"
    );
  });
});

describe("可視層 派生", () => {
  it("D-samepri: 同じ priority の sub_map どうしは互いを覆わない（A (570,1300)）", () => {
    expectLayersClose(fxSynMt("D-samepri").merc2XyVisibleLayers(FX_A570), [
      [3, [570, 1300]],
      [0, [357.5, 412.5]],
      [2, [1683.34, 281.11]]
    ]);
  });

  it("D-impTie: importance 同値なら priority 降順（(700,900)）", () => {
    expectLayersClose(fxSynMt("D-impTie").merc2XyVisibleLayers(fxMainPx2Merc([700, 900])), [
      [3, [340, 1250]],
      [1, [1700, 1250]],
      [0, [700, 900]],
      [2, [1691.9, 293.3]]
    ]);
  });

  it("D-impPriTie: importance・priority 同値なら層番号昇順（(700,900)）", () => {
    expectLayersClose(fxSynMt("D-impPriTie").merc2XyVisibleLayers(fxMainPx2Merc([700, 900])), [
      [1, [1700, 1250]],
      [3, [340, 1250]],
      [0, [700, 900]],
      [2, [1691.9, 293.3]]
    ]);
  });

  it("D-pri0: priority 0 の sub_map も本図を覆う（(1700,1250)）", () => {
    expectLayersClose(fxSynMt("D-pri0").merc2XyVisibleLayers(fxMainPx2Merc([1700, 1250])), [
      [2, [1716.9, 302.05]]
    ]);
  });

  it("D-6layer: 上限で切らずに全件返す（(-500,768) で 3 件）", () => {
    const result = fxSynMt("D-6layer").merc2XyVisibleLayers(fxMainPx2Merc([-500, 768]));
    expect(result).toHaveLength(3);
    expectLayersClose(result, [
      [0, [-500, 768]],
      [2, [1661.9, 290]],
      [5, [301.9, 290]]
    ]);
  });

  it("T4b の呼び方: 1 位の層で getLayerTransform(idx).transform(merc, true, idx > 0) が同じ xy を返す（m-1）", () => {
    const mt = fxSynMt("D-6layer");
    const merc = fxMainPx2Merc([-500, 768]);
    for (const [idx, xy] of mt.merc2XyVisibleLayers(merc)) {
      const again = mt.getLayerTransform(idx)!.transform(merc, true, idx > 0);
      expect(again).not.toBe(false);
      expect(again).toEqual(xy);
    }
    // Core が本図の紙外（層 0 の (-500,768)）を除いた後の 1 位 = 広域図（層 2・sub_map）で、
    // 中心の周囲 4 点を同じ層で逆変換しても false にならない（精度円の半径計算用）
    const inPaper = ([, xy]: [number, number[]]) => xy[0] >= 0 && xy[0] <= 2048 && xy[1] >= 0 && xy[1] <= 1536;
    const [firstIdx] = mt.merc2XyVisibleLayers(merc).filter(inPaper)[0];
    expect(firstIdx).toBe(2);
    const mercs = MapTransform.mercViewpoint2Mercs(merc, 20, 0, [256, 256]);
    for (const m of mercs) {
      expect(mt.getLayerTransform(firstIdx)!.transform(m, true, firstIdx > 0)).not.toBe(false);
    }
  });
});

describe("可視層 1932延岡", () => {
  const mt = fxNobeokaMt();
  const cases: [string, [number, number], LayerXy[]][] = [
    ["#9 地点 [131.658501,32.600698]", [131.658501, 32.600698], [[1, [8769.4, 2652.77]]]],
    ["#104 地点 [131.635619,32.569472]", [131.635619, 32.569472], [[0, [3005.02, -1898.25]], [1, [8501.4, 1500.2]]]],
    ["紙内地点 [131.655753,32.556258]", [131.655753, 32.556258], [[0, [610.61, 464.67]], [1, [7843.96, 1579.87]]]],
    ["表現範囲外地点 [131.644679,32.613064]", [131.644679, 32.613064], [[0, [9758.83, -249.97]]]]
  ];
  for (const [label, ll, expected] of cases) {
    it(label, () => {
      expectLayersClose(mt.merc2XyVisibleLayers(fxLl2Merc(ll)), expected);
    });
  }
});

// 既存メソッドの特性値（C-3: 既存メソッドの出力を 1 ビットも変えない）。
// 出所: MaplatTransform 46975d4 の未変更 src を tsx で実行して採取した値
//（採取スクリプトと
//  characterization-46975d4.json）。JSON 文字列の一致で比較する（数値は往復で同一ビット）。
// mercs2Viewpoint の zoom・rotation は 2026-11-28 視点の往復モード（格子）へ切り替えた値（採取し直し）。
// center・merc2XyWithLayer・merc2Xy・mercs2SysCoords は 46975d4 の採取値のまま（無変化を確認済み）。
const FX_CHARACTERIZATION = {"synthetic":[{"fixture":"base5","label":"(700,900)","merc":[14601400,3798200],"merc2XyWithLayer":[[1,[1700,1250]],[0,[700.0000000136931,900.0000000053299]]],"merc2Xy":[1700,1250],"mercs2SysCoords":{"value":[[[13227886.366919462,-4422340.708467156],[13227886.367661916,-3674485.438954938],[13975741.636468131,-4422340.708467156],[13227886.367661916,-5170195.977979377],[12480031.097370792,-4422340.708467156]],[[-6339992.873817714,2426417.0257803425]]]},"mercs2Viewpoint":{"value":{"center":[13227886.366919462,-4422340.708467156],"zoom":3.7438002146400855,"rotation":1.2003941651792968e-20}}},{"fixture":"base5","label":"(1200,700)","merc":[14602400,3798600],"merc2XyWithLayer":[[0,[1200.00000002311,700.0000000000038]],[2,[1704.4,288.30000000047687]]],"merc2Xy":[1200.00000002311,700.0000000000038],"mercs2SysCoords":{"value":[[[3443946.746869117,6339992.8740855865],[3443946.7469009645,6433474.782774609],[3537428.655562669,6339992.8740855865],[3443946.746837262,6246510.965396563],[3350464.838175565,6339992.8740855865]],[[13313985.035579886,14396088.757598136]]]},"mercs2Viewpoint":{"value":{"center":[3443946.746869117,6339992.8740855865],"zoom":6.743800214748921,"rotation":-1.4059013327668656e-10}}},{"fixture":"base5","label":"(1700,1250)","merc":[14603400,3797500],"merc2XyWithLayer":[[0,[1700.0000001442204,1250.0000001075443]],[2,[1716.900000002328,302.0499999985387]]],"merc2Xy":[1700.0000001442204,1250.0000001075443],"mercs2SysCoords":{"value":[[[13227886.369741548,-4422340.710571572],[13227886.369706657,-4328858.801899083],[13321368.278430194,-4422340.710598238],[13227886.369776439,-4515822.619244061],[13134404.461052898,-4422340.710544907]],[[13558583.526138004,14127030.418072242]]]},"mercs2Viewpoint":{"value":{"center":[13227886.369741548,-4422340.710571572],"zoom":6.743800214931728,"rotation":7.616192940935735e-11}}},{"fixture":"base5","label":"(1700,290)","merc":[14603400,3799420],"merc2XyWithLayer":[[0,[1700.0000001626352,290.0000000000264]],[2,[1716.9000000022793,278.0500000014734]]],"merc2Xy":[1700.0000001626352,290.0000000000264],"mercs2SysCoords":{"value":[[[13227886.370101888,14362823.362897243],[13227886.370133739,14456305.271586267],[13321368.27879544,14362823.362897243],[13227886.370070037,14269341.45420822],[13134404.461408336,14362823.362897243]],[[13558583.52613705,14596659.519798938]]]},"mercs2Viewpoint":{"value":{"center":[13227886.370101888,14362823.362897243],"zoom":6.743800214765987,"rotation":-1.7765439510830057e-10}}},{"fixture":"base5","label":"A(570,1300)","merc":[14600715,3799175],"merc2XyWithLayer":[[3,[570,1300.00000003663]],[0,[357.5000000439062,412.49999999045133]]],"merc2Xy":[570,1300.00000003663],"mercs2SysCoords":{"value":[[[-8883817.175416324,-5400734.671234183],[-8883817.175416324,-5026807.036883481],[-8509889.54064199,-5400734.671401158],[-8883817.175416324,-5774662.305496145],[-9257744.810190659,-5400734.671067208]],[[-13041991.513270762,11965758.156061478]]]},"mercs2Viewpoint":{"value":{"center":[-8883817.175416324,-5400734.671234183],"zoom":4.743800215127687,"rotation":-1.786186961673112e-10}}},{"fixture":"base5","label":"(-500,768)","merc":[14599000,3798464],"merc2XyWithLayer":[[0,[-499.9999999995719,768]],[2,[1661.9,290]]],"merc2Xy":[-499.9999999995719,768],"mercs2SysCoords":{"value":[[[-29821447.963283427,5009377.085697312],[-29821447.963283427,5102858.994559716],[-29727966.054589853,5009377.085697312],[-29821447.963283427,4915895.1768349055],[-29914929.871976998,5009377.085697312]],[[12482350.167837169,14362823.362897757]]]},"mercs2Viewpoint":{"value":{"center":[-29821447.963283427,5009377.085697312],"zoom":6.743800214710085,"rotation":7.882068763852185e-23}}},{"fixture":"D-4layer","label":"(1700,1250)","merc":[14603400,3797500],"merc2XyWithLayer":[[0,[1700.0000001442204,1250.0000001075443]]],"merc2Xy":[1700.0000001442204,1250.0000001075443],"mercs2SysCoords":{"value":[[[13227886.369741548,-4422340.710571572],[13227886.369706657,-4328858.801899083],[13321368.278430194,-4422340.710598238],[13227886.369776439,-4515822.619244061],[13134404.461052898,-4422340.710544907]]]},"mercs2Viewpoint":{"value":{"center":[13227886.369741548,-4422340.710571572],"zoom":6.743800214931728,"rotation":7.616192940935735e-11}}},{"fixture":"D-6layer","label":"(-500,768)","merc":[14599000,3798464],"merc2XyWithLayer":[[0,[-499.9999999995719,768]],[2,[1661.9,290]]],"merc2Xy":[-499.9999999995719,768],"mercs2SysCoords":{"value":[[[-29821447.963283427,5009377.085697312],[-29821447.963283427,5102858.994559716],[-29727966.054589853,5009377.085697312],[-29821447.963283427,4915895.1768349055],[-29914929.871976998,5009377.085697312]],[[12482350.167837169,14362823.362897757]]]},"mercs2Viewpoint":{"value":{"center":[-29821447.963283427,5009377.085697312],"zoom":6.743800214710085,"rotation":7.882068763852185e-23}}},{"fixture":"D-samepri","label":"A(570,1300)","merc":[14600715,3799175],"merc2XyWithLayer":[[3,[570,1300.00000003663]],[0,[357.5000000439062,412.49999999045133]]],"merc2Xy":[570,1300.00000003663],"mercs2SysCoords":{"value":[[[-8883817.175416324,-5400734.671234183],[-8883817.175416324,-5026807.036883481],[-8509889.54064199,-5400734.671401158],[-8883817.175416324,-5774662.305496145],[-9257744.810190659,-5400734.671067208]],[[-13041991.513270762,11965758.156061478]]]},"mercs2Viewpoint":{"value":{"center":[-8883817.175416324,-5400734.671234183],"zoom":4.743800215127687,"rotation":-1.786186961673112e-10}}},{"fixture":"D-impTie","label":"(700,900)","merc":[14601400,3798200],"merc2XyWithLayer":[[1,[1700,1250]],[3,[340,1250]]],"merc2Xy":[1700,1250],"mercs2SysCoords":{"value":[[[13227886.366919462,-4422340.708467156],[13227886.367661916,-3674485.438954938],[13975741.636468131,-4422340.708467156],[13227886.367661916,-5170195.977979377],[12480031.097370792,-4422340.708467156]],[[-13384429.400847502,-4422340.708467156]]]},"mercs2Viewpoint":{"value":{"center":[13227886.366919462,-4422340.708467156],"zoom":3.7438002146400855,"rotation":1.2003941651792968e-20}}},{"fixture":"D-impPriTie","label":"(700,900)","merc":[14601400,3798200],"merc2XyWithLayer":[[1,[1700,1250]],[3,[340,1250]]],"merc2Xy":[1700,1250],"mercs2SysCoords":{"value":[[[13227886.366919462,-4422340.708467156],[13227886.367661916,-3674485.438954938],[13975741.636468131,-4422340.708467156],[13227886.367661916,-5170195.977979377],[12480031.097370792,-4422340.708467156]],[[-13384429.400847502,-4422340.708467156]]]},"mercs2Viewpoint":{"value":{"center":[13227886.366919462,-4422340.708467156],"zoom":3.7438002146400855,"rotation":1.2003941651792968e-20}}},{"fixture":"D-pri0","label":"(1700,1250)","merc":[14603400,3797500],"merc2XyWithLayer":[[0,[1700.0000001442204,1250.0000001075443]],[2,[1716.900000002328,302.0499999985387]]],"merc2Xy":[1700.0000001442204,1250.0000001075443],"mercs2SysCoords":{"value":[[[13227886.369741548,-4422340.710571572],[13227886.369706657,-4328858.801899083],[13321368.278430194,-4422340.710598238],[13227886.369776439,-4515822.619244061],[13134404.461052898,-4422340.710544907]],[[13558583.526138004,14127030.418072242]]]},"mercs2Viewpoint":{"value":{"center":[13227886.369741548,-4422340.710571572],"zoom":6.743800214931728,"rotation":7.616192940935735e-11}}}],"nobeoka":[{"lnglat":[131.658501,32.600698],"merc":[14656157.2899257,3842422.449548362],"merc2XyWithLayer":[[0,[8080.245314722085,1442.9008559728393]],[1,[8769.396372395744,2652.767256529391]]],"merc2Xy":[8080.245314722085,1442.9008559728393],"mercs2SysCoords":{"value":[[[-273350.2732668482,16508194.629486814],[-251615.7658189386,16511766.532508418],[-278154.25900330395,16488368.926688295],[-295084.780714754,16504622.72646521],[-268546.2875303887,16528020.332285333]],[[1412302.811154291,13548879.676506797]]]},"mercs2Viewpoint":{"value":{"center":[-273350.2732668482,16508194.629486814],"zoom":8.478835469330676,"rotation":-1.5551831824068358}}},{"lnglat":[131.635619,32.569472],"merc":[14653610.077337366,3838297.012867424],"merc2XyWithLayer":[[0,[3005.0169560443514,-1898.2458979859148]],[1,[8501.40285220628,1500.1995543393202]]],"merc2Xy":[3005.0169560443514,-1898.2458979859148],"mercs2SysCoords":{"value":[[[-12687282.228658162,24680589.155479457],[-12659556.47498181,24678756.03968695],[-12689115.344450757,24652863.401801754],[-12715007.982334513,24682422.271271963],[-12685449.11286557,24708314.90915716]],[[756794.7060993798,16368042.878199054]]]},"mercs2Viewpoint":{"value":{"center":[-12687282.228658162,24680589.155479457],"zoom":8.494114355214446,"rotation":-1.6368162355594291}}},{"lnglat":[131.655753,32.556258],"merc":[14655851.383964999,3836551.671989392],"merc2XyWithLayer":[[0,[610.6079913144231,464.6743889509763]],[1,[7843.961964735097,1579.8737920052235]]],"merc2Xy":[610.6079913144231,464.6743889509763],"mercs2SysCoords":{"value":[[[-18543970.413085077,18900921.801616676],[-18523303.87698162,18902765.452903423],[-18539051.574528676,18872671.019973297],[-18564636.949188534,18899078.15032993],[-18548889.25164148,18929172.583260052]],[[-851295.780667536,16173160.895540861]]]},"mercs2Viewpoint":{"value":{"center":[-18543970.413085077,18900921.801616676],"zoom":8.669963179748642,"rotation":-1.53764327237701}}},{"lnglat":[131.644679,32.613064],"merc":[14654618.631923953,3844056.5864782003],"merc2XyWithLayer":[[0,[9758.825220613473,-249.97397367050553]]],"merc2Xy":[9758.825220613473,-249.97397367050553],"mercs2SysCoords":{"value":[[[3832430.8385907076,20648940.909061573],[3860156.592267055,20647107.793269068],[3830597.722798113,20621215.15538387],[3804705.0849143527,20650774.02485408],[3834263.9543832988,20676666.662739277]]]},"mercs2Viewpoint":{"value":{"center":[3832430.8385907076,20648940.909061573],"zoom":8.491240969258206,"rotation":-1.6086147115655163}}}]};

describe("既存メソッド特性", () => {
  const snap = (mt: MapTransform, merc: number[]) => {
    const mercs = MapTransform.mercViewpoint2Mercs(merc, 20, 0, [256, 256]);
    const safe = <T,>(f: () => T) => {
      try {
        return { value: f() };
      } catch (e) {
        return { error: String((e as Error).message) };
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
  const SYN_MERC: Record<string, number[]> = {
    "(700,900)": fxMainPx2Merc([700, 900]),
    "(1200,700)": fxMainPx2Merc([1200, 700]),
    "(1700,1250)": fxMainPx2Merc([1700, 1250]),
    "(1700,290)": fxMainPx2Merc([1700, 290]),
    "A(570,1300)": FX_A570,
    "(-500,768)": fxMainPx2Merc([-500, 768])
  };

  for (const c of FX_CHARACTERIZATION.synthetic) {
    it(`合成 ${c.fixture} ${c.label}`, () => {
      const merc = SYN_MERC[c.label];
      const { fixture: _f, label: _l, ...expected } = c;
      expect(JSON.stringify(snap(fxSynMt(c.fixture), merc))).toBe(JSON.stringify(expected));
    });
  }

  const nobeoka = fxNobeokaMt();
  for (const c of FX_CHARACTERIZATION.nobeoka) {
    it(`1932延岡 v2 [${c.lnglat.join(",")}]`, () => {
      const { lnglat, ...expected } = c;
      expect(JSON.stringify(snap(nobeoka, fxLl2Merc(lnglat as [number, number])))).toBe(
        JSON.stringify(expected)
      );
    });
  }

  // 丸め値の「現行」列とも照合する（採取値そのものが実測前提と一致すること）
  const r2 = (a: unknown): unknown =>
    Array.isArray(a) ? a.map(r2) : typeof a === "number" ? Math.round(a * 100) / 100 : a;
  const DESIGN_CURRENT: [string, string, number[], unknown][] = [
    ["base5", "(700,900)", SYN_MERC["(700,900)"], [[1, [1700, 1250]], [0, [700, 900]]]],
    ["base5", "(1200,700)", SYN_MERC["(1200,700)"], [[0, [1200, 700]], [2, [1704.4, 288.3]]]],
    ["base5", "(1700,1250)", SYN_MERC["(1700,1250)"], [[0, [1700, 1250]], [2, [1716.9, 302.05]]]],
    ["base5", "(1700,290)", SYN_MERC["(1700,290)"], [[0, [1700, 290]], [2, [1716.9, 278.05]]]],
    ["base5", "A(570,1300)", FX_A570, [[3, [570, 1300]], [0, [357.5, 412.5]]]],
    ["base5", "(-500,768)", SYN_MERC["(-500,768)"], [[0, [-500, 768]], [2, [1661.9, 290]]]],
    ["D-4layer", "(1700,1250)", SYN_MERC["(1700,1250)"], [[0, [1700, 1250]]]],
    // D-impTie: 現行は priority の低い駅前（層 1）が先 = 期待（A が先）と逆順
    ["D-impTie", "(700,900)", SYN_MERC["(700,900)"], [[1, [1700, 1250]], [3, [340, 1250]]]]
  ];
  for (const [fx, label, merc, expected] of DESIGN_CURRENT) {
    it(`設計の現行列 ${fx} ${label}（Issue #9 の「実際」）`, () => {
      expect(r2(fxSynMt(fx).merc2XyWithLayer(merc))).toEqual(expected);
    });
  }
  const NOBEOKA_CURRENT: [[number, number], unknown][] = [
    [[131.658501, 32.600698], [[0, [8080.25, 1442.9]], [1, [8769.4, 2652.77]]]],
    [[131.635619, 32.569472], [[0, [3005.02, -1898.25]], [1, [8501.4, 1500.2]]]],
    [[131.655753, 32.556258], [[0, [610.61, 464.67]], [1, [7843.96, 1579.87]]]],
    [[131.644679, 32.613064], [[0, [9758.83, -249.97]]]]
  ];
  for (const [ll, expected] of NOBEOKA_CURRENT) {
    it(`設計の現行列 1932延岡 v2 [${ll.join(",")}]`, () => {
      expect(r2(nobeoka.merc2XyWithLayer(fxLl2Merc(ll)))).toEqual(expected);
    });
  }
});
