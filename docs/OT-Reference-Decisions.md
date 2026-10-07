# OT reference and structure decisions — 2026-10-07 (AFOT-002)

## Boundary

This is an offline engineering audit and reference proposal, not a public corpus release or textual/editorial approval. All original artifacts and evidence remain immutable. The current app still reads NT only. AFOT-001 selects the English sources; AFOT-003 will implement and verify new releases.

Reproduce with `python3 scripts/ot/audit_sources.py`. The script verifies pinned artifact/evidence hashes and writes [the complete source-path-bearing report](OT-Reference-Reconciliation-2026-10-07.json). It does not invoke or change any production adapter. Exact unnormalized discrepancy strings, structured special blocks and original notes are retained in that report. Counts below use whitespace-normalized comparison; whitespace-only differences within words are separately identified by comparison with all whitespace removed.

## Reference proposal

Use the 39 English OT books in their existing source order, with uppercase USFM-style canonical codes. The report carries each book name and every chapter's verse maximum for all four editions. Their independently parsed inventories match exactly: 39 books, 929 consecutive chapters, 23,145 nonempty source rows, no duplicate addresses and no internal verse-number gaps. Both USJ sources and YLT USFX match their authority's address sets in both directions, with no missing or extra addresses. All structured verse labels encountered are numeric; no joined/range markers require an English mapping in these artifacts.

Keep `app/lib/domain/registry.json` as the frozen M1 reproduction base and the existing NT `canonical-registry.json` unchanged. AFOT-003 should create a versioned OT registry candidate and a reviewed whole-Bible union successor, preserving the NT prefix identities and predecessor bytes. The audit inventory is a proposal, not the active registry. Validation must continue distinguishing canonical existence, edition coverage and data-load errors.

### Source aliases verified

- Berean TXT calls the book `Psalm`; the display/canonical book name can remain `Psalms`, code `PSA`.
- YLT VPL uses `SOL`, `EZE`, `JOE`, `NAH`; YLT USFX uses `SNG`, `EZK`, `JOL`, `NAM`. Explicit mappings are SOL→SNG, EZE→EZK, JOE→JOL and NAH→NAM. Preserve original source IDs separately.
- English chapter/verse equality establishes no Hebrew or Septuagint mapping. Those corpora will require their own inventories and alignment decisions, including superscriptions and alternate numbering.

## Structured reconciliation

| Source | Differences after whitespace normalization | Whitespace-only subset | Other exact pairs needing review | Publisher notes |
| --- | ---: | ---: | ---: | ---: |
| BSB USJ → official TXT | 1,310 | 1,108 | 202 | 3,542 |
| MSB USJ → official TXT | 1,387 | 1,185 | 202 | 3,542 |
| YLT USFX → VPL | 0 | 0 | 0 | 0 |

BSB and MSB TXT OT wording is identical. Structured artifacts differ, so neither source's discrepancy list may be substituted for the other's. Examples include punctuation/converter strings such as `[’’]` at Daniel 10:21, MSB bracketed wording at 1 Chronicles 1:17, and Psalm superscriptions stored outside verse markers. These are engineering observations, not inferred manuscript readings. No discrepancy has been silently repaired or added to an approved-differences list.

YLT's XML supplies `p` paragraph structure, numeric verse markers and no OT `f` footnotes or `q` poetry markers. Its text matches VPL with whitespace normalization. Do not invent poetry markup for YLT. BLB has only verse-level TXT and no structured headings/notes in this selected artifact.

### Psalms and block roles require special handling

The existing NT heading classification cannot simply be reused for OT. BSB/MSB contain `d`, `qa`, `qr`, list and poetry markers in addition to ordinary headings. In Psalm 3 the `d` block contains “A Psalm of David, when he fled from his son Absalom.” while TXT places those words at the beginning of verse 1. Treating `d` uniformly as publisher commentary would lose part of the authoritative text or duplicate it during alignment. Conversely Psalm 1's `d` block is a book-range label, “Psalms 1–41”; not every `d` is a Psalm superscription.

AFOT-003 must classify each relevant block by its actual role, preserving original marker/source path. Biblical superscriptions need an explicit text-bearing role and a documented relationship to the TXT verse anchor; publisher chapter titles and cross-reference headings remain distinct. Poetry/list/acrostic/refrain structure must be preserved without creating canonical verse 0. The audit stores these blocks and discrepancy pairs for that work; its temporary heading exclusion is diagnostic, not a publication policy.

All 7,084 Berean source notes have source paths and attached verse anchors in this audit (3,542 per edition). They are source records, not a claim of 7,084 distinct notes or verified equivalent note bodies. Verify original note references, inline positions, heading notes, text-alignment movement and citation/display fidelity during import review.

## Release strategy and next step

AFOT-002's reference/inventory investigation and release proposal are complete. Source-difference approval and publication fidelity remain AFOT-003 work. Next:

1. Create an OT-specific adapter layer and candidate registry, keeping the NT adapters and released outputs intact.
2. Reconcile Psalm title roles and all 202 non-whitespace pairs per Berean source; explain/classify differences individually before recording reviewed approval. Preserve TXT authority and raw USJ.
3. Preserve structural source runs and note positions while aligning authoritative text; independently sample narrative, poetry, lists, superscriptions, notes and cross-references.
4. Produce new release IDs, reviewed difference records and deterministic output checksums. Verify reproductions and predecessor hashes. Never use `--freeze` to conceal unresolved differences.
5. Only then implement OT reader integration (AFOT-004), with browser/deep-link/keyboard/phone checks. Public branding and signing identities remain untouched here.
