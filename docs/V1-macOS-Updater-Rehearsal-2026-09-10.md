# macOS hosted updater rehearsal — 2026-09-10

This record covers the real hosted update from Ad Fontes NT `1.0.0-rc.1` to `1.0.0-rc.2` on Larry's Apple Silicon Mac. It proves the macOS update mechanism for this release line; it is not approval of public v1.0 or a claim about Windows.

## Published candidate

- RC2 was a version-only rebuild of the approved RC1 application at source `effacba0059623bcdd04cc0e627ee8c4d5299211`; both use Ordinary Means release `om-studies-2026-09-10-v5`.
- `Developer ID Application: Larry Herzog (GY28US5AR3)` signed the application. Apple accepted application notarization submission `c0f1aa00-8c60-4360-8ad0-273871208686` and DMG submission `5aa0a6e3-c02a-4bfe-a71f-dc63f7a67216`.
- The preserved DMG SHA-256 is `00611c7f5b55ddd50417b84df0cf7ea36a17b0594e1783de933b3221dd774441`. The signed updater archive SHA-256 is `44e2b4928622464440e0190b1d4b3db4772278b0224c9963edb00302f203b63d`; the detached updater-signature file SHA-256 is `4e82b645d8210c55e34d9e69e614b389419b8e2b7c0aa64f343b76906ebbcfda`.
- Before publication, the three preserved RC2 files matched their recorded checksums and `hdiutil verify` reported a valid disk-image checksum. The build itself had already passed strict app signing, Gatekeeper, notarization and stapling checks. The updater archive signature was then exercised by the real application during installation.

## Host publication

- The approved release branch was fast-forwarded to the private repository's `main`; the clean Ubuntu checkout was fast-forwarded through the documented host-pull workflow. The running web containers were not rebuilt or restarted.
- The host accepted the guarded updater installation at repository commit `2a70a250b5c2caa0658fab4c6dcdee93bc299fd3`. It verified the previously inspected Nginx baseline, validated Nginx before and after replacement, reloaded successfully, checked the staged archive SHA-256, and published RC2. Warnings about repeated protocol options came from the unrelated `euphonium.studio` configuration and did not fail either Nginx validation.
- The mutable metadata endpoint is `https://ad-fontes.app/desktop-updates/stable/latest.json`. It returns HTTP 200, version `1.0.0-rc.2`, the expected nonempty signature, and `Cache-Control: no-store`.
- The immutable archive endpoint is `https://ad-fontes.app/desktop-updates/releases/1.0.0-rc.2/ad-fontes-nt-1.0.0-rc.2-darwin-aarch64.app.tar.gz`. It returns HTTP 200 with immutable one-year caching and attachment disposition. Independently downloaded bytes have SHA-256 `44e2b4928622464440e0190b1d4b3db4772278b0224c9963edb00302f203b63d`, exactly matching the local and Ubuntu staging records.
- Both updater response types set HSTS and `X-Robots-Tag: noindex, nofollow, noarchive`; unrecognized paths under `/desktop-updates/` return 404. The existing application health endpoint still returned `{"ok":true}` and the home page returned 200 after reload.

## End-to-end result

- The installed, notarized RC1 at `/Applications/Ad Fontes NT.app` identified itself as `1.0.0-rc.1`. Its manual check found RC2 and displayed the exact version-only release note.
- Larry's explicit release authorization covered the rehearsal. The test selected **Download and install**. The application downloaded and authenticated the hosted archive, replaced itself, and relaunched without manual copying or a macOS security prompt.
- The relaunched app retained its John 1:18 BSB reading location and identified itself as `1.0.0-rc.2`. A second manual check reported that `1.0.0-rc.2` was up to date.
- The installed `Info.plist` reports both short and bundle versions as `1.0.0-rc.2`. With normal macOS Security-framework access, strict/deep `codesign` verification passed, the designated requirement was satisfied, the authority chain ended at Apple Root CA with Team ID `GY28US5AR3`, and Gatekeeper accepted the updated bundle with source `Notarized Developer ID`.

## Limits and next decision

- This verifies one normal manual update on the supported Apple Silicon architecture. It does not exercise an interrupted download, a deliberately corrupt signature, downgrade/rollback, Intel Mac, Windows, or the quiet 24-hour automatic-check schedule.
- RC2 remains an unlisted release candidate behind the live stable updater pointer. It is not the public `1.0.0` release. Final promotion still requires the remaining release decisions and checks recorded in `docs/V1-Release-Readiness.md`.
- `larryherzogjr.com` was not changed. The production Ad Fontes web application containers were not rebuilt as part of this updater rehearsal.
