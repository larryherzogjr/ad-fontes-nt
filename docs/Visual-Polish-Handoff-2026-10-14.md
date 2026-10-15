# Ad Fontes visual polish implementation handoff

October 14, 2026 · AF-UI-001 through AF-UI-007 · Queued after the Hebrew and Greek enhancements

Larry wants all five cosmetic improvements and both usability improvements from the visual review implemented after the Hebrew and Greek enhancements currently underway are finished. This is the implementation brief for the conversation doing that work. Complete the language enhancements and their required verification first, then work through all seven items below. Do not reduce this to the three suggested starting priorities or reopen whether the seven improvements are wanted.

Larry’s instruction: “I want to push ALL your above suggestions...so want a detailed doc for Codex to work through after the hebrew and greek enhancements are done.” Here, “push” establishes the requested design scope; this handoff does not independently authorize Git publication, deployment, or signed desktop release. Follow any separate explicit release instructions already given in the receiving conversation and the repository’s release rules.

The intended outcome is a calmer reader, coherent controls, a balanced Library overview, and immediate access to the selected Library tool. Retain the current navy, warm cream, brass accents, serif reading text, and established Ad Fontes identity. Implement a restrained refinement of the existing application.

## Starting conditions and authority

Read `AGENTS.md`, `PROJECT-STATUS.md`, `docs/Ad-Fontes-NT-Handoff.md`, `docs/Ad-Fontes-NT-Implementation-Plan.md`, `docs/Current-Release-Acceptance-2026-10-14.md`, and `docs/NT-OT-Connections-2026-10-07.md`. Read the latest Hebrew and Greek enhancement implementation records produced by the receiving conversation, plus `docs/Full-Text-Search-Implementation-2026-10-14.md`. Apply the installed Sites skill to this scaffold.

At handoff creation, Hebrew Strong’s/BDB work is recorded under AF-HEB-027 in `docs/Hebrew-Lexicon-2026-10-14.md`; Abbott-Smith Greek integration is actively changing the working tree. Neither its completion nor its eventual release pins should be inferred from this document. Use the completed language-enhancement state as the baseline. Preserve its dictionary displays, source notices, matching limits, error handling, and offline assets.

The review inspected the local web application on port 3034: the 2 Corinthians 13 BSB reader, its edition-comparison panel, the Library overview, and the full-text search collection. Desktop screenshots used a 1440 × 1000 viewport; Library navigation was also inspected at 390 × 844. This was a focused visual review, not a complete accessibility audit, a native-app test, or acceptance of the pending language enhancements. The source may already have advanced beyond the screenshots by the time this is read.

Before editing, inspect `git status` and the current diff. Shared files already contain another conversation’s work. Preserve it; do not reset, overwrite, stage, or commit unrelated work merely to prepare the polish. Recheck the current UI, reuse the appropriate local server, and capture a fresh baseline after the language work finishes. This handoff itself changes no app code.

## Required scope

| Backlog ID | Outcome | Suggested implementation order |
| --- | --- | --- |
| AF-UI-001 | Promote the passage heading and consolidate the reader’s upper controls | 2 |
| AF-UI-002 | Make controls, icons, spacing, and states visually consistent | 1 |
| AF-UI-003 | Balance the Library overview grid and standardize its cards | 4, together with AF-UI-006 |
| AF-UI-004 | Reduce competing borders and filled surfaces | 3 |
| AF-UI-005 | Soften persistent passage-selection styling | 3 |
| AF-UI-006 | Replace the repeated full Library grid inside collections with compact navigation | 4 |
| AF-UI-007 | Clarify collection search versus full-resource-text search | 5 |

All seven are required. The order is practical sequencing, not permission to defer the later items. Choose routine implementation details autonomously within this brief; explain any material deviation with evidence.

## Visual direction

Retain the existing palette and local font stacks. Current tokens include `--background`, `--foreground`, `--primary`, `--surface`, `--accent-soft`, `--ink`, `--ink-foreground`, `--brass`, `--control`, `--font-ui`, and `--font-reading`. Reuse them and add narrowly scoped tokens only where a distinct role is needed, such as a lighter selection tint. Keep serif type for Scripture and major editorial headings, and the UI font for controls, labels, and metadata.

Use consistent spacing, modest corner radii, and clear text hierarchy. Navy should identify primary or selected controls. Brass should remain a small accent; whole panels do not need gold fill. Avoid adding ornamental imagery, gradients, remote fonts, a new logo, or a new theme. Preserve readable contrast and keyboard focus while reducing visual noise.

