# Ad Fontes visual polish follow up handoff

October 15, 2026 · AF-UI-008 through AF-UI-013 · Implementation requested

Larry requests all five improvements from the second visual review, plus a new Library entry default. Implement them together on the completed Hebrew/Greek and first-polish baseline. The current status records version 4.1.3 live and verified; the preceding language work and AF-UI-001–007 are complete, not prerequisites still awaiting implementation.

Larry’s additional direction is explicit: **“Browse all collections” should be the default for the dropdown when entering the Study Library.** Retain the **“Browse collections”** link to the right of the dropdown when a specific collection is chosen. On narrow screens the link may wrap beneath the dropdown to preserve readable controls and touch targets.

This means ordinary Library entry opens the actual collection overview, with the matching dropdown selection. Do not merely display “Browse all collections” while rendering Textual Comparisons underneath. Explicit collection/detail links and browser history should still open or restore their intended content.

Implement all items below for local review. This handoff does not itself request a version bump, Git push, production deployment, or signed installer release. Follow any separate explicit release authorization in the receiving conversation and the repository’s release procedure. Do not repeat the completed first polish pass or seek renewed approval for these six requested outcomes.

## Authority and baseline

Read `AGENTS.md`, `PROJECT-STATUS.md`, `docs/Ad-Fontes-NT-Handoff.md`, `docs/Ad-Fontes-NT-Implementation-Plan.md`, and `docs/Current-Release-Acceptance-2026-10-14.md`. Review these specific records:

- `docs/Visual-Polish-Handoff-2026-10-14.md` for the first pass’s intent and protected behavior.
- `docs/Visual-Polish-Implementation-2026-10-14.md` for the implemented layout and navigation.
- `docs/Hebrew-Lexicon-2026-10-14.md` and `docs/Abbott-Smith-2026-10-14.md` for source boundaries and exact matching limits.
- `docs/Full-Text-Search-Implementation-2026-10-14.md` for the active search derivative and behavior.
- `docs/NT-OT-Connections-2026-10-07.md` for current content scope and retired accounts.

**Superseding decision:** the earlier handoff required bare `/library` to remain Textual Comparisons. Larry’s October 15 default-overview request supersedes that requirement for ordinary unqualified Library entry. Preserve older filtered comparison URLs through the compatibility behavior below. Retain the earlier documents as historical records rather than rewriting their original decisions.

The second review inspected the current local web build, using 1440 × 1000 desktop and 390 × 844 phone viewports. It covered 2 Corinthians 13 BSB, whole-chapter comparison, Library overview/full-text search, Hebrew H1254a, and the Greek agapē detail with expanded Abbott-Smith. It was a visual review, not a fresh full test run or native/device acceptance.

Before editing, inspect the current Git diff and status. Preserve other conversations’ work and unrelated untracked artifacts. Use the latest completed baseline, follow the installed Sites skill for the scaffold, and capture new before images at matching viewports. Reuse a suitable local preview if it is current; port 3034 was available during review.

## Scope and sequence

| ID | Required outcome | Priority |
| --- | --- | --- |
| AF-UI-008 | Compact phone study-panel navigation | First visual priority |
| AF-UI-009 | Tighten reader controls between chapter title and Scripture | Second visual priority |
| AF-UI-010 | Give Hebrew word details a clear typographic hierarchy | Required |
| AF-UI-011 | Improve expanded dictionary prose measure and sense spacing | Required |
| AF-UI-012 | Align full-text destination names and soften Hebrew occurrence highlights | Required; both parts |
| AF-UI-013 | Make the collection overview the default Library entry | Explicit new user decision |

Implement AF-UI-013 alongside navigation and label work. All items are in scope, not optional recommendations. Keep the existing cream/navy/brass palette, reading fonts, balanced overview grid, compact collection navigation, and improved passage selection.

## AF UI 008 Compact phone study navigation

**Observed problem.** At 390px, Compare, Greek, Connections, and Commentaries appeared as four full-width rows in the study dialog. Together with the passage heading, secondary section tabs, back link, edition controls, and source headers, they placed the first Scripture near the bottom of the screen.

**Implementation.** Use a compact two-column layout for the primary study tools at phone widths. Four tools should occupy two rows. Account for the Hebrew tool and other context-dependent combinations without hiding destinations or imposing a four-item assumption. An odd final item can occupy one grid cell or span the final row if that produces a coherent result. Preserve desktop horizontal navigation when it fits.

