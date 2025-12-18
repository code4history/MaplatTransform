# Proposal: Unify Package Manager (pnpm) and Build System (Vite)

## Summary
Migrate the `MaplatTransform` repository to use **pnpm** as the package manager and formalize the usage of **Vite** as the bundler. Additionally, establish a robust **CI/CD** pipeline using GitHub Actions to verify builds, linting, and tests.

## Background
- **Issue #1**: "Unify Package Manager" requests standardization on pnpm.
- **Current State**: The repository currently uses `npm`. `package.json` already contains `vite` scripts, but the configuration and CI/CD integration need formalization.
- **Goal**: Align with the Code for History standard environment (pnpm + Vite) and ensure build quality via CI.

## Design Details
- **Package Manager**: Switch from `npm` to `pnpm`. This involves removing `package-lock.json` and generating `pnpm-lock.yaml`.
- **Bundler**: Confirm and lock `vite` configuration. Ensure `npm run build` works correctly with pnpm.
- **CI/CD**: Update `.github/workflows/test.yml` to:
    - Install `pnpm` (via `pnpm/action-setup`).
    - Cache `pnpm` store.
    - Run lint, typecheck, test, and build steps using `pnpm`.

## Dependencies
- `pnpm` (tooling)
- `vite` (existing dependency)
- GitHub Actions

## Risks
- **CI failures**: Switching package managers might expose implicit dependency issues.
- **Script compatibility**: Some scripts in `package.json` might need adjustment for pnpm (e.g., arguments passing).