## AF UI 001 Passage heading and reader hierarchy

**Observed issue.** The study toolbar, reader guide, packet/selection controls, and NT/OT connections disclosure appear before the chapter heading. On the reviewed reader, this stack substantially delays the start of Scripture. The guide’s large tinted box has more visual prominence than routine reading needs.

**Implementation direction.** Bring the chapter title and edition identity nearer the top of the reading area. A useful order is the passage identity, a compact study/action area, relevant selection or help state, and the Scripture. Reduce duplicated instruction and excessive space between the upper elements. Keep chapter-specific commentary and connections discoverable near the passage without making every disclosure a full-width competing panel.

Consolidate the packet link and selection controls into a coherent secondary action area. Show “Selected: …”, Edit, Clear, and Copy when they apply. Keep “Select verses” available without requiring pointer text selection. Retain the guide’s explanatory content, dismissal preference, and “Show reader guide” recovery action; a compact help disclosure is a reasonable treatment. Preserve the distinction between OM commentary and publisher footnotes.

The exact arrangement can follow the finished language UI. Hebrew/Greek tools and their conditional availability must remain intact. Do not restore the retired Lectionary or Confessional Connections reader-toolbar placements.

**Acceptance criteria.**

- The chapter identity appears before the long guide/overview stack, and the first Scripture content is materially higher than the fresh baseline at the same viewport, font size, and guide state.
- Desktop and phone layouts retain passage/edition navigation, study tools, reading settings, selection, packet creation, and help access.
- Fresh and returning-reader states both work; existing guide-dismissal and text-size preferences survive.
- Opening a study from an unmarked chapter still uses the existing whole-chapter behavior. Explicit selections still take precedence, and closing restores the correct reader state.
- Multi-chapter passages retain accurate per-chapter headings and disclosures. Do not duplicate or mislabel a chapter heading merely to place a new title above the tools.
- Focus mode, deep-link anchors, sticky controls, and skip-to-reading behavior remain useful after DOM reordering.

## AF UI 002 Consistent controls and icon treatment

**Observed issue.** The toolbar combines boxed letter symbols, a circular Greek symbol, plain text controls, and a separately styled white “Aa” settings button. Related controls vary in padding, borders, and perceived weight.

**Implementation direction.** Establish a small shared vocabulary for primary actions, secondary actions, quiet toolbar actions, and selected tabs/toggles. Standardize control height, radius, font size, icon area, spacing, and baseline alignment. Use existing icon capabilities or letter symbols consistently; preserve Greek/Hebrew identity where useful. Decorative symbols should not compete with their labels.

Apply the same treatment to the reader, study-panel controls, Library navigation, and the newly completed language tools. Retain clear disabled, hover, selected, and keyboard-focus states. Ensure the settings control looks like a member of the same toolbar.

**Acceptance criteria.**

- Controls with equivalent roles look and behave consistently across these surfaces.
- Primary touch controls retain at least 44px activation height; compact visual symbols do not imply tiny hit areas.
- Every icon-only control has an accessible name. Decorative icons are hidden from accessibility APIs.
- Selection is expressed through appropriate semantics such as `aria-current` or `aria-pressed` as well as appearance.
- Focus remains clearly visible. Do not erase focus styling to achieve a quieter screenshot or add heavy frames around the entire reading pane.
- Long labels and enlarged text wrap or adapt without clipping. No new remote asset dependency is introduced.

## AF UI 003 Balanced Library overview cards

**Observed issue.** Twelve collection cards form five-column desktop rows followed by a row of two. Long names wrap unevenly, and counts compete with titles.

**Implementation direction.** Use a three-column desktop overview, adapting to two and then one column as the available width requires. Align title/count areas and descriptions without fixed heights that clip text. Use consistent, subdued count badges. Keep cards with no meaningful count free of invented numbers.

Coordinate this with AF-UI-006: the full grid belongs in an overview or explicit “Browse collections” view, not above every selected collection’s controls. Preserve all collections that exist when the language work is finished; the observed total of twelve is not a hard-coded requirement.

**Acceptance criteria.**

- The desktop overview has a balanced three-column arrangement at the reviewed wide size, with legible long titles and aligned descriptions.
- Counts retain their existing meaning, including filtered counts where applicable. Do not silently turn them into total-corpus counts.
- Active, hover, and keyboard-focus treatments are distinct and consistent with AF-UI-002.
- Every collection remains available from the overview and compact switcher, including new or renamed collections from the preceding work.
- The phone overview is easy to scan, with no horizontal page overflow or truncated labels.

