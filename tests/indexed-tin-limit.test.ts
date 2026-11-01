import { describe, expect, it } from "vitest";
import fs from "node:fs";
import type { Position } from "geojson";
import { Transform } from "../src";
import { MAX_INDEX_CELLS_PER_TRIANGLE, countIndexCells } from "../src/geometry";
import type { Tins } from "../src/geometry";
import type { Compiled } from "../src/types";

/** 全体の外接矩形を 1 つで覆う三角形を count 個並べる。座標を from 倍し、変換先を to 倍にする */
function coveringTins(count: number, from = 1, to = 2): Tins {
  const corners = [[0, 0], [100, 0], [0, 100]];
  const scaled = (factor: number) => corners.map(([x, y]) => [x * factor, y * factor]);
  const feature = () => {
    const src = scaled(from);
    const dst = scaled(to);
    return {
      type: "Feature" as const,
      geometry: { type: "Polygon" as const, coordinates: [[...src, src[0]]] },
      properties: {
        a: { geom: dst[0], index: 0 },
        b: { geom: dst[1], index: 1 },
        c: { geom: dst[2], index: 2 }
      }
    };
  };
  return { type: "FeatureCollection", features: Array.from({ length: count }, feature) };
}

/** 対角の 2 隅にだけある小さな三角形を count 個並べる。全体の外接矩形は coveringTins と同じ */
function smallTins(count: number): Tins {
  const base = coveringTins(count);
  base.features.forEach((feature, index) => {
    const offset = index % 2 === 0 ? 0 : 99;
    const src = [[offset, offset], [offset + 1, offset], [offset, offset + 1]];
    feature.geometry.coordinates = [[...src, src[0]]];
  });
  return base;
}

function transformWithTins(forw: Tins, bakw: Tins): Transform {
  const tin = new Transform();
  const empty: [number[], Tins[]] = [[], []];
  const centroid = {
    type: "Feature" as const,
    geometry: { type: "Point" as const, coordinates: [0, 0] },
    properties: {}
  };
  tin.tins = { forw, bakw };
  tin.vertices_params = { forw: empty, bakw: empty };
  tin.centroid = { forw: centroid, bakw: centroid } as Transform["centroid"];
  tin.addIndexedTin();
  return tin;
}

function eachBoundOf(tins: Tins): Position[][] {
  return tins.features.map(feature => {
    const coords = feature.geometry.coordinates[0];
    const xs = coords.map(coord => coord[0]);
    const ys = coords.map(coord => coord[1]);
    return [
      [Math.min(...xs), Math.min(...ys)],
      [Math.max(...xs), Math.max(...ys)]
    ];
  });
}

function boundOf(eachBounds: Position[][]): Position[] {
  return [
    [
      Math.min(...eachBounds.map(each => each[0][0])),
      Math.min(...eachBounds.map(each => each[0][1]))
    ],
    [
      Math.max(...eachBounds.map(each => each[1][0])),
      Math.max(...eachBounds.map(each => each[1][1]))
    ]
  ];
}

function countOf(tins: Tins): number {
  const eachBounds = eachBoundOf(tins);
  return countIndexCells(
    eachBounds,
    boundOf(eachBounds),
    Math.ceil(Math.sqrt(tins.features.length))
  );
}

function loadCompiled(name: string): Compiled {
  const raw = JSON.parse(fs.readFileSync(`${__dirname}/compiled/${name}.json`, "utf-8"));
  return raw.compiled ?? raw;
}

function loadCases(name: string): [number[], number[]][] {
  return JSON.parse(fs.readFileSync(`${__dirname}/cases/${name}.json`, "utf-8"));
}

