# Spec: Tooling Version Alignment

## ADDED Requirements

### Requirement: Vite and Vitest Versions
The project MUST use `vite` version `^6.x` and `vitest` version `^3.x`.

#### Why
To strictly align with Maplat Harmony Phase 2 standards (Issue #3).

#### Scenario: Version Check
Given `package.json`
When I check `devDependencies`
Then `vite` MUST be `^6`
And `vitest` MUST be `^3`
