# Ad Fontes NT

**A New Testament study environment from Ordinary Means.**

M4 accepted: a hosted NT reader with BSB, BLB (publisher draft), MSB, YLT, Nestle 1904, Robinson–Pierpont 2018 and the Boyd TR compilation. All 27 books, edition switching, canonical passage navigation, original publisher material, four-edition English search, adjustable type and device-local reading position. **This is not the finished MVP.**

## Run locally

Requires Node.js **22.18+** (tested on 26), npm and Python **3.9+**. From the project root:

```sh
npm --prefix app ci
npm run import:all
npm run dev
```

Open **http://localhost:3000/**, or the Local URL printed by the server. Stop with Ctrl-C. Public reading needs no account, API key, external Bible API or database. Private notes require account configuration. Installation needs the network; importing and reading use archived project files. Keep the preview local.

Examples:

- `/read/ROM/3?translation=BSB&passage=ROM.3.23`
- `/read/ROM/16?translation=MSB&passage=ROM.16.25-ROM.16.27`
- `/read/3JN/1?translation=N1904&passage=3JN.1.15`
- `/read/JHN/1?translation=BSB&passage=JHN.1.1&panel=greek&token=JHN.1.1%215`
- `/read/ACT/8?translation=BSB&passage=ACT.8.37&panel=compare`
- `/search?q=grace&translation=YLT`
- `/about/sources`

Enter `Romans 3:23`, `John 7:53-8:11`, `Jude 5`, or ordered ranges separated by semicolons. English search supports whole words, literal phrases in double quotes, book filtering and pagination. The edition selector preserves a selected canonical passage, including differently numbered source segments. Click or tap a verse number to open nearby **Compare editions** and **Explore Greek** actions. Highlight Scripture across one or more verses for **Study selection**; study opens the containing canonical verses. Closing study or using browser Back restores your reading position. Verse links still support copying or opening in a new tab; source verse labels remain visible. Choose **Compare editions** or **Explore Greek** for the selected passage. The Greek view offers source lemma/morphology, contextual glosses, a historical dictionary, selected-form transliteration, the dictionary headword’s written pronunciation guide, and paginated same-lemma occurrences with the matched word highlighted; selected words survive reload. Study panels accept up to 80 canonical verses.

## Verify and build

```sh
npm test
npm run typecheck
npm run build
```

Builds verify pinned source/evidence hashes, exact reviewed differences, complete inventories, mappings and byte-identical outputs before compilation. The tests include independent source-format comparisons. `cd app && npm start` runs the production output locally through the Node server at the URL it prints. Ubuntu deployment templates are prepared but not installed.

## Data and source records

`app/lib/domain/` holds the reference registry, resolver, edition catalog and corpus interface. Independent Python adapters produce immutable `app/public/corpus/<release>/` chapter bundles. The browser loads chapters on demand and loads a selected English search index only when needed. PostgreSQL stores accounts, sessions and private notes; immutable Scripture remains in versioned corpus bundles. Public reading does not depend on PostgreSQL.

`sources/<edition>/` contains pinned originals, evidence, manifests, full source inventories and output checksums. BSB/MSB use official TXT wording with original structured paragraph/note data; other adapters preserve their named source formats. Full raw archives can contain other material, but only approved **NT layers** enter application bundles. Failed data loading never means a verse is absent from an edition.

- [M3 analysis sources and coverage](docs/M3-Source-Decisions.md)
- [Complete external editorial review packet](docs/editorial-review/2026-09-05/Ad-Fontes-NT-Reviewer-Handoff.md)
- [Textual review queue and publication workflow](content/editorial/REVIEW.md)
- [M2 source decisions and reference mappings](docs/M2-Source-Decisions.md)
- [Project status, verification and next steps](PROJECT-STATUS.md)
- [Original M1 verification](docs/M1-Verification.md)

`python3 scripts/download_sources.py` recovers pinned BSB raw files; `python3 scripts/download_m2_sources.py` recovers the other pinned raw files. Both reject changed upstream bytes. Do not use importer `--freeze` to bypass a discrepancy; changed source or mapping behavior requires a reviewed new release.

