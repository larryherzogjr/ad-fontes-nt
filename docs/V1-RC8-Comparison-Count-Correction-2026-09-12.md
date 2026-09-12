# Ad Fontes NT 1.0.0-rc.8 comparison-count correction

Date: 2026-09-12
Status: exact cross-platform candidate approved; publication authorized

RC8 corrects the shared Sources-page project-status count from 30 to 39 reviewed comparison notes. It otherwise retains RC7's exact Scripture, commentary, study, lexical, account, and updater behavior.

## Source and verification

- Source commit: `45b70710fa0c4e47fb6ccd63c9ac14d2bd9f829b`.
- `npm run verify:both` passed 61 Node tests, 20 Python fidelity tests, TypeScript, the production web build, all 13,371 offline desktop files, and six desktop tests.
- Regression coverage requires “39 reviewed comparison notes” and rejects the stale “30 reviewed comparison notes” phrase.
- The exact Mac updater archive reports `1.0.0-rc.8`, passes strict/deep Developer ID verification, and passes Gatekeeper assessment as `Notarized Developer ID`.

## Native artifacts

- Apple application notarization submission: `fdbde350-7509-462c-ad4e-12229a5085b0` (Accepted).
- Apple DMG notarization submission: `87ae4692-e2f4-42e9-bfe7-f2ba812eb423` (Accepted).
- macOS public DMG SHA-256: `6cf05244c591b6954b97c9434495a8d337ef4d1842b267ce7e89b77ab786f24b`.
- macOS updater archive SHA-256: `2b3c4492183e1af87c80d9c367ed116614399710e45821e99edd6cab67fd2b50`.
- macOS updater signature-file SHA-256: `dfe4de765e8af5b403090cc06ac343d0efe4fe5a922fd92ca9e2aa4f7a872da2`.
- Windows GitHub run: `34715260900`; shared verification, Azure OIDC, Artifact Signing Public Trust, RFC 3161 timestamping, Authenticode verification, and artifact upload passed.
- Windows installer/updater SHA-256: `240ae537e00ba02e809c37315689da1bf97a35f4ec57214b92e58dc7c3129e9c`.
- Windows updater signature-file SHA-256: `4c210f4d2e0c60dcc1f70b81d2a46b583eaaaf285a3c55bb5bf8d5674deed8a2`.
- GitHub artifact ZIP digest: `sha256:b2be5a5c55ba14a8742e8ad776870fa6f6e046a68fea475d81551108ad0f66f2`.

## Exact publication approval

The combined immutable updater staging verifies both payloads. `stable/latest.json` SHA-256 is `ed1a865c5c1c2918e610e5dadf02a9cda5bbed476f4c54e05b0fbf1fb423453a`; `SHA256SUMS` SHA-256 is `9ffa3b3abadc9da28440afe5c2f8541a0d85d77bc07f9663b22f4c35b1906bc2`. Larry explicitly approved the exact manifest hash on September 12, 2026. Approval authorizes RC8 publication, not final v1.0.

Publication order is the immutable updater payloads and stable manifest, then public DMG/EXE, then the RC8 web application. RC7 remains immutable, and `larryherzogjr.com` remains outside scope.
