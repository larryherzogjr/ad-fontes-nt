# Ad Fontes NT 1.0.0 final release

Date: 2026-09-13
Operator: Larry Herzog Jr., publishing as Ordinary Means

## Decision and scope

Larry directed that the current release be marked `1.0.0` and authorized the
final-release workflow. This is a new coordinated web, macOS Apple Silicon and
Windows 11 x64 release from the approved RC13 successor source; it is not a
rename or byte-for-byte republication of the RC13 packages.

The final release contains the accepted Ad Fontes NT MVP plus the subsequently
approved expansion to 104 Textual Comparisons, the 250 Greek word studies, the
5,400-entry Greek lexicon, and the approved manuscript evidence plates. The
inline manuscript plate retains its dark viewing field on hover, and the
complete-artifact lightbox remains available.

No Scripture, Greek analysis, lexicon entry, word-study prose, textual-
comparison prose, evidence registry, account behavior or database schema is
changed by the final version promotion.

## Version and public presentation

The coordinated application version is `1.0.0` in npm, Tauri and Cargo
metadata. The Downloads and in-reader project-status copy identify 1.0.0 as the
public cross-platform release rather than a release candidate. Supported
desktop systems remain macOS Sonoma 14 or newer on Apple Silicon and Windows 11
x64. Private account-backed notes remain web-only.

The public installer paths are versioned under the existing guarded download
origin. RC13 remains immutable and available as the rollback release. Existing
release-candidate artifacts and their approvals do not authorize the new
1.0.0 bytes.

## Required verification and approvals

Before publication:

1. The exact final source commit must pass `npm run verify:both`, rendered web
   and offline-desktop checks, and owner review.
2. The Windows workflow must build and Public Trust sign from that exact commit.
3. The trusted Mac must build, Developer ID sign, notarize, staple and validate
   the 1.0.0 application, DMG and updater archive from that exact commit.
4. A combined immutable updater staging directory must reproduce both platform
   hashes and generate a new exact `stable/latest.json` hash.
5. Larry must approve that exact updater manifest and its associated signed
   artifacts. A subsequent artifact-pin commit must be approved before host
   publication and coordinated web deployment.
6. Independent HTTPS and rendered-live verification must follow publication.

The 48-hour soft-launch observation remains a post-publication gate before any
broader announcement. Final version approval does not manufacture elapsed
monitoring time.

## Preparation status

The coordinated 1.0.0 source preparation passed `npm run verify:both`: TypeScript
checking, deterministic imports and publication, 72 Node tests, 20 Python tests,
the production web build, staging of all 13,473 released offline files, the
desktop web build and six offline desktop tests. Focused final-version tests
also passed.

Rendered checks confirmed the final Downloads and Sources presentation, exact
1.0.0 installer links and a 390-pixel Downloads layout without horizontal
overflow. The offline desktop comparison at Matthew 23:13–14 retained the dark
manuscript viewing field after pointer interaction, opened the complete-artifact
view, closed it with Escape, retained the `Browse Textual Comparisons` return
link and produced no browser warnings or errors.

The exact source commit, signed artifacts, updater manifest, artifact-pin
commit, publication evidence and post-publication checks will be recorded here
as each remaining gate is completed. Until those records exist, RC13 remains
the live release.
