# Ad Fontes NT 1.0.0-rc.6 copy-selection candidate

Date: 2026-09-12  
Status: exact cross-platform candidate approved, published and independently verified

RC6 adds a persistent **Copy selection** action beside Edit/Clear for a canonical passage. It copies authoritative Scripture segment text without rendered verse numbers and appends the compact canonical passage plus the full edition name. Highlighted-text copying applies the same exclusion to verse-number and marker controls.

## Source and verification

- Source commit: `f55642e4862a27d5321fb2ce3a92225be74782d1`.
- `npm run verify:both` passed 59 Node tests, 19 Python fidelity tests, TypeScript, the production web build, all 13,371 offline desktop files and six desktop tests.
- Production Chrome checks covered the persistent and floating copy actions, pointer and Enter activation, exact footers, absence of inline verse numbers and a 390×844 mobile viewport.
- Larry Herzog Jr. tested the exact native RC6 packages on macOS Apple Silicon and Windows 11 and reported that both passed.
- No Scripture, commentary, corpus mapping, account behavior or `larryherzogjr.com` file changed.

## Native artifacts

- Apple application notarization submission: `e7989bc8-3f83-4e0b-b1af-f3686d05af8a` (Accepted).
- Apple DMG notarization submission: `0b589f08-f656-407f-b1c1-4c56abac917c` (Accepted).
- The application inside the DMG passes strict/deep Developer ID verification, Gatekeeper assessment as `Notarized Developer ID`, and stapler validation. The application extracted independently from the updater archive passes strict/deep signature verification.
- macOS public DMG SHA-256: `881f394d11d811b1646db61ddbdaabf0b1279034f086b0586a89571ca31779e6`.
- macOS updater archive SHA-256: `cf344b8bc0b579d16d719879d09bb783edf637712562c470b5674fbda943214d`.
- macOS updater signature-file SHA-256: `7f4cdf026279fba62900bb9560ff2e5cd548b00a8ab0e59c76e3db82a3023470`.
- Windows GitHub run: `34678897368`; shared verification, Azure OIDC, Artifact Signing Public Trust, RFC 3161 timestamping, Authenticode verification and artifact upload passed.
- Windows installer/updater SHA-256: `097aba981ba29e97691a553ab90f3cce8369425311cd4c9736f4fe7972b4e508`.
- Windows updater signature-file SHA-256: `a4df30ebf0c3cbcf42d21f51b651c270428fdb3b830c0f786d466d0659672f5d`.
- GitHub artifact ZIP digest: `sha256:432c7f7b83682ef179c3032386858d1d280804a946baeb39f1d0177e4f63ece1`.

## Exact publication approval

The combined immutable updater staging verifies both payloads. `stable/latest.json` SHA-256 is `7ad5c73b2fbfdd13b30f8a876b4cfbd020748979c64cea46a717101339bbba73`; `SHA256SUMS` SHA-256 is `d13e8c9612f100b91cee0127a873f33486ad501a596aa2518c22c57405cf6f4a`. Larry explicitly approved the exact manifest hash on September 12, 2026. Approval authorizes this candidate's publication, not final v1.0.

Publication was authorized to install the immutable updater payloads and stable manifest first, then the public DMG/EXE, and only then deploy the RC6 Downloads/Sources web copy. Existing RC5 artifacts remain immutable, and `larryherzogjr.com` remains outside scope.

## Publication verification

The host fast-forwarded cleanly to `9b778ae19e4fa5cc9640e2832fcbc41d9e7698e5`, verified both updater payloads and both public-download packages, published the immutable RC6 updater directory and stable manifest, published the public DMG and Windows installer, and rebuilt the web application. The database backup is `backups/adfontes-before-update-20260912T072525Z.dump`; both containers became healthy and `/api/health` returned `{"ok":true}`.

Independent full HTTPS downloads of the manifest, both updater payloads, public DMG and public Windows installer totalled 569,476,512 bytes and matched all approved hashes. Stable metadata uses `no-store`; versioned updater payloads use one-year immutable caching; public installers use attachment/noindex headers; payloads support byte ranges. The public directory denies listing with 403 and an unknown updater path returns 404. The live Downloads page contains only the RC6 DMG and EXE links, the live Sources page identifies RC6 as the current cross-platform candidate, and a live John 1:1–5 passage exposes Edit selection, Clear selection and Copy selection. Application health is good. `larryherzogjr.com` was not changed.
