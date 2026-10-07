# Greek NT/OT connected study — October 7, 2026

Larry authorized recommendations 1–3: paired Greek comparison, cross-Testament lemma exploration, and reviewed connection classifications. Hebrew remains undecided and outside this release. This follow-on uses existing pinned Scripture/analysis and approved OM studies; it adds no commentary or source corpus.

## AFOT-008 — Paired NT/Septuagint reading

The NT/OT panel presents English, Greek, or both. Greek panes identify Nestle 1904 and selected Rahlfs 1935 source text, retain separate source numbering/correspondence labels, and report errors independently. Interlinear glosses and source-specific morphology can be toggled. Exact NFC lemmas shared by the displayed passages can be highlighted; this is a lexical observation, not word alignment or proof of literary dependence. Word buttons expose the existing Dodson definitions, unchanged approved OM lemma studies, analysis provenance and cross-source occurrence explorer.

`panel=connections`, `connection=<publisher-reference-id>`, `connectionView=english|greek|both`, and `connectionGreekView=text|interlinear` preserve reader deep links. Ordinary reader selections and shared panel close/keyboard behavior remain available. Publisher-note anchors do not establish quotation extent. English editions preserve their own wording; Greek analysis uses its identified source regardless of English choice.

## AFOT-009 — Cross-source lemma concordance

`greek-lemma-links-2026-10-07-v1` is an offline derivative of `nestle-analysis-1.3-m3-v1` and `lxx-rahlfs-1935-2026-10-07-v3`. Its source lemma file hashes, implementation hash and output hash are pinned under `sources/greek/`. The builder verifies its frozen snapshot; changed inputs/implementation require a successor, not an unexplained freeze.

The index contains 12,994 exact normalized lemmas, 3,182 shared by both sources. It preserves source lemma identifiers and independent counts. No accent stripping, synonym expansion, Strong’s equivalence or English alignment is used. The explorer switches NT/Septuagint, filters by book, pages 20 occurrences, verifies word offsets and links to Greek context. Occurrence count/release/lemma mismatches report errors; zero indicates no indexed exact match within that source’s stated coverage. NT coverage remains 7,940 matched source verses; selected LXX mapped verses exclude 342 unpaired source verses. Existing source selectors, coverage gaps, original notices and 19 unmatched gloss verses remain unchanged.

Only the selected source’s occurrences load on demand. The UI pages results, but original per-lemma occurrence assets remain complete; this is not a smaller native data distribution. Greek data continues to add approximately 576 MiB uncompressed.

## AFOT-010 — Review-controlled connection labels

The original 698-reference publisher index is unchanged. A separate local editorial publication supplies only exact-content human-approved quotation, allusion or broader-parallel records. It verifies reference identities, canonical ranges, pinned English Scripture evidence and review hash/reviewer/date; changed payloads invalidate approvals. It never converts every publisher reference into a quotation. The UI supports filters, shows approved observation separately from editorial judgment and exposes reviewer/date/hash.

Eight conservative quotation/allusion candidates are in review in `content/editorial/connections/`. Their complete readable packet is [NT-OT-Classification-Review-2026-10-07.md](NT-OT-Classification-Review-2026-10-07.md). Broad-parallel infrastructure is present, but no new parallel judgment is proposed without adequate review evidence. All eight candidates are withheld from web/native public assets. The empty approved-only publication explicitly reports no approved classifications, while retaining all publisher references. A failed publication load reports an error and leaves reference reading available.

The exact batch payload hash is `ee8a80aae380568200ae6e4086bc4cf6c1b4074ebeb1bd51c204a227c397e8b3`. Approval is pending, not inferred from reviewer assignment or feature authorization. After Larry approves the complete packet: record exact individual hashes, actual approval date, reviewer `larry-herzog-jr`, set approved statuses, reproduce local bundles and verify. Any corrections need fresh hashes/approval. No deployment or signed native publication is part of this work.

## Continuing scope

Hebrew, additional LXX editions/deuterocanonical navigation, English word alignment, reconstructed quotation boundaries and new OT passage commentary remain outside this increment. Existing canonical mapping and source notices remain authoritative. M5 pilot/release preparation and physical native acceptance remain pending; the MVP is not marked complete.

## Verification and local review

Full shared verification passed (89 Node / 31 Python / six desktop tests, typecheck, production web and desktop builds). Final UI refinements were followed by typecheck, another full test suite, both build refreshes and six desktop tests; final review-ledger changes also passed the focused approval tests. Browser checks verified paired NT/OT Greek, shared highlighting, definition/OM reading, separate source counts, book filtering/pagination, main-inspector cross-source exploration, selected connection/display deep links, keyboard return/Escape/reopening and 320px/390px layouts. Packaged desktop checks included reverse YLT Jeremiah/Hebrews links and source Jeremiah 38 correspondence to English 31. No console errors were observed in these views. All 28,909 released files are staged offline; no draft classifications are bundled. The production web preview runs on loopback 3016, and packaged desktop preview on 1421. [Review image](../artifacts/review/greek-connections-2026-10-07.png). This is local engineering verification, not native signing, deployment or M5 acceptance.

## Exact-content approval follow-on

Larry approved all eight records on October 7 with “All approved.” Batch `ee8a80aae380568200ae6e4086bc4cf6c1b4074ebeb1bd51c204a227c397e8b3` is unchanged; individual approval hashes/date/reviewer are recorded and candidate statuses are approved. The separate editorial bundle now contains seven quotations and one allusion. Exact reciprocal publisher references receive the same reviewed label through the approved connection-ID lists; other references retain their unclassified status. Earlier pending statements document the pre-approval state. No broader-parallel record, changed Scripture, new commentary, deployment or signed installer is included. Final approval-publication verification is recorded in PROJECT-STATUS.md.

Approval-publication verification passed: full shared gate (89 Node, 31 Python, six desktop tests, typecheck and both builds). A browser-cached empty pre-approval bundle was corrected by fresh classification requests (`cache: no-store`); focused tests/typecheck, both build refreshes and six desktop tests passed afterward. Web reviewed-quotation filters, reciprocal badges, exact source evidence and reviewer/hash display passed, including 320px; packaged desktop reviewed-allusion reading/filter/evidence passed with no console errors. [Approved view](../artifacts/review/approved-connection-labels-2026-10-07.png).
