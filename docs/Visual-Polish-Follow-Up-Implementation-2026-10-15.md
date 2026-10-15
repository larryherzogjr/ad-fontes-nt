# Follow-up visual polish — AF-UI-008–013

Larry explicitly confirmed **“Implement all six locally.”** This implements the October 15 handoff on the completed 4.1.3 baseline. The October 15 overview decision supersedes the first pass’s bare-Library comparison default; historical handoffs and the existing queued status entry remain intact.

| ID | Implemented result |
| --- | --- |
| AF-UI-008 | Phone primary study navigation uses two equal grid columns, with 44px-high controls. Four NT tools use two rows; the five-tool OT/Hebrew case uses three rows with the last tool retained. Secondary sections, study history, Close and desktop horizontal navigation remain separate. |
| AF-UI-009 | Packet, selection and recoverable guide controls share a secondary group. NT/OT and Ordinary Means chapter disclosures share a compact resource area but remain independently operable. Loaded resource-free chapters leave no strip; loading/error notices remain available. Scripture typography is unchanged. |
| AF-UI-010 | Hebrew details promote the exact indexed source form, including marks, above its source key and explicitly labeled dictionary transliteration. Dictionary headwords/glosses remain distinct. Shared sidebar titles remain proportionate. No transliteration or form equivalence is generated. |
| AF-UI-011 | Dictionary prose is bounded to 72ch with paragraph spacing. Only explicit leading `1.`–`99.` and `(a)`–`(z)` paragraph markers receive major/subordinate styling. Literal paragraph strings remain the rendered content; there are no generated list numbers. Hebrew prose shares the measure/spacing; ambiguous markers such as BDB’s `1 be created` remain plain. |
| AF-UI-012 | The overview destination, switcher, heading and applicable links identify “Search resource text.” Index-field and Scripture searches retain their own labels. Hebrew occurrence marks alone use muted amber, with system highlight colors in forced-colors CSS. Exact token selection is unchanged. |
| AF-UI-013 | Plain `/library` now opens the actual overview with “Browse all collections” selected. Overview URLs are also supported; collection pages retain the adjacent browse link. New comparison links explicitly emit `view=comparisons`. |

## Navigation compatibility

`app/lib/library-routing.ts` centralizes parsing and serialization. Initial rendering shows a loading state until the actual route is known, preventing a misleading comparisons flash. Collection switching starts clean; in-collection pagination and detail return links retain valid state. Deliberate switching focuses the collection region, while passive history restoration retains its existing behavior.

- Bare `/library`, explicit overview, unrelated parameters and unknown views select overview. Overview ignores stray collection filters, including those attached to unknown views, so card counts remain complete.
- Explicit valid views retain their destination and supported parameters.
- Old unqualified comparison links with `q`, `book`, `kind`, or a valid positive `page` retain comparison behavior. Existing saved bookmarks are not rewritten.
- Unqualified article/lemma/Hebrew detail keys also retain their intended collection. Explicit invalid views use the overview fallback.
- Serializers, comparison cards, filters, pagination and textual-study return links generate explicit comparison URLs. Global header, mobile and footer Library links remain ordinary `/library` entry links.
- Native links retain their hrefs and modified-click behavior; no custom new-tab replacement was added. Full-text and original-language context URL contracts are unchanged.

## Verification

Passed `npm run typecheck`, `npm run build`, `npm run desktop:build:web`, and `npm run test:desktop`. The web prebuild executed `npm test`: **180 application tests / 50 Python-source tests**. All **15 desktop checks** passed after the completed 61,463-file staging. Focused navigation and dictionary tests passed (10 checks). Final typecheck/full web build were refreshed after tightening the overview fallback; the offline bundle contains that refinement and its routing matrix was browser-tested. No standalone duplicate `npm test` invocation is claimed.

New regression checks cover clean explicit destinations, default/unknown-view overview behavior, legacy filters, detail URLs, invalid page numbers, pagination state, collection switching, and conservative sense-marker classification. Existing source/editorial/dictionary/search fidelity checks pass without changing pins.

Browser checks on the local production/development previews and built offline frontend covered:

