# Proposal: Correct Package Metadata (@maplat/transform)

## Summary
Ensure that the `package.json` distributed with the package correctly identifies itself as `@maplat/transform` and not `@maplat/tin`. Also verify that no references to the forked source (`@maplat/tin`) leak into the build artifacts in a way that affects consumers.

## Background
- **Issue #2**: User reported "package.json within package.json is @maplat/tin".
- **Analysis**: The repository root `package.json` is correctly named. However, the issue might stem from:
    1.  A nested `package.json` (unlikely in standard structure, but possible in `dist` if copied strangely).
    2.  `vite.config.ts` or other build scripts injecting incorrect metadata.
    3.  A misunderstanding of `npm warn` messages in the consumer log (which showed `@maplat/tin` having errors, possibly meaning the *consumer* is `@maplat/tin` depending on `@maplat/transform`).
- **Goal**: Verify and enforce correct package name in all artifacts.

## Design Details
- **Verification**: Check `dist/package.json` (if it exists) or how `package.json` is bundled.
- **Fix**: If any incorrectly named `package.json` is generated, correct it. If the issue is consumer-side configuration, clarify it.

## Risks
- **None**: This is defined as a bug fix / verification task.
