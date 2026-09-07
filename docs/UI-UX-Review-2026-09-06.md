# Ad Fontes NT — UI/UX design review

**A New Testament study environment from Ordinary Means.**

September 6, 2026 · Recommendations for AFNT-005 / AFNT-026 / AFNT-029

The strongest design direction is a quiet, carefully typeset reading environment with study tools close to the text. The existing off-white surface, deep blue-green accents, serif Scripture, narrow reading column, and explicit source labels support that direction. The largest opportunity is the hierarchy and placement of controls.

This is a design review, not an implementation or new acceptance decision. M4 remains accepted; M5 and the finished MVP remain incomplete.

## Review evidence

Inspected the live application at https://ad-fontes.app/ and the current source. Browser observations covered John 1 in BSB, the John 1:18 reviewed explanation and edition comparison, Greek text and interlinear views, the signed-out notes entry, and BSB search for “grace.” Desktop viewport was 1280 × 720; phone viewport was 390 × 844. Measurements below describe those particular states at a Scripture size of 21, after scrolling to the page top. They are not universal device measurements.

| Observed state | Finding |
|---|---|
| John 1, desktop | First Scripture paragraph starts approximately 922 CSS pixels from the page top. The opening screen contains controls and introductory material but no verse text. |
| John 1, phone | First Scripture paragraph starts approximately 1,250 CSS pixels from the page top. No horizontal page overflow was detected in this reader state. |
| John 1:18 comparison, desktop | The first edition card begins approximately 2,770 CSS pixels below the panel top, following the explanation and source list. The panel's total scrollable height is approximately 4,780 pixels. |
| Study panel, desktop | A 760-pixel modal covers much of the passage and dims the remainder. Its header scrolls with the content. Closing restored focus to the invoking commentary control. |
| Interlinear, phone | The first Greek word row appears near the bottom of the opening screen. View controls, repeated explanatory material, and optional-row checkboxes occupy most of that screen. |
| Search, phone | The reading Book/Chapter controls still display John / 1 while a separate search filter says All 27 books. The results themselves span books. |

An independent source audit also examined note editing and Greek word-detail placement. Signed-in note editing was not exercised in this review. No physical-device testing, full accessibility audit, or performance benchmark was performed. App code, corpus files, editorial approvals, and live hosting were not changed; automated app tests/build were not rerun for this documentation-only review.

## Recommended changes, in priority order

### 1. Put the passage at the beginning of the reading surface

The current sequence is masthead, search/edition/book/chapter controls, Scripture category, edition name and description, text size, study actions and help, notes disclosure, chapter title, commentary callout, publisher heading, then Scripture. Each part is defensible individually; together they postpone the primary activity.

Use a smaller masthead and one compact passage toolbar. Place the chapter title and selected edition immediately above Scripture. Put type size behind an accessible “Reading settings” control; move the general edition description into edition information while retaining material labels such as publisher draft and the exact named Greek edition. Replace the large chapter commentary callout with a compact, expandable count near the study actions, retaining inline OM markers and clear curated-coverage language.

On a phone, combine book/chapter navigation into one passage control and make search an explicitly labeled action that opens its input. Keep the exact name and subtitle. A compact sticky passage bar can supply previous/next navigation after the masthead scrolls away.

**Proposed design target:** at the default type size, John 1's first paragraph should be visible in both reviewed viewport sizes. This is a target to prototype and test, not an achieved result. Preserve touch targets and text enlargement rather than shrinking controls to hit it.

Source: `app/app/reader.tsx:445`, `app/app/reader.tsx:545`, `app/app/reader.tsx:590`, `app/app/reader.tsx:597`; `app/app/globals.css:88`.

### 2. Keep desktop study beside a usable passage

Use a nonmodal split layout when there is room for two readable columns. Reflow the Scripture column instead of covering it. Give the study area its own scrolling and a persistent passage title, tool selection, and Close control. On narrow screens, retain a full-width study view with an obvious return action and restoration of the selected verse.

Greek word details should stay adjacent to the Greek text on wide screens, or appear immediately beneath the selected verse on phones. Currently they appear after all selected Greek verses and selection scrolls to them. Retain the existing short definition previews.

Publisher footnotes are another candidate for contextual presentation: their current marker opens and scrolls to the note after the chapter. A nearby popover or the shared study area could avoid that long jump while retaining publisher attribution, original wording, and keyboard return behavior.

**Validation:** readers can inspect a note or word and consult its passage without repeatedly closing/reopening a panel; focus order, Escape, Back, deep links, and reading restoration still work. A desktop nonmodal redesign requires deliberate focus behavior; simply removing `showModal()` is insufficient.

Source: `app/app/study-panel.tsx:95`, `app/app/study-panel.tsx:193`, `app/app/study-panel.tsx:508`, `app/app/study-panel.tsx:555`; `app/app/reader.tsx:395`; `app/app/globals.css:570`.

### 3. Give comparison clear paths to explanation, readings, and sources

Provide in-panel navigation to “Explanation,” “Edition readings,” and “Sources.” Opening an OM marker should prioritize its approved explanation; opening Compare editions should make the actual edition readings immediately reachable. Move the long source bibliography into a disclosure, with cited links opening the relevant entry and moving focus correctly.

Use the existing approved explanatory sections without rewriting their theology or source claims. Keep English and Greek distinguishable. A wide comparison layout can place the three named groupings beside one another when legible; otherwise retain stacked groups with quick navigation. Keep exact edition names, source gaps, brackets, alternatives, and important limitations visible next to the affected text. Release IDs can sit in expandable source detail.

