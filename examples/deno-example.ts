/**
 * Example of using MaplatTransform with Deno
 * 
 * This example demonstrates how to use the MaplatTransform library in a Deno environment.
 * Make sure you have the compiled transformation data available.
 */

import { Transform } from "../src/index.ts";

// Example: Load compiled transformation data
// In a real application, you would load this from a file or API
const compiledData = {
  version: 2.00703,
  points: [
    [[0, 0], [100, 100]],
    [[100, 0], [200, 100]],
    [[100, 100], [200, 200]],
    [[0, 100], [100, 200]]
  ],
  tins_points: [[
    [0, 1, 2],
    [0, 2, 3]
  ]],
  weight_buffer: {
    forw: {},
    bakw: {}
  },
  strict_status: "strict",
  centroid_point: [[50, 50], [150, 150]],
  vertices_params: [[1, 2, 3, 4], [5, 6, 7, 8]],
  vertices_points: [
    [[0, 0], [100, 100]],
    [[100, 0], [200, 100]],
    [[100, 100], [200, 200]],
    [[0, 100], [100, 200]]
  ],
  edges: []
};

// Create a Transform instance
const transform = new Transform();

// Set the compiled data
transform.setCompiled(compiledData);

// Example transformations
console.log("Forward transformation examples:");
const point1 = [50, 50];
const transformed1 = transform.transform(point1);
console.log(`[${point1}] -> [${transformed1}]`);

const point2 = [25, 75];
const transformed2 = transform.transform(point2);
console.log(`[${point2}] -> [${transformed2}]`);

// Backward transformation
console.log("\nBackward transformation examples:");
const backPoint1 = [150, 150];
const backTransformed1 = transform.transform(backPoint1, true);
console.log(`[${backPoint1}] -> [${backTransformed1}]`);

// Check if a point is within bounds
const outOfBoundsPoint = [200, 200];
const outOfBoundsResult = transform.transform(outOfBoundsPoint);
console.log(`\nOut of bounds check: [${outOfBoundsPoint}] -> ${outOfBoundsResult}`);

// Loading from a file example
console.log("\n--- Loading from file example ---");
console.log("To load compiled data from a file:");
console.log("const compiledJson = await Deno.readTextFile('./compiled.json');");
console.log("const compiled = JSON.parse(compiledJson);");
console.log("transform.setCompiled(compiled);");