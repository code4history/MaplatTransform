<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# Repository Guidelines

## Project Structure & Module Organization
Core transformation logic lives in `src/` (`geometry.ts`, `triangulation.ts`, `edgeutils.ts`, `index.ts`). Vitest suites and fixtures live in `tests/` (`transform.test.ts`, `cases/`, custom matchers in `setup.ts`). Legacy node specs remain under `spec/` for regression reference, while `public/index.html` hosts the Vite demo playground. Release helper scripts (`scripts/*.js`) handle version bumps and npm publishing; do not edit generated `dist/` artifacts directly.

## Build, Test, and Development Commands
Use `npm run dev` to spin up the Vite playground for rapid experimentation against the demo HTML. `npm run build` performs strict type-checking plus a production bundle targeting CJS/ESM/UMD outputs. `npm run typecheck` and `npm run lint` are lightweight pre-flight commands for CI-style validation. Deploy previews (docs/demo) via `npm run deploy`, which emits HTML at repo root before bundling.

## Coding Style & Naming Conventions
Write modern TypeScript using strict compiler defaults (`tsconfig.json` enforces `strict`, `noUnused*`, alias `@/*`). Prefer functional helpers and explicit tuple types for coordinate pairs. Follow the Prettier profile in `.prettierrc` (2-space indent, single quotes, 100-char width, LF endings); run `npx prettier --write src tests` when touching multiple files. ESLint (`eslint.config.mjs`) layers `@typescript-eslint` rules: avoid `any`, prefix intentionally unused variables with `_`, and keep modules typed at the boundary.

## Testing Guidelines
Vitest is the canonical runner: `npm test` (single pass), `npm run test:watch` (TDD loop), `npm run coverage` (V8 reports). Keep tests colocated in `tests/` and mirror source filenames (`geometry` logic → `geometry.test.ts`). Use the provided `toBeDeepCloseTo` matcher for floating-point assertions instead of manual tolerances. Include representative fixtures under `tests/cases/` and document new datasets inside the test file header comment.

## Commit & Pull Request Guidelines
History uses Conventional Commits (`feat:`, `fix:`, `chore:`) per recent `git log`; continue that style so automated release scripts can parse versions. Keep commits scoped to one concern and mention ticket numbers when relevant (`fix: handle inverted y-axis #123`). Pull requests must describe the transformation scenario, reference any affected `cases/` assets, and attach screenshots or logs for demo/regression evidence. Ensure lint, typecheck, and tests pass locally before requesting review.

## Release & Configuration Tips
Version utilities in `scripts/` (`version:bump`, `version:sync`, `publish:npm(:dry)`) expect the workspace to be clean. When building locally for publication, set `BUILD_MODE=package` implicitly via `npm run build` and verify the generated `dist/` exports (`maplat_transform.{js,cjs,umd.js}` plus `index.d.ts`). Keep secrets out of the repo; Maplat transformation definitions may include proprietary coordinates, so scrub sample data before sharing.