## AF UI 004 Quieter surfaces and study panels

**Observed issue.** The reader and comparison UI accumulate borders, inset accents, horizontal rules, shaded sections, and individual cards. Multiple layers have similar visual weight.

**Implementation direction.** Preserve a clear boundary between the reading surface and study panel. Within each surface, rely more on whitespace, heading weight, and modest separators. Keep boundaries where they explain an interactive control, distinguish edition columns, or separate source material. Simplify redundant frames and repeated emphasis rather than stripping every border.

Retain explicit textual labels for Scripture, publisher notes, Ordinary Means commentary, confessional material, and historical dictionary/commentary sources. Apply the same restrained system to the Hebrew and Greek enhancements once their content and behavior are complete.

**Acceptance criteria.**

- Panel headers, tool navigation, content headings, and secondary metadata have an obvious visual hierarchy.
- Comparison editions remain easy to distinguish and scan in compact and comfortable layouts and with the wider comparison mode.
- Source attribution and necessary coverage limitations remain readable and adjacent to the content they qualify.
- Errors, unavailable data, and disabled controls remain distinguishable from valid empty results.
- Forced-colors/high-contrast rendering preserves meaningful boundaries and selected states.

## AF UI 005 Softer persistent passage selection

**Observed issue.** Selecting the full chapter gives nearly every line a gold background and every selected verse number a dark block. Long selections become visually heavy.

**Implementation direction.** Introduce a lighter persistent selection tint and a restrained margin or edge cue. Reduce verse-number fill weight while retaining an unmistakable selected state. Keep the visible selected-range label and Clear control. Check the result on short and whole-chapter selections; the full chapter is the demanding case.

The margin treatment must follow the actual selected runs or verse boundaries. A single bar on a paragraph must not imply that unselected text or intervening gaps are selected. Use source-appropriate directionality for Hebrew/Aramaic. App-marked passage selection, native text selection, search matches, and keyboard focus should remain distinguishable.

**Acceptance criteria.**

- Whole-chapter selection is visibly lighter, while a single selected verse and partial paragraph remain identifiable.
- Joined verses, discontinuous ranges supported by the app, multi-chapter selections, poetry, publisher headings, and notes retain correct selection boundaries.
- Selection appearance does not change canonical identity, coverage states, URL encoding, copy output, packet content, or study-tool inputs.
- Selecting and clearing do not change line height or cause text to jump.
- Hebrew directionality, Greek diacritics, enlarged type, and forced colors remain legible.
- Native drag selection and verse-number selection continue to operate independently as designed.

## AF UI 006 Compact navigation inside Library collections

**Observed issue.** Opening “Search the Library” still leaves all collection cards above its form. At phone width, the user must pass a long stack of unrelated navigation before reaching the tool they chose.

**Implementation direction.** Once a collection is active, use a compact, labeled collection switcher with an explicit “Browse collections” action. Place the collection heading and its primary input/control immediately after that compact navigation. Retain the full grid for browsing. A native select or an accessible menu/disclosure using existing primitives is suitable; avoid a horizontal strip that hides most destinations on phones.

Current `/library` defaults to textual comparisons, and existing links/bookmarks use it that way. Preserve this behavior and current deep links. A compatibility-friendly implementation can keep the default comparisons view and open the full overview through “Browse collections,” with a deliberate overview state or additive route if needed. Do not repurpose bare `/library` in a way that strands old comparison filters or context. The overview grid must still be readily accessible so AF-UI-003 is delivered.

Existing recent/saved shelves should remain accessible but should not displace the chosen task below a long preamble. Preserve collection-specific routing and the intentional clearing of incompatible parameters. Do not concatenate every query parameter into every destination.

**Acceptance criteria.**

- At 390 × 844 with default text size, opening the full-text collection shows its title and search input in the first viewport; twelve preceding cards are gone.
- The same structure serves lectionary, packets, comparisons, word studies, lexicons, research, connections, confessions, and commentaries without hiding their primary controls behind global navigation.
- Every collection is reachable by keyboard and touch. The current collection is visibly and programmatically identified.
- A deliberate collection switch places focus/scroll appropriately at the chosen content. Back/Forward and context return retain their existing restoration behavior instead of resetting indiscriminately to the top.
- Direct links, reload, existing saved links, article/lemma details, pagination, and query/filter restoration still work.
- Native select navigation occurs only on a committed choice; menu/disclosure implementations support Escape and focus return. Do not regress modified-click/open-in-new-tab behavior for links.
- Web and offline desktop share the same navigational behavior.