Inspect the existing cascade before editing. At handoff inspection, the phone rules include `.study-tabs { gap: 4px; flex-wrap: wrap; }` and a button basis of `calc(50% - 1px)`. Two such bases plus the gap can exceed the available width, which is a likely contributor to the observed single-column wrapping. Verify computed behavior; a two-column grid using `minmax(0, 1fr)` avoids this width arithmetic. Do not assume the existing nominal 50% rule already achieves the desired layout.

Retain the distinct secondary navigation for Commentary / Readings / Sources. Preserve Close and study history controls, and make sure sticky header regions leave a useful scrollable content area. Reduce redundant margins where appropriate, without making the controls cramped.

**Acceptance criteria.**

- At 390px, the four reviewed tools occupy two rows, with no horizontal overflow. At 320px, labels wrap safely and controls remain usable.
- Primary tool activation areas remain at least 44px high; focused and pressed states are clear.
- Hebrew/OT tool combinations work, including an odd number of tools. No available tool disappears to fit the grid.
- DOM/tab order follows the visual order. Keyboard activation, Escape, Close, and invoking-control focus restoration remain correct.
- The first edition’s actual text appears materially higher than the matched baseline, with multiple readable lines available in the opening phone viewport where the selected content permits.
- Desktop panel, widened comparison, compact/comfortable readings, and pane scrolling remain intact.

## AF UI 009 Reader space above Scripture

**Observed problem.** The chapter heading is now prominent, but the toolbar, guide, packet/selection actions, NT/OT connections disclosure, and OM commentary disclosure still form several separate rows. In the reviewed phone state, the first verse starts roughly three-quarters down the screen.

**Implementation.** Tighten the vertical rhythm of this supporting area. Arrange packet creation and selection controls as a coherent secondary group. Place the two chapter-resource disclosures in one compact resource area while keeping them separately labeled and independently operable. Allow responsive wrapping; use shared spacing rather than forcing a crowded single line at 320px. Keep the reader guide recoverable but visually subordinate.

Preserve generous Scripture line spacing, paragraph spacing, and the existing chapter title. Recover space from surrounding controls and redundant margins, not by shrinking the Bible text. Account for chapters with zero, one, or both resource types and for loading/error notices. A missing resource must not leave an empty reserved strip.

**Acceptance criteria.**

- In the same 2 Corinthians 13 BSB phone state, the first verse moves visibly upward relative to the new before image. Record the improvement using the same font size, guide state, viewport, and selection state.
- Connections and Ordinary Means commentary remain distinct, with retained counts/labels and source-specific limitations. Publisher footnotes remain separate.
- Select/Edit/Clear/Copy, packet creation, study tools, and settings remain reachable; selected ranges wrap without clipping or covering text.
- The guide’s dismissal preference and settings recovery action work. Fresh, returning, and expanded-guide layouts remain sensible.
- Whole-chapter fallback, explicit ranges, multi-chapter headings, focus mode, and chapter navigation retain their existing behavior.
- Touch targets are not reduced merely to improve the screenshot. Scripture typography and source formatting remain unchanged.

## AF UI 010 Hebrew word detail hierarchy

**Observed problem.** Greek agapē has a prominent headword, transliteration, and organized supporting content. Hebrew H1254a appears as a relatively small identifier/form line, followed by another similar heading inside Dictionary references. The selected word does not have equivalent prominence.

**Implementation.** Establish one clear word identity area in the Hebrew Explorer detail: a prominent source word/form, a subordinate source lemma key, and transliteration when supplied by the appropriate source. Make the relationship between the selected source form and dictionary headword explicit. Reduce visually redundant headings while retaining their distinct information. Scope the strongest title treatment to the word detail; keep the reusable dictionary component proportionate inside reader sidebars and WLC inline details.

Do not discard accents/cantillation to make forms match, substitute a normalized dictionary headword for the selected source form, or invent transliterations for missing data. A dictionary transliteration should be identified as belonging to that entry when the distinction matters. Use the existing Hebrew font support, adequate line height, `lang` attributes, and bidirectional isolation for mixed Hebrew, Latin identifiers, and transliteration.

**Acceptance criteria.**

