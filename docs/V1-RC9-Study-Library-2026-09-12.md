# Ad Fontes NT 1.0.0-rc.9 Study Library release

Date: 2026-09-12
Status: exact cross-platform candidate approved, published, and independently verified

RC9 adds the shared web/desktop Study Library. It exposes the 39 approved textual comparisons as the default browsable collection, all 250 approved Ordinary Means Greek word studies, and all 5,400 indexed Nestle 1904 lemmas while preserving the existing distinctions among textual comparisons, publisher notes, commentary, Scripture and lexical material.

## Source and verification

- Source commit: `611a31296db65debb54d68fd7ffd0e1975b042ea`.
- Private `main` was verified at that exact commit before native packaging.
- `npm run verify:both` passed 63 Node tests, 20 Python fidelity tests, TypeScript, the production web build, all 13,372 offline desktop files, and six desktop tests.
- The combined updater staging reproduced the exact native payload hashes and passed every entry in `SHA256SUMS`.

## Native artifacts

- Apple application notarization submission: `aec5be8e-0cd4-4b04-bd4d-4fd161829bd8` (Accepted).
- Apple DMG notarization submission: `2ee81ce9-c4a3-48bf-91e0-3f91cb1b522a` (Accepted).
- macOS public DMG SHA-256: `c37b4e776b148a26ec1fbfdbe2d341a6e3c928aeb18089818c947177813b2edb`.
- macOS updater archive SHA-256: `d47009f07ccf1d5c857e69ee8aaf591958537b95ccfe8196e079f2c761265484`.
- macOS updater signature-file SHA-256: `59852c2962dc4e65705632b88b03c612eb36778433c039cee7768b2657e9a8e1`.
- Windows GitHub run: `34721247540`; shared verification, Azure OIDC, Artifact Signing Public Trust, RFC 3161 timestamping, Authenticode verification, and artifact upload passed.
- Windows installer/updater SHA-256: `9eae0909282b60049c197b2cece758d88cd335de91d34abe9af59c52ebf5a34a`.
- Windows updater signature-file SHA-256: `0f51a757a8bd9131c72d3900f4f0cc98d0db340587a1b46274fcbbd16047c235`.
- GitHub artifact ZIP digest: `sha256:8a9194b16cee339d7dfbc3ce242abcba4b8f737688f92a56e65f518e398fb0df`.

## Exact publication approval

The combined immutable updater staging verifies both payloads. `stable/latest.json` SHA-256 is `64ee822a6cb8b85bba735c9c5e634159a96abdfd58ae7279dd59865bd06393b3`; `SHA256SUMS` SHA-256 is `092d33f7f3a6d454e9c871131ca6654438f862cd3b08815c2f29acabe1910f21`. Larry explicitly approved the exact manifest hash on September 12, 2026. Approval authorizes RC9 publication, not final v1.0.

Publication order is the immutable updater payloads and stable manifest, then public DMG/EXE, then the RC9 web application. RC8 remains immutable as the rollback release, and `larryherzogjr.com` remains outside scope.

## Publication verification

The host published the exact RC9 updater payloads and manifest, both public installers, and the RC9 web application. Both containers became healthy and `/api/health` returned `{"ok":true}`; the pre-update database backup is `backups/adfontes-before-update-20260912T223432Z.dump`.

Independent full HTTPS downloads of `stable/latest.json`, both updater payloads, the public DMG, and the public Windows installer totalled 570,994,397 bytes and matched every approved hash. Stable metadata returned `no-store`; versioned updater content returned one-year immutable caching; packages returned attachment/noindex and security headers and supported byte ranges. Both release directories denied listing with 403, and an unknown updater path returned 404.

Rendered live-browser checks confirmed that the Downloads page identifies RC9 and links the exact RC9 packages, while the Sources page identifies RC9 and all 39 reviewed comparison notes. The Library loaded all 39 comparisons as its default canonical collection, distinctly labeled the three publisher-note comparisons and routed them to publisher notes, and exposed the 250 Ordinary Means studies and 5,400 Nestle lemmas as separate collections. Search and shareable detail URLs opened the complete *Mystērion* article and its linked lemma record; the latter identified Dodson/Strong's 3466, reported 27 pinned Nestle occurrences, and rendered all 27 exact token links with the no-English-alignment limitation.

RC9 is the current published release candidate. RC8 remains available as an immutable rollback artifact. This approval and publication do not constitute final v1.0 acceptance.
