# Ad Fontes NT 1.0.0-rc.11 macOS lightbox correction

Date: 2026-09-13

Status: exact cross-platform candidate approved for publication preparation; RC10 remains published

## Scope

RC11 is a narrowly scoped coordinated web/macOS/Windows successor candidate for
AFNT-112. It corrects manuscript-image enlargement in the macOS Tauri/WebKit
application. The RC10 implementation placed a fixed-position Base UI portal
inside the reader's study `<dialog>`; WebKit constrained that overlay to the
study panel instead of the application viewport. The browser presentation was
not affected.

The correction uses a body-portaled native top-layer `<dialog>` for manuscript
enlargement. It centers the complete artifact against the full application
window, isolates Escape/cancel handling from the enclosing study dialog, and
restores focus to the exact `Enlarge` trigger. The reviewed title, locator, alt
text, caption guidance and locally bundled image remain unchanged.

No Scripture, approved commentary, lexical content, visual-source registry,
source image, caption, rights record, commentary approval hash, account,
database, hosting behavior, updater trust key or update-channel configuration
changes. RC10 remains intact as rollback.

## Verification before source commit

- A separately named local macOS debug application reproduced RC10's clipping
  and verified the correction in the Tauri WebKit runtime at the normal
  1280-pixel window and a true 390-pixel window.
- Both widths retained the complete artifact without panel clipping or
  horizontal overflow. Keyboard Escape dismissed only the enlargement,
  preserved the direct-linked comparison and restored focus to the exact image
  trigger.
- A local production-browser check repeated open, complete-artifact rendering,
  Escape dismissal, direct-link retention and focus restoration at 2 Peter
  3:10.
- `npm run verify:both` passed TypeScript checking, deterministic publication,
  production web and desktop builds, 69 Node tests, 20 Python tests, staging of
  all 13,412 released offline files and six desktop tests. The existing
  non-fatal desktop bundle-size warning remains.

## Exact source and native artifacts

- Source commit: `c6c9da8b8a19e391105bc6b104e2791056daa9d9`.
- Private `main` independently resolved to that exact commit before native
  packaging.
- Apple application notarization submission:
  `108b07d8-7a36-427d-9b4d-73383b146686` (Accepted).
- Apple DMG notarization submission:
  `90d5a3e7-1061-431c-9257-ba9afd32174b` (Accepted).
- macOS public DMG SHA-256:
  `b7823dc4d4b3819770668d84485caa4b736eb022efd2b03ebdabb46f9fb489f0`.
- macOS updater archive SHA-256:
  `32ea4d0892089581424f78f29eec1a20f568f125c0dfa4d8029be75bcc4840dc`.
- macOS updater signature-file SHA-256:
  `4fd9047ce87109c04382aed504aecacae391036b9484108d44ac53c4ef8ecbd0`.
- Windows GitHub run: `34741424552`; shared verification, Azure OIDC,
  Artifact Signing Public Trust, RFC 3161 timestamping, Authenticode
  verification and artifact upload passed.
- Windows installer/updater SHA-256:
  `98a32ae5c941b77e22468b69747dcd538330f14dcd3a6a30fee1b9b2591ac742`.
- Windows updater signature-file SHA-256:
  `c4433da224b3259c2c49eee8275d19459ec454469dc6557d65c3620dd47220f4`.
- GitHub artifact ZIP digest:
  `sha256:ed03cc8932c9c2233902167003a07ae772e2a8a31348735999a5665f5533f453`.

The permanent updater public key matched the key embedded in the release
configuration. A read-only mount of the final DMG independently verified
version `1.0.0-rc.11`, arm64 architecture, strict/deep code signing, Gatekeeper
acceptance and the stapled notarization ticket.

## Exact updater approval and remaining gates

The combined immutable staging reproduces both updater payload hashes and
passes every entry in `SHA256SUMS`. `stable/latest.json` SHA-256 is
`fed9806eb3292859cd85cd6417db9bbb2139f98c592dfec4d71ab02b543fe747`;
`SHA256SUMS` SHA-256 is
`2d5795d075b038fdf2e9945e86d58e46052c1bdd3c3bc7f0bfacaeb759cd80af`.
Larry explicitly approved that manifest hash and its associated signed macOS
and Windows artifacts for publication preparation.

The remaining gates are review and push of the artifact-pin commit, explicit
publication/deployment authorization, host staging, immutable updater and
public-installer publication, coordinated web deployment, and independent live
verification. RC10 remains the published rollback release. Final v1.0 is not
claimed, and the current approval does not itself authorize hosted-server
changes.