BGB was unavailable, so the documented Nestle fallback is used. BLB’s source is labeled draft. Greek analysis is a separately versioned local layer for Nestle 1904: 7,940 matching verses, with two explicitly unavailable analyses and 28 additional verses without matched contextual glosses. It does not imply English–Greek alignment. Larry Herzog Jr. is the assigned textual reviewer; **All 30 initial explanations are approved and locally published**. Batch 6 adds Matthew 23:13–14, Mark 16:9–20, John 7:53–8:11 and 1 John 5:7–8, with approved corrections and exact source boundaries. [Batch 6 verification](docs/editorial-review/returns/2026-09-05/batch-6/RECONCILIATION.md). Batch 5 adds John 1:18, 1 Timothy 3:16, Revelation 22:19 and the two numbering notes in 2 Corinthians/3 John, with approved corrections and cross-links. [Batch 5 verification](docs/editorial-review/returns/2026-09-05/batch-5/RECONCILIATION.md). Batch 4 includes Matthew 6:13, Mark 1:1, Luke 22:43–44, Romans 5:1 and 1 Corinthians 13:3 with all approved corrections. Luke uses a dedicated publisher-note study; Corinthians explicitly identifies the limits of the displayed Greek editions. [Batch 4 status](docs/editorial-review/returns/2026-09-05/batch-4/RECONCILIATION.md). Batch 3 adds Luke 17:36, John 5:3–4, Acts 15:34, Acts 24:6–8 and Romans 16:25–27, with exact partial-verse excerpts and approved related-note links. [Batch 3 verification](docs/editorial-review/returns/2026-09-05/batch-3/RECONCILIATION.md). Batch 2 adds Mark 11:26, Mark 15:28, Luke 23:17, Acts 28:29 and Romans 16:24, with approved factual corrections and distinct labels for the reviewed rendering/textual publisher notes. [Batch 2 verification](docs/editorial-review/returns/2026-09-05/batch-2/RECONCILIATION.md). The first batch covers Matthew 17:21, Matthew 18:11, Mark 7:16, Mark 9:44, Mark 9:46, and a revised Acts 8:37. Open `/read/ACT/8?translation=BSB&passage=ACT.8.37&panel=compare&unit=candidate-18`, or use a chapter’s commentary buttons or the inline OM markers. Mark 9:44 and 9:46 link to each other. M3 is accepted locally, including the presented Greek review and verse-level OM markers. [Acceptance and limitations](docs/M3-Acceptance.md). M4 account-backed notes and the initial resource links are accepted on [ad-fontes.app](https://ad-fontes.app). [Acceptance and continuing limitations](docs/M4-Acceptance.md). M5 pilot/release work is next.

## Accounts and private notes (M4 accepted)

Select a verse and choose **My note**, or open **My notes · private**. Notes support save, edit/delete, canonical passage links, edition-specific quotations, JSON import/export and readable export. Saved notes belong to the account and follow passages across translations. Unsaved drafts remain only in the open page; there is no offline editing.

Google establishes identity. New identities enter the shared registration password once; admitted readers subsequently use Google alone. Missing configuration leaves accounts unavailable while public reading remains usable.

[Account architecture, Google setup, Ubuntu deployment and verification](docs/M4-Accounts-and-Hosting.md) includes the exact callback URL and prerequisites. Run `python3 scripts/configure-hosting.py` to enter dedicated credentials privately and generate `deployment/.env`. Do not paste secrets into chat. This file targets hosted Compose, not the unconfigured local preview.

For local account development, set `DATABASE_URL`, `APP_ORIGIN=http://localhost:3000`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `REGISTRATION_PASSWORD_HASH` in the server environment, using a dedicated development database and registered local Google callback. Run `npm run migrate`, then `npm run dev`.

For integration tests, point `DATABASE_URL` at an isolated database named **afnt_m4_test**, run `npm run migrate`, then `npm run test:accounts`. The suite truncates its Ad Fontes tables. Ordinary tests/builds need no Google credentials or database.

## GitHub and host updates

See [private GitHub workflow](docs/GitHub-Workflow.md) for Mac push and host pull/rebuild commands. Pulling source does not restart the running app. Credentials, personal notes and database backups stay outside Git.

The reader includes a collapsed **Related Ordinary Means resources** section below the reading material when relevant links exist. The initial 12 studies/articles open in new tabs; their prose is not copied into Ad Fontes NT. [Inventory and mapping boundaries](docs/M4-Resource-Links.md).
