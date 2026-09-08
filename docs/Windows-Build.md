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
