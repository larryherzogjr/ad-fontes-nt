# Ad Fontes NT 1.0.0-rc.1 verification

This record covers the locally prepared public-release candidate on `codex/v1-public-release`. It is not approval to publish v1.0.

## Verified locally

- `npm run verify:both` passed on September 10, 2026: TypeScript checking; production web build; 52 Node tests; 19 Python tests; reproduction of all pinned Scripture, analysis, lexical, editorial and 250-article BSB-adaptation outputs; 13,371-file offline desktop staging; and five desktop tests.
- A disposable isolated PostgreSQL cluster passed all five account integration tests. The deletion test removes the authenticated user, notes, sessions and OAuth rows through foreign-key cascades, clears the session cookie, and confirms the same Google identity returns as a new pending registration rather than recovering the deleted account.
- `npm audit` reported zero known npm vulnerabilities.
- `cargo audit` loaded 1,243 current RustSec advisories and found no known vulnerabilities in the 521-crate lockfile. It reported six unmaintained `unic-*` crates through Tauri's `urlpattern` dependency and one `glib` unsoundness warning. The `glib` and `proc-macro-error` packages are absent from the supported `aarch64-apple-darwin` and `x86_64-pc-windows-msvc` target trees. The six maintenance warnings affect Tauri's shared URL-pattern parser; they are recorded and not suppressed.
- Production-mode loopback timings on this Mac used five requests per path. The first `/` response completed in 81 ms and four warm responses in 6–8 ms. John 1, search and policy responses completed in 4–8 ms. Health completed in 14 ms cold and under 2 ms warm. These are local server-response measurements, not public-network or low-end-device benchmarks. The desktop frontend output is 599.08 kB JavaScript (189.12 kB gzip) and 168.59 kB CSS (28.45 kB gzip); Vite records the JavaScript chunk as a size optimization warning, not a build failure.
- Production-browser inspection at 319 CSS pixels found no horizontal overflow on Privacy, Terms, Support or My account. Their heading, main-region and link semantics are present; measured foreground contrast ratios ranged from 5.78:1 to 14.07:1. The John 1 reader accessibility tree exposes the skip link, primary navigation, edition chooser, study actions, Scripture region, labeled verse links, publisher-note controls, commentary controls, chapter navigation and policy links.
- The local Apple Silicon native RC build completed with ad-hoc signing and generated a Tauri updater archive and signature. This proves packaging and updater signing, not Developer ID signing, notarization or public-install acceptance.
- The desktop updater is limited to the configured HTTPS stable endpoint and embedded public verification key. Automatic checks occur at most once per 24 hours and stay quiet on failure; downloading and installation require an explicit click. A failed update leaves the installed version in place. The desktop retains no account, notes, general filesystem or shell permission.
- Release scripts pass shell syntax checks and `git diff --check`. The manifest builder refuses an existing version directory, requires platform-specific signed updater formats, emits canonical immutable filenames and HTTPS URLs, and records SHA-256 hashes. The host publisher validates staging hashes and then downloads every public artifact to verify its published bytes.

## External gates still open

- Larry must approve the exact Privacy, Terms and Support drafts and their effective date; draft notices intentionally remain visible meanwhile.
- The Mac has no valid `Developer ID Application` identity installed. Certificate setup, notarization credentials, signed/notarized build, Gatekeeper assessment, clean installation and real updater rehearsal remain required.
- Azure Artifact Signing account creation, individual identity validation, certificate profile, GitHub credentials and the Basic subscription remain unconfigured. No charge has been incurred. A signed Windows build and clean install/upgrade/uninstall/updater rehearsal remain required.
- `sitepull@10.20.30.70` is reachable but rejects the current Mac key. The dedicated private-data Borg repository, timers, failure email, integrity check and disposable restore rehearsal remain unconfigured. Private database archives are designed to expire within 30 days; any longer public-release/configuration archive must be separate and contain no private data.
- Production Nginx syntax/reload, immutable updater-path publication, rollback rehearsal, final artifact hashes, explicit owner promotion approval, deployment verification and the 48-hour soft launch remain required.
- Physical screen-reader, physical touch-device and Windows 11 updater acceptance are not claimed by this local record.
- The repository-wide `oxlint` command still exits nonzero on longstanding React-effect, semantic-markup and unused-component findings across the shared reader and scaffold. Targeted linting of the new account, policy-page and updater files passes. The repository-wide findings must be triaged rather than silently waived before AFNT-026 is closed.

## External service decisions

Microsoft Azure Artifact Signing Basic is the selected Windows path. Microsoft currently lists it at USD $9.99 per account per month for 5,000 signatures, and the full monthly amount is not prorated. Starting the paid account requires a separate immediate owner approval. The release integration uses Tauri's custom signing command so both the application executable and NSIS installer are signed before Tauri creates the separately signed updater archive.
