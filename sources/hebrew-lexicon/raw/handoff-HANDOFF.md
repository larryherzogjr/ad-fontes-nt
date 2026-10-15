# Handoff — Deep Greek & Hebrew Lexicon layer

Bundle: `deep-lexicon/` — full lexica + a tagged Greek NT, joining the
`wlc-hebrew` / `wlc-glosses` bundles.

## Integration notes for Codex / Ad Fontes

1. **Greek NT display**: `nt-json/<book>.json` is self-sufficient (text +
   per-word Strong's/lemma/Robinson-morph). Book codes are 3-letter
   (MAT, MRK, … REV). Verses keyed by chapter then verse strings.
2. **Greek word study**: token `g` → `abbott-smith.json` (full article) or
   `strongs-greek.json` (quick gloss). Untagged inflections go through
   `index/forms.json` (keys have sentence punctuation stripped).
3. **Hebrew word study**: existing chain WLC text → `wlc-glosses` forms →
   Strong's H# → this bundle's `lexical-index.json` (`by_strongs`) →
   `bdb.json` by the record's `bdb` id. Every one of the 8,681 Strong's
   keys resolves to BDB.
4. **Abbott-Smith extras**: entries keyed `w:<greek>` are words absent
   from Strong's; search them only as a fallback.
5. **Attribution**: show the CC BY line for the Open Scriptures Hebrew
   Bible Project in the app's licenses screen (see README).

## Verification performed

- Counts: Strong's Greek 5,624; Abbott-Smith 6,143 (5,431 Strong's-keyed,
  712 extras); BDB 11,845; lexical index 10,221 ids / 8,681 Strong's keys,
  all with BDB links; NT 27 books / 7,939 verses / 137,711 tokens /
  19,090 forms.
- Join samples checked by eye: G3056 λόγος (both dictionaries), H1 אָב and
  H7225 רֵאשִׁית (index → BDB), MAT 1:1 tokens, forms λόγος/ἀγάπη.
- NT token regex verified to capture every `<w>` in verse milestones
  (word counts match published Tischendorf token totals).

## Build script

- `build_deep_lexicon.py` (workspace root). Sources needed under /tmp:
  `strongs-master/` (re-extract from `sources/openscriptures-strongs-repo.zip`),
  `Abbott-Smith-master/`, `tischendorf-data-master/`, `HebrewLexicon-master/`
  (all re-extractable from `sources/*.zip`).

## Future work

- LXX Greek text with Strong's tagging would extend the Greek chain to the
  OT (Swete's LXX tagging is in progress in the open-data community).
- Robinson-Pierpont Byzantine text as a PD alternative Greek NT base.
- Unabridged LSJ (CC BY-SA) if classical coverage is ever wanted.