## AF UI 007 Clear search scope labels

**Observed issue.** The general Library field and the separate “Search the Library” full-text collection can appear interchangeable. The reader also has its own Scripture search.

**Implementation direction.** Give each search a persistent, accurate scope label. The initial review suggested “Find titles and references” versus “Search resource text”; source inspection shows that the first phrase is too narrow. The existing collection search also matches summaries/search metadata, article headwords/transliterations/glosses/descriptions/categories/tags, and lexicon fields, depending on the collection. Recheck the final language implementation before choosing copy.

Recommended direction: use “Find in this collection” with concise collection-specific help, and “Search resource text” for the existing full-text function. Keep familiar collection navigation wording if useful, and explain the scope beside the input. Retain the reader’s “Go to a passage or search Scripture.” Provide an obvious link to full-text search from appropriate collection-search contexts without claiming that both searches share the same engine or coverage.

**Acceptance criteria.**

- A user can identify whether they are searching Scripture, collection index fields, or complete included resource text before submitting.
- Labels remain visible after typing; scope is not communicated solely by placeholders.
- Help text accurately reflects the current indexed sources. Do not claim that newly added dictionaries, confessions, linked-only resources, or every Library collection are in full-text search unless separately implemented and pinned.
- Existing query semantics remain unchanged: full-text word/phrase behavior, case/accent handling, filtering, ranking, excerpts, and return-to-result state are preserved.
- Preserve the active tracked search derivative and all implementation/source/output pins. At handoff inspection, the domain points to `library-search-2026-10-14-v2`; re-read its release record rather than reviving historical v1 pins.
- New labels do not conceal Hebrew/Greek-specific search options or change source-number matching.

## Code map and implementation cautions

Paths below are navigation aids, not frozen line numbers. Re-read them after the language work finishes.

| Area | Starting points |
| --- | --- |
| Reader composition, guide, controls, chapter headings | `app/reader/reader.tsx` |
| Shared palette, reader layout, selection, Library styling | `app/app/globals.css` |
| Selection interactions and floating actions | `app/reader/reading-selection.tsx` |
| Study panel, tabs, comparison layout | `app/reader/study-panel.tsx` |
| Library shell, cards, route parsing and collection switching | `app/library/library.tsx` |
| Full-text controls, context and results | `app/library/full-text-search.tsx`, `app/library/full-text-search.css` |
| Search semantics and worker | `app/lib/domain/library-search.ts`, `app/library/search.worker.ts` |
| Hebrew enhancement surfaces | `app/library/hebrew-explorer.tsx`, `app/reader/hebrew-passage.tsx`, `app/reader/hebrew-dictionary.tsx`, `app/reader/original-language-reader.tsx` |
| Greek enhancement surfaces | `app/reader/word-lookup.tsx`, `app/reader/abbott-smith.tsx`, Greek detail rendering in `app/library/library.tsx` |
| Navigation state and offline entry | `app/lib/study-navigation.ts`, `app/desktop/navigation.ts`, `app/desktop/main.tsx` |

Useful selectors include `.reader-tools`, `.study-actions`, `.reader-guide`, `.reader-selection-status`, `.chapter-heading`, `.scripture .selected`, `.scripture .selected-number a`, `.library-tabs`, and `.library-card`. `globals.css` contains multiple generations of overrides, including a late five-column Library rule and the existing “Ink & Brass, Study Desk” block. Inspect the cascade before changing it. Consolidate the relevant rules where practical instead of adding another broad override layer. Avoid an unrelated wholesale stylesheet rewrite.

Library collection switching currently uses `history.pushState`, route state, a location key, and `popstate`. Full-text context has its own return/restoration behavior. Preserve these contracts when moving navigation; merely changing markup can still disrupt focus, scroll, remounting, or query retention. Reuse current accessible primitives and avoid new dependencies unless required by a concrete implementation need.

## Verification plan

Use a fresh baseline from the completed language enhancements. Run the required root checks against the final changes:

```sh
npm test
npm run typecheck
npm run build
npm run desktop:build:web
npm run test:desktop
```

The current web build’s prebuild runs imports and `npm test`. It is acceptable to use that successful test execution as evidence rather than rerunning an unchanged suite solely to duplicate it; state exactly what ran. Run desktop checks after the new offline frontend has finished staging. Do not freeze or regenerate unexplained corpus/search pins to resolve a failure.