- The selected Hebrew word is the visual focal point of the detail view, comparable in hierarchy to the Greek detail without requiring identical type metrics.
- H1254a and other source keys remain visible; homograph suffixes and Hebrew/Aramaic distinctions are preserved.
- Source form, dictionary headword, transliteration, OSHB gloss, Strong’s entry, BDB entry, occurrence count, and OM study remain distinguishable.
- Missing dictionary matches, multiple keys/candidates, and dictionary load failures retain useful layouts and disclosures.
- Hebrew marks do not collide or clip at desktop/phone widths and enlarged text. RTL Scripture and LTR interface labels remain correctly ordered.
- Explorer occurrence-to-reader links and return context remain unchanged. Shared dictionary styling does not create oversized headings in sidebars.

## AF UI 011 Dictionary reading typography

**Observed problem.** Expanded Abbott-Smith prose spans a broad desktop column. Numbered senses and lettered subpoints have almost the same alignment and spacing as surrounding prose, making the structure harder to scan.

**Implementation.** Give dictionary body prose a comfortable maximum measure, approximately 65–75 Latin characters where appropriate, adapting to the available sidebar/phone width. Add modest paragraph spacing and clearer separation between major senses. Indent explicit subordinate points using logical properties so the typography behaves predictably. Keep source labels and notices subordinate but readable. Apply coherent typography to Hebrew dictionary bodies where their existing structure supports it.

The current Abbott-Smith renderer receives exact paragraph strings and renders them as paragraphs. Prefer presentation-only treatment based on existing source structure. If narrowly recognizing explicit leading sense markers such as `1.` or `(a)` is necessary, preserve each original string byte-for-byte in visible text and copy output; classify only unambiguous markers for styling. Do not reconstruct theological hierarchy from prose, rewrite abbreviations, renumber senses, or treat every number as a list item. Ambiguous paragraphs should remain plain. Use focused tests if adding classification logic.

No importer, release-format, or pin changes should be necessary. If existing public data lacks enough structure for a particular indentation, improve measure and spacing without guessing the missing structure, and document that precise limitation.

**Acceptance criteria.**

- The expanded agapē entry is easier to scan, with readable measure and distinct major/subordinate points where explicitly supported.
- Historical text, punctuation, abbreviations, citations, paragraph order, and source numbering are preserved. Copying does not gain generated list numbers or lose original ones.
- Multiple source entries remain separate; historical NT counts remain distinct from current indexed occurrence counts.
- Layout works in Library details, ordinary study sidebars, widened views, and 320px/390px screens, with no fixed-width overflow.
- Loading, unavailable-match, retry, collapse/reopen, and keyboard focus behaviors remain functional.

## AF UI 012 Consistent naming and occurrence color

This item has two required parts.

**Full-text naming.** Use **“Search resource text”** consistently for the full-text destination in the overview card, collection dropdown, destination heading, and applicable navigation links. Keep the overview card’s supporting description about full text across included studies and commentaries. Preserve persistent input labeling that explains words/quoted phrases. Retain “Find in this collection” for index-field searches and “Go to a passage or search Scripture” for the reader.

Do not rename every generic mention of searching the Library. Update labels that identify this specific destination, including accessible names, so users see the same name before and after navigation. Preserve the `/library?view=fulltext` route and existing query/filter/history contracts.

**Hebrew occurrence color.** The reviewed Hebrew occurrence context uses a bright yellow mark that conflicts with the restrained palette. Give the exact matched token a muted amber treatment with readable text contrast. Scope it to occurrence matches rather than globally restyling every `mark`. Preserve a visual distinction between occurrence matches, full-text search hits, persistent passage selection, and native text selection.

**Acceptance criteria.**

- Overview card, dropdown, and destination all identify “Search resource text,” with no remaining conflicting label for that navigation target.
- Label changes make no new claim about indexed content. Newly added dictionaries, confessions, linked resources, and other collections do not acquire full-text coverage through revised copy.
- Hebrew occurrence matching still highlights only the exact existing token; repeated occurrences in one verse remain separately identifiable.
- The new highlight preserves Hebrew glyphs/marks, spacing, source text, and occurrence links. It remains legible in forced-colors/high-contrast rendering where supported.
- Search semantics, ranking, source/output pins, matching rules, and copy text remain unchanged.

## AF UI 013 Default Library overview and route compatibility

