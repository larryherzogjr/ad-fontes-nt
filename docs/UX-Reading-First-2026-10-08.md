# Reading-first UX improvements · October 8, 2026

Backlog: **AF-OT-018**. Larry authorized all seven recommendations from the UX/UI evaluation. These are shared web/desktop presentation changes, implemented locally. M5 pilot acceptance and MVP completion remain outstanding.

## Implemented recommendations

1. **Bring connected reading and catalog results forward.** Shorter selection summaries and an expandable passage-options section reduce phone overhead. The catalog places its full source explanation after results; evidence, coverage limitations and original publisher information remain available.
2. **Make collections discoverable.** Reader and public-page navigation consistently link to Septuagint Research and NT/OT Connections. Both also appear as Library collections.
3. **Simplify Greek research.** Basic search has a short introduction. Advanced morphology, part-of-speech, form, accent and source-only controls are grouped under Advanced filters, which opens when those filters are active. Search rules and source coverage remain in a separate disclosure. Source-only wording explains missing English correspondence without implying textual absence.
4. **Make edition comparison compact and configurable.** Compact cards are the default, with visible source-family labels. Choose editions supports a persistent subset, including LXX for OT passages; at least one edition remains selected. Comfortable layout remains available for longer readings and synchronized verse scrolling. Compact layout disables synchronization without overwriting the saved synchronization preference. `compareEditions` and `comparisonLayout=comfortable` preserve choices in deep links.
5. **Match Library filters to released commentary coverage.** The commentary book selector uses books represented in the released collection. An older URL selecting an uncovered book retains that selection with an explicit coverage explanation and a clear-filters recovery link. This does not restrict Scripture or research coverage.
6. **Clarify recent history.** A presentation helper deduplicates equivalent recent entries and names study modes and chosen editions. Stored history and bookmarks are not rewritten; bookmarks retain their existing presentation. Unit variants of the same authored study consolidate while distinct study labels remain distinct.
7. **Improve control readability and phone hierarchy.** Frequent controls use 14px text, navigation wraps, and narrow study tabs use concise labels while retaining full accessible names. Comparison and connected-reading layouts fit small screens.

## Verification

- `npm test`: 101 Node tests and 32 Python checks passed, including new history-presentation tests.
- `npm run typecheck` and `npm run build`: passed, including immutable-source reproduction. Final web compilation passed after the last UI refinements.
- Desktop web bundle build and six desktop checks passed; final desktop compilation/checks were repeated after the last UI refinements.
- Browser review covered desktop, 390px phone and 320px comparison layouts; no horizontal overflow in those checked views. Keyboard layout activation and Escape focus return passed.
- Edition subset and layout deep links survived reload. Research morphology deep links retained filters and opened Advanced filters. Empty search recovery and Library uncovered-book recovery were verified.
- Packaged desktop preview displayed the refreshed shared UI and Genesis 1:1 BSB/LXX two-edition comparison.
- In the same 390px review scenarios, the first catalog result moved from about 887px to 518px from the viewport top, and the connected-reading heading moved from about 524px to 347px. These are scenario-specific observations, not universal performance metrics.

Review images: `artifacts/review/ux-compact-comparison-2026-10-08.jpg` and `artifacts/review/ux-connected-phone-2026-10-08.jpg`.

## Preserved boundaries and next steps

Scripture/source releases, canonical mappings, publisher notices, editorial approval records, public branding and native identities are unchanged. No accounts or personal-note runtime was restored. No deployment, installer signing, updater publication or native release was performed.

M5 still requires physical-device and screen-reader testing, package/performance evaluation and remaining release acceptance. Review these shared UI changes in that pilot before publishing refreshed web/native builds. The live 2.0.0 release remains unchanged by this local work.

## Follow-up · Library integration

Larry refined recommendation 2: Septuagint Research and NT/OT Connections belong inside Study Library, like its other collections, rather than in primary navigation or separate destinations when selected there.

- Removed both desktop/mobile primary-menu entries from shared reader, public and Library headers.
- Library collection selection renders each tool under the existing Library heading and collection cards without leaving the Library shell. Wide screens show all five collection cards in one row.
- Research search, filters, pagination, source reading, return-to-search and LXX occurrence links retain `/library?view=research` context. Connection filters/pagination retain `/library?view=connections`. URL state supports reload and browser history.
- Contextual reader access and explicit English/NT passage links still open the appropriate reading view. Existing standalone `/greek` and `/connections` deep links remain compatible.
- Research/catalog filters do not leak into unrelated Library collections. Standard Library search is replaced by each tool's own controls while that collection is active.

Verification: 102 Node tests / 32 Python checks passed, including Library research return-link coverage and rejection of external/malformed return URLs. Typecheck and full production build passed. Browser verified collection selection by keyboard, research search/source/return/page-two flow, catalog filter reload and Back, and 390px layout without horizontal overflow. Final shared web/desktop builds and desktop checks are recorded in PROJECT-STATUS.md. No deployment or installer publication; M5/MVP limitations above continue.

## Follow-up · Consistent return links

Larry requested one return-link label across collections: **← Back to Study Library**. Article and lexicon detail pages use this wording with their existing collection/filter destinations. Every reader study panel now exposes the link, including comparisons without commentary, publisher notes, Greek exploration and NT/OT connections. Connections return to the Library catalog; OT Greek returns to Research and NT Greek to the Lexicon. Septuagint source reading returns to its Library research search while retaining available query/filter/page state. Standalone legacy research/catalog pages also link back to their Library collection. No duplicated return link is added to the embedded catalog/search landing views, which already show the Library collection navigation.

Browser verified keyboard return from Connections, research page-two query restoration and phone presentation. Existing return-label assertions were updated to reflect the requested wording. Sources and release boundaries remain unchanged.

## AF-OT-019 · Swap connected passages and promote editions

Larry approved reciprocal passage switching and per-card edition promotion.

- **Swap passages** makes the opposite testament's displayed passage the main reading, retains the selected connection and keeps the study panel open. It carries reviewed/publisher/manual display state, manual ranges and English/Greek/interlinear choices. English and paired Greek reference text puts the opposite testament first. Repeated swaps retain the main edition on each side, using a supported English edition for OT when an NT Greek edition cannot represent it.
- An explicitly selected, released connection remains selected even when manually adjusted display ranges extend beyond its original publisher anchor. This preserves the chosen connection; it does not assign a new classification to those display ranges.
- **Make this the main edition** appears on supported edition cards beside the existing reading action. It preserves the passage, selected edition subset, layout and reviewed unit, and opens the edition readings section. The active edition is marked **Main edition**. LXX/source-only research is not falsely promoted to an unsupported main-reader edition.
- Existing reading links, Library returns and browser history remain available. No Scripture, mapping, classification, source release or native identity changes.

Browser verification covered Matthew 1:23 ↔ Isaiah 7:14 in YLT, keyboard reverse swap, manual Matthew 1:22–23 / Isaiah 7:13–14 with interlinear Greek, restoration of Nestle 1904 after returning from OT, YLT promotion preserving BSB/YLT and Comfortable choices, and 390px compact controls without horizontal overflow. Source-only promotion is intentionally unavailable. Proof: `artifacts/review/ux-promote-edition-2026-10-08.jpg`. Final verification is recorded in PROJECT-STATUS.md.
