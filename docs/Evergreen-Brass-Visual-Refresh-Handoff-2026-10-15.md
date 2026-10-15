# Ad Fontes evergreen and brass visual refresh handoff

October 15, 2026 · AF-UI-035 through AF-UI-038 · Authorized for local implementation

Larry selected the evergreen-and-brass direction after reviewing the Library and reading concepts. His instruction is: **“Create a detailed handoff for the other Codex convo to implement these changes, keeping Georgia for Scripture and preserving the Greek and Hebrew typography.”**

Implement a noticeable, restrained refresh through the masthead, English interface typography, Library cards, and supporting colors. Keep prolonged reading comfortable. This is a presentation change on the current working app, with the existing functionality and recent improvements retained.

**The two firm typography requirements are unchanged Georgia for English Scripture and preservation of the existing Greek and Hebrew rendering.** Source Serif 4 is for English interface titles; Source Sans 3 is for interface controls and supporting Latin text. Neither is a blanket replacement for source-language text or reading prose.

Prepare the complete shared web/offline implementation and local review evidence. This request does not itself authorize a version bump, production deployment, installer publication, or replacement of native app icons. Follow any separate explicit release authorization in the receiving conversation. Do not seek renewed approval for the selected design direction or routine implementation choices within this scope.

## Baseline and governing decisions

Read `AGENTS.md`, `PROJECT-STATUS.md`, `docs/Ad-Fontes-NT-Handoff.md`, `docs/Ad-Fontes-NT-Implementation-Plan.md`, and `docs/Current-Release-Acceptance-2026-10-14.md`. Also read:

- `docs/Visual-Polish-Implementation-2026-10-14.md` and `docs/Visual-Polish-Follow-Up-Implementation-2026-10-15.md` for the implemented layout and accessibility work.
- `docs/Hebrew-Library-Study-Pages-2026-10-15.md`, `docs/External-Link-Sweep-2026-10-15.md`, and `docs/Reader-Resource-Rows-2026-10-15.md` for the latest local behavior.
- `docs/Hebrew-Lexicon-2026-10-14.md`, `docs/Abbott-Smith-2026-10-14.md`, and `docs/Original-Languages-2026-10-09.md` before touching their presentation boundaries.
- `docs/Full-Text-Search-Implementation-2026-10-14.md` and `docs/NT-OT-Connections-2026-10-07.md` for protected source/search behavior and retired accounts.

The handoff inspection found version 4.1.3, with AF-UI-008–016 implemented locally after that release. The local production preview used `http://localhost:3034/`. Verify the receiving conversation's current state rather than assuming that version or port is still unchanged. Existing uncommitted application work belongs to the ongoing implementation; preserve it. Inspect the diff before editing and keep unrelated archives, manuscript candidates, graphics, and output directories out of this change.

This decision supersedes the earlier visual handoffs' requirement to retain the navy palette and system-only interface fonts. Their completed usability and language improvements still apply. Current-release/M5/MVP acceptance remains closed; this is a new enhancement, not a reopening of historical acceptance.

## Visual references and how to use them

The following images reproduce the concepts Larry saw and selected. Repository copies are in `docs/design/evergreen-brass-2026-10-15/`; use those copies if the checkout path differs from the preview links below.

![Evergreen and brass Library concept](/Users/lherzog/Documents/Codex/ad-fonts-nt/docs/design/evergreen-brass-2026-10-15/library-concept.jpg)

![Evergreen and brass reading concept](/Users/lherzog/Documents/Codex/ad-fonts-nt/docs/design/evergreen-brass-2026-10-15/reading-concept.jpg)

These are **style references, not replacement page specifications**. The Library concept deliberately shows only three sample cards; the working app must retain all twelve collections, their current order, the collection switcher, and recent/saved features. The reading concept shows only a title and one verse to illustrate typography. Retain the real reader's toolbar, study tools, selection controls, resource disclosures, footnotes, settings, and complete passage.

The selected direction is the evergreen version. The experimental navy comparison and font switches are review aids, not new product settings. Do not copy the concept's remote Google Fonts dependency, preview footer, artificial empty reading space, simplified navigation, or sample content into production.

## Work packages

| ID | Required outcome |
| --- | --- |
| AF-UI-035 | Shared evergreen, ivory, brass, and sage palette, with readable interactive states |
| AF-UI-036 | Locally bundled Source Serif 4/Source Sans 3 interface fonts, with protected Scripture and language typography |
| AF-UI-037 | Restrained Library collection-card treatment across all twelve collections |
| AF-UI-038 | Shorter Library introduction and coherent application across existing surfaces |

