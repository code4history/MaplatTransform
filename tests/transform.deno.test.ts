import { assertEquals, assertAlmostEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { Transform } from "../src/index.ts";

const datasets = [
  ["Nara", "naramachi_yasui_bunko"],
  ["Fushimi", "fushimijo_maplat"],
  ["Burari", "burakita-2024"]
];

// Helper function to assert close values
function assertCloseTo(actual: number, expected: number, tolerance = 0.0001) {
  assertAlmostEquals(actual, expected, tolerance);
}

for (const [town, filename] of datasets) {
  Deno.test(`Test by actual data (${town})`, async (t) => {
    const casesJson = await Deno.readTextFile(`tests/cases/${filename}.json`);
    const compiledJson = await Deno.readTextFile(`tests/compiled/${filename}.json`);
    
    const cases: [[[number, number], [number, number]]] = JSON.parse(casesJson);
    const load_c = JSON.parse(compiledJson);

    const tin = new Transform();
    tin.setCompiled(load_c.compiled);
    console.log(`Compiled: ${load_c.compiled}`);

    await t.step("Forward transformation", () => {
      let i = 0;
      for (const [forw, bakw] of cases) {
        i++;
        const bakw_tr = tin.transform(forw) as [number, number];
        assertCloseTo(bakw_tr[0], bakw[0]);
        assertCloseTo(bakw_tr[1], bakw[1]);
      }
    });

    await t.step("Backward transformation", () => {
      let i = 0;
      for (const [forw, bakw] of cases) {
        i++;
        const forw_tr = tin.transform(bakw, true) as [number, number];
        assertCloseTo(forw_tr[0], forw[0]);
        assertCloseTo(forw_tr[1], forw[1]);
      }
    });
  });
}