# Ad Fontes NT 1.0.0-rc.7 unified audit release

Date: 2026-09-12
Status: exact cross-platform candidate approved and published; superseded by RC8 for a display-count correction

RC7 incorporates the approved reconciliation of the independent second-pass audits, follow-up theological review, verified confessional-source corrections, and nine approved Volume One studies. It selects immutable Ordinary Means release `om-studies-2026-09-12-v8` and lexical release `dodson-2010-v5`. Scripture is unchanged.

## Source and verification

- Source commit: `b712dd903fefda178fcb73f8350921873c97a63d`.
- `npm run verify:both` passed 61 Node tests, 20 Python fidelity tests, TypeScript, the production web build, all 13,371 offline desktop files, and six desktop tests.
- Publication emits 39 approved comparison units with none withheld and reproduces 250 approved Ordinary Means articles.
- The three unsupported Western Acts cases remain deferred pending a reviewed source.

## Native artifacts

- Apple application notarization submission: `a27aaebd-57d7-466f-b9ee-11eec03043be` (Accepted).
- Apple DMG notarization submission: `4ad44bc6-03d0-47e0-8169-42e4682bcb10` (Accepted).
- The macOS application passes Developer ID verification and Gatekeeper assessment as `Notarized Developer ID`; the DMG passes checksum, stapler, and notarization validation.
- macOS public DMG SHA-256: `8414f50d19e8cfc9bac37cd89970206a5937d628eaddb0b435dadb6ed226bce9`.
- macOS updater archive SHA-256: `6dfa377dc26d00747d97315e6a1a95ab3c0060e4f088d632a2f6404dc7750d7d`.
- macOS updater signature-file SHA-256: `4256f3f9306cb033c82eb7f298fb62ffc6db00d0fef7571f897d922a39834086`.
- Windows GitHub run: `34713519610`; shared verification, Azure OIDC, Artifact Signing Public Trust, RFC 3161 timestamping, Authenticode verification, and artifact upload passed.
- Windows installer/updater SHA-256: `1eee57e02b4be859f649a66c778a2f316d0aca7d7f144e3e3dbf835e079bbf7c`.
- Windows updater signature-file SHA-256: `6067831aaf766dd94d1c9290fca6206f59a70a1f3bb58ac251f9b94fad49872d`.
- GitHub artifact ZIP digest: `sha256:a677975d4535b927853b96851946556274d472f23813f92a879eff85b0644273`.

## Exact publication approval

The combined immutable updater staging verifies both payloads. `stable/latest.json` SHA-256 is `5e174174a0de5e8a43c471fa130f9482e10f7db5c013c0661d64587896481742`; `SHA256SUMS` SHA-256 is `a8cd7e3bd6cb98e711eb7c299b3f5af7fd8c892dd6a1dd28559b3e52cf41d23c`. Larry explicitly approved the exact manifest hash on September 12, 2026. Approval authorizes this RC7 candidate's publication, not final v1.0.

Publication order is the immutable updater payloads and stable manifest, then public DMG/EXE, then the RC7 web application. Existing release artifacts remain immutable, and `larryherzogjr.com` remains outside scope.

## Publication and supersession

The host published the exact RC7 updater payloads and manifest, both public installers, and the RC7 web application. Both containers became healthy and `/api/health` returned `{"ok":true}`; the pre-update database backup is `backups/adfontes-before-update-20260912T194143Z.dump`. Independent full HTTPS downloads of the manifest, both updater payloads, the public DMG, and the public Windows installer totalled 569,520,615 bytes and matched every approved hash. Stable metadata returned `no-store`; versioned updater payloads returned one-year immutable caching; public packages returned attachment/noindex headers and supported byte ranges.

Post-publication verification found one stale display count shared by the web and desktop Sources page: it said 30 reviewed comparison notes while RC7 publishes 39. The immutable RC7 artifacts remain preserved; RC8 is the clean successor for that wording-only correction. No RC7 Scripture, commentary, study, or account data is invalidated.
