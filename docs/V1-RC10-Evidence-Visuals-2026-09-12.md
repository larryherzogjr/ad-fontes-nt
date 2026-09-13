# Ad Fontes NT 1.0.0-rc.10 evidence-visual release candidate

Date: 2026-09-12

Status: local source candidate; not pushed, signed, published or deployed

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

## Remaining release gates

1. Create and review the exact local source commit.
2. Obtain Larry's explicit approval before pushing that commit to private
   `main`.
3. Build, sign, notarize and verify the macOS artifacts and build/sign/verify
   the Windows x64 artifacts from that exact source.
4. Combine updater payloads, generate the exact stable manifest and public
   installer checksum set, and obtain Larry's exact-hash approval.
5. Publish immutable updater artifacts and public installers, then deploy the
   coordinated web update and perform live verification. RC9 remains the
   rollback release. Final v1.0 is not claimed.

No release step beyond local preparation is authorized by the visual-source
approval alone.