Implement these as one coordinated local pass. Verification, offline parity, and documentation are part of each package.

## AF UI 035 Color and surface system

### Palette

Start with the selected concept colors. Reuse the app's existing variables where their roles agree; renaming every token is unnecessary. Any small contrast correction should preserve the chosen appearance and be recorded in the implementation note.

| Existing token or role | Target | Intended use |
| --- | --- | --- |
| `--ink` | `#183D35` | Evergreen masthead, high-emphasis buttons, selected study controls |
| `--ink-foreground` | `#FAF8F2` | Readable text on the dark evergreen surface |
| `--primary`, `--accent`, `--ring` | `#285B4B` | Links, interactive accents, and focus on light surfaces |
| `--background` | `#FAF8F2` | Warm ivory main reading surface |
| `--foreground` | `#242C29` | Dark charcoal reading and primary interface text |
| `--control` | `#FFFDF8` | Inputs and quiet collection-card surfaces |
| `--surface`, `--muted` | `#EDF1E9` | Pale sage study chrome, count badges, and supporting surfaces |
| `--muted-foreground` | `#5B665F` | Supporting copy that remains readily readable |
| `--border` | `#D8DDD5` | Subtle structural dividers and card edges |
| `--brass` | `#B7965B` | Masthead rule, active-navigation detail, and short decorative rules |
| `--input` | Retain a sufficiently contrasting control-boundary color; verify against ivory | Input recognition must not depend on the much softer decorative border |
| `--passage-selection` | Initially retain `#F3EFE3` | Existing subdued persistent Scripture selection |
| `--accent-soft` | Initially retain `#EEE4C9` | Existing warm search/token emphasis; audit uses individually |

Keep the successful distinction between the quiet ivory Scripture area and the subtly tinted study area. Do not turn long passages green or add tinted boxes around each verse. Keep the app's existing light appearance; a dark-mode feature is outside this handoff.

Brass is primarily decorative. It is not suitable for ordinary small text on ivory. Retain dark text in badges, descriptions, and source notices. On a dark evergreen masthead, a brass focus indicator can remain appropriate after contrast verification; on light surfaces use the darker green focus color. Never replace every focus outline with brass.

### Apply the colors by role

- Update all existing masthead variants, including Library, ordinary reader, English Septuagint, original-language reader, public pages, and the phone navigation menu. Preserve the exact name **Ad Fontes** and subtitle **A biblical study environment from Ordinary Means.**
- Keep the established thin brass masthead rule and active-navigation underline. Their colors change coherently; no taller header, large hero banner, new logo, or decorative background is needed.
- Make primary buttons and active study tools evergreen with light text. Secondary actions remain quiet. Preserve visible text labels, pressed states, and keyboard focus.
- Give generic supporting surfaces and count badges the pale sage treatment. Preserve the current NT/OT connections and OM commentary row alignment, 44px targets, count semantics, and loading/error behavior.
- Review older hard-coded blue colors in `globals.css` and the collection-specific stylesheets. Replace obsolete decorative/interactive blues by role, not with a global hex substitution. Several later CSS sections override earlier ones, so verify computed results.
- Preserve semantic differences in edition-status indicators, errors, warnings, publisher notes, exact occurrence marks, and source classifications. A branding pass must not collapse these into the same green. Keep text labels and existing forced-colors behavior.
- Preserve the existing quiet selection strength and its exact token/range boundaries. The recent muted Hebrew occurrence highlight can remain warm amber. Do not increase highlight saturation simply to make the release look different.

**Acceptance:** the masthead and interactive elements visibly use the new family, all text remains readable, source/status distinctions survive, and the reader remains calm during extended reading. No mixed accidental navy/evergreen chrome should remain on the reviewed core screens.

## AF UI 036 Typography and local font delivery

### Separate interface titles from reading text

The current `app/app/globals.css` includes this important coupling:

```css
:is(h1, h2, .scripture, .comparison-scripture) {
  font-family: var(--font-reading);
}
```

Do **not** implement the refresh by changing `--font-reading` to Source Serif. Split the responsibilities and scope the new title rules explicitly. Broad heading rules also reach Greek headwords, Hebrew detail headings, packet output, and authored articles.

Suggested role definitions, with the chosen local font-face names:

