# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Security
- **Vite & Source-Map Security Upgrades**: Updated `vite` to `6.4.5` and `source-map-js` to `1.2.2`, resolving high-severity advisories (GHSA-698v-4r3x-3vcv, GHSA-r825-w8mm-5pxw, GHSA-68fv-2mgg-jv7q).

### Fixed
- **Biome Linter & Code Quality**: Resolved Biome complexity warnings by introducing safe optional chaining (`?.`) in `src/lib/lebensmittelwarnung.ts` and sorted import specifiers in `tests/lebensmittelwarnung.test.ts`.

### Verification
- `npm run typecheck` (`tsc --noEmit`): 0 errors.
- `npm run lint` (`biome check`): 46 files checked, 0 errors, 0 warnings.
- `npm test` (`vitest run`): 14 test files, 85 tests passed.
- `npm run build` (`vite build`): Clean production asset generation.