**Validation:** a reader can reach an actual edition reading without scrolling through the complete bibliography, and can distinguish Scripture, publisher notes, source observations, and Ordinary Means interpretation.

Source: `app/app/study-panel.tsx:340`, `app/app/study-panel.tsx:382`, `app/app/study-panel.tsx:469`.

### 4. Let Greek words lead the interlinear view

Keep the edition identity, contextual-gloss attribution, and lack of English alignment clear in a concise introduction. Put optional transliteration, lemma, Strong's, and grammar rows in a “Display options” disclosure. Hide the desktop width-expansion action when the study view already fills a phone screen. Use a compact segmented control for Greek text / Interlinear.

Prioritize the Greek surface, then the contextual gloss, then optional metadata. Preserve the source's word order, punctuation, and unavailable-analysis labels. This is a layout change, not new alignment or lexical interpretation.

**Validation:** the opening phone screen contains a useful portion of Greek text, and optional rows remain easy to discover and keyboard operable.

Source: `app/app/study-panel.tsx:478`, `app/app/study-panel.tsx:489`; `app/app/globals.css:857`.

### 5. Refine the visual hierarchy and reader-facing labels

Keep the existing palette and serif/sans-serif pairing. Establish a small consistent type scale: prominent chapter heading; comfortable Scripture; restrained section headings; readable utility labels. Concentrate generous spacing around Scripture and between sections, and tighten repeated label/control groups. Use fewer full-width bordered boxes, consistent border radii, and a clearer distinction between primary actions, secondary actions, and text links. Preserve visible keyboard focus.

Display “John 1:18” instead of “JHN.1.18” in UI headings and navigation, and compact contiguous selected ranges. Keep canonical identifiers unchanged in data and source records. Do not transform immutable quotations or approved editorial payloads through a blanket text replacement.

Give Save note the primary button treatment with its status adjacent, keep Delete visually distinct and secondary, and place import/export under a secondary disclosure. Make editor focus consistent for all New/Edit entry points. The current source reveals these note-composer opportunities; the signed-in flow needs browser validation during implementation.

Move internal milestone terminology such as “M4 accepted” to the project/about detail. It is accurate project status but gives ordinary readers little useful information in the site footer.

Source: `app/app/globals.css:168`, `app/app/globals.css:223`, `app/app/globals.css:632`; `app/app/study-panel.tsx:91`; `app/app/personal-notes.tsx:7`, `app/app/personal-notes.tsx:85`, `app/app/personal-notes.tsx:227`, `app/app/personal-notes.tsx:301`.

### 6. Make existing notes and resources easy to find without another large block

Place compact My notes and Related resources actions near the passage tools. The resource action can show an accurate count and open or jump to the existing collapsed list. Keep its accepted unobtrusive, link-only behavior and real passage matching. The signed-out notes action can say “Sign in to save notes,” with reading still immediately available.

Prioritize Read and study actions over account administration. A separate notes-browsing page is a possible later refinement if pilot use justifies it; the first improvement can reuse the current notes surface.

Source: `app/app/reader.tsx:420`, `app/app/reader.tsx:590`, `app/app/reader.tsx:786`.

### 7. Make the search toolbar reflect searching

On the search page, show query, edition, and one clearly labeled book filter. Remove the unrelated reading chapter picker from that state, or put it behind an explicit return-to-reading action. In the current interface, John / 1 above results from all books can imply a search constraint that is not active.

Subtly highlight matching search terms in result snippets while preserving the underlying Scripture text and the search engine's exact matching rules. Place the result count closer to the query and reduce the large repeated search heading on phones.

Source: `app/app/reader.tsx:502`, `app/app/reader.tsx:809`, `app/app/reader.tsx:835`.

## Suggested implementation sequence

1. **First pass — reading hierarchy and finish:** compact reader header/tools, chapter-first layout, human-readable references, consistent controls, phone display options, and context-specific search toolbar. Record under AFNT-005 / AFNT-026 / AFNT-029.
2. **Second pass — study interaction:** desktop split layout, persistent study header, comparison section navigation, and contextual word/footnote details. Preserve every existing navigation and source distinction.
3. **Pilot verification:** ask unfamiliar readers to open a passage, compare John 1:18, inspect a Greek word, find a related resource, and create/save a note. Observe finding the controls, maintaining reading context, and understanding content categories. These remain proposed tasks under AFNT-028, not pilot results.

Reader changes require the repository's full test, typecheck, build, and meaningful browser checks. No implementation work is approved or completed merely by this recommendation list.

## Implementation follow-up

After this review, Larry explicitly approved implementing the full refinement for local presentation. The seven recommendations above are implemented in the local checkout. The original observations remain as the baseline; this does not approve deployment or change milestone acceptance.

The compact reader now exposes John 1's first paragraph in the opening reviewed desktop and phone viewports (approximately 548px and 653px from the top, respectively, at 21px Scripture). Desktop study shares the screen with the reader, with expanded comparison at sufficiently wide sizes; phones retain the full-width study view. Footnotes and Greek details are contextual, comparison navigation separates the explanation/readings/sources, search has one active book filter and matched-term highlighting, and personal-note controls have been refined.

Automated checks passed: 46 Node tests, 11 Python tests, typecheck and production build. Browser verification covered navigation, representative source edge cases, keyboard/focus behavior, 320–1600px layouts and enlarged Scripture. A separate temporary fixture exercised the actual personal-notes component with synthetic account/notes responses, including failed-save draft retention; real Google sign-in, database integration, physical devices and an unfamiliar-reader pilot were not rerun. No application authentication bypass, corpus/editorial changes or live deployment was introduced. See `PROJECT-STATUS.md` for the detailed implementation and validation record.
