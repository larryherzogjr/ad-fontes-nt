# Ad Fontes NT 1.0.0-rc.5 resolved-audit candidate

Date: 2026-09-11  
Status: corrected cross-platform candidate approved, published and independently verified

Larry Herzog Jr. approved exact candidate-manifest SHA-256 `58cab201852f955de95af4ee2a3531a4f03708e867a0183bc884651a752792d8`. Promotion created immutable article release `om-studies-2026-09-11-v7` and refreshed the approval record for comparison unit `candidate-18`.

The content changes resolve the five findings deliberately held out of the preceding full-corpus audit release:

- `AUDIT-062`: use the supplied absolute author-site destination in Hades;
- `AUDIT-063`: remove the unidentified *The Knowledge of Him* reference in Epiphaneia;
- `AUDIT-064`: identify Nestle 1904, Robinson–Pierpont and the displayed Textus Receptus edition separately in Eusebeia;
- `AUDIT-065`: identify “for you” as the intended two-syllable phrase in Hyper;
- `AUDIT-086`: limit candidate-18's Textus Receptus description to the Stephanus, Elzevir and Scrivener basis documented by C7.

No Scripture, corpus mapping, lexical bundle, account behavior, source website, production service, public Downloads-page link, or existing RC4 binary changes. Because v7 changes future desktop bundle bytes, the coordinated local application version advances to `1.0.0-rc.5`; RC4 remains the public version until RC5 native artifacts pass the established signing, runtime-test, exact-manifest approval and publication gates.

## Desktop rebuild note

The first signed artifacts from source commit `ee8d472ef62345b2d2833e26ffa7c83472bce144` passed platform verification but exposed stale RC4 wording on the shared offline Sources page. They and combined manifest SHA-256 `755f05ab94e72b2ff3115675c0c26e54df2474541b68122bab2bd5cb247ecd6f` are superseded before publication.

The corrected native rebuild uses source commit `00dc789c3ffa7a9908746035d9b3c18682cac097`. The generated offline assets identify RC5 as the current cross-platform candidate and omit the stale predecessor-to-RC4 statement.

## Corrected native artifacts

- Apple accepted and notarized the corrected application submission `ea05aec5-7739-4a35-ba35-d837f9074c66` and DMG submission `dba8d97f-b5b4-4dae-b5b7-ba441547c2ce`. The application passes strict/deep Developer ID verification and Gatekeeper assessment as `Notarized Developer ID`; stapler validation passes for both app and DMG; the disk image verifies; the executable is arm64; and the bundle reports `1.0.0-rc.5`.
- macOS public DMG SHA-256: `08c7848e27d80e5fb080320ddf57b2a9121013a9cc7cba9f881bcadcd25d9596`.
- macOS updater archive SHA-256: `09096757f5d497d49c0e1532441637d2c0e132589833c0980e713eaadae60cbc`.
- Windows GitHub run `34671491804` passed shared verification, Azure OIDC, Artifact Signing Public Trust, RFC 3161 timestamping, Authenticode verification and artifact upload. Downloaded build metadata identifies commit `00dc789c3ffa7a9908746035d9b3c18682cac097`, version `1.0.0-rc.5`, `om-studies-2026-09-11-v7`, 250 articles, Windows x64 and publisher Larry Herzog Jr.
- Windows installer/updater SHA-256: `82f47ac80bcd1655a25757fdaa6db233388fee2d0ade5d381d4b11f03b726276`.
- GitHub artifact ZIP digest: `sha256:9a54629ff2c586299ee828b8c282a842d48615069f9f01a2500dbec8e3534e88`.

## Exact publication approval

The combined immutable updater staging verifies both payloads. `stable/latest.json` SHA-256 is `0eb72f44b406d26275003ac78fabbf5c286aa2b74d3c10e50fb96bd5dcf0d286`; `SHA256SUMS` SHA-256 is `8ff29dc75899a77fafd04ec31b65862c6ee94e837860d4d10e61034f491d33b8`. Larry explicitly approved the exact manifest hash on September 12, 2026. Approval authorizes this candidate's publication, not final v1.0.

## Publication verification

The host fast-forwarded cleanly to `48dbcf4`, verified both updater payloads and both public-download packages, published the immutable RC5 updater directory and stable manifest, published the public DMG and Windows installer, and rebuilt the web application. The database backup is `backups/adfontes-before-update-20260912T052111Z.dump`; both containers became healthy and `/api/health` returned `{"ok":true}`.

Independent HTTPS downloads of all five live files totalled 569,475,424 bytes and matched the approved manifest and four artifact hashes exactly. Stable metadata uses `no-store`; versioned updater payloads use one-year immutable caching; public installers use attachment/noindex headers; all payloads support byte ranges. Unknown updater paths return 404 and the public download directory denies listing with 403. The live Downloads page contains only the RC5 DMG and EXE links, and the deployed Sources client identifies RC5 as the current cross-platform candidate without the superseded predecessor-to-RC4 wording. `larryherzogjr.com` was not changed.
