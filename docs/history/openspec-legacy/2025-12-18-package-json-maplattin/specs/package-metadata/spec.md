# Spec: Package Identity

## ADDED Requirements

### Requirement: Correct Package Name
The distributed package MUST be named `@maplat/transform`.

#### Scenario: Build Artifacts
Given the project is built
When I inspect the generated `package.json` (if any) or the build output
Then the package name MUST be `@maplat/transform`
And it MUST NOT be `@maplat/tin`
