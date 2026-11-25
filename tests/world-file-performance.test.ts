import { describe, expect, it } from "vitest";
import { Transform } from "../src/transform.ts";
import type { Compiled, CompiledWorldFileOuter } from "../src/types.ts";

function makeCompiled(outer: boolean): Compiled | CompiledWorldFileOuter {
  const points: Compiled["points"] = [];
  const tinIndexes: number[][] = [];
  for (let row = 0; row < 70; row++) {
    for (let column = 0; column < 100; column++) {
      const x = column * 10 + 1;
      const y = row * 10 + 1;
      const start = points.length;
      for (const xy of [[x, y], [x + 8, y], [x, y + 8]]) {
        points.push([xy, [xy[0], 700 - xy[1]]]);
      }
      tinIndexes.push([start, start + 1, start + 2]);
    }
  }
  const vertices: Compiled["vertices_points"] = [
    [[0, 0], [0, 700]], [[1000, 0], [1000, 700]],
    [[1000, 700], [1000, 0]], [[0, 700], [0, 0]]
  ];
  const base: Compiled = {
    version: 3.00001,
    points,
    tins_points: [tinIndexes, tinIndexes],
    weight_buffer: {},
    centroid_point: [[500, 350], [500, 350]],
    vertices_params: [[0, 1, 2, 3], [0, 1, 2, 3]],
    vertices_points: vertices,
    strict_status: "strict",
    wh: [1000, 700]
  };
  if (!outer) return base;
  return {
    ...base,
    outerTransform: "worldFile",
    worldFile: { xScale: 1, xSkew: 0, xOrigin: 0.5, ySkew: 0, yScale: -1, yOrigin: 699.5 }
  };
}

describe("B の索引探索性能", () => {
  it("7,000 三角形で通常経路と B の処理結果・所要時間を比較する", () => {
    const ordinary = new Transform();
    ordinary.setCompiled(makeCompiled(false));
    const worldFile = new Transform();
    worldFile.setCompiled(makeCompiled(true));
    const queries = Array.from({ length: 20000 }, (_, index) => {
      const column = index % 100;
      const row = Math.floor(index / 100) % 70;
      return [column * 10 + 2, row * 10 + 2];
    });
    for (const query of queries.slice(0, 100)) {
      expect(worldFile.transform(query, false, true)).toEqual(ordinary.transform(query, false, true));
    }
    const measure = (transform: Transform) => {
      const start = performance.now();
      for (const query of queries) transform.transform(query, false, true);
      return performance.now() - start;
    };
    const ordinarySamples: number[] = [];
    const worldFileSamples: number[] = [];
    for (let round = 0; round < 3; round++) {
      if (round % 2 === 0) {
        ordinarySamples.push(measure(ordinary));
        worldFileSamples.push(measure(worldFile));
      } else {
        worldFileSamples.push(measure(worldFile));
        ordinarySamples.push(measure(ordinary));
      }
    }
    const median = (samples: number[]) => samples.sort((a, b) => a - b)[1];
    const ordinaryMs = median(ordinarySamples);
    const worldFileMs = median(worldFileSamples);
    console.info(`三角形7,000件（中央値）: 通常=${ordinaryMs.toFixed(2)}ms、B=${worldFileMs.toFixed(2)}ms、比=${(worldFileMs / ordinaryMs).toFixed(2)}`);
  });
});
