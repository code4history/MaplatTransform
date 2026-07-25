# Proposal: Verify Vite & Vitest Version Alignment

## Summary
Reopen validation of Issue #3 to ensure `vite` and `vitest` versions are strictly aligned and compatible, preventing potential build/test instability.

## Background
- **Issue #3**: Originally "Unify Vite & ESLint". Specified targets: **Vite ^6.x** and **Vitest ^3.x**.
- **User Request**: "Reopen Issue #3 and confirm Vite & Vitest version alignment". "Did you read Issue #3?".
- **Current Context**: The repository usage (**Vite ^7.2.2**, **Vitest ^4.0.8**) is *ahead* of the Issue #3 targets.
- **Reason for Reopening**: To verify if the usage of newer versions (Vite 7/Vitest 4) is intentional and compatible with the broader "Maplat Harmony Phase 2" standards, or if alignment (downgrade or explicit approval) is required.

## Design Details
- **Action**: Downgrade/Align `vite` to `^6.0.0` and `vitest` to `^3.0.0`.
- **Verification**: Ensure no breaking changes affect the build or tests after downgrade.
- **Dependency Management**: Use `pnpm install vite@^6 vitest@^3` to enforce versions.

## Risks
- Downgrade might re-introduce bugs fixed in v7, or break syntax used in v7 (unlikely given simple usage).
