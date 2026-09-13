# Ad Fontes NT 1.0.0-rc.12 — 65-comparison expansion

Date: 2026-09-13

Status: locally promoted and verified; source commit, native artifacts and production publication pending

## Scope

RC12 combines the requested first two textual-comparison expansion releases. It adds 65 approved records (`candidate-40` through `candidate-104`) to the 39-record predecessor, for 104 approved comparison articles. The combined collection now represents all 27 New Testament books. The additional ten-unit viability reserve is excluded for separate review after these 65 additions reach production.

The release also selects 65 approved Codex Sinaiticus evidence plates backed by 60 unique complete-page CSNTM facsimiles. Each plate remains a source-specific witness claim with an explicit evidence limit; it is not a complete apparatus and does not establish the original reading.

No Scripture, publisher-source release, Greek analysis, lexicon entry, Ordinary Means Greek word-study article, personal-note API, account behavior, updater trust key or database behavior changes.

## Exact editorial approval

Larry Herzog Jr. explicitly approved both hashes on 2026-09-13:

- Editorial candidate-manifest SHA-256: `eecfd3d5e857970e6b6b6cfcb8bbc55d27b8a9365de618b7f9a97a6bebba35ee`
- Sinaiticus visual candidate SHA-256: `f707f4e5d20977c833dd3410ca11f1127dd38e0f8b49212ed4028652d4ee36e4`

The promotion records 65 matching review decisions, preserves the complete candidate evidence, publishes 104 approved articles with none withheld, and binds all new plates to the approved article payload hashes.

## Local verification

- `npm run verify:both` passed TypeScript checking, deterministic publication, the production web build, 71 Node tests, 20 Python tests, the desktop web build, 13,473 staged offline files and six desktop tests.
- The independent visual verifier passed 65 plate records, 60 immutable CSNTM pages and 180 checksum-bound source files.
- The production Library visibly reported 104 textual comparisons, 250 Greek word studies and 5,400 Greek lexicon lemmas.
- The Revelation 13:18 publisher-note direct link retained the exact selected passage and `candidate-104`, distinguished displayed-edition agreement from the publisher-noted 616 alternative, and rendered the approved Sinaiticus reading and evidence limit.
- The Ephesians 1:1 comparison direct link retained `candidate-89`, displayed all seven named edition rows, and rendered the first-hand/corrector distinction in its Sinaiticus plate.
- At normal width and 390×844, the complete-page manuscript enlargement stayed inside the viewport. Escape dismissed only the enlargement and restored focus to the exact trigger. No browser console warning or error was reported.

The existing non-fatal desktop JavaScript chunk-size warning remains.

## Remaining release gates

1. Review and approve the exact local source commit, then push it to private `main`.
2. Build, sign, notarize and independently verify the Apple Silicon artifacts from that source.
3. Run the private Windows Public Trust signing workflow from the same source and verify the downloaded artifacts.
4. Assemble the combined immutable updater staging and obtain exact manifest/artifact approval.
5. Publish the approved updater payloads and public installers, deploy the coordinated web application through the isolated host workflow, and complete independent HTTPS and rendered-live verification.

RC11 remains the current production release and immutable rollback until all gates above pass. RC12 does not claim a separately promoted final-v1.0 artifact.
