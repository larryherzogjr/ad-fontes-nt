# Desktop prototype and shared maintenance

2026-09-08 · AFNT-107 (offline desktop), AFNT-104 (authored resource bundles).

Larry authorized the proposed first deliverable: an offline desktop reader prototype and a shared-code structure. Personal notes and authentication are omitted from this desktop slice. The accepted hosted M4 notes/account system remains in the web entry point. This is a new development increment, not M5 acceptance or public desktop release approval.

## One repository, two entry points

| Location | Responsibility |
|---|---|
| `app/reader/` | Shared React reader, study panels, selection, word previews, embedded OM article viewer/styles and accessibility behavior. |
| `app/lib/domain/` | Shared canonical references, corpus adapters, analysis, lexical matching and content distinctions. |
| `app/app/reader.tsx` | Thin web entry point; supplies the existing hosted personal-notes component. Web routes and server APIs remain unchanged. |
| `app/reader/environment.tsx` | Small presentation boundary for word-study links and source information. Defaults preserve the website experience. |
| `app/desktop/` | Static React entry point and system-browser link handling. Uses the shared reader, article viewer and stylesheet. |
| `app/desktop/src-tauri/` | Native window and packaging. No Node server, PostgreSQL, login service, general filesystem permission or shell plugin. |
| `sources/om-studies/` | Immutable authored-content snapshots, article identity, evidence and hashes. |

Make reading or Greek-tool changes in the shared directories. Do not copy the reader into desktop or create a long-lived desktop fork. Platform-specific features belong at an entry point or behind an explicit interface. Desktop is a separate Vite build; it does not assume Vinext server output can run in a static webview.

The current development branch starts from `bd9c797` (Confirm book and chapter navigation selections), which was a clean checkout. No live host update or push is part of this increment.

## Local commands

From the repository root, after `npm --prefix app ci`:

```sh
npm run typecheck
npm run build
npm run desktop:build:web
npm run test:desktop
```

`npm run verify:both` runs these four checks in order.

Both builds reproduce the same pinned OM article through `import:all`. The web build also runs the existing Node/Python tests. `npm test` remains available independently. `desktop:build:web` reproduces sources offline, verifies the saved OM article, stages approved public assets, then builds the static frontend. `test:desktop` runs against that built output, including all 1,820 edition chapters, source hashes and Greek/lexical operations without network fetching.

For the native application:

```sh
npm run desktop:dev
npm run desktop:build -- --bundles app
```

The second command produces a macOS `.app`; use the platform-appropriate bundle target on other operating systems. Native development uses port 1420. `npm run desktop:preview` serves the built static frontend at port 1421 for browser QA. Production desktop serves embedded assets, with no listening application server.

The first verified macOS arm64 prototype is copied to `artifacts/desktop/Ad Fontes NT.app`, alongside `BUILD-INFO.json` identifying its binary. Future native builds write to `app/desktop/src-tauri/target/release/bundle/`; the convenience copy is not automatically refreshed. Both locations are ignored by Git.

Mac beta packaging uses `tauri.macos.conf.json` with ad-hoc signing (`-`) to seal the complete app bundle, including icon resources. Verify it with `codesign --verify --deep --strict`. This is not Developer ID signing or notarization.

Rust 1.94.0 and platform build prerequisites are required. This Mac's toolchain was installed only in the ignored `.desktop-tools/` directory; the launcher detects it without changing shell profiles. Other developers may use their existing Rust installation. Keep `Cargo.lock` and the npm lockfile; pair Tauri JavaScript and Rust packages on the same major/minor version. Build-tool dependency installation can require networking; corpus import and runtime reading do not.

