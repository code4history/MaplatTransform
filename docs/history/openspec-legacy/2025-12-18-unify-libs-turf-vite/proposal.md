# Proposal: Unify Libraries & Tooling (Turf, Vite, ESLint)

## Summary
Standardize the usage and configuration of core libraries and build tools to align with the Maplat ecosystem standards. This includes unifying Turf.js dependencies, refactoring Vite configuration, and ensuring ESLint consistency.

## Background
- **Issue #3**: "Unify Vite & ESLint config across repositories".
- **User Request**: Explicitly mentioned `unify-libs-turf-vite`, indicating Turf.js is also a target for unification.
- **Current State**: 
    - Configuration is scattered or project-specific.
    - Turf dependencies are granular (`@turf/boolean-point-in-polygon` etc.).
    - ESLint config exists (`eslint.config.mjs`) but needs verification against standards.

## Design Details
- **Turf.js**: Evaluate whether to switch to the monolithic `@turf/turf` for simplicity or strictly enforce granular packages for tree-shaking. (Defaults to standardizing on whatever is the Maplat preference; usually granular is better for libs, but unification might imply using the same set across repos).
- **Vite**: Ensure `vite.config.ts` follows consistent patterns (plugins, build targets).
- **ESLint**: Ensure strict linting rules are applied consistently.

## Risks
- **Bundle Size**: Changing Turf imports could affect bundle size.
- **Build Breakage**: Tighter lint/build rules might expose existing code issues.
