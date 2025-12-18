# Spec: Package Manager Standardization

## ADDED Requirements

### Requirement: Use pnpm for package management
The project MUST use `pnpm` instead of `npm` or `yarn` to ensure efficient and strict dependency management.

#### Scenario: Install dependencies
Given a fresh clone of the repository
When I run `pnpm install`
Then all dependencies are installed correctly
And a `pnpm-lock.yaml` file is generated or updated
And no `package-lock.json` file exists

#### Scenario: Run scripts
Given dependencies are installed
When I run `pnpm run build`
Then the build completes successfully without errors
