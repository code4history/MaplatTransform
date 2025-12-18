# Spec: Modern Bundler (Vite)

## ADDED Requirements

### Requirement: Use Vite for building
The project MUST use `vite` for development and building the production library.

#### Scenario: Production Build
Given dependencies are installed
When I run the build script
Then `vite build` is executed
And the output files are generated in the `dist` directory
And the output includes CommonJS, ES Module, and UMD formats (as per existing config)
