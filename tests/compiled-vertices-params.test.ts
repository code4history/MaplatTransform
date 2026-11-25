import { describe, expect, it } from "vitest";
import fs from "node:fs";
import { Transform } from "../src";
import type { Compiled, CompiledLegacy } from "../src/types";

const COMPILED_DIR = `${__dirname}/compiled`;
function loadCompiled(file: string): Compiled {
  const raw = JSON.parse(fs.readFileSync(`${COMPILED_DIR}/${file}`, "utf-8"));
  return raw.compiled ?? raw;
}

/** tests/compiled のうち compiled そのもの（地図データの形のものは除く） */
const FIXTURES = fs
  .readdirSync(COMPILED_DIR)
  .filter(file => file.endsWith(".json"))
  .filter(file => loadCompiled(file).vertices_params !== undefined)
  .sort();

/** 読み込み済みの Transform の状態から、旧形式（tins と向きごとの vertices_params を持つ形）を作る */
function toLegacy(file: string): CompiledLegacy {
  const tin = new Transform();
  tin.setCompiled(loadCompiled(file));
  return JSON.parse(
    JSON.stringify({
      tins: tin.tins,
      strict_status: tin.strict_status,
      weight_buffer: {},
      vertices_params: tin.vertices_params,
      centroid: tin.centroid
    })
  );
}

/** 三角網の外にある点。頂点の表を使う経路を通る */
const OUTSIDE = [-12345, -6789];

function expectPosition(value: unknown) {
  expect(Array.isArray(value)).toBe(true);
  const position = value as number[];
  expect(position).toHaveLength(2);
  expect(Number.isFinite(position[0])).toBe(true);
  expect(Number.isFinite(position[1])).toBe(true);
}

const MODERN = "fushimijo_maplat_v2.json";

describe("compiled vertices_params shape check", () => {
  describe("valid data keeps loading", () => {
    it("covers every compiled fixture", () => {
      expect(FIXTURES.length).toBeGreaterThanOrEqual(31);
    });

    it.each(FIXTURES)("%s loads and transforms a point outside the triangles", file => {
      const tin = new Transform();
      expect(() => tin.setCompiled(loadCompiled(file))).not.toThrow();
      expectPosition(tin.transform(OUTSIDE, false, true));
    });

    it("the vertex list is as long as the vertex triangle list in every fixture", () => {
      for (const file of FIXTURES) {
        const tin = new Transform();
        tin.setCompiled(loadCompiled(file));
        for (const side of [tin.vertices_params!.forw!, tin.vertices_params!.bakw!]) {
          expect(side[0].length).toBeGreaterThan(0);
          expect(side[0].length).toBe(side[1]!.length);
        }
      }
    });

    it("the legacy form loads and gives the same result as the modern form", () => {
      const modern = new Transform();
      modern.setCompiled(loadCompiled(MODERN));
      const legacy = new Transform();
      expect(() => legacy.setCompiled(toLegacy(MODERN))).not.toThrow();
      expect(legacy.transform(OUTSIDE, false, true)).toEqual(
        modern.transform(OUTSIDE, false, true)
      );
    });

    it("the legacy form without vertices_params still loads", () => {
      const legacy = toLegacy(MODERN) as Partial<CompiledLegacy>;
      delete legacy.vertices_params;
      expect(() => new Transform().setCompiled(legacy as CompiledLegacy)).not.toThrow();
    });
  });

  describe("malformed data is refused at load time", () => {
    const arrayLike = { length: 4, 0: 0, 1: 1, 2: 2, 3: 3 };

    it.each([
      ["first list is not an array", 0],
      ["second list is not an array", 1]
    ])("modern form: %s", (_label, at) => {
      const compiled = loadCompiled(MODERN);
      (compiled.vertices_params as unknown[])[at] = arrayLike;
      expect(() => new Transform().setCompiled(compiled)).toThrow(/vertices_params/);
    });

    it("modern form: vertices_params itself is not an array", () => {
      const compiled = loadCompiled(MODERN);
      const [forw, bakw] = compiled.vertices_params!;
      (compiled as unknown as Record<string, unknown>).vertices_params = { 0: forw, 1: bakw };
      expect(() => new Transform().setCompiled(compiled)).toThrow(/vertices_params/);
    });

    it("modern form: a list longer than the vertex count", () => {
      const compiled = loadCompiled(MODERN);
      compiled.vertices_params![0] = [...compiled.vertices_params![0], 0];
      expect(() => new Transform().setCompiled(compiled)).toThrow(/vertices_params/);
    });

    it("modern form: a list shorter than the vertex count", () => {
      const compiled = loadCompiled(MODERN);
      compiled.vertices_params![1] = compiled.vertices_params![1].slice(1);
      expect(() => new Transform().setCompiled(compiled)).toThrow(/vertices_params/);
    });

    it.each([
      ["a string", "0"],
      ["null", null],
      ["an object", {}]
    ])("modern form: an element that is %s", (_label, value) => {
      const compiled = loadCompiled(MODERN);
      (compiled.vertices_params![0] as unknown[])[1] = value;
      expect(() => new Transform().setCompiled(compiled)).toThrow(/vertices_params/);
    });

    it.each(["forw", "bakw"] as const)("legacy form: %s list is not an array", side => {
      const legacy = toLegacy(MODERN);
      (legacy.vertices_params[side] as unknown[])[0] = arrayLike;
      expect(() => new Transform().setCompiled(legacy)).toThrow(/vertices_params/);
    });

    it("legacy form: a list longer than the vertex triangle list", () => {
      const legacy = toLegacy(MODERN);
      legacy.vertices_params.forw![0].push(0);
      expect(() => new Transform().setCompiled(legacy)).toThrow(/vertices_params/);
    });

    it("legacy form: the vertex triangle list is not an array", () => {
      const legacy = toLegacy(MODERN);
      const tins = legacy.vertices_params.bakw![1]!;
      (legacy.vertices_params.bakw as unknown[])[1] = { ...tins, length: tins.length };
      expect(() => new Transform().setCompiled(legacy)).toThrow(/vertices_params/);
    });

    it("a refused load leaves the earlier data in place", () => {
      const tin = new Transform();
      tin.setCompiled(loadCompiled(MODERN));
      const before = tin.transform(OUTSIDE, false, true);
      const compiled = loadCompiled("naramachi_yasui_bunko_v2.json");
      (compiled.vertices_params as unknown[])[0] = arrayLike;
      expect(() => tin.setCompiled(compiled)).toThrow(/vertices_params/);
      expect(tin.transform(OUTSIDE, false, true)).toEqual(before);
    });
  });
});
