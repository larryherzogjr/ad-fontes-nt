# MT ↔ LXX verse pairing

`verse_pairs.jsonl` maps every verse of the Hebrew-canon books in this
repository's Rahlfs morphology to its counterpart verse in the Masoretic
Text, resolving the two traditions' versification differences (Jeremiah's
chapter reordering, the Psalms offset, 2 Esdras = Ezra+Nehemiah, the second
tabernacle account, and ~40 books' worth of smaller shifts).

This is the verse-level foundation for a word-level MT↔LXX alignment
dataset (in progress); it is published now because it is independently
useful and, to our knowledge, the first freely licensed verse-pairing table
for the Septuagint.

## Format

One JSON object per line, one line per LXX verse:

```json
{"grk_book": "jeremiah-lxx", "grk_ref": "38:36", "mt_book": "jeremiah",
 "mt_refs": ["31:35"], "method": "hand"}
```

- `grk_book` / `grk_ref` — book slug and `chapter:verse` exactly as in
  `db/seeds/lxx_morph/<book>.json`.
- `mt_book` / `mt_refs` — the counterpart verse(s) in **English/KJV verse
  numbering** (the numbering used by most digital WLC editions, including
  Open Scriptorium's). `mt_refs` lists more than one verse where the Greek
  condenses several Hebrew verses (e.g. LXX Exod 38:15 ↔ MT 37:19–21).
- `method` — how the pairing was derived:
  - `identity` — same book, same numbers (18,781 verses);
  - `tvtms` — renumbered via the TVTMS versification data (see below),
    with the applicable Greek tradition variant selected per book by
    testing TVTMS's conditions against this corpus (4,157);
  - `block` — 2 Esdras chapter blocks (1–10 = Ezra, 11–23 = Nehemiah, −10)
    (609);
  - `hand` — hand-derived, content-verified maps where the printed
    versification matches no TVTMS variant: LXX Jeremiah 25:14–20 / 30 /
    32 / 36 / 38, Proverbs 32–36 (= MT 25–29), 3 Kingdoms 4–5, the second
    tabernacle account (LXX Exod 36–39), and several verified verse
    transpositions (408);
  - `unpaired` — no MT counterpart, with a `reason`: LXX pluses and
    compositions (Ps 151, the 3 Kingdoms miscellanies, Greek Esther
    additions, Job's epilogue, the Bezalel summaries in Exod 38, etc.)
    (410).
- `flag` (optional) — sections where the pairing is verified but the
  rendering is free enough that word alignment will be sparse:
  `divergent-section` (LXX Exod 36–39) and `og-paraphrase` (OG Dan 4–6).

MT verses with no line here are LXX minuses (e.g. MT Jer 33:14–26,
1 Sam 17:12–31, MT Exod 36:10–34).

## Method and validation

Pairings were built from the TVTMS versification dataset plus content
verification, then validated two ways:

1. a stratified 931-verse audit (independent judging of every pair's
   correctness, oversampling every hand-mapped region) measured **99.57%**
   pairing correctness raw, ≈99.7% corpus-weighted; the 4 errors found
   were adjacent-verse transpositions, all fixed;
2. a corpus-wide transposition sweep (lexical association scoring of every
   pair against local swap/rotation/shift alternatives; 92% recall on
   planted errors, zero false positives at threshold) found 3 further
   transpositions, all content-verified and fixed (LXX Jer 7:27 = MT 7:28,
   Ezek 42:18↔19, Joshua-B 19:47↔48).

Expected residual error is below one verse corpus-wide for the
transposition class; freely rendered sections are flagged rather than
excluded.

The second tabernacle account (LXX Exod 36–39) was mapped empirically:
translation-equivalence scores learned from the securely paired Pentateuch,
verse-candidate scoring across MT 35–40, cross-checked against the classic
table in Swete, *An Introduction to the Old Testament in Greek*, p. 235.

## Attribution

Versification mappings are derived in part from **TVTMS** (Tyndale
Versification Traditions Mapping System), CC BY 4.0, created by
STEPBible.org / Tyndale House Cambridge — source:
<https://github.com/STEPBible/STEPBible-Data>. Hebrew verse inventory from
the Westminster Leningrad Codex via Open Scriptorium.

License: CC BY 4.0, as for the rest of the data in this repository.

## Word-level alignment (`word_links.jsonl.gz`)

One record per paired verse: `{ref, grk_book, grk_refs, links}` where `ref`
and token indices follow `verse_pairs.jsonl` and the morphology JSON. Each
link is `{h, g, ...}` — `h` indexes the WLC verse's tokens, `g` the Greek
verse's tokens — with one provenance field:

- `stability` (0.5–1.0): fraction of a 10,299-member bootstrap ensemble of
  eflomal alignment runs (bootstrap resamples × models 1/2/3 × two null
  priors, grow-diag-final-and symmetrized) that produced the link;
- `rule`: a deterministic convention link the statistical aligner cannot
  see, anchored to an already-aligned neighbor — `art` (Greek article →
  its noun's Hebrew token), `kai` (καί → the waw-prefixed token), `de`,
  `prep` (preposition → its object's prep-prefixed token), `sfx` (genitive
  personal pronoun → the suffix-bearing token).

## Evaluation set (`eval_300.json`)

300 hand-checked verses (100 literal prose, 100 free, 100 poetry), doubly
annotated: a screened draft (human-reviewed) and an independent blind
re-annotation, with all disagreements adjudicated. Inter-annotator
agreement F1 = 0.983. Includes full tokens and English glosses for both
languages.

Alignment quality measured against the evaluation set (held-out half):

| layer                     | precision | recall | F1    |
|---------------------------|-----------|--------|-------|
| stability ≥ 0.9           | 0.987     | 0.640* | 0.777*|
| stability ≥ 0.7           | 0.977*    | 0.800* | 0.880*|
| stability ≥ 0.5 (+ rules) | 0.962     | 0.848  | 0.901 |

(* = with rule links included; ≥0.9/≥0.7 rows show boosted figures.)
The shipped `word_links.jsonl.gz` corresponds to the last row; filter by
`stability` for a higher-precision subset.
