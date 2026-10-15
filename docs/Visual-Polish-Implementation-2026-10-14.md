# Visual polish — local implementation and review

Larry explicitly confirmed **“Implement all seven locally”** after supplying the visual handoff. This is presentation/navigation work on the completed Hebrew/Greek baseline. No publication, version change, source acquisition or new dictionary/full-text inclusion is authorized by this pass.

| Item | Local result |
| --- | --- |
| AF-UI-001 | Actual first chapter heading and edition precede the study controls. Later chapters retain their own headings once. The reader guide is a compact disclosure with its original content, dismissal preference and settings recovery action. Packet/selection controls remain together. |
| AF-UI-002 | Quiet tool actions share typography, 44px minimum activation height and consistent unboxed symbols. Settings joins that vocabulary. Pressed tool semantics and visible focus outlines are retained. |
| AF-UI-003 | The collection overview uses three desktop columns, two medium columns and one phone column, with aligned descriptions and subdued count badges. Existing count meanings remain. |
| AF-UI-004 | Removed redundant guide, connection, comparison-card and nested dictionary frames. Source labels, coverage notes, edition separators, errors and disabled states remain. |
| AF-UI-005 | Persistent verse-run selection uses a lighter tint and fine text-edge cue. Verse-number fill is removed; selected numbers retain their underline and stable dimensions. No paragraph-length bar claims unselected text. Search matches, word choice and native text selection retain distinct treatments. |
| AF-UI-006 | All twelve collections are reachable through a compact native switcher, with an explicit overview link. The full grid appears only in the overview. Recent/saved shelves are available in a disclosure after the current task. |
| AF-UI-007 | Collection index search is labeled “Find in this collection,” with accurate per-collection field help. Full-text search is headed “Search resource text” and its persistent input label is “Search resource text · Words or a quoted phrase.” Hebrew/research/other specialized search controls retain their own scope labels. |

## Compatibility and technical choices

- New additive route: `/library?view=overview`. Bare `/library` still means Textual Comparisons, preserving old comparison links, filters and bookmarks.
- The committed collection switcher deliberately builds a clean destination through `app/lib/library-collections.ts`; incompatible query/context parameters are not forwarded. Overview card links retain their original routing conventions. Modified clicks still use ordinary links.
- Deliberate switching focuses/scrolls the main collection region. Existing `navigateCollection`, `locationKey` and `popstate` contracts remain for child tools and Back/Forward; context/search navigation does not receive an indiscriminate scroll reset.
- Native select semantics identify the current collection. It replaces a repeated grid, not every collection-specific filter. The persistent label is “Library collection” to distinguish it from full-text result filtering by Collection.
- The guide preference remains separate from its temporary disclosure-open state. A returning reader’s dismissal remains honored. Recovery still works through Reading settings.
- Selection styling follows actual source runs and verse numbers; it does not add a misleading paragraph-margin bar or change run membership. Number dimensions match the unselected inline dimensions to avoid line reflow from highlighting.
- The first heading uses the actual first loaded chapter, including source placement behavior. It is suppressed inside that chapter’s later section, while following chapters retain their original titles.
- No new dependency, remote font, image, theme or icon asset is introduced. Existing navy/cream/brass identity and local font stacks remain.

## Verification

Passed `npm run typecheck`, `npm run build` (its offline prebuild ran `npm test`: **175 application / 50 Python-source checks**), `npm run desktop:build:web`, and **15 desktop checks** after staging completed. The focused navigation test verifies every collection destination, clearing incompatible state and preserving `/library` compatibility. Existing content/search/editorial/lexicon fidelity checks pass without rebaselining any pin.

Browser checks covered:

- 1440×1000 reader/overview/comparison, medium 900px collection layout, 390×844 collection entry and 320px reader/sidebar/Library flows. Native browser 200% zoom and OS forced-colors mode are not exposed by the available controls and are **not claimed tested**. The stylesheet includes forced-color boundaries/selection; maximum app Scripture size (32px) was tested at 320px without final horizontal overflow.
- 2 Corinthians 13 BSB unmarked and whole-chapter selected; retained OM and publisher note markers, one accurate chapter heading, softer selection and whole-chapter study behavior.
- Romans 3:23–26 selection Edit/Cancel, Clear, and successful offline Copy with reference. Clearing before opening Compare uses the whole chapter. Escape restores the invoking Compare button after its normal animation frame.
- Compact/comfortable comparison and wider layout; selected tabs and retained source distinctions. Focus-mode entry/exit works with the promoted heading.
- John 1–2 multi-chapter selection retains exactly “John 1” and “John 2”; Psalm 23 retains its poetry blocks and publisher formatting.
- All twelve switcher choices, clean destination URLs, current native option, no repeated grid in collections, and overview with twelve cards/three desktop columns.
- Full-text quoted phrase “forgiveness of sins” (54 resources / three pages), source-book filtering for “forgiveness” in 2 Corinthians (two Lenski resources), context opening, Escape return, restored invoking-link focus, and offline Back/Forward retaining query/book. Query semantics and ranking were not changed.
- Offline Hebrew sidebar with H1254a Strong’s/BDB expansions, WLC main reader with RTL Scripture, and Abbott-Smith Greek sidebar. Dictionary matching/source limitations and historical-frequency labels remain.
- Fresh-guide dismissal, reload persistence and settings recovery were tested on the isolated offline-preview origin, without clearing the user’s real preferences/bookmarks. Maximum text size was changed only on that isolated origin.
- Final web and offline browser warning/error logs were empty. This is browser/offline-frontend evidence, not a physical-device, screen-reader or new signed-installer acceptance.

## Evidence and local handback

At 1440×1000, same chapter/edition/default text size and guide-enabled preference: Scripture moved from **y=778.27px to y=584.19px**, approximately **194px higher**. The heading moved from y=592.88px to y=223.20px. The new guide is intentionally collapsed by default rather than a permanently expanded callout. After selecting the full-text collection at 390×844, the input remains in the first viewport (bottom approximately 351px after deliberate task navigation).

Before/after images are under the ignored `artifacts/review/visual-polish/` directory: `before-reader.jpg` / `after-reader.jpg`, `before-selected.jpg` / `after-selected.jpg`, `before-panel.jpg` / `after-panel.jpg`, `before-library.jpg` / `after-library.jpg`, `before-fulltext.jpg` / `after-fulltext.jpg`, and `before-phone.jpg` / `after-phone.jpg`. The old Library screenshot shows the repeated grid; the new overview deliberately has its own additive route.

Local review:

- http://localhost:3034/read/2CO/13?translation=BSB
- http://localhost:3034/library?view=overview
- http://localhost:3034/library?view=fulltext

The normal local preview remains running; temporary development/offline QA servers are stopped and the browser viewport override reset.

## Protected boundaries

No corpus text, canonical mapping, morphology, source notice, editorial approval hash or language matching rule was changed by the polish. Active full-text derivative remains `library-search-2026-10-14-v2`; its tracked manifest SHA-256 remains `70017093d90f97ccedd89edbc9d99663c18bd43b52de59bcbc24ab8f56c10a1d`. The preceding Hebrew/Abbott-Smith work and untracked unrelated files were preserved. Public name/subtitle, version 4.0.0, signing/package/updater identities, retired accounts and Lectionary/Confessional Library/packet placement are unchanged. No commit, push, hosted deployment or signed installer was produced.

Next: Larry reviews the complete local polish. Native zoom/forced-colors and physical-device acceptance remain verification limits, not claims of completed tests. Current-release/M5/MVP acceptance stays closed.
