# Abbott-Smith in Greek exploration — AF-GRK-028

Larry accepts the Hebrew addition and authorizes Abbott-Smith in the Greek Explorer and sidebar, prepared for local testing before publication. The addition reuses existing word details and the Library Greek Lexicon. No new toolbar control, Scripture edition, corpus mapping, morphology, contextual gloss, Strong’s release, Dodson definition, Ordinary Means article or occurrence total is changed.

## Pinned historical source

The exact `abbott-smith.tei.xml` and `README.md` come from `Abbott-Smith-master/` in the `deep-lexicon/sources/abbott-smith-tei.zip` member of the user-supplied `deep-lexicon-handoff.zip`. Both archive hashes and the selection decision are in `sources/abbott-smith/raw/provenance.json`. The XML header identifies G. Abbott-Smith’s first edition, New York: Charles Scribner’s Sons, 1922, and credits the transcription contributors. The retained README explicitly places the lexicon XML, including markup, in the public domain. Its statement about separate scanned-PDF restrictions is preserved; the PDF and repository editor code are not imported or distributed.

The upstream XML contains **6,153 entry elements**. The prepared handoff JSON has 6,143 keys and does not preserve the source entry identity/number distinctions completely. Each XML entry receives a separate stable ordinal identifier in the derivative; entries are never overwritten by a dictionary keyed solely by Strong’s number. Extended identifiers such as `G0901a` retain the suffix (normalized only to `G901a` for lookup); all explicit multi-number relationships remain. The source XML is preserved exactly.

`abbott-smith-1922-2026-10-14-v1` contains an exact headword index, 62 small entry shards, source README, NOTICE and reviewed differences (66 files). The offline importer pins raw inputs, its own bytes and every generated output. Normal builds fail on drift. `--freeze-new` only creates an absent release and cannot replace an existing baseline.

## Matching and display

- Match the exact indexed headword using NFC and lowercase only. Source `entry@n`, explicit `orth` and explicit `form type="lemma"` fields supply index terms. No accent removal, hyphen removal, spelling guesses, synonyms or Ordinary Means article aliases enter this lookup.
- In token details, a numbered dictionary entry must also match a number in the token’s original Strong’s field when supplied. An explicitly unnumbered source entry can match its exact headword, with the missing number disclosed. Extended suffixes are not collapsed into ordinary Strong’s numbers.
- Standalone Library lemma pages match by exact headword and say so. Multiple matching entries remain separate; no first-candidate choice is made.
- The current 5,400-lemma NT Library has 5,049 exact headword matches before token-number filtering. The other 351 remain unlinked without guessed equivalences. This is coverage within the current analysis, not a count of words absent from the printed lexicon.
- Long entries load on expansion. Dodson remains the quick definition/hover preview. Abbott-Smith is shown once in selected-word details across the shared reader, paired Greek and research tools, plus the Library Greek Lexicon detail page.
- Source text, sense labels and literal citation/abbreviation wording are retained. Layout whitespace and page breaks are normalized for reading. Citations are not silently assigned canonical numbering or clickable passage mappings.
- `occurrencesNT` source notes are stored separately and clearly identified as Abbott-Smith’s historical frequency notes. They never replace the app’s Nestle/LXX occurrence totals. Tischendorf text, analysis and frequency exports are not imported.
- Definitions describe possible meanings, not an automatic interpretation of a passage. Authored dictionary explanations remain historical Abbott-Smith material, distinct from Scripture, Berean contextual glosses and Ordinary Means commentary.

Missing matches are disclosed. Failed loads/release mismatches remain errors with retry, not claims of missing dictionary coverage. The new dictionary, source notice and README are included in offline desktop staging. Publication and signed installers remain outside this local request.

Verification and local review links are recorded in PROJECT-STATUS.md.