References: [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/), [frontend configuration](https://v2.tauri.app/start/frontend/), [platform build automation](https://v2.tauri.app/distribute/pipelines/github/).

## Bundled content and authoring

Larry confirmed on September 8, 2026 that all 250 Greek articles had been reviewed and approved, authorized their use in Ad Fontes NT, and requested that all be live on larryherzogjr.com. This supersedes historical draft markers and the 39 pending-review placeholders. Author-site metadata/comments now reflect approval; article prose is unchanged.

The active `om-studies-2026-09-10-v5` snapshot is the approved Ad Fontes BSB adaptation of all 250 articles plus ten approved word-count/language corrections in six articles. It preserves the exact approved v30 adaptation provenance through v4 and binds the correction candidate to SHA-256 in an immutable v5 successor. The original website edition remains unchanged. Earlier releases, including v4 and the original one-article prototype, remain immutable and reproducible.

`app/lib/domain/om-release.json` selects the same collection for the website and desktop. Both use `app/reader/word-studies.tsx` and its stylesheet. A small index identifies available articles; article prose loads individually when opened and is cached in memory. Cross-links between included articles stay in the viewer. Markdown footnotes work inside the article dialog. Return to Greek and Escape preserve the invoking word-study button. Original website links remain available. Desktop labels bundled availability as offline; the website does not claim offline browser installation.

The author website remains the writing source for ordinary editorial releases. The BSB adaptation is deliberately app-only and follows the separate reviewed-candidate workflow recorded in `docs/OM-BSB-Article-Adaptation-2026-09-09.md`. To refresh an ordinary collection from the author website:

1. Edit and approve the changed articles there. Keep each article's `editorial_review: "approved"` and actual `editorial_approval_date` current; unchanged articles retain their earlier approvals.
2. Supply an actual approval record for the selected content. The exporter does not create or infer approval text.
3. Run `python3 scripts/export_om_studies.py --source /path/to/larryherzogjr --release NEW-RELEASE --snapshot-date YYYY-MM-DD --predecessor CURRENT-RELEASE --approval-record /path/to/approval.md`. PyYAML is required for this authoring operation, not ordinary app builds. Existing release directories cannot be overwritten.
4. Review source differences, recorded quotations/notices, article identities and output hashes, then select the new release in `app/lib/domain/om-release.json`.
5. Run `npm run verify:both`, build the native application, and review both reading flows before their separate releases.

For a reviewed BSB candidate, run `scripts/promote_om_bsb_candidate.py` only with its exact candidate, validator, verification and approval artifacts. The promoter refuses anything other than the approved v30 hashes and creates a new release directory rather than modifying an existing release. Any later adaptation requires a newly reviewed candidate and a new immutable release.

For a narrow correction to an app-only OM release, use `scripts/prepare_om_editorial_correction.py` with an exact-replacement specification under `docs/editorial-review/`, obtain approval against the resulting candidate-manifest SHA-256, then use `scripts/promote_om_editorial_correction.py`. Both tools verify the immutable predecessor; the promoter refuses candidate bytes that differ from the approved hash.

The importer reproduces the selected immutable files without network access or a sibling checkout. It verifies all source/evidence and output checksums; it has no rebaseline flag. Existing lexical associations remain unchanged. Article quotations remain part of authored commentary; they do not install NET or any other additional Scripture edition.

OM output is generated under ignored `app/public/om/` for both builds. Docker excludes generated output from its input context, reproduces it from saved sources, and copies public output into its runtime. Desktop files and local toolchains remain excluded. Author-site publication uses its existing Hugo/static workflow; Ad Fontes NT has its separate deployment path.

## Verification and release workflow

For each shared change, run the commands above, check the web reader and the native reader, then merge the reviewed change. Website deployment continues through the documented Mac-push/host-pull procedure and `deployment/update-host.sh`. Desktop installers are a separate release artifact; generating one does not deploy the website.

Baseline QA: direct passage link and reload, book/chapter confirmation, edition switching, search results, Acts 8:37 absence distinction, long-unit commentary, Greek word selection/occurrences, saved OM article/return focus, keyboard selection and 320px layout. Native QA also includes a run with all process networking denied, local asset navigation, system-browser links, restart and reading preferences. Record actual coverage, not intended tests.

Generated corpus data, frontend output, executables and local tools stay out of Git. `desktop-content.json` inventories staged assets and their checksums. Keep public installer/update hosting separate from the private source repository. Do not embed repository tokens or signing keys in an application.

The Windows beta now has an independent [build lane](Windows-Build.md) and [tester guide](Windows-Beta-Testing.md). This produces private installer artifacts while Mac development continues.

## Next increments

- AFNT-107: native Windows/Linux builds and actual runtime checks; Intel Mac support if needed; supported OS versions and installer formats.
- AFNT-104: maintain the approved 250-article export through the shared release workflow; review future source and quotation/asset changes.
- AFNT-107: signing/notarization and installer/update/rollback rehearsals. Larry approved the AF open-book application icon on September 8, 2026; Mac and Windows use formats generated from the same master.
- AFNT-107: local notes only if they prove useful; synchronization remains outside the accepted desktop direction.
- AFNT-107: manual build automation first, then separately authorized distribution. Signed update checks may later be optional; offline reading must never depend on an update service.
- AFNT-026–029: continuing M5 accessibility/pilot/release work for the web product; desktop prototype completion does not close these items.

The `1.0.0-rc.1` desktop now has a signed, user-controlled stable updater: it checks quietly at most once per 24 hours, provides a manual check, and requires explicit approval before download and installation. Update metadata and immutable packages are prepared for `ad-fontes.app`; public publication remains gated on OS signing and updater rehearsals. The desktop still has no account system or local notes and makes no claim of cross-platform certification beyond the explicitly verified release targets.