describe("indexed TIN cell limit", () => {
  describe("data over the limit", () => {
    it("builds no index when every triangle covers the whole extent", () => {
      const tins = coveringTins(100);
      const tin = transformWithTins(tins, coveringTins(100, 2, 1));

      expect(countOf(tins)).toBe(10000);
      expect(countOf(tins)).toBeGreaterThan(MAX_INDEX_CELLS_PER_TRIANGLE * 100);
      expect(tin.indexedTins).toBeUndefined();
    });

    it("looks at the backward side as well", () => {
      const tin = transformWithTins(smallTins(100), coveringTins(100, 2, 1));
      expect(tin.indexedTins).toBeUndefined();
    });

    it("looks at the forward side as well", () => {
      const tin = transformWithTins(coveringTins(100), smallTins(100));
      expect(tin.indexedTins).toBeUndefined();
    });

    it("drops an index left by earlier data", () => {
      const tin = transformWithTins(smallTins(100), smallTins(100));
      expect(tin.indexedTins).toBeDefined();

      tin.tins = { forw: coveringTins(100), bakw: coveringTins(100, 2, 1) };
      tin.addIndexedTin();
      expect(tin.indexedTins).toBeUndefined();
    });

    it("allows exactly the limit and refuses one cell more per triangle", () => {
      const atLimit = transformWithTins(coveringTins(36), coveringTins(36, 2, 1));
      expect(countOf(coveringTins(36))).toBe(MAX_INDEX_CELLS_PER_TRIANGLE * 36);
      expect(atLimit.indexedTins).toBeDefined();

      const overLimit = transformWithTins(coveringTins(37), coveringTins(37, 2, 1));
      expect(countOf(coveringTins(37))).toBeGreaterThan(MAX_INDEX_CELLS_PER_TRIANGLE * 37);
      expect(overLimit.indexedTins).toBeUndefined();
    });

    it("is not bypassed by a triangle with non-numeric coordinates", () => {
      const eachBounds: Position[][] = Array.from({ length: 100 }, () => [
        [0, 0],
        [100, 100]
      ]);
      eachBounds[0] = [
        [NaN, 0],
        [NaN, 100]
      ];
      const count = countIndexCells(eachBounds, [[0, 0], [100, 100]], 10);
      expect(count).toBe(9900);
    });
  });

  describe("real data", () => {
    it.each([
      ["18th_mapcontest_gp_v2"],
      ["naramachi_yasui_bunko"]
    ])("keeps the index of %s", name => {
      const tin = new Transform();
      tin.setCompiled(loadCompiled(name));

      expect(tin.indexedTins).toBeDefined();
      const forw = tin.tins!.forw as Tins;
      const bakw = tin.tins!.bakw as Tins;
      const size = forw.features.length;
      expect(Math.max(countOf(forw), countOf(bakw)) / size).toBeLessThanOrEqual(
        MAX_INDEX_CELLS_PER_TRIANGLE
      );
    });

    it("counts the same number of cells as the built index", () => {
      const tin = new Transform();
      tin.setCompiled(loadCompiled("naramachi_yasui_bunko"));

      const sumOf = (gridCache: number[][][]) =>
        gridCache.flat().reduce((total, cell) => total + (cell?.length ?? 0), 0);
      expect(countOf(tin.tins!.forw as Tins)).toBe(sumOf(tin.indexedTins!.forw!.gridCache));
      expect(countOf(tin.tins!.bakw as Tins)).toBe(sumOf(tin.indexedTins!.bakw!.gridCache));
    });
  });

  describe("transform without an index", () => {
    it("works on data over the limit", () => {
      const tin = transformWithTins(coveringTins(100), coveringTins(100, 2, 1));

      expect(tin.transform([10, 10])).toEqual([20, 20]);
      expect(tin.transform([20, 20], true)).toEqual([10, 10]);
    });

    it("works on data too small for an index", () => {
      const tin = transformWithTins(coveringTins(2), coveringTins(2, 2, 1));

      expect(tin.indexedTins).toBeUndefined();
      expect(tin.transform([10, 10])).toEqual([20, 20]);
      expect(tin.transform([20, 20], true)).toEqual([10, 10]);
    });

    it("gives the same result as with the index", () => {
      const indexed = new Transform();
      indexed.setCompiled(loadCompiled("fushimijo_maplat_v2"));
      const plain = new Transform();
      plain.setCompiled(loadCompiled("fushimijo_maplat_v2"));
      plain.indexedTins = undefined;

      const cases = loadCases("fushimijo_maplat_v2");
      const picked = [0, Math.floor(cases.length / 2), cases.length - 1].map(i => cases[i]);
      for (const [forw, bakw] of picked) {
        expect(plain.transform(forw)).toEqual(indexed.transform(forw));
        expect(plain.transform(bakw, true)).toEqual(indexed.transform(bakw, true));
      }
    });
  });
});