Add focused behavioral tests only for new navigation/state logic where useful. Do not add tests that merely assert CSS strings or mirror markup. Browser verification supplies the important evidence for visual changes.

| Review case | Required observations |
| --- | --- |
| NT reader | 2 Corinthians 13 BSB, unmarked and whole-chapter selected; title hierarchy, first verse placement, OM markers and publisher notes |
| Explicit range | Romans 3:23–26 or another verified existing range; Edit, Clear, Copy, reload and study-panel inputs |
| Study panel | Compare and Greek, close/Escape/focus return, tabs, compact/comfortable and wider layouts, main-edition changes |
| Hebrew | Genesis 1 BSB with Hebrew study panel and WLC main reading; inspect actual finished Strong’s/BDB entry and Hebrew Explorer flow |
| Greek enhancement | A verified Abbott-Smith entry reached through the completed sidebar/Library integration, including unavailable/ambiguous matching states where fixtures exist |
| Other reading | Poetry and a multi-chapter passage; retained publisher formatting and correct selection extent |
| Library overview | All current collections, responsive grid, badges, keyboard navigation and overview return |
| Library collections | Switch through every collection; primary controls visible without the full preceding grid; existing query/filter conventions preserved |
| Full-text search | Word and quoted-phrase queries, collection/book filters, pagination, context open, Escape/return, Back/Forward, restored query/scroll/focus |
| Reader and collection searches | Verify distinct labels and unchanged results for Scripture, comparisons, Greek study/lexicon fields, and completed Hebrew search |
| Desktop parity | Open the built offline frontend and repeat core reader, navigation, full-text, Hebrew, and Greek flows with local assets |

Check wide desktop, a medium width near panel breakpoints, 390px, and 320px. Include enlarged text/200% zoom, keyboard-only navigation, visible focus, and forced-colors where supported. Check both fresh-guide and dismissed-guide states. Do not clear the user’s real saved preferences/bookmarks to simulate a fresh state; use an isolated test context. Check long labels, Greek accents, RTL Hebrew, and side-panel/modal scrolling. Inspect browser errors/warnings and loading/error states.

Capture before/after evidence in the repository’s established ignored review-artifact location, using the same viewport and reading settings for comparisons. At minimum include the reader, selected chapter, study panel, Library overview, full-text collection, and phone collection view. Report observations rather than claiming native device, screen-reader, or signed-install verification from a browser test.

## Source and release boundaries

Preserve the exact public name and subtitle: “Ad Fontes” / “A biblical study environment from Ordinary Means.” Preserve native package, signing, and updater identities. Do not change application versions as an incidental styling edit.

This work changes presentation and navigation around existing material. Preserve immutable Scripture, canonical mappings, approved editorial hashes, source notices, derivative pins, historical predecessor bytes, and all matching/coverage limitations. Unavailable data remains unavailable data; a cleaner design must not turn it into an assertion of textual absence. The current-release/M5/MVP acceptance remains closed; these are later enhancements.

Personal notes/accounts/Google OAuth remain retired. Preserve retained legacy data and private configuration. Keep Lectionary and Confessional Connections in their current authorized Library/packet placements. Do not introduce new source acquisition, semantic search, dictionary inclusion in full-text search, or broader content publication as part of this polish.

Publication follows the receiving conversation’s actual authorization and existing Mac-push/host-pull workflow. Never infer deployment permission from a completed local design. If host sudo/password input is required for separately authorized publication, send Larry the complete command for his own terminal as required by `AGENTS.md`.

## Completion and handback

- Finish every AF-UI item and update `PROJECT-STATUS.md` with its status, decisions, evidence, limitations, and next steps. Keep the preceding Hebrew/Greek records intact.
- Describe any navigation route additions and compatibility treatment, exact final search labels, and whether a visual recommendation needed a technical adjustment.
- Provide local review links and before/after images for the main reader and Library changes.
- Report the commands run and their actual results, browser sizes/flows inspected, and any checks that could not be performed.
- Confirm that the completed Hebrew/Greek features remain functional and that protected source/search/editorial pins are unchanged by the polish.
- State whether the result is local only or was separately authorized and released. Do not equate browser QA with native release verification.

The next action for the receiving conversation is to finish and verify its Hebrew and Greek enhancements, reread this handoff against that final baseline, then implement all seven items as one coherent polish pass.
