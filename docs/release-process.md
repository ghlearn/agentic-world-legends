# Release process

This project uses **Semantic Versioning** (`MAJOR.MINOR.PATCH`) for release governance.

## Version bump rules

1. **PATCH** (`0.2.x`): bug fixes, balancing tweaks, copy polish, small non-breaking improvements.
2. **MINOR** (`0.x.0`): player-visible additions like levels, mechanics, content, or major UX changes.
3. **MAJOR** (`x.0.0`): breaking game format or full-system rewrites (rare while in beta).

## Required release flow

1. Update `package.json` version to the target SemVer value.
2. Add a matching top-of-file section in `CHANGELOG.md`:
   - `## [x.y.z] - Beta` (or another release label/date as needed)
   - Organize notes under `### Added`, `### Changed`, `### Fixed`, `### Removed`.
3. Run local quality gates:
   - `pnpm exec tsc --noEmit`
   - `pnpm test`
   - `pnpm build`
4. Commit the version/changelog updates together with code changes.
5. Tag and push:
   - `git tag -a vX.Y.Z -m "vX.Y.Z — <one-line summary>"`
   - `git push origin vX.Y.Z`
6. Confirm the **Release** workflow run is successful (`.github/workflows/release.yml`).

## Automation behavior

- `CI` workflow validates pull requests and `main` branch pushes.
- `Deploy` workflow publishes GitHub Pages after CI passes for pushes to `main`.
- `Release` workflow triggers on `v*.*.*` tags, uses the matching `CHANGELOG.md` section as release body, and uploads a `dist` artifact bundle.

SemVer labels are the source of truth for release intent; commit-type labels are optional and not required by process policy.
