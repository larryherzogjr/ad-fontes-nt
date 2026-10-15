# Handoff — Book of Concord (Triglot Concordia 1921)

Bundle: `book-of-concord/` — 9 documents, 4,145 English paragraphs, plus
complete Latin and German column texts per document. Companion to the
LXX Apocrypha, WLC, and Clementine Vulgate bundles.

## Integration notes for Codex / Ad Fontes

1. **Primary artifact**: `json/<doc>.json`. Sections mirror the
   bookofconcord.org document structure (which follows the 1921 print).
   Keys are stable (`art-I`, `iii-VII`, …).
2. **Trilingual data**: `paragraphs[].la` / `paragraphs[].de` are populated
   only in sections flagged `"number"` (verified printed-number equality).
   Elsewhere use `la_text` / `de_text` (whole-document reference text) or the
   `latin/` / `german/` text mirrors. Do not assume paragraph-level
   alignment where the flag is `"none"`.
3. **Unnumbered paragraphs** inside `"number"`-aligned sections repeat the
   preceding paragraph's `la`/`de` text (marginal numbers cover ~1 of every
   2 paragraphs in the 1921 print). Deduplicate for display if needed.
4. **Creeds**: use `la_block` / `de_block` per section; Small Catechism:
   document-level only (`la_text` / `de_text`).
5. **Front matter**: the Triglotta's own prefaces (Preface to the Book of
   Concord, German "Vorrede", Latin "Praefatio") precede the creeds in the
   sources but are not part of the 9 documents; they remain in
   `sources/ConcordiaTriglotta_*_NPH1997.txt` if wanted later.
6. **No apocrypha issues, no verse renumbering needed** — these are
   confessional documents; paragraph numbers are the only numbering.

## Verification performed

- English: all 139 site pages parsed; Apology index-page duplication
  detected (1203/1203 paragraphs duplicated) and excluded; per-document
  paragraph counts validated against the site structure.
- Alignment: per-paragraph joins exist only on exact marginal-number
  sequence equality (per section, per language); everything else is
  explicitly null + flagged. Trilingual samples spot-checked by eye
  (AC art. I, FC-SD preface, creeds).
- Latin digitization duplication (Apology VII–VIII 1–22) detected
  algorithmically and removed.

## Build scripts (workspace root)

- `parse_boc_en.py` — HTML → English JSON (needs `/tmp/boc_pages/`,
  re-downloadable from the tree in `sources/bookofconcord-org-tree.json`).
- `parse_boc_delang.py` — NPH la/de texts → trilingual JSON + text mirrors.

## Known gaps / future work

- ~half of the sections are not number-aligned (see `align_report.json`);
  a future pass against the 1921 scan PDF (archive.org) could fix the
  German Apology art. IVb numbering and join more sections.
- Greek quotations in the Latin column are mojibake from the NPH source.
- Bente's Historical Introductions (Project Gutenberg #26909) would make a
  natural companion volume.
