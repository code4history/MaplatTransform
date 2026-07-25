# Repository Guidelines

## Core Operating Principles

These principles govern how an AI coding agent should operate in this repository, regardless of which tool (Claude Code, Codex, or others) is used.

1. **Response Language Discipline**: Follow this repository's working-language convention when responding to the user (for this repository, Japanese), and keep responses polite and concise. This rule governs the language the agent uses when *talking with the user* — it is a separate axis from the language this document itself is written in (English, see "Documentation Language" below), and separate from the bilingual (English/Japanese) convention that applies to README and Wiki pages.
2. **Respect for Existing Behavior**: Do not invent your own implementation or make unsupported leaps of inference. Prioritize faithfully reproducing and porting the logic of the existing implementation — the migration source, the specification, or prior commits — over introducing a novel design.
3. **Root-Cause Analysis**: When a problem or bug occurs, do not keep patching based on guesses. Always compare against the existing implementation or specification and investigate the root cause thoroughly before applying a fix.
4. **The Human Gate Is Sovereign**: Never decide on your own that it is fine to move on to the next step without an explicit response from the user to a question or confirmation request. The agent privately concluding that something is fine is not a substitute for the user confirming it — the user must obtain that assurance for themselves. Whether to proceed to the next step is always the user's exclusive prerogative. Proceeding without a response usurps that prerogative and must be treated as the equivalent of a coup — a grave violation, never a minor process slip.

### Documentation Language

This document (`AGENTS.md`) itself is written in English, independent of principle 1 above.

## Operational Rules & History

- Repository-specific operating rules for AI coding agents are recorded under `docs/superpowers/rules/`.
- A translated index of this repository's pre-2026 development history (proposals and records originally written in the OpenSpec workflow) is available at `docs/history/openspec-legacy-index.md`, with original documents preserved under `docs/history/openspec-legacy/`.

## Project Structure & Module Organization

Core transformation logic lives in `src/` (`geometry.ts`, `triangulation.ts`, `edgeutils.ts`, `transform.ts`, `map-transform.ts`, `coord-utils.ts`, `compiled-state.ts`, `viewpoint.ts`, `constants.ts`, `types.ts`, `index.ts`). Vitest suites and fixtures live in `tests/` (`transform.test.ts`, `map-transform.test.ts`, `coord-utils.test.ts`, `viewpoint.test.ts`, `cases/`, `setup.ts`). Legacy Node specs remain under `spec/` for regression reference, while `demo/` and `public/index.html` host the Vite demo playground. Release helper scripts (`scripts/*.mjs`/`*.js`) handle submap generation and version bumps; do not edit generated `dist-demo/` artifacts directly.

## Build, Test, and Development Commands

`pnpm dev` starts the Vite dev server for the demo playground. `pnpm build` runs `pnpm typecheck` then a production bundle (`BUILD_MODE=package vite build`). `pnpm build:demo` / `pnpm deploy` build the demo site. `pnpm typecheck` (`tsc --noEmit --allowImportingTsExtensions`) and `pnpm lint` (`eslint src tests`) are the pre-flight checks. `pnpm generate:submaps` regenerates compiled submap fixtures.

## Coding Style & Naming Conventions

TypeScript with `strict: true` in `tsconfig.json` (`noUnused*` enabled, `@/*` alias to `src/*`). Prefer functional helpers and explicit tuple types for coordinate pairs. Follow the Prettier profile in `.prettierrc`; run `pnpm exec prettier --write src tests` when touching multiple files. ESLint (`eslint.config.mjs`) layers `@typescript-eslint` rules: avoid `any`, prefix intentionally unused variables with `_`, and keep modules typed at the boundary.

## Testing Guidelines

Vitest is the canonical runner: `pnpm test` (single pass), `pnpm test:watch` (TDD loop), `pnpm coverage` (V8 reports). Keep tests colocated in `tests/` and mirror source filenames (`geometry`/`transform` logic → `transform.test.ts`). Include representative fixtures under `tests/cases/` and document new datasets inside the test file header comment.

## Commit & Pull Request Guidelines

History uses Conventional Commits (`fix:`) alongside task-ID-prefixed messages (e.g. `m15-t1:`, `c2-m4-t2:`, `c2-m1-t1:`) tied to this project's internal task tracking. Keep commits scoped to one concern; when a message is not part of a tracked task, prefer a Conventional Commits prefix and mention ticket numbers when relevant. Pull requests must describe the transformation scenario, reference any affected `cases/` assets, and attach screenshots or logs for demo/regression evidence. Ensure lint, typecheck, and tests pass locally before requesting review.

## Release & Configuration Tips

Version utilities in `scripts/` (`version:bump`, `version:sync`, `publish:npm(:dry)`) expect the workspace to be clean. `pnpm prepublishOnly` runs lint, typecheck, test, and build together as the release gate; verify the generated `dist-demo/` exports afterward. Keep secrets out of the repo; Maplat transformation definitions may include proprietary coordinates, so scrub sample data before sharing.