```css
--font-ui: 'Source Sans 3', -apple-system, BlinkMacSystemFont,
  'Segoe UI', Arial, sans-serif;
--font-title: 'Source Serif 4', Georgia, 'Times New Roman', serif;
--font-reading: Georgia, 'Times New Roman', 'Palatino Linotype', serif;
```

Use a preserved legacy UI stack where required to prevent an inherited source-language font change. A font-family declaration alone does not prove which font supplied a Greek glyph; verify the actual language surfaces as well as their computed styles.

| Surface | Required treatment |
| --- | --- |
| Ad Fontes wordmark | Source Serif 4, approximately 30–34px on desktop, semibold; retain compact phone size |
| English page and chapter titles | Source Serif 4, regular; retain current responsive sizing and hierarchy |
| English collection-card titles | Source Serif 4, semibold, approximately 20–22px where the existing layout permits |
| Navigation, labels, buttons, badges, explanatory UI | Source Sans 3; preserve readable sizes and target dimensions |
| English Scripture | Existing Georgia stack, size controls, line height, paragraph/poetry formatting, and emphasis |
| Greek Scripture, tokens, lemmas, headwords, and mixed-language source prose | Existing surface-specific font stack and metrics; no blanket substitution |
| Hebrew/Aramaic Scripture, words, headwords, and occurrences | Existing Noto Serif Hebrew asset and applicable existing fallbacks, directionality, isolation, and generous line heights |
| Long authored-study and historical-commentary bodies | Preserve current reading fonts and spacing; this is not a prose-body redesign |
| Printed/exported study packets | Preserve the current readable, ink-efficient output and Georgia Scripture; avoid accidental global heading/font inheritance changes |

Use regular and semibold title weights. Supply actual interface weights needed by the app, including 700 if retained in existing labels; do not rely on accidental synthesized styles. Avoid uppercase styling or letter-spacing on Greek/Hebrew text. Keep existing transliteration and dictionary-label distinctions intact.

### Protect language-specific rendering

Inventory the following before editing and compare them afterward:

- `.scripture[lang='grc']` currently uses the Palatino/Times family with its own line height. `.greek-token-text` also has a dedicated Palatino/Times treatment. Other Greek surfaces use Georgia or inherited UI fonts. Preserve each surface's current treatment instead of forcing every Greek element into one family.
- `.library-word-detail h1[lang='grc']`, Greek lexicon row links, Abbott-Smith `h4[lang='grc']`, selected token details, paired Greek, research text, and occurrence snippets must not inherit the new English title face accidentally.
- `.hebrew-text` and `.hebrew-scripture` use **Noto Serif Hebrew** from `/corpus/original-languages-2026-10-09-v1/fonts/noto-serif-hebrew.woff2`. Preserve those exact asset bytes and the existing source-release path.
- Preserve `.hebrew-word-identity`, `.hebrew-passage-text`, `.hebrew-occurrence-context`, and their current responsive sizes/line heights. Keep `lang="he"`, `lang="arc"`, `lang="grc"`, `dir`, `bdi`, and isolation behavior. Do not clip vowels or cantillation through a smaller line box or `overflow: hidden`.
- Check mixed Greek/Latin and Hebrew/Latin prose. Some dictionary paragraphs are plain source strings without separate language spans. Changing an ancestor's font can change those glyphs even when dedicated headword classes are preserved. Where language runs are not already isolated, retain the existing paragraph font treatment rather than rewriting source strings or introducing speculative script segmentation.
- A locally served font face may expose Greek glyphs. Prevent the new interface faces from taking over protected language runs through correct scope and, where appropriate, a verified Latin-only `unicode-range`. Do not use a guessed subset that drops transliteration diacritics or needed Latin punctuation.

Do not normalize text, remove marks, modify lexical matching, change source data, or alter approved article content to accommodate a font. Preserve source-specific unknown/missing-data labels and dictionary sense spacing from AF-UI-011.

### Bundle the new fonts for web and desktop

