# Ad Fontes NT 1.0.0-rc.12 — 65-comparison expansion

Date: 2026-09-13

Status: exact cross-platform candidate approved for publication preparation; RC11 remains published

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

## Exact source and native artifacts

- Source commit: `585298bbab829daa2ca3f3724bd916531364ce6d`.
- Private `main` independently resolved to that exact commit before the final
  native packaging passes.
- The first private Windows run correctly rejected the clean checkout because
  a verifier referenced an ignored editorial-candidate path. The approved
  successor commit reads the exact-hash-identical promoted evidence instead;
  it changes no approved article, visual or release payload hash.
- Apple application notarization submission:
  `042813df-53e6-4faa-9dc9-d2f6de4ff0e5` (Accepted).
- Apple DMG notarization submission:
  `81d73815-9885-466f-8999-54ba90fa9009` (Accepted).
- macOS public DMG SHA-256:
  `5f74b55430312af0f0f50f3ef7b73508e2f3077cf8e061615c8fcd5df26d3474`.
- macOS updater archive SHA-256:
  `347905e9bf8561cc42071e2b28747970d7df3df13103014e0f988a9b1858e1d1`.
- macOS updater signature-file SHA-256:
  `9c9adbc396ce0edbf00b3ab4642950a184364bceeebde9464b02aeea9b4a494f`.
- Windows GitHub run: `34744575140`; clean shared verification, Azure OIDC,
  Artifact Signing Public Trust, RFC 3161 timestamping, Authenticode
  verification and artifact upload passed.
- Windows installer/updater SHA-256:
  `9f9d5457a6919d93214725f515ac2290a742b5677ae9c22b944f7308240d7fe5`.
- Windows updater signature-file SHA-256:
  `1f68eed2bf44f39f6dc34b49ae99103a93b58c648cb085249e9c5d9b39a65ec6`.
- GitHub artifact ZIP digest:
  `sha256:76388085f4e7df4619b2eab187f89bcb1596f5148671e6cfe8b2f0a33890101a`.

The permanent updater public key matched the key embedded in the release
configuration. A read-only mount of the final DMG independently verified
version `1.0.0-rc.12`, arm64 architecture, strict/deep code signing,
Gatekeeper acceptance and the stapled notarization tickets for both the app
and DMG.

## Exact updater approval and remaining gates

The combined immutable staging reproduces both updater payload hashes and
passes every entry in `SHA256SUMS`. `stable/latest.json` SHA-256 is
`5402463c177d1959e92eef5c8d857dd44c08d9eabc2af56468b7cf2a3cacaefc`;
`SHA256SUMS` SHA-256 is
`8f9276896b77d8ebeff678792dfb1705c48f5f85f7a3b327baaf508c40664ff8`.
Larry explicitly approved that manifest hash and its associated signed macOS
and Windows artifacts for publication preparation.

The remaining gate is approval of the exact artifact-pin commit and explicit
publication authorization. Only then may the approved updater payloads,
manifest and public installers be published, followed by the coordinated web
deployment and independent HTTPS and rendered-live verification.

RC11 remains the current production release and immutable rollback until that
gate and live verification pass. RC12 does not claim a separately promoted
final-v1.0 artifact.
