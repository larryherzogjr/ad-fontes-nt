# Windows beta build lane

AFNT-107 · September 8, 2026. Larry authorized Windows beta work in parallel with the Mac desktop work and has Windows testers available.

## Build flow

`.github/workflows/windows-beta.yml` has two jobs:

1. Ubuntu reproduces pinned content, tests both website and desktop, and packages verified frontend assets.
2. Windows Server 2022 installs Rust 1.94.0 and uses the locked Tauri dependencies to embed those exact assets in a Windows x64 NSIS installer.

The installer includes the offline Evergreen WebView2 installer, uses current-user installation, and retains the existing app identifier. The Windows-only Tauri configuration leaves Mac settings alone. Its ICO uses Larry's approved AF open-book application icon; Mac uses an ICNS generated from the same master.

Corpus imports deliberately run on Linux. Python's platform defaults can otherwise change output newlines/encoding on Windows. The artifact hash is checked before extraction; Windows never fetches live corpus or article data. `.gitattributes` preserves pinned source and editorial bytes on every checkout.

Actions are pinned to reviewed commit SHAs, use read-only repository permissions, and do not publish a GitHub Release, deploy either website, or message testers. Build artifacts remain private to repository users and expire after 30 days. Download the installer package locally and share that package with testers; they do not need access to the source repository. Never make the private repository public to distribute a binary.

## Run and download

The initial `codex/windows-beta` branch runs the workflow when build-related files change. After merging, use GitHub → Actions → Windows desktop beta → Run workflow to build a selected ref. Website deployment remains independent.

The final artifact contains the setup EXE, the tester guide, a SHA-256 checksum and build identity. `BUILD-INFO.json` records the source commit, workflow URL and OM release. Keep it with test results.

For a Windows developer machine, install Node 24.18.0, Rust 1.94.0 and Visual Studio C++ build tools. Install app npm dependencies, download/extract the verified frontend artifact to `app/desktop/dist`, then run from the repository root:

```sh
npm run desktop:build -- --bundles nsis --config ci-no-frontend-build.json -- --locked
```

`ci-no-frontend-build.json` must only be used after verifying the prepared frontend; it skips regeneration. Ordinary Mac development/build commands are unchanged.

## Acceptance and next work

The first deliverable is an unsigned Windows x64 beta. Windows 11 on Intel/AMD PCs is the initial test target. Real install, offline reading, external links, keyboard/display scaling, restart and uninstall checks are in [the tester guide](Windows-Beta-Testing.md). Windows ARM is a separate build/test decision. Code signing and automatic updates remain future work; do not describe a compiled installer as Windows runtime certification.

The shared reader and content changes continue to serve both Mac and Windows. Platform packaging can proceed independently; neither installer build deploys ad-fontes.app.

