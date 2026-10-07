# Focused UX pilot polish · October 7, 2026

Larry approved all five second-review recommendations and both optional polish items. This is shared web/desktop presentation work (AF-OT-016).

- Connected Greek details appear immediately after the selected source verse, with reference, edition and word ordinal. Phones show the selected source verse and its details as a focused view; Return restores the occurrence and full comparison. Dictionary material and existing Ordinary Means commentary remain distinct.
- Connection selection, display state and English/Greek controls precede explanatory material. Filters, reviewed evidence, publisher provenance and range adjustments share a disclosure. Display controls remain sticky below the measured study header.
- Every Septuagint search result and lemma occurrence names its exact source text. English correspondence/source-only status remains separate.
- Connected English readings retain immutable source segments and display independent reference markers rather than a concatenated range. Existing internal line breaks are preserved. Verse rows do not assert cross-side alignment or introduce publisher paragraph claims.
- Desktop study chrome offers a visible Widen comparison control.
- Authored comparison views identify commentary and edition comparison; their explanation tab names commentary explicitly.
- Empty research searches explain filter/spelling recovery and offer Clear source filters, retaining query, search type and accent preference. No-match states do not imply textual absence.

No source, mapping, classification, approval hash or native identity changes. No deployment. M5 physical-device/accessibility pilot, performance/package evaluation and signed release acceptance remain outstanding.

Verification passed: 99 Node tests, 32 Python checks, typecheck, web production build and desktop production bundle, plus six desktop offline checks. The immutable import pipeline reproduced the approved inputs before tests/builds; the historical width-label assertion was updated to the authorized visible wording. Final UI rebuilds used the reproduced bundles.

Browser verification covered the web and packaged desktop preview: selected NT/LXX reference/edition/ordinal; keyboard activation, arrow navigation and return focus; full versus phone-focused Greek passages; two-column widened desktop comparison; sticky controls measured below the header; independent English markers; Tobit Sinaiticus result and occurrence labels; clearing a restrictive morphology filter back to 30,603 source verses; and John 1:18 commentary labels. At 390px, no panel horizontal overflow; first connected English passage begins around 534px (previous review layout around 690px). No browser errors observed. Screenshots: `artifacts/review/ux-word-context-phone-2026-10-07.png` and `artifacts/review/ux-connected-english-phone-2026-10-07.png`.

Local review remains available at http://localhost:3016. Physical-device review is still part of M5.
