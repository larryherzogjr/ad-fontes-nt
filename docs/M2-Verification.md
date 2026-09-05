# Ad Fontes NT — project status

2026-09-05 · **M2 working milestone: English and Greek edition foundation** · Local only; the MVP and public-release review are not complete.

## Completed engineering backlog

M1 **AFNT-002, 004, 006–010** remains working. Its original source release is immutable; prior verification is retained in `docs/M1-Verification.md`.

- **AFNT-011:** BSB, BLB, MSB and YLT are locally readable, with independent source-format ingestion, pinned originals, layer-specific rights evidence, reproducible outputs and English Scripture search.
- **AFNT-012 (engineering):** Nestle 1904 fallback, Robinson–Pierpont 2018 and Boyd compilation (2022) are imported. Original Unicode, source numbers, brackets, subscriptions, publisher notes and identified appended alternatives are retained. Qualified textual review has not been claimed.
- **AFNT-013 (engineering):** Explicit mappings for absence, brackets, joined/split numbering and relocation. Source placement is distinct from canonical anchors; failed data loads remain errors. Real fixtures include Acts 8:37, Mark 16:9–20, John 7:53–8:11, Romans 14/16, 2 Corinthians 13, 3 John 14/15 and Revelation 12/13.
- **AFNT-014:** Named edition selector preserves a selected canonical passage, highlights mapped source text and moves focus back into reading. Normal chapter selection stays in that source chapter. Reading preferences and edition-bearing deep links persist locally.
- **AFNT-015:** Sources & Editions is driven by the release catalog, with exact identities, source links, rights, included/excluded layers and checksum manifests.
- **AFNT-001 (local source gate):** All seven slots have pinned local artifacts. Human source/editorial sign-off remains a public-release dependency; no alignment or enrichment is implied by sharing a group.

## Source inventory

Each edition has 27 books and 260 chapters. Counts describe its source, not a universal verse count.

| Edition | Nonempty source segments | Publisher notes | Distinct treatment |
|---|---:|---:|---|
| BSB | 7,941 | 1,312 | Existing verbatim TXT/USJ import; M2 mappings in a new release |
| BLB publisher draft | 7,941 | 0 | TXT supplies verse layout; no supplied paragraph/note structure |
| MSB | 7,953 | 3,104 | Four empty markers; doxology at Romans 14:24–26 |
| YLT 1898 | 7,957 | 0 | eBible metadata identifies 1898; original archaic English |
| Nestle 1904 | 7,942 | 1 | Source’s 1913 annotation, brackets, separate Mark shorter ending |
| RP2018 | 7,953 | 0 | 15 alternative verse rows in PA/ACT24, outside main text |
| Boyd TR compilation | 7,957 | 342 | 14 subscriptions separate from verse text |

Manifests: `sources/<edition>/m2-manifest.json`. Immutable output hashes: `m2-output-checksums.json`; exact source inventories: `m2-inventory.json`. BSB M1 provenance is retained separately. MSB local v2 adds links from absent anchors to the actual publisher notes at the preceding source verse; the preliminary v1 is retained and not selected.

## Decisions and limitations

Static per-chapter JSON remains practical. React/TypeScript, edition-neutral references and a corpus interface are retained. A relational database such as PostgreSQL can be introduced behind that interface for future editorial/private data if needed; M2 introduces no database service or migration commitment.

BGB’s download host could not be reached, so the handoff’s Nestle 1904 fallback is used. BLB is visibly labeled as a publisher draft. MSB’s exact underlying RP release remains unspecified; YLT is not equated with Boyd’s compilation; Nestle is not labeled the exact Greek behind BSB/BLB. The selected Nestle transcription includes some later annotation and inconsistent verse markup, all documented in `docs/M2-Source-Decisions.md`. No silent harmonization or invented Greek wording was used.

BSB uses its existing reviewed TXT/USJ differences. MSB’s 738 differences (728 spacing, 10 converter artifacts) are pinned and reconciled to official TXT wording; originals and original structured runs remain stored. New layer imports require separate rights and source checks. Morphology, Strong’s analyses, lexicons, English–Greek alignment, essays and fonts are excluded from application bundles.

No qualified textual reviewer, reviewed theological explanation, variant collection, personal notes, accounts, payments, AI, group workflow, NET/ESV, OT feature or public deployment is represented as complete. AFNT-003 and the human review portions of AFNT-012/013 remain open.

## Verification

- **13 Node test groups passed:** all 1,820 edition chapters and all mapping targets; resolver edge cases; split/join/renumbering/relocation; real absence versus data failure; full bracketed units; alternatives; four-edition English search and explicit unavailable Greek search capability.
- **9 Python tests passed:** three retained M1 checks plus six M2 groups. Full BLB/MSB TXT reconciliation; full YLT/Boyd comparison with independent VPL exports (subscriptions accounted for); Nestle non-layout Unicode round-trip including brackets/alternatives; all RP main-text letters and inventories against original CCAT, with independent Nestle passage spot checks against the separately transcribed text column. Original MSB/Boyd publisher-note objects and every RP Unicode CSV surface string also reconcile exactly. This does not claim morphology verification.
- Offline imports verify original/evidence hashes, exact reviewed differences, frozen inventories and every output-file checksum. A changed or unexplained source inventory fails instead of becoming textual absence.
- TypeScript checking and production build passed. The build runs offline import and domain/fidelity verification before compilation; the subsequently added original-note/Unicode check also passed.
- Browser: Romans 3:23 switched through all seven editions with the canonical URL and mapped text retained; Romans 16:25–27 in MSB loads the source doxology at 14:24–26 and survives reload; 3 John 15 maps to BSB’s joined verse and Nestle’s separate verse. Ordinary BSB Romans 14 remains a single source chapter.
- Browser: Acts 8:37 displays a real-absence notice and opens MSB’s actual publisher note; focus moves to the note summary and returns to its marker. A long bracketed Mark passage uses one concise notice and retains its separately labeled appended alternative.
- Browser: YLT search finds 122 “grace” results, shows page 2, and filters to 20 Romans results. Keyboard Enter submits reference/search input; Tab reaches Go; the native edition menu accepts keyboard selection and returns focus to reading.
- Screenshots reviewed at 390×844 (polytonic Greek) and 1280×900 (reader/selector). DOM layout checks at 320, 390 and 1280 pixels show no horizontal overflow. Greek Scripture has `lang="grc"`. Existing text-size persistence remains working. No full screen-reader certification is implied.

Existing local-only caveats continue: the prescribed scaffold has 11 recorded dependency advisories (8 high, 2 moderate, 1 low), so public exposure needs remediation/revalidation. No full screen-reader audit, formal WCAG certification, mobile-network benchmark, pilot, deployment or offline-PWA capability is claimed. System fonts are used; preferences do not synchronize.

## Next milestone

**M3 — curated textual comparison and Greek exploration (AFNT-016–021).** Start with the variant schema/publication gate and a verified Greek analysis source. Reviewed explanations require an identified qualified human reviewer and actual source evidence. Keep draft material unpublished; do not fabricate Ordinary Means resources, interpretations or alignments.