References: [Tauri Windows installer options](https://v2.tauri.app/distribute/windows-installer/), [Tauri build automation](https://v2.tauri.app/distribute/pipelines/github/).

## Parallel Mac packaging

The existing validated Mac frontend was also packaged as `Ad Fontes NT_0.1.0_aarch64.dmg` during this Windows build. Tauri completed the locked native build and `hdiutil verify` validated the image. The local image, checksum and build identity are under ignored `artifacts/desktop/mac/`. It remains an Apple Silicon beta without Developer ID signing or notarization. No shared-reader behavior changed in this packaging increment.

## First successful Windows build

[Build 1](https://github.com/larryherzogjr/ad-fontes-nt/actions/runs/34287870365) succeeded from commit `afee3103dff5d100971575bf96b4ff0f66752bc5`. Shared checks passed on Ubuntu, and the native Windows x64 application and NSIS offline installer built on Windows Server 2022. This is packaging verification; real Windows installation, reading, offline behavior and uninstall results remain with testers. The private artifact is `Ad-Fontes-NT-Windows-x64-beta-1`.

The downloaded local tester package is `artifacts/desktop/windows/Ad-Fontes-NT-Windows-x64-beta-1.zip` (about 294 MB, including offline WebView2 setup). Its setup EXE SHA-256 is `f86ff2b2830ba5d0395e068f23b583c854f88c7f6bc900f1ae67522f99a1290a`, verified against the build record after download. The ZIP integrity check also passed. These ignored artifacts can be shared with testers without sharing the private repository.

## Approved AF icon beta

Larry approved the AF open-book design on September 8, 2026. The master, exact approved preview and production notes are in `app/desktop/branding/`. Windows explicitly selects the same ICO for the app, NSIS setup and uninstaller. Mac uses the matching ICNS with a complete ad-hoc bundle signature.

[Windows beta 3](https://github.com/larryherzogjr/ad-fontes-nt/actions/runs/34290912067) succeeded at `49f1de7`, including the shared checks and native installer build. Local download: `artifacts/desktop/windows/Ad-Fontes-NT-Windows-x64-beta-3.zip` (293,900,554 bytes). Setup SHA-256: `5355689228f78ae85f53668287db59e119675fc83239d5c3012c1fafed0942c9`. All six embedded setup icon sizes (16, 24, 32, 48, 64 and 256) match the approved ICO pixel-for-pixel; downloaded metadata/checksum and ZIP integrity passed. Actual Windows installation and runtime testing remain with testers. Beta 2 was superseded before completion; use beta 3 instead of beta 1.

The corresponding Apple Silicon Mac image is `artifacts/desktop/mac/beta-2/Ad Fontes NT_0.1.0_aarch64.dmg` (35,727,188 bytes), source `2b8ee70`, SHA-256 `3ff3ee7ca2c88c21db1993b77cbd3d6c0f96b92dc14f6234c1a91a025f926a81`. Disk-image verification, mounted-bundle strict/deep signature verification and the packaged ICNS equality check passed. It is ad-hoc signed, without Developer ID signing or notarization. The earlier Mac image outside `beta-2/` predates this icon update.

## Approved standalone articles — version 0.1.1

[Windows beta 6](https://github.com/larryherzogjr/ad-fontes-nt/actions/runs/34319404686) succeeded at `77a91ba`, using the shared `om-studies-2026-09-09-v3` release with all 250 approved articles. Both Ubuntu verification and native Windows packaging passed. The downloaded artifact is `artifacts/desktop/windows/beta-6/Ad-Fontes-NT-Windows-x64-0.1.1-beta.zip` (293,965,538 bytes), SHA-256 `ef2290fdb04acc64ea7b67085080749a9f12798ad4410de0fdb31678bdffdfc0`, matching GitHub’s artifact digest. Its setup SHA-256 is `7286dbc9478cfcbbef24bffbf4c0c6d54f1962d4104ab5d4db2274cfeb9e195f`. ZIP integrity, installer checksum, source/version/release metadata and approved icon identity passed. The separately downloaded prepared frontend also matches all 251 pinned article/index output hashes. Beta 5 was canceled before native packaging when the stale source-description date was corrected.

The corresponding Mac package is `artifacts/desktop/mac/beta-3/Ad-Fontes-NT-macOS-Apple-Silicon-0.1.1-beta.dmg` (35,722,380 bytes), SHA-256 `b6931393c08a95dd51089899c5474e8aa5e0bf00bd462ae966b9e304709c58cf`, from the same source commit. Disk-image integrity, mounted strict/deep bundle signature, packaged icon and version checks passed. The installed Mac app was updated with backups retained under `artifacts/desktop/mac/`, opened John 1 BSB under a network-denying sandbox, and was then relaunched normally. Existing preferences were retained.

## Approved BSB adaptation — version 0.1.2

[Windows beta 7](https://github.com/larryherzogjr/ad-fontes-nt/actions/runs/34431926845) succeeded at `d8971be`, using app-only release `om-studies-2026-09-09-v4`. The Ubuntu lane passed the complete shared verification before the Windows x64 lane built the unsigned NSIS installer with its offline WebView2 installer. The tester ZIP is `artifacts/desktop/windows/beta-7/Ad-Fontes-NT-Windows-x64-0.1.2-beta.zip` (293,940,328 bytes), SHA-256 `3e771f7cf602ae007354ff9bf2e909aa0d28ccd2cb48927c8a882368d8eef7fa`. ZIP integrity, embedded installer SHA-256 `3f4a010483999cf318bf85fd557529508516c9032fb541cd3fb0bd0abb04f26f`, version, commit, release metadata and approved icon identity passed. The separately downloaded prepared frontend contains 13,371 inventoried files and matches all 251 pinned v4 article/index hashes.

The matching Mac beta 4 package is `artifacts/desktop/mac/beta-4/Ad-Fontes-NT-macOS-Apple-Silicon-0.1.2-beta.dmg` (35,740,516 bytes), SHA-256 `d5bb90c87e69f35227f5ba207839d7fc2f067f1c7a61fc86e321ed58a0ce8ceb`, from the same source commit. Disk-image integrity, mounted strict/deep bundle signature, packaged icon identity, version 0.1.2 and arm64 executable checks passed. The package is ad-hoc signed and not notarized.

The current packages retain their previous signing status: unsigned Windows and ad-hoc-signed Mac, without Developer ID/notarization. Actual Windows install/runtime acceptance and automatic updating remain future work. Distribution status and versioned URLs are in [Beta-Downloads.md](Beta-Downloads.md).
