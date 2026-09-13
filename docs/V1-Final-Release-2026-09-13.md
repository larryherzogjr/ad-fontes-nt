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

Larry approved exact final source commit
`e6886747fc4cfd865dbcbd613705f1f265fafdb0`. It was pushed to private
`main`, and the remote branch independently resolved to that same hash before
either native build began.

## Approved signed native artifacts

- Apple application notarization submission:
  `31aba24a-4896-451b-841d-dbc889abe553` (Accepted).
- Apple DMG notarization submission:
  `0f47b6a5-6506-4ce5-90d0-874f76a40a0c` (Accepted).
- macOS public DMG SHA-256:
  `1f4043b5f35087a086ecc01b23a335056035b4bf3e37ef979e48bc4fcdb0007e`.
- macOS updater archive SHA-256:
  `34a466179b208d3315bfe3032776cc6b5b0781d7041fa9aef8850d17effbb3b5`.
- macOS updater signature-file SHA-256:
  `3ab298d0ed7fe94d9623a5ac582096bcc67263cfb4f576d7a4eed1b85f58c866`.
- Windows GitHub run: `34758730101`; clean shared verification, Azure OIDC,
  Artifact Signing Public Trust, RFC 3161 timestamping, Authenticode
  verification and artifact upload passed at the approved source commit.
- Windows installer/updater SHA-256:
  `e07550f4721926f21a8c4ea7cfd02bcbe587a0cddb38323b74db5acec1f8f724`.
- Windows updater signature-file SHA-256:
  `3d35698804c4918571cf5cfcbd767209477899973d68dab242f1bb325ccea5d5`.
- GitHub Windows artifact ZIP digest:
  `sha256:34f3c4ff0455652b935a98c3979affe6bd22a77e17c63d517d5653c11d825151`.

Independent macOS verification reproduced all three supplied hashes, confirmed
version `1.0.0` and arm64 architecture in a read-only mount of the DMG, and
passed strict/deep signing, Gatekeeper and stapler validation. The downloaded
Windows artifact reproduced its internal checksums and exact source, version,
release, publisher and signing metadata.

## Approved updater candidate

The combined immutable staging reproduces both updater payloads and passes
every entry in `SHA256SUMS`. It has publication date
`2026-09-13T13:26:32Z` and release note: “Publishes Ad Fontes NT 1.0.0 with 104
textual comparisons, 250 Greek word studies, the 5,400-entry Greek lexicon, and
manuscript evidence plates.”

- `stable/latest.json` SHA-256:
  `3f38c09c9e5e13886f0e0c8ed666abb5341a7f7ee821b76455ec6b0d815ab141`.
- `SHA256SUMS` SHA-256:
  `159930cb4b74a542d96fd3a383454dc320e75c752de45a3eaa411a8088d209d1`.

Larry approved that exact manifest and all associated signed artifacts. The
artifact-pin commit, publication evidence and post-publication checks remain to
be recorded. Until publication succeeds, RC13 remains the live release.
