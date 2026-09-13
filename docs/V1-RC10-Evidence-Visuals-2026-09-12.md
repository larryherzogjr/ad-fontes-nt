# Ad Fontes NT 1.0.0-rc.10 evidence-visual release candidate

Date: 2026-09-12

Status: exact cross-platform candidate approved for publication preparation; not published or deployed

## Scope

RC10 is the coordinated web/macOS/Windows release candidate for AFNT-110 and
AFNT-111. It adds the accessible seven-edition summary to all 39 approved
textual-comparison articles and integrates locally bundled manuscript evidence
plates. No Scripture, approved commentary payload, lexical article, account,
note, database, or hosting behavior changes.

The selected immutable visual releases are:

- `csntm-2026-09-12-v1`, candidate SHA-256
  `6376169b7283a63288181286478c5cf6cfe2f5c4ce4bd4e3fb521055ab054318`;
  four approved pilot records and five displayed image assets.
- `csntm-sinaiticus-2026-09-12-v2`, candidate SHA-256
  `6bbbd387d8faff05c2c64aba32c8b2a48e11d4ea47ad434f4beddd713a318170`;
  39 approved records backed by 33 unique complete-page image assets.

Both releases retain separate exact owner approvals and current-commentary
bindings. The reader presents the v1 witness first and then the supplement.
Identical Sinaiticus manuscript/page records for candidates 26 and 27 remain in
the immutable registries but are shown only once. The result is at least one
plate for every article and two distinct witness plates for Mark 16:9–20 and
John 7:53–8:11. Edition summaries explicitly state that edition agreement is
not manuscript evidence.

## Accessibility and offline behavior

Every visual claim has a textual equivalent, precise manuscript/passage
locator, institutional credit, reuse statement, source link, alt text, and an
explicit statement of what it cannot establish. Complete-page images enlarge
in a keyboard-operable dialog with Escape dismissal and trigger-focus return.
The publisher rejects remote/traversing paths, missing approval, source checksum
drift and stale commentary bindings. Both desktop targets stage the same two
approved registries and all local image files; no image requires a network
request.

## Verification before source commit

- `npm test`: 69 Node tests and 20 Python tests passed.
- `npm run verify:both`: typecheck, deterministic import/publication,
  production web build, the same tests, 13,412-file desktop staging, desktop web
  build and six desktop tests passed.
- Production-browser checks covered the first and last new plates, direct URLs,
  reload, two-witness order, duplicate suppression, local paths, enlargement,
  Escape/focus restoration, 390×844 layout/lightbox, and console errors.
- The non-fatal desktop JavaScript chunk-size warning remains; no new runtime
  error was observed.

## Exact source and native artifacts

- Source commit: `f7a875c031eb76332d6667d795186d180870fa2c`.
- Private `main` was independently verified at that exact commit before native
  packaging.
- Final Apple application notarization submission:
  `6af28511-f067-4b09-9b2d-f17ba8a01618` (Accepted).
- Final Apple DMG notarization submission:
  `4c37b646-054c-44c2-97ea-0c7f2291d7ba` (Accepted).
- macOS public DMG SHA-256:
  `e61cbba2cd751fc9956f22821496e88ae17b1084c0ba3ca7772d55ea833a55bf`.
- macOS updater archive SHA-256:
  `30e825dc904f438c74963c11fbf9d5f0bdbd10ca132416f3b445b8a14a8dd84a`.
- macOS updater signature-file SHA-256:
  `5ce63b481e83d9cd6b3c0e3489ca0ce085c7d2ad33ea53ce318a819ca3e4e3de`.
- Windows GitHub run: `34735522835`; shared verification, Azure OIDC,
  Artifact Signing Public Trust, RFC 3161 timestamping, application/installer
  Authenticode verification and artifact upload passed with zero signing
  warnings or errors.
- Windows installer/updater SHA-256:
  `8e625861c997ffb08cf920f2604765f84ded1c7b22bfa2e00efa7616a7e37eb4`.
- Windows updater signature-file SHA-256:
  `bde4f83b0da18f86f248962c4f2a6f9de91e16fd978d4c7685dadad6bea11cae`.
- GitHub artifact ZIP digest:
  `sha256:a5562487b9ee08eaac1d25908a56384d051e9bcf4c64a43411e56611e10be452`.

The first Mac packaging pass used a stale local `.tauri` updater key. Its app
and DMG were accepted by Apple, but the build's key-mismatch warning excluded
all of that pass's bytes from RC10 staging. The complete pipeline was rerun
with the backed-up permanent key whose public half exactly matches the app
configuration. The final artifacts and submissions listed above showed no
key-mismatch warning. A read-only mount of the final DMG independently verified
version `1.0.0-rc.10`, arm64 architecture, strict/deep code signing, Gatekeeper
acceptance and the stapled notarization ticket.

## Exact updater approval and remaining gates

The combined immutable staging reproduces both updater payload hashes and
passes every entry in `SHA256SUMS`. `stable/latest.json` SHA-256 is
`c6f6ca828dd8aa5955b36ff7f66244ebf93592951b473f73efd30706d462d5cc`;
`SHA256SUMS` SHA-256 is
`7c30101af48acffc883573274bedc0d470f66c6b778fb37778cf54cc1360975d`.
Larry explicitly approved that manifest hash and its associated signed macOS
and Windows artifacts for publication preparation.

The remaining gates are review and push of the artifact-pin commit, explicit
publication/deployment authorization, host staging, immutable updater and
public-installer publication, coordinated web deployment, and independent live
verification. RC9 remains the published rollback release. Final v1.0 is not
claimed, and the current approval does not itself authorize hosted-server
changes.
