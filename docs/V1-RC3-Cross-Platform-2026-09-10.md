# Ad Fontes NT 1.0.0-rc.3 cross-platform candidate — 2026-09-10

`1.0.0-rc.3` is the first assembled desktop update candidate containing both supported public-release targets: macOS Sonoma 14+ on Apple Silicon and Windows 11 x64. It is built from source commit `813adc234a9ec21cef7d0a275fb5c765986dfb1f`. Publication of this release candidate does not approve public v1.0.

## Shared verification

- `npm run verify:both` passed at `1.0.0-rc.3`: TypeScript checking, 53 Node tests, 19 Python fidelity tests, the production web build, the offline desktop build, all 13,371 released desktop files and five desktop test groups.
- The selected Ordinary Means release remains the approved `om-studies-2026-09-10-v5` with 250 articles. Scripture, analysis, lexical and article bytes are unchanged from the approved predecessor candidate; this release changes coordinated package versions and release tooling only.
- The macOS release script now selects the DMG by exact configured version and confirms the bundle version, preventing a stale predecessor DMG from satisfying release checks.

## macOS Apple Silicon

- Tauri built the arm64 application, Developer ID signed it as `Developer ID Application: Larry Herzog (GY28US5AR3)`, and Apple accepted application notarization submission `bec7fc71-bcb5-4c8b-9931-d8d9f3d10a5e`.
- The app was stapled. Strict/deep `codesign` verification, the designated requirement, Gatekeeper assessment and stapler validation passed; Gatekeeper reports `Notarized Developer ID`.
- Apple accepted DMG notarization submission `073252de-5d0d-4d2f-b0a8-85396228910d`. Stapling, stapler validation and `hdiutil verify` passed.
- DMG SHA-256: `7e0a75293e9f8fc69f4ed44dab51abb78caf92856ad9ae7fb89e94310e9bc61e`.
- Updater archive SHA-256: `4f2ba847dd74642cd4498b6ea5c1440ef9437ef25dac028d16d473c01e9b52c4`.
- Updater signature-file SHA-256: `a4e541405af928f91470050cb471ce59965ad4017756efd70d7e00d3f3d9b45f`.

## Windows x64

- Private GitHub run `34564441422` passed every shared and Windows step from the same source commit. Azure OIDC, the pinned Artifact Signing client, service preflight, application signing, NSIS signing, SignTool verification, updater signing and artifact upload all succeeded.
- The application and installer chains identify `Larry Herzog Jr.`, have verified RFC 3161 timestamps, and report zero SignTool warnings and errors.
- Uploaded artifact: `Ad-Fontes-NT-Windows-x64-signed-1.0.0-rc.3`; GitHub artifact digest `sha256:bea0f2468201832a9fe124f8d9f4b9179f5cd8562417073a1947d3a85de95a34`.
- Installer/updater SHA-256: `cbd6dc296dfcdcc9422878a91c07a26b94961932b7bda3fee89d3896d3676b64`.
- Updater signature-file SHA-256: `f5692d0e60c06bb37aa016c500350323deff23ec5ef406e6f64e9a41d68c24c9`.
- The downloaded artifact's checksum file and `BUILD-INFO.json` independently match the source, version, OM release and both hashes.

## Combined immutable staging

- `scripts/desktop_update_manifest.mts` assembled both updater platforms under ignored local staging `artifacts/desktop/updates/1.0.0-rc.3-staging/`. Both staged release files pass SHA-256 verification.
- Candidate `latest.json` SHA-256: `8d74842e39a0dab2871f80eb09ac6dd90263cd89135d541278df0d1ab6137315`.
- Candidate `SHA256SUMS` SHA-256: `5a2a92c3772fd95c66ebc678faf15e6456bb7a7b2081c5b8ef6032d20e274786`.
- The previously served macOS-only `1.0.0-rc.2` directory remains immutable.

## Windows acceptance and publication — 2026-09-11

- Larry confirmed that the exact RC3 package works on Windows 11 and explicitly approved publication of combined manifest SHA-256 `8d74842e39a0dab2871f80eb09ac6dd90263cd89135d541278df0d1ab6137315`.
- The two locally and remotely verified payloads were published under immutable `releases/1.0.0-rc.3/` paths, and the approved manifest was installed atomically at `stable/latest.json`. The existing web containers were not rebuilt, and `larryherzogjr.com` was not changed.
- An independent HTTPS fetch returned the exact approved manifest hash and version `1.0.0-rc.3`, with both supported platforms. Full public downloads independently matched macOS SHA-256 `4f2ba847dd74642cd4498b6ea5c1440ef9437ef25dac028d16d473c01e9b52c4` and Windows SHA-256 `cbd6dc296dfcdcc9422878a91c07a26b94961932b7bda3fee89d3896d3676b64`.
- Mutable metadata returns `Cache-Control: no-store`; the Windows release returns one-year immutable caching and attachment disposition. The app health endpoint and homepage return HTTP 200, an unknown updater object returns HTTP 404, and the prior RC2 archive still matches SHA-256 `44e2b4928622464440e0190b1d4b3db4772278b0224c9963edb00302f203b63d`.
- The host command reported `Invalid checksum entry` only after publishing because the post-publication validator omitted underscore from its permitted filename characters. The Windows filename legitimately contains `x86_64`. Independent public-byte verification proved the publication complete. The validator now accepts underscore and validates every checksum entry before any publication mutation, preventing the same false failure and improving future preflight safety.

Remaining gates are the real `rc.2` to `rc.3` Mac updater rehearsal, a Windows updater rehearsal from an installed predecessor, and explicit public v1.0 approval. Windows uninstall remains unrecorded unless separately exercised.