**Required user-facing behavior.** Entering the Study Library through ordinary global navigation, a generic Library link, or plain `/library` opens the overview. The dropdown visibly selects the exact text **“Browse all collections”**, and the full collection grid is displayed. This default is independent of the last collection visited. A direct link to a specific collection or a Back action restoring one is not ordinary entry and must retain its intended destination.

When a collection is chosen, the dropdown reflects that actual collection; the full grid disappears; and **“Browse collections”** remains to its right at adequate widths. That link and the dropdown’s overview option both return to the same overview. Avoid redundant browse links while already on the overview.

**Routing plan.** Explicitly support `view=comparisons` and generate it for new Textual Comparisons links. Today both `collectionDestination('comparisons')` and `hrefFor` omit that view, and `currentRoute` falls back to comparisons; updating only the dropdown would break navigation. Update the parser, destination helper, URL serializer, overview card, filters/pagination, and any context-specific return links together.

Use this compatibility matrix as the acceptance contract:

| Entry or action | Expected content and selection |
| --- | --- |
| Plain `/library` | Overview; “Browse all collections” selected |
| `/library?view=overview` | Same overview; preserve this existing additive URL |
| Global header/mobile-menu/footer Library link | Overview, even after a previous collection visit |
| `/library?view=comparisons` | Textual Comparisons |
| Existing comparison URL without a `view`, carrying recognized legacy comparison state such as `q`, `book`, `kind`, or `page` | Textual Comparisons with that valid state retained |
| Explicit valid `view` for any collection | That collection, respecting its own parameters |
| Article, Greek lemma, Hebrew key, full-text context, or other valid detail URL | The requested detail and correct collection selection |
| “Browse collections” from a collection | Overview with collection-specific state removed from the overview destination |
| Back/Forward or “return to results” | Restore the actual prior collection/detail/query/filter/page and established focus/scroll behavior |

An old unqualified `/library` bookmark cannot be distinguished from a new ordinary visit. It intentionally adopts the overview default. Old filtered comparison links remain supported; do not erase saved bookmarks or rewrite their storage wholesale. For invalid `view` values, use a deterministic safe fallback, preferably overview, and test it. An unrelated query parameter alone must not silently select comparisons.

Audit links by intent rather than globally replacing every `/library` string. Generic “Back to Study Library” can open the overview; a return explicitly meant to restore comparison results must generate an explicit comparison URL and retain legitimate state. Keep source-language return URLs, full-text context restoration, and packet inputs intact. Preserve modified-click/new-tab behavior for links and committed-choice behavior for the native select.

**Acceptance criteria.**

- Every row in the routing matrix works on web and the built offline frontend.
- Dropdown and visible content agree on initial load, reload, direct entry, switching, and browser history. No misleading initial comparisons flash appears before overview initialization.
- All current collections remain reachable from the grid and switcher. The current twelve are a baseline inventory, not a reason to delete additions made elsewhere.
- New comparison navigation emits `view=comparisons`; legacy filtered links continue to resolve correctly.
- Search forms, filters, pagination, detail links, and return links do not accidentally fall back to the overview.
- Plain Library entry does not automatically resume the last collection. Explicit history/context restoration still does.
- Focus lands usefully after deliberate switching; passive restoration does not indiscriminately reset scroll to the top.

## Code map

| Area | Starting files |
| --- | --- |
| Shared visual rules and responsive cascade | `app/app/globals.css` |
| Study tools, panel header and comparison controls | `app/reader/study-panel.tsx` |
| Reader title, toolbar, guide, packet and selection areas | `app/reader/reader.tsx`, `app/reader/reading-selection.tsx` |
| Chapter resources | `app/reader/testament-connections.tsx`, `app/reader/reviewed-markers.tsx` |
| Hebrew Explorer detail and occurrence marks | `app/library/hebrew-explorer.tsx` |
| Shared Hebrew dictionaries | `app/reader/hebrew-dictionary.tsx`, `app/reader/hebrew-passage.tsx`, `app/reader/original-language-reader.tsx` |
| Greek dictionary presentation | `app/reader/abbott-smith.tsx`, `app/library/library.tsx`, `app/reader/word-lookup.tsx` |
| Library routing, labels, overview and global links | `app/library/library.tsx`, `app/lib/library-collections.ts`, Library links in other app surfaces |
| Full-text UI | `app/library/full-text-search.tsx`, `app/library/full-text-search.css` |
| Navigation regression tests | `tests/library_collections.test.ts`, `tests/library.test.mts`, `tests/study_navigation.test.ts`, `tests/library_search.test.ts` |
| Offline navigation | `app/desktop/navigation.ts`, `app/desktop/main.tsx`, `tests/desktop.test.ts` |

