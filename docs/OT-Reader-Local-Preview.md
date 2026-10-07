# Local OT reader preview — AFOT-004

> Superseded by the [approved English OT release and public branding](OT-English-Acceptance-2026-10-07.md). Normal `npm run dev` and web/desktop builds now include OT; the preview-only flag/middleware described below records the earlier review boundary.


Run `npm run dev:ot` from the repository root. This reproduces the pinned candidate-v3 artifacts before enabling `AFOT_LOCAL_PREVIEW=1`. Open the printed local URL at `/read/PSA/3?translation=BSB`. The current review server uses http://localhost:3016/read/PSA/3?translation=BSB.

The flag is off by default. Candidate chapter/search files are served by a narrowly scoped development middleware from ignored `artifacts/ot/`, never copied to public assets. A production web build with the flag enabled fails explicitly. Normal web and desktop builds retain the released NT corpus, registry and technical identities.

## Available for review

- All 66 books in reference entry, chapter navigation and book picker; four OT English editions (BSB, BLB Draft, MSB, YLT), with BSB the default when leaving an NT Greek edition.
- Four-edition OT comparison and search across the Bible, one testament or one book, with pagination and reference links. MSB OT wording matches BSB; BLB is still an early draft.
- Source poetry, Scripture titles, Psalm acrostic publisher headings and Berean publisher notes remain distinct. Candidate v3 explicitly cleans 119 BLB source presentation artifacts while retaining original text and exact transformations.
- OT quotation metadata and note validation use the actual candidate release. Notes still require the existing admitted account/session and configured private-note service.

## Verification and limits

`npm run test:ot` reproduces 3,726 candidate files and passes seven fidelity tests. `npm run test:ot-reader` passes five tests covering canonical references, edition capabilities, search, note quotation/import validation, corrupted-data rejection and mixed-release limitations. `npm run verify:both` passed typecheck, normal web build, 76 Node and 20 Python tests, pinned import/publication reproduction, desktop build and six desktop tests.

Browser checks covered Psalm 3 deep links, clean BLB superscriptions, four comparison cards, publisher notes and Escape focus restoration; reference submission and OT/NT boundary navigation by keyboard; OT search pagination and browser Back; Psalm 119 stanza layout; the book picker; 390px reading and 320px comparison without horizontal overflow; and retained NT Greek-token analysis.

The local notes panel reported that personal notes are not configured. No account, database or real saved note was created or modified; live persistence verification remains pending a configured isolated test environment. A single quotation/comparison spanning both testaments is rejected because the candidate and NT use distinct releases. Septuagint, Hebrew analysis, OT Ordinary Means commentary and curated NT-to-OT connections are not supplied by this preview.

This is engineering verification, not Larry's source/display approval or authorization to publish. Review the reader and [source/display samples](OT-Import-Review-Samples.md) before promotion. AFOT-005 covers NT-to-OT connections and Septuagint source selection; AFOT-006 covers the agreed public rebrand while preserving signing/package/updater identities. No push, deployment or packaging occurred.