Use the official [Source Serif project](https://github.com/adobe-fonts/source-serif) and [Source Sans project](https://github.com/adobe-fonts/source-sans) as the upstream starting points. At implementation time, select and pin exact redistributable font artifacts, preserve their license files, and record version/commit, source URL, included faces/weights, file size, and SHA-256. Do not fabricate a version or checksum in advance.

Suggested new tracked location: `app/public/fonts/ad-fontes-ui-v1/`, with a small license/provenance manifest. This is an application asset directory, independent of immutable corpus releases. Equivalent shared local bundling is acceptable if it is verified in both builds.

Use shared local `@font-face` rules with appropriate fallbacks and `font-display: swap`. Normal builds and runtime must not fetch fonts from Google Fonts, Adobe, a package CDN, or a moving upstream release. Do not add `next/font/google` or copy the concept's hosted-font stylesheet.

**Desktop integration is required:** `scripts/prepare_desktop.mts` stages an explicit allowlist from `app/public` into `app/desktop/public`; it does not copy every public directory. If using the proposed public font directory, add its precise path to that allowlist so inventory hashes and the finished offline bundle include the files. Do not hand-copy only into ignored/generated desktop output. Alternatively, use bundler-resolved local files and verify their emitted assets in both production builds.

The native CSP currently permits `font-src 'self'`. Preserve it. Both `app/app/layout.tsx` and `app/desktop/main.tsx` import the shared stylesheet; avoid a web-only font solution. Preload only fonts whose need and benefit are demonstrated, without adding unnecessary variants or a large font payload.

**Acceptance:** Source Serif/Source Sans visibly render the intended interface roles in web and offline builds; Georgia remains the English Scripture face; Greek/Hebrew render as before, including accents and mixed text; no external font request is required; a font-loading failure leaves usable fallback text.

## AF UI 037 Library collection cards

Apply the concept's restrained treatment to the existing overview grid, not to every content box in the application.

- Keep all twelve cards, their order, labels, destinations, data-derived counts, and descriptions. Use the existing three/two/one-column responsive layout.
- Use the quiet control surface against ivory, a subtle border, and approximately the existing 6px corner radius. Keep enough internal space for two-line labels and descriptions, but avoid making cards substantially taller just to add ornament.
- Add one short brass rule, approximately 28–32px wide and 2px high, and one small consistent line icon per card. These can share a compact upper area. The title remains the focal point. At narrow widths, reposition the icon if needed so it does not consume an additional empty row.
- Use the already installed `lucide-react` library. Pick recognizable existing icons, approximately 18–20px with a consistent stroke weight. Suggested associations: calendar for Lectionary, notebook for packets, search for full text, columns for comparisons, book for Greek studies, dictionary for the lexicon, languages for Hebrew, search/book for Septuagint research, links for NT/OT connections, parallel columns for Gospel Parallels, scroll for confessions, and books for commentaries. Confirm actual exports in the installed version. No new icon library, custom logo, or theological symbolism is needed.
- Icons are decorative (`aria-hidden`, non-focusable). Visible labels and the existing full-card links remain the accessible navigation. Keep native hrefs and modified-click behavior; do not replace links with generic click containers or nest buttons inside them.
- Retain actual count badges only where the application already has counts. Style them consistently with pale sage and dark text. Do not manufacture counts for the other collections or hard-code the sample concept's numbers.
- Hover and focus should make the link clearer through a slightly stronger border or underline. Avoid lifting, bouncing, pulsing, large shadows, or perpetual animation. The card must be understandable on touch without hover.

**Acceptance:** every current collection remains reachable; card titles and descriptions remain readable at 320px, 390px, intermediate widths, and desktop; no labels collide with icons/badges; keyboard focus is clear; additional decoration does not undo the earlier balanced-grid work.

## AF UI 038 Library introduction and application consistency

Replace the overview's long enumeration of the collections with the concise sentence used in the concept:

> Explore the texts, languages, and resources that support your study.

Keep the title **“Explore Scripture and its study resources.”** and the **Study Library** eyebrow. The cards provide the collection-specific detail. This small copy change is interface text only; it does not alter scholarly content, resource coverage, or indexed source prose.

Retain the current navigation contract:

- Ordinary `/library` entry shows the real overview with **Browse all collections** selected.
- A specific selection retains the adjacent **Browse collections** link; it may wrap safely on a phone.
- Keep all twelve destinations, explicit comparison URLs, compatible older filtered/detail links, Back/Forward, contextual returns, and recent/saved behavior.
- Preserve **Search resource text** as the full-text destination name and **Find in this collection** for metadata/index-field searching.
- Hebrew Library studies remain full pages; reader/sidebar study dialogs retain their separate behavior. External links retain the recently implemented new-tab/system-browser rules.

Carry the shared colors and English interface title treatment into the reader, study headers, collection tools, and public pages where they already use the common visual system. Keep the completed phone study grid, compact controls above Scripture, recoverable reader guide, quiet dictionary separators, 72ch dictionary measure, and matched resource rows.

A short brass detail can accompany an existing English title where it fits, but do not add an extra ornament row above every passage or enlarge the phone header. The reading concept's rule illustrates the visual vocabulary, not a requirement to increase the reader's vertical footprint.

Do not add a “What's new” banner, theme switcher, new onboarding flow, dashboard, or navigation reorganization as part of this pass. The visual refresh itself supplies the requested cue.

## Code map and implementation sequence

Paths are relative to the repository root. Names below describe the inspected baseline; reconcile them with the receiving conversation's latest edits.

| Location | Work or caution |
| --- | --- |
| `app/app/globals.css` | Palette tokens, multiple generations of style overrides, font-role separation, mastheads, reader/study controls, Library cards, Greek/Hebrew exceptions, high-contrast and forced-colors rules |
| `app/library/library.tsx` | Library header, overview title/intro, all twelve card links, Greek detail headings; preserve routing and counts |
| `app/lib/library-collections.ts`, `app/lib/library-routing.ts` | Existing labels and route contracts; no routing redesign needed |
| `app/reader/reader.tsx`, `app/reader/lxx-english-reader.tsx`, `app/reader/original-language-reader.tsx` | Separate masthead variants and protected Scripture containers |
| `app/app/public-page.tsx` | Shared public-page masthead |
| `app/reader/study-panel.tsx`, `app/reader/hebrew-passage.tsx`, `app/reader/paired-greek.tsx`, `app/reader/greek-research.tsx` | Study chrome versus source-language content; preserve existing layout and text behavior |
| `app/library/hebrew-explorer.tsx`, `app/library/hebrew-study.tsx`, `app/reader/hebrew-dictionary.tsx`, `app/reader/abbott-smith.tsx` | Headwords, mixed-script dictionary prose, source labels, article presentation |
| `app/reader/word-studies.css`, `app/reader/commentaries.css` | Existing long-form reading typography; preserve body font/measure/spacing |
| `app/library/full-text-search.css`, `app/library/confessions.css`, `app/library/gospel-parallels.css`, `app/library/lectionary.css` | Check hard-coded supporting colors and inherited interface fonts |
| `app/library/study-packets.tsx` | Embedded preview/print/export CSS; prevent unintended global typography changes |
| `app/app/layout.tsx`, `app/desktop/main.tsx` | Shared stylesheet entry points |
| `scripts/prepare_desktop.mts`, `tests/desktop.test.ts` | Explicit offline staging, inventory, and meaningful font-asset verification |

Suggested order:

1. Capture baseline screenshots and font/spacing measurements from the latest local build. Record viewport, reader text size, guide/selection state, route, and scroll position.
2. Acquire and pin the chosen interface font files and licenses. Establish shared loading and offline inclusion before styling against them.
3. Separate title/UI/reading roles and explicitly protect language-specific and mixed-source text. Verify this before a broad color pass.
4. Update the palette and shared controls, auditing competing CSS rules rather than appending another unrestricted override layer.
5. Style all overview cards and shorten the introduction. Keep existing navigation intact.
6. Complete web/offline builds and focused browser checks. Fix layout regressions, then capture matched after images and document actual outcomes.

## Validation and review evidence

Run the repository-required `npm test`, `npm run typecheck`, and `npm run build`. The current web build's prebuild runs `npm test`; if using that execution as the test run, record it accurately rather than claiming an additional standalone invocation. Run `npm run desktop:build:web`, then `npm run test:desktop` after the build completes. Do not overlap desktop checks with staging that replaces its output directory.

Add only meaningful verification for the new asset behavior: required local font files/license or manifest, reproducible bytes, and inclusion in the finished offline build. Use browser inspection for actual typography and layout; avoid brittle tests that merely restate CSS strings. Preserve all existing source/editorial/search checks without changing pins to make failures disappear.

### Browser matrix

| Area | Minimum checks |
| --- | --- |
| Library overview | All twelve cards, selected default, counts, complete labels, keyboard focus, 1440px/1024px/390px/320px; no horizontal overflow |
| English reading | Matthew 6 and a poetry passage; Georgia at normal and maximum app text size; selection/copy, footnotes, focus mode, chapter navigation; no unnecessary extra space above Scripture |
| Reader controls | Both chapter-resource rows where available, successful zero-match hiding, loading/error clarity, four/five-tool phone layouts, 44px primary targets |
| Greek | Main N1904 reading, token/interlinear view, Greek lexicon detail and expanded Abbott-Smith, research/paired text, occurrences; polytonic accents and current font treatment unchanged |
| Hebrew/Aramaic | WLC main reading, Hebrew study pane, H1254a/H1254b, a long Aramaic form, dictionary expansion and exact occurrence highlights; marks, RTL order, isolation, and current headword hierarchy unchanged |
| Study/article prose | Greek/Hebrew authored studies, Lenski/K&D, mixed-language dictionary paragraphs; no unintentional body-font or source-text change |
| Search/navigation | Full-text results/context/return, default overview, explicit collections, a legacy filtered comparison URL, direct reload, Back/Forward, Hebrew full-page article return |
| Keyboard/accessibility | Visible focus on light and dark surfaces, selected states, Escape/focus return, text enlargement, readable source labels; inspect actual foreground/background combinations |
| Packets | Existing preview and print/export behavior, Georgia Scripture and ink-efficient output; no dark masthead or ornament added to printed content |
| Offline | Finished desktop frontend loads the new fonts from local assets; English/Greek/Hebrew remain readable with external connectivity unavailable; no remote-font fallback dependency |

Useful existing routes include `/library`, `/read/MAT/6?translation=BSB`, `/read/2CO/13?translation=BSB`, `/library?view=hebrew&hebrew=H1254a`, and `/library?view=lexicon&lemma=088e063630ad844a6dd6`. Use current UI-derived links for additional source-language contexts rather than guessing token identifiers.

Verify at least 4.5:1 contrast for normal text and 3:1 for qualifying large text under [WCAG text contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), and appropriate 3:1 contrast for essential control boundaries/focus indicators against adjacent colors under [non-text contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html). Decorative rules are not substitutes for visible control boundaries or readable labels. Check 200% zoom and OS contrast/forced-colors behavior when supported; distinguish unavailable checks from passes. Keep browser/device/native test claims proportional to what was actually exercised.

Save matched before/after evidence under `artifacts/review/evergreen-brass/` or the current review convention. Include the desktop Library, phone Library, English reader, Greek study, Hebrew study, and an offline view. Record new font provenance and byte totals, actual commands/results, contrast findings, and any unavailable platform checks in an implementation note. Do not overwrite earlier review evidence.

## Protected boundaries and completion

- Preserve the exact public name/subtitle, existing app icon/favicons, native package/signing/updater identities, and supported platforms. A new color palette does not authorize a new native identity or reworked social asset.
- Keep accounts, personal notes, and Google OAuth retired. Preserve legacy private data and configuration.
- Do not change corpus text, canonical/source mappings, analysis, token matching, dictionary entries, article bodies, approved review hashes, source notices, counts, or search coverage. New UI font provenance is separate from content releases.
- Preserve the active `library-search-2026-10-14-v2` manifest SHA-256 `70017093d90f97ccedd89edbc9d99663c18bd43b52de59bcbc24ab8f56c10a1d` and all predecessor evidence. Do not regenerate pins or use `--freeze` to conceal a discrepancy.
- Preserve distinct Scripture, publisher-note, Ordinary Means, historical-commentary, and confessional presentations. Preserve all disclosed source limitations and the October 14 acceptance decision.

The implementation is ready for Larry's local review when AF-UI-035–038 are complete, all existing collections and reader controls remain available, required checks pass, fonts work locally in both builds, and before/after review confirms unchanged Scripture and source-language typography. Update `PROJECT-STATUS.md` with the actual implementation state, evidence, limits, and next step. Release preparation remains subject to the receiving conversation's explicit authorization and the repository's documented workflow.

## Receiving conversation prompt

> Implement `docs/Evergreen-Brass-Visual-Refresh-Handoff-2026-10-15.md` in full on the latest local baseline, preserving the existing uncommitted work. Larry has selected the evergreen-and-brass direction. Complete AF-UI-035–038: the shared palette, locally bundled Source Serif 4 and Source Sans 3 for interface roles, all twelve Library cards, and the shorter overview introduction. Keep Georgia for English Scripture and preserve the existing Greek/Hebrew typography and mixed-language source prose. Retain the current Library overview default and recent UI/navigation improvements. Verify the web and offline builds, capture matched visual evidence, and update project status for local review. This handoff alone does not request deployment, signing, a version bump, or native icon changes.
