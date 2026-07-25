# dependencies Specification

## Purpose
TBD - created by archiving change unify-libs-turf-vite. Update Purpose after archive.
## Requirements
### Requirement: Unified Turf Usage
The project MUST use a consistent approach for Turf.js imports (Granular or Monolithic) to match other Maplat repositories.

#### Why
To ensure consistent bundle optimization and dependency management across the ecosystem.

#### Scenario: Dependency List
Given `package.json`
When I check `dependencies`
Then strictly necessary `@turf/*` packages (or `@turf/turf`) MUST be listed
And unused Turf packages MUST be removed