- 1440×1000, 900px, 390×844 and 320px layouts; three/two/one-column overview, all twelve switcher destinations, useful deliberate focus, and no observed horizontal overflow in checked cases.
- Four NT tools in two phone rows; five OT/Hebrew tools in three rows; 44px primary target heights; compact/comfortable readings, widened comparison, keyboard activation, Escape and settled invoking-button focus return.
- 2 Corinthians 13 with no selection and whole-chapter selection; Romans 3:23–26 Edit/Cancel, Clear and successful Copy status with reference; John 1–2 chapter headings; focus mode; 32px Scripture at 320px without overflow.
- Zero resources (1 Chronicles 22), one resource type (Genesis 1) and both types (2 Corinthians 13). Publisher notes and inline OM markers remain distinct.
- Dismissed-guide reload and settings recovery during the current visit on an isolated QA origin. Existing dismissal persistence and temporary guide display behavior are preserved; actual user guide/text preferences were not cleared.
- Plain/global header/mobile/footer Library entry, explicit overview/comparisons, legacy filtered comparison links, unknown views, clean switching, search submission, Back/Forward/reload and retained book/query state. Final production preview confirms twelve overview cards and explicit comparison links.
- Hebrew H1254a/H1254b retain distinct BDB mappings and the shared broader Strong’s entry; H2030 discloses the unresolved BDB mapping. A long Aramaic A324 form fits with `lang="arc"`. Exact occurrence marks remain intact; occurrence-to-WLC navigation and return context work offline.
- Expanded agapē prose has a 72ch measure with explicit major/subordinate spacing; ἄγω’s two source entries remain separate. Dictionary content fits at 320px. Historical source notices and frequency labels remain.
- Filtered full-text “forgiveness” in 2 Corinthians still returns two Lenski resources on web and offline. Opening context and Escape preserve query/book state. Final captured browser warning/error logs are empty.

Native browser zoom, OS forced colors, physical-device/screen-reader testing and new native/signed installer verification are not claimed. The available browser controls do not expose forced-colors emulation. Fetch-failure/retry behavior retains the passing existing domain checks; new browser fault injection was not performed. The CSS supports forced colors, but that is not a claim of an observed OS-mode test.

## Matched evidence

At **390×844**, **21px Scripture**, no explicit selection, guide enabled/collapsed and scroll position zero, 2 Corinthians 13’s first Scripture paragraph moved from **y=620.39px to y=547.80px**, about **73px higher**. Whole-chapter compact comparison’s first actual Scripture paragraph moved from **y=748.79px to y=628.79px**, **120px higher**. The four phone tools changed from four rows to two, retaining 44px heights. These are this pass’s fresh measurements, not the prior review’s measurements.

Evidence is in the ignored `artifacts/review/visual-polish-follow-up/` folder:

| View | Before | After |
| --- | --- | --- |
| Phone reader | `before-phone-reader.png` | `after-phone-reader.png` |
| Phone study navigation | `before-phone-panel.png` | `after-phone-panel.png` |
| Hebrew word detail, desktop | `before-hebrew.png` | `after-hebrew.png` |
| Hebrew word detail, phone | `before-phone-hebrew.png` | `after-phone-hebrew.png` |
| Expanded Greek dictionary | `before-dictionary.png` | `after-dictionary.png` |
| Hebrew occurrence highlight | `before-highlight.png` | `after-highlight.png` |
| Ordinary Library entry | `before-library.png` | `after-library.png` |

`metrics.json` records matched positions, font/guide/scroll state and tool coordinates; `routes.json` records navigation checks. Build logs are retained alongside the screenshots. Initial automation reads taken before navigation/focus settled were repeated after the actual UI became ready; those transient readings are not reported as application failures.

## Local review and protected boundaries

- http://localhost:3034/library
- http://localhost:3034/read/2CO/13?translation=BSB
- http://localhost:3034/library?view=hebrew&hebrew=H1254a
- http://localhost:3034/library?view=lexicon&lemma=088e063630ad844a6dd6

The refreshed local production preview remains on port 3034. Temporary development/offline QA servers are stopped and the viewport override is reset. Existing uncommitted status/handoff work and unrelated archives, graphics and candidates are preserved.

No version bump, commit/push, production deployment or signed installer was made. Branding, native identities, current-release acceptance, retired account decisions, Library-only Lectionary/Confessional placement, corpus/canonical/morphology/editorial approvals and dictionary matching rules remain unchanged. Full-text search coverage is unchanged: dictionaries and other additional collections were not added. The active search manifest SHA-256 remains `70017093d90f97ccedd89edbc9d99663c18bd43b52de59bcbc24ab8f56c10a1d`; Hebrew and Abbott-Smith inputs/outputs reproduce their existing pins.

Next: Larry reviews all six local outcomes. Any release remains separately authorized work.
