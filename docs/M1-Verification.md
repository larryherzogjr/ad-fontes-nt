# Ad Fontes NT — project status

2026-09-05 · **First working milestone (M1)** · Local only. The intended MVP is not finished.

## Completed backlog

- **AFNT-002:** 27-book canonical registry, aliases, explicit USFM/OSIS mapping, numeric ordering, chapter/verse bounds, single-chapter books, chapter/cross-chapter/disjoint ranges, absent-verse anchors.
- **AFNT-004:** Sites/Vinext React/TypeScript application; separate references/corpus/search contracts; static local bundles; reproducible setup/build/test commands. No D1, R2, accounts or remote Bible dependency.
- **AFNT-006:** Complete BSB NT import, original archives and evidence, checksums, structural/notes preservation, text alignment, gap/inventory/difference report; failed validation cannot replace an existing release.
- **AFNT-007:** Local corpus adapter, release-bearing passage results, coverage and publisher notes; invalid-reference, unsupported-edition and unavailable-data distinctions.
- **AFNT-008:** Responsive chapter reading, book/chapter controls, direct passage entry, previous/next, type size, device-local position, deep links and verse links. Cross-chapter passages show both chapter contexts.
- **AFNT-009:** BSB-only Scripture search, all-word matching and quoted literal phrases, book filter, 20-result pagination, no-results state, reference resolution before keyword search. Notes/headings excluded.
- **AFNT-010:** Automated raw source/segment/note/paragraph reconciliation, independent text fixtures, offline repeatability, reference and adapter tests, browser reading verification.

## Partial foundation; not claimed complete

- **AFNT-001:** BSB artifacts approved for this local milestone; seven English/Greek slots recorded, six later slots unresolved. No unverified later artifact is bundled.
- **AFNT-003:** Handoff content labels and source/evidence separation preserved. Qualified reviewer, 25–40 candidates and approved worked example remain outstanding; no editorial approval fabricated.
- **AFNT-005:** Desktop/mobile reading and publisher-note states implemented. Variant, Greek and personal-note designs remain later milestones.
- **AFNT-015:** BSB Sources & Editions view delivered early; multi-edition acceptance awaits M2.

## Decisions

Fixed scope remains NT-only, local BSB, canonical edition-neutral anchors, independent adapters, exact supplied branding, three later comparison groupings through named editions, separate content categories, and no AI/accounts/payments/groups/NET/ESV/OT. Adopted recommendations: static public chapter assets, a small lazily loaded English index, local preferences and one modular app. Server/private storage is unnecessary for M1. Typography/palette are neutral prototype decisions, not authenticated Ordinary Means brand assets.

Source release, hashes, asset layers and rights evidence: `sources/bsb/manifest.json`. Full decisions and later gates: `docs/Source-Decisions.md`. Later source slots: `sources/registry.json`.

The official USJ and TXT agree on the inventory: **27 books, 260 chapters, 7,941 nonempty Scripture rows, 1,312 publisher notes, 16 documented internal verse gaps**. TXT wording is authoritative. USJ structure is retained; all 200 differences are recorded (188 whitespace-only, 12 converter artifacts). These are source-specific counts. No universal verse-count assertion is used.

## Verification results

- Node domain suite: **8 groups passed**, covering all registered chapters, aliases, invalid/reversed/overlapping references, ranges, chapter boundaries, real absence, failed/incomplete loads, unsupported editions, search/filter/pages/phrases/no-results/note exclusion.
- Independent Python suite: **3 tests passed**. Every source verse, original note object and paragraph marker reconciled; all rendered verse characters equal official TXT; Romans 3:23, John 1:1, Philippians 2:6 (poetry) and Philemon 1:4 spot checks; repeat import is byte-identical.
- Production startup verified on loopback: reader/search/source routes and deep links return HTTP 200; served chapter and search bytes equal validated files.
- TypeScript check and production build passed. Builds gate on import and both test suites.
- Browser: John 1 reading; Romans 3:23 input/highlight/reload; Acts 8:37 absence notice, actual publisher reading, focus into note and back; keyboard Enter submission; whole-word search (115 grace results), second results page, Romans filter (18), quoted phrase result; Philemon single chapter and next into Hebrews; invalid Romans 99:1 error and recovery, zero-result search, final Revelation chapter disables Next, and keyboard Tab moves from passage input to Go.
- Layout: screenshots reviewed at 390×844 and 1280×900; 320-pixel and 390-pixel widths have no horizontal document overflow. Text size survives reload. Keyboard scrolling followed by reload restores the same 3,082-pixel reading position; Sources & Editions renders its source and milestone disclosures. Controls expose labels in the accessibility tree and native keyboard behavior.
- Browser testing caught a framework-history race; replaced manual synthetic navigation with full document navigation and retested search and direct routes.
- Payload measurement: largest chapter JSON 121,157 bytes; mean 46,061 bytes. Search JSON 1,459,291 bytes (354,497 gzip), loaded only for search. Domain search tests finish in tens of milliseconds locally; representative mobile cold/warm network budgets are not yet measured.

## Genuine limitations / release gates

This is a development milestone, not public-launch clearance. The prescribed scaffold's dependency audit reports **11 advisories (8 high, 2 moderate, 1 low)**, including transitive image/network libraries and RSC/dev tooling; saved in `sources/dependency-audit.json`. No server actions, image processing or external source fetching are used by the reader, but that does not clear the dependency findings. Update/revalidate these before any non-local exposure. Keep the dev server on loopback.

No full screen-reader audit, formal WCAG certification, mobile-network benchmark, production deployment, pilot, backup/rollback exercise or editorial Greek review is claimed. M5 covers broader acceptance. System fonts are used without external font requests; complete Greek typography testing awaits Greek corpora. Device-local reading settings do not synchronize and are lost when browser storage is cleared. The app requires JavaScript and does not yet install as an offline PWA.

Exact later Greek releases, morphology/lexicon/alignment rights, authentic Ordinary Means assets, actual resource inventory, editorial owner/reviewer and worked variant examples remain open. None blocks verified BSB reading. No public deployment, publisher message, account, paid service or invented Scripture was used.

## Next milestone

**M2 — English and Greek comparison foundation (AFNT-011–015):** verify/import BLB, MSB, YLT or a verified replacement and the three explicitly named Greek editions; reconcile real split/join/absence/bracket/placement behavior; preserve canonical passage on switching. Attempt BGB verification first, with the documented Nestle 1904 fallback. Freeze RP2018 and Boyd compilation release details independently. Do not add comparison claims or word alignments before source evidence exists.
