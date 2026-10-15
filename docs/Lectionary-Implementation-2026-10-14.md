# Lectionary browsing and Sunday packets — October 14, 2026

**Current decision:** Larry removes the reader-sidebar follow-on to avoid clutter. Lectionary stays in the Study Library, including normal reading links and Sunday packet preparation. The reader toolbar and study-panel tab no longer include Lectionary. Older sidebar deep links open normal reading; the historical implementation and checks below record the superseded experiment. Source/calendar pins remain unchanged.

AFNT-120 / AFNT-102. Larry authorizes a locally testable first version: One-Year and Three-Year lectionaries, Library browsing, reading links, and preparation of a Sunday study packet. The initial Library version is accepted by Larry and remains the current scope. The reader-sidebar experiment is retired; reverse passage lookup in the Library, collects, hymn suggestions and lectionary summaries remain follow-ons. Lectionary has no reader-toolbar or sidebar control.

## Source and scope

Six official LCMS Commission on Worship Word calendars are preserved byte-for-byte under `sources/lectionary/lcms-calendars-2026-10-14-v1/raw/`. Their URLs, acquisition date and SHA-256 values are in `acquisition.json`. Primary publication pages:

- [2024–25: Three-Year C and One-Year](https://resources.lcms.org/worship-planning/series-c-and-one-year-series-calendars-with-lectionary-readings/)
- [2025–26: Three-Year A and One-Year](https://resources.lcms.org/worship-planning/series-a-and-one-year-series-calendars-with-lectionary-readings/)
- [2026–27: Three-Year B and One-Year](https://resources.lcms.org/worship-planning/series-b-and-one-year-series-calendars-with-lectionary-readings/)

Only factual calendar dates, observance names, source headings and Scripture appointments are projected. This is not a public-domain claim for the formatted documents or permission to reproduce LCMS summaries, prayers, hymnal prose, logos or source Bible quotations. Original DOCX files remain source evidence outside both distributable bundles. Scripture comes from the app's independently approved editions.

`extract.py` reads the original table cells in source order, retaining printed reading notation, same-date blank/merged cells, alternative-observance rows and observed-date labels. Each document's "New Church Year Starts Here" successor preview is excluded: its successor is represented by its own complete calendar. The 2026–27 preview of 2027–28 is not extrapolated. There are 431 observance records, covering December 1, 2024 through November 25, 2027. Outside this period, the UI states that readings are not bundled. Congregational transfers and future calendars are not calculated.

Active derivative: `lcms-calendars-2026-10-14-v3`, with output and implementation/source/registry pins in `content/lectionary/`. Candidate v1 failed to handle optional notation and several explicitly printed aliases; candidate v2 missed spaces after colons. Their exact manifests, generated outputs, parser and builder bytes remain rejected private evidence. They are not active app catalogs. The primary originals and canonical registry remain unchanged.

Offline normal builds reproduce the extracted rows and verify pins; only the one-time `acquire.py` downloads sources. Normal builds never refresh calendars or establish new output pins.

## Reference decisions

- Parenthesized verses are optional, excluded initially, with a visible inclusion checkbox.
- Explicit "or" alternatives are individual choices. The packet includes the chosen alternative, not every alternative.
- Palm Sunday procession and Passion appointments separated in the source remain a combined choice, retaining their individual alternatives and full numerical extents.
- Discontinuous and cross-chapter extents are preserved. Whole psalms resolve through the approved canonical registry.
- Literal `a`/`b` portions keep their printed labels. Reader links and packets use complete canonical verses, with a visible disclosure; there is no established word alignment.
- Four choices named "The Song of Moses and Israel" lack a numeric reference. They remain visible and unresolved. A packet requires choosing the explicitly linked Psalm alternative; no Exodus extent is guessed.
- Explicit printed source oddities, including `Jer. 31:15–15`, are preserved rather than silently corrected.
- Source section headings such as TRINITY are retained as calendar organization, without an invented theological explanation.

## User flow

Library → Lectionary opens the upcoming Sunday using the device's local date. Series preference is stored locally as `af-lectionary-series-v1`. Date, church year, observance, English Bible edition, alternative choices and optional-verse inclusion are shareable URL state. Previous/next Sunday buttons follow bundled Sunday dates across the Advent cycle boundary. The observance selector lists all Sunday/festival entries within the selected church year, including same-date alternatives.

Each Library reading link opens normal reading with exact canonical extents and the selected edition. It does not open a sidebar.

**Create this Sunday's study packet** opens Study Packets with the observance name/date, selected appointed passages and edition, while preserving existing related-material preferences. It prepares the configuration; the user builds the preview as usual. The printed preview and self-contained HTML include the appointed reading roles, source notation, actual included extents, series/date, optional-verse choice and official-calendar citation.

The existing packet storage key/schema remain v2. An optional `lectionary` selection contains the source observance ID, selected alternatives and optional-verse setting. Validation re-resolves that selection against the bundled catalog and requires exact canonical coverage. An appointed packet can include up to 400 verses / 12 ranges, allowing complete Passion readings. Custom packets retain the 120-verse / 12-range limit. Editing Scripture references or starting a new packet clears the appointed context; changing title/edition/related choices retains it. Canonical ordering is used in the Scripture section, while the appointment list retains First Reading/Psalm/Epistle/Gospel order.

## Verification and next steps

Focused tests cover six original hashes, every source row, active output/parser/registry pins, all numeric ranges, all primary and available alternate choices with optional verses on/off, four unresolved canticle choices, Advent cycle boundaries, same-date alternatives, discontinuous/partial/cross-chapter references, long Passion packets, context/storage validation and complete local corpus coverage. Verification passed: `npm run typecheck`, `npm run build` including `npm test` (166 application tests and 44 Python/source tests), staged offline Vite build, and 13 desktop checks. Web browser checks cover the upcoming Sunday, all three cycle calendars, remembered One-Year choice after reload, alternate Gospel and optional Psalm extents, YLT reading links and back navigation, keyboard Sunday navigation, complete 173-verse Palm Sunday preview, related Confessional Connections inclusion, preview invalidation, saved Sunday configuration, script-free HTML export and 320px browsing/packet layouts without overflow. The final production preview independently prepares the 38-verse October 18 packet with correct source context. The offline browser independently reads the Series B alternative Gospel in Mark 13 and builds its Advent Sunday packet. Final web/offline browser logs have no warnings/errors. No physical printer or PDF job is claimed.

Local test entry: http://localhost:3034/library?view=lectionary . Proofs: `artifacts/review/lectionary/library-browser.png`, `readings.png`, and `sunday-packet.png`. Temporary development/offline preview servers are stopped; production preview remains on port 3034.

Next: Larry tests locally. No push, deployment, native installer, signing, updater identity or version change is part of this task. Further calendar years require a pinned, reviewed source successor.

## Historical reader sidebar follow-on — AFNT-120 (removed)

Larry accepts the Library feature and requests appointments and companion-reading links in the reader sidebar. The toolbar button and study-panel tab use `panel=lectionary`. No new source projection is created: `lectionary-context.ts` matches the active v3 catalog by exact numeric canonical verse overlap, for the remembered One-Year/Three-Year series and an optional church-year filter. A source appointment may be shorter/longer than the current selection; partial verses remain verse-level matches with disclosure. Unresolved nonnumeric canticles remain unlinked.

Each dated observance appears once, retaining all matching roles/choices and required-versus-optional-only labels. Results prioritize an explicitly selected day, then upcoming dates and recent past dates; six records appear per page. Every displayed day provides all First Reading/Psalm/Epistle/Gospel choices, explicit optional extents, calendar attribution and its Library link. Other-reading links use `panel=lectionary`, `lectionarySeries`, `lectionaryObservance`, and an optional `lectionaryYear`, so the main passage changes while that day stays open in the sidebar. The current edition is retained when compatible; an OT reading reached from Greek NT opens BSB with a visible fallback label.

Library reading links also carry the selected source day directly into the reader’s lectionary sidebar, including optional/alternate choices. Context uses the existing desktop sidebar and phone modal, study navigation trail, deep-link/reload behavior and Escape/Close focus return. Comparison-only loading, verse synchronization and edition controls are excluded from this mode. Whole chapters over the comparison tool’s 80-verse limit remain eligible for appointment lookup. Unmapped source-only reading does not acquire guessed canonical identity. The new control is a sidebar button, preserving Larry’s toolbar-placement decision.

Validation covers exact OT/NT overlap, disjoint-gap exclusion, optional/alternate choices, one record per day, year filtering, date ordering, Sunday retention and edition fallback. Initial browser checks cover YLT Matthew 22 → Isaiah 45 with the same October 18 context after reload, Escape restoring the exact invoking button, One-Year November 8, empty-year feedback, commentary/tab switching, Greek → BSB fallback, Psalm 96 optional-only matching, Psalm 119’s 12 results across two pages, and 320px modal layouts without overflow. Final verification passed: typecheck, full build with 170 application tests and 44 Python/source tests, final web/offline frontend builds and 13 desktop checks. Production and offline browsers independently retain the October 18 day while navigating Matthew 22 → Isaiah 45; the production Escape return restores the original range and `open-lectionary` focus. Library One-Year reading links independently open their October 18 context. Final web/offline browser logs are clean. Temporary dev/offline servers are stopped; the production preview remains on port 3034. Screenshot: `artifacts/review/lectionary-sidebar/reader-context.png`. No new PDF, physical printer job, native installer or release/deployment is claimed.

## Library-only retirement verification

Typecheck, full build (166 application / 44 Python-source tests), offline frontend build and 13 desktop checks passed. Browser verification confirms plain-reader Library links, old sidebar URL normalization with edition/range retained, removal of both reader entry points, 320px reading without overflow and successful Sunday packet preview. Port 3034 is ready locally. Screenshot: `artifacts/review/lectionary-library-only/reader.png`.