Read actual code before editing; this is not a line-number map. The existing collection-destination test explicitly expects comparisons at `/library`; replace that obsolete expectation with tests of the new decision and compatibility matrix. This is an intentional behavior change, not permission to weaken unrelated checks.

## Verification and evidence

Run the required root checks on the final implementation:

```sh
npm test
npm run typecheck
npm run build
npm run desktop:build:web
npm run test:desktop
```

The current web prebuild runs `npm test`; report that execution accurately and avoid redundant unchanged runs solely to duplicate evidence. Wait for offline staging to finish before desktop checks. Never use `--freeze` or rebaseline a source pin to make an unexplained failure disappear.

Add meaningful tests for route defaults, explicit comparisons, legacy query handling, unknown views, and clean collection switching. Add tests for any new sense-classification logic. Use browser inspection for responsive visual behavior rather than tests that merely assert CSS strings.

Review these cases:

- **Reader:** 2 Corinthians 13 BSB with no selection and whole-chapter selection; a short explicit range; resource-free and resource-bearing chapters; expanded/collapsed guide; maximum app text size; focus mode; Greek and Hebrew tools.
- **Phone study:** compare at 390 × 844 and 320px; all context-appropriate tool counts; secondary tabs; Close/Escape; compact/comfortable content; actual Scripture visible below controls.
- **Library entry:** header, mobile menu, footer, direct bare URL, overview URL, explicit comparisons, valid old comparison filter URLs, unknown view, and all collection destinations.
- **History:** switch collections, open details, return, Back/Forward, reload, and modified-click links. Verify query/filter/page and focus/scroll restoration, including full-text context and source-language occurrences.
- **Hebrew:** `/library?view=hebrew&hebrew=H1254a`, a distinct homograph or another appropriate existing fixture, multiple/absent dictionary entries, RTL occurrence contexts and exact highlighted tokens.
- **Greek:** `/library?view=lexicon&lemma=088e063630ad844a6dd6` and its expanded Abbott-Smith entry; a long and a multiple-candidate entry from existing data; narrow sidebar and wide Library rendering.
- **Search:** overview naming, full-text form, word/phrase search, filtered results and context return; ensure label changes do not affect indexed source coverage.

Use wide desktop, a medium breakpoint width, 390px, and 320px. Inspect keyboard focus and touch target dimensions; test enlarged text and forced colors where the available environment supports them. Check console warnings/errors. Use an isolated test origin/context for changing persistent guide/text preferences; preserve the user’s actual saved state.

Capture matched before/after views in the established ignored artifact area, for example `artifacts/review/visual-polish-follow-up/`. Include phone study navigation, phone reader, Hebrew detail, expanded dictionary, Hebrew match highlight, and fresh Library entry. Record actual before/after vertical positions where useful; do not invent measurements from the previous review. Reset temporary viewport overrides when finished.

## Protected boundaries and delivery

Preserve “Ad Fontes” / “A biblical study environment from Ordinary Means.” Preserve package/signing/updater identities, current release acceptance, retired accounts/notes/OAuth, and existing Library-only Lectionary/Confessional placement. Keep Scripture, publisher notes, authored commentary, confessions, morphology, and historical dictionary sources visibly distinct.

No corpus, canonical mapping, morphology, editorial approval, dictionary matching, source notice, or search release changes are part of this pass. Preserve the Hebrew/Abbott-Smith and active `library-search-2026-10-14-v2` pins. Do not add dictionaries to full-text search, invent source-form equivalences, or alter scholarly text to support a cosmetic change. Unavailable data remains explicitly unavailable.

Update `PROJECT-STATUS.md` and add an implementation record identifying AF-UI-008–013, final behavior, route compatibility, verification, limitations, and local review links. Keep historical records intact and state that October 15 supersedes the old bare-Library default. Preserve concurrent work and unrelated artifacts.

Hand back all six outcomes with before/after evidence and actual test results. Distinguish browser/offline-frontend checks from native-device or signed-release verification. Document any specific blocked check rather than marking it passed. Any later publication must follow separately authorized release work, including Larry’s own-terminal command whenever host sudo/password input is required.
