# tooling Specification

## Purpose
TBD - created by archiving change unify-libs-turf-vite. Update Purpose after archive.
## Requirements
### Requirement: Standardized Build Configuration
The project MUST use `vite` for building and testing, with a configuration consistent with Maplat standards.

#### Why
To ensure reproducible builds and compatibility with the unified CI/CD pipeline.

#### Scenario: Build Output
Given the standardized `vite.config.ts`
When I run `pnpm build`
Then it MUST produce valid ESM, CJS, and UMD builds in `dist/`
And `d.ts` files MUST be generated

### Requirement: Standardized Linting
The project MUST use `eslint` with a shared or standard configuration.

#### Why
To maintain code quality and style consistency across all Maplat repositories.

#### Scenario: Lint Check
Given the standardized `eslint.config.mjs`
When I run `pnpm lint`
Then it MUST enforce the defined coding standards

### Requirement: Vite and Vitest Versions
The project MUST use `vite` version `^6.x` and `vitest` version `^3.x`.

#### Why
To strictly align with Maplat Harmony Phase 2 standards (Issue #3).

#### Scenario: Version Check
Given `package.json`
When I check `devDependencies`
Then `vite` MUST be `^6`
And `vitest` MUST be `^3`

