# Spec: CI/CD Pipeline

## MODIFIED Requirements

### Requirement: GitHub Actions Workflow
The project MUST have a GitHub Actions workflow that verifies the codebase on every push and pull request.

#### Scenario: CI Execution
Given a new commit is pushed to the repository
When the GitHub Actions workflow triggers
Then it MUST install dependencies using `pnpm`
And it MUST run `lint`
And it MUST run `typecheck`
And it MUST run `test`
And it MUST run `build`
And all steps MUST pass for the workflow to succeed
