# Deno Usage Guide for MaplatTransform

This guide explains how to use MaplatTransform with Deno.

## Setup

1. **Using deno.json (Recommended)**
   
   The project includes a `deno.json` configuration file that sets up import maps for npm dependencies. This allows you to import the library naturally:

   ```typescript
   import { Transform } from "./src/index.ts";
   ```

2. **Direct npm imports**
   
   You can also import directly from npm without the configuration:

   ```typescript
   import { Transform } from "npm:@maplat/transform@0.2.0";
   ```

## Running the Library

Since MaplatTransform doesn't use any Node.js-specific APIs in its core functionality, it works seamlessly with Deno. The library uses:

- Pure TypeScript/JavaScript code
- npm packages via Deno's npm compatibility layer
- No file system or other Node.js built-in modules

## Testing

Run the Deno-compatible tests:

```bash
deno task test
```

This will run the test suite located in `tests/transform.deno.test.ts`.

## Example Usage

```typescript
// examples/deno-example.ts
import { Transform } from "../src/index.ts";

// Load compiled transformation data
const compiledJson = await Deno.readTextFile('./compiled.json');
const compiledData = JSON.parse(compiledJson);

// Create transform instance
const transform = new Transform();
transform.setCompiled(compiledData);

// Perform transformations
const sourcePoint = [100, 100];
const targetPoint = transform.transform(sourcePoint, false);
console.log(`Transformed: [${sourcePoint}] -> [${targetPoint}]`);

// Reverse transformation
const reversed = transform.transform(targetPoint, true);
console.log(`Reversed: [${targetPoint}] -> [${reversed}]`);
```

## Available Tasks

The `deno.json` file defines several useful tasks:

- `deno task dev` - Run with file watching
- `deno task test` - Run tests
- `deno task fmt` - Format code
- `deno task lint` - Lint code
- `deno task check` - Type check

## Permissions

When running with Deno, you may need the following permissions:

- `--allow-read` - To read transformation definition files
- `--allow-net` - If loading definitions from remote URLs

## Differences from Node.js

1. **Import paths**: Use `.ts` extensions and relative paths
2. **Testing**: Uses Deno's built-in test runner instead of Vitest
3. **File reading**: Use `Deno.readTextFile()` instead of `fs.readFileSync()`

## Troubleshooting

### Import errors

If you encounter import errors, ensure:
1. You're using the correct import syntax with `.ts` extensions
2. The `deno.json` file is in the project root
3. npm dependencies are specified correctly in the import map

### Type errors

The library is fully typed and should work with Deno's TypeScript compiler. If you encounter type errors:
1. Check that you're using a recent version of Deno
2. Ensure the `compilerOptions` in `deno.json` match your needs