# Book of Concord — Triglot Concordia (1921) resource bundle for Ad Fontes

Public-domain Book of Concord texts: the **Triglot Concordia** (St. Louis:
Concordia Publishing House, 1921), the standard trilingual (German–Latin–
English) edition of the Lutheran Confessions, published for the 400th
Reformation jubilee. The 1921 text is fully in the public domain.

## Why this source

Modern English translations of the Book of Concord (Kolb–Wengert, Tappert,
McCain) are copyrighted and cannot be shipped. The Triglotta's English column
is the only complete public-domain English translation of all the Lutheran
Confessions, and it carries the German and Latin columns — the languages of
the original confessions — in the same edition.

## Documents (9)

| code | document | sections | EN paragraphs |
|------|----------|----------|---------------|
| creeds | The Three Ecumenical Creeds | 3 | 13 |
| ac | Augsburg Confession | 30 | 455 |
| apology | Apology of the Augsburg Confession | 26 | 1,203 |
| sa | Smalcald Articles | 27 | 373 |
| pp | Treatise on the Power and Primacy of the Pope | 1 | 129 |
| sc | Small Catechism | 10 | 224 |
| lc | Large Catechism | 6 | 740 |
| epitome | Formula of Concord — Epitome | 13 | 269 |
| fc-sd | Formula of Concord — Solid Declaration | 14 | 739 |

## File layout

- `json/<doc>.json` — primary structured data. Shape:
  `{code, source, la_text, de_text, sections: [{key, title, headings,
  la_alignment, de_alignment, paragraphs: [{n, en, la, de}]}]}`.
  - `en` is always present. `la`/`de` are present only where the section
    carries `"la_alignment": "number"` / `"de_alignment": "number"` — see
    Alignment below; otherwise `null`.
  - `la_text` / `de_text` are the complete cleaned Latin/German texts of the
    whole document (reference copies; not paragraph-aligned).
  - `creeds` sections also carry `la_block` / `de_block` (per-creed full text).
- `text/<doc>.txt` — English plain-text mirrors with paragraph numbers.
- `latin/<doc>.txt`, `german/<doc>.txt` — complete cleaned Latin/German texts
  per document, marginal numbers as printed (`1]`, `2]`, …).
- `align_report.json` — per-document alignment statistics.
- `sources/` — provenance: the two NPH electronic texts and the
  bookofconcord.org page tree used for the build.

## Alignment policy (important)

The three source transcriptions number paragraphs differently:

- The English column was parsed from bookofconcord.org's transcription, whose
  per-paragraph anchors mostly but not always reproduce the printed marginal
  numbers (it re-splits several documents, e.g. the Apology's article IV).
- The NPH Latin and German electronic texts reproduce the printed marginal
  numbers, but the 1921 print places a marginal number on only about every
  other paragraph, and the NPH digitization contains artifacts (see Quality
  notes).

Therefore per-paragraph joins are made **only where the printed marginal
number sequence matches exactly** (per section, per language); such sections
are flagged `"number"`. All other sections carry `"none"` and fall back to
the per-document `la_text`/`de_text`. In a `"number"`-aligned section, an
unnumbered English paragraph inherits the preceding numbered paragraph's
Latin/German text — the printed marginal-numbered segment spans it.

Current verified coverage: Latin 52 sections / 1,125 paragraphs joined;
German 56 sections / 832 paragraphs joined (see `align_report.json`).

## English paragraph-numbering quirks (faithful to the source)

Preserved as printed; do not "fix" renumbering without checking the 1921
scan: Apology art. III is a single paragraph numbered 52; Apology arts.
IX–XI continue the series 51–67; Apology art. IV is split by the site into
`art-IV` (Of Justification, 1–121) and `art-IVb` (Of Love, 1–279); the
Smalcald Articles' Part III is numbered 1–105 on the site while the Latin and
German columns number each article separately; the Large Catechism's altar
section has one duplicate printed number; FC-SD art. XI has late shuffled
anchors.

## Quality notes and known defects

- **Latin column**: a digitization duplication (Apology arts. VII–VIII,
  paragraphs 1–22 printed twice) was detected and dropped from the aligned
  data and the text files (`22 duplicated lines` in the build log). A few
  Latin paragraphs contain Greek quotations rendered as OCR garbage in the
  NPH text (e.g. Apology art. II); the 1921 print has proper Greek.
- **German column**: the Fraktur-based print means no better OCR-quality
  German source was obtainable; the NPH electronic text is clean modern
  spelling but its marginal numbering in parts of the Apology (art. IVb) and
  the Smalcald Articles is irregular, so those sections are not
  number-aligned.
- **Small Catechism**: German/Latin provided as full-document text only —
  the Q&A rubric structure does not align mechanically. The creeds likewise
  carry per-section blocks instead of per-paragraph joins.
- The bookofconcord.org Apology index page duplicates the entire article
  text; it was excluded from the English parse (the per-article pages are
  the canonical text).

## Licensing

- Triglot Concordia (1921): **public domain**.
- English transcription (bookofconcord.org): public domain text (their
  copyright page confirms the Triglot Concordia content is PD).
- NPH 1996/1997 electronic editions: the underlying 1921 text is PD; NPH
  holds copyright in their electronic edition's added matter (citations,
  footers), which was stripped in cleaning. Treat the cleaned text as PD;
  if in doubt, cite the 1921 print.
