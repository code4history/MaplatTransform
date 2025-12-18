# Spec: Tooling Standardization (Vite & ESLint)

## ADDED Requirements

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
