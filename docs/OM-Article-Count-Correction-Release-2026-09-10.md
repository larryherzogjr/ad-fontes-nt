# OM article count-correction release — September 10, 2026

Release: `om-studies-2026-09-10-v5`  
Predecessor: `om-studies-2026-09-09-v4`

Larry Herzog Jr. approved correction candidate `om-count-corrections-2026-09-10-v2` against candidate-manifest SHA-256 `bf5683ff39806cde1eb729d165473591bc744bbdca213ab200a2eccc8c27e612` on September 10, 2026.

The immutable release changes ten exact statements across six articles:

- Anthropos: *Ecce homo* is two Latin words.
- Anomia: *Hē hamartia estin hē anomia* is five Greek words.
- Logos: *En archē ēn ho logos* is five Greek words.
- Pistos ho logos: the eight-word Greek count is no longer applied to the nine-word English rendering.
- Pater: the discussion identifies three elements rather than calling a four-word phrase one word.
- Kyrios: *Kyrios Iēsous* is consistently distinguished as two Greek words from the three-word English “Jesus is Lord”; “Lord, have mercy” is no longer identified as that same creed.

The other 244 article files are byte-for-byte unchanged from v4. The original v30 BSB adaptation provenance, validator information, BSB source checksum and predecessor bytes remain preserved. No Scripture, corpus mapping, article identity, URL, source attribution or substantive theological conclusion changed. `larryherzogjr.com` remains unchanged.

The shared selector uses v5 for both web and desktop builds. The exact approval, candidate manifest, correction specification, review rendering and validation record are stored under the release’s `evidence/` directory and covered by its manifest checksums.

Verification passed with 53 Node tests, 19 Python tests, TypeScript checking, both production builds, all 13,371 staged offline files and five desktop tests. The release tests assert each approved replacement and the 244 unchanged predecessor files. A local browser check opened Anthropos from the John 19:5 Greek-token deep link, displayed “Two Latin words,” and confirmed Escape dismissal returns focus to the originating study control.

Native candidate packaging was also refreshed from the committed v5 selector:

- The Apple Silicon `1.0.0-rc.1` DMG passed `hdiutil verify`, strict/deep ad-hoc signature validation, arm64 architecture and bundle-version checks. Its SHA-256 is `4396f0c62802ed792616a8c246ecfab438d52b53a656b155f59b1299e4b0e055`. The binary contains the v5 article paths. This local package is not Developer ID signed, notarized or updater-signed and therefore is not a public Mac release artifact.
- Windows x64 beta build 9 passed shared verification and native NSIS packaging in [GitHub run 34537586195](https://github.com/larryherzogjr/ad-fontes-nt/actions/runs/34537586195) at source `c07654114279ea643c5eabd600913988989da732`. The downloaded `1.0.0-rc.1` installer metadata identifies `om-studies-2026-09-10-v5`, and its computed SHA-256 matches both build metadata and `SHA256SUMS.txt`: `1c3e488253d4368d53835e94a9c99ab70989422edb958cbf7e7d599c6ee6be58`. It is intentionally labeled an unsigned beta, not a signed stable updater artifact.

This release is selected locally but has not been deployed. Existing production services and published desktop packages still use v4 until a separately approved release rollout.

The author-site follow-up is intentionally separate and documented in `docs/LarryHerzogJr-Greek-Article-Count-Corrections-Handoff-2026-09-10.md`.
