# typescript-definitions Specification

## Purpose
TBD - created by archiving change issue-4. Update Purpose after archive.
## Requirements
### Requirement: Package Exports with TypeScript
The `package.json` MUST include proper TypeScript type definitions in the `exports` field.

#### Why
To ensure consuming projects can correctly resolve TypeScript types regardless of their module system (ESM/CJS).

#### Scenario: Type Resolution
Given a consuming TypeScript project
When importing from `@maplat/transform`
Then TypeScript MUST correctly resolve type definitions
And the import MUST work for both ESM and CJS module systems

