# Septuagint source audit — October 7, 2026 (AFOT-007)

Larry authorized implementing Greek OT comparison, interlinear analysis and existing OM Greek Explorer links for local testing, stopping only for a deal-breaker. The initial acquisition audit found an unresolved source-rights conflict before application changes or imports. The sprint is stopped at that source gate; none of the three new LXX features is implemented or represented as ready to test.

## Blocking finding

The [Open Scriptorium announcement](https://openscriptorium.org/posts/free-lxx-morphology) describes an openly licensed Rahlfs analysis dataset while acknowledging specialist-review limitations. Its [repository README](https://github.com/OpenScriptorium/lxx-morph) identifies the Greek transcription as coming from Eliran Wong's digital edition and describes that source as public domain. The source mirror inspected at commit `0a23df295de5e5710724c8b6e84edf99e89348aa` repeats this attribution in `LICENSE-DATA`.

The named [Eliran Wong Rahlfs repository](https://github.com/eliranwong/LXX-Rahlfs-1935), however, states CC BY-NC-SA 4.0 for its database and identifies CCAT/CATSS derivation and additional access/declaration conditions. A historical printed text's public-domain status does not establish that all rights/conditions attaching to a particular digital dataset are cleared. The downstream license and the named upstream terms do not presently establish a consistent redistribution basis for this app. This is an unresolved provenance/rights finding, not a legal ruling that every individual annotation is restricted.

No morphology, source words, glosses or pairing records from this candidate were added to application assets. The reviewed source documentation and checksums are retained separately under `sources/lxx/source-audit-2026-10-07/`. The public repository was acquired in `/tmp/afnt-lxx-morph-audit` for inspection only; no downloaded repository code was executed. No upstream declaration was submitted and nobody was contacted.

## Alternatives investigated

- [Swete via First1KGreek / nathans](https://github.com/nathans/lxx-swete) identifies CC BY-SA 4.0 for text/annotations, separately from MIT tooling. It remains a potential Greek-reading source, but this does not supply the fully reviewed morphology and contextual gloss layer needed for the requested NT-like interlinear. Swete and Rahlfs must not be treated as identical token sequences or interchangeable source numbering.
- [Eliran Wong's Swete workspace](https://github.com/eliranwong/LXX-Swete-1930) lists morphology/gloss work as collaboration objectives; its visible file inventory supplies verse/word/transliteration CSVs, not a ready full morphology/gloss release. Do not infer completion from the roadmap or import its GPL-tagged workspace without a layer-specific audit.
- [Perseus Morpheus](https://github.com/perseids-tools/morpheus) is an analysis engine, not an already reviewed contextual LXX corpus. Creating an independent full analysis pipeline, disambiguating alternatives and clearing each lexical input would be a different undertaking, not a straightforward import. No automatically guessed morphology or NT contextual glosses were attached to OT words.

## Resume condition and existing functionality

Resume with a source-specific clarification resolving the upstream conflict, a demonstrably independent cleared morphology/gloss corpus, or an explicitly revised scope separating Greek reading from full interlinear analysis. Publisher contact remains outside current authorization. Existing OM commentary is reusable through verified lemma links once a trustworthy lemma layer is established; it is not a substitute for that analysis and is not passage-specific LXX commentary.

The current English reader, NT Greek tools, NT/OT connections panel and local review server remain the existing implementation. No corpus release, canonical mapping, source pins, reader code, app dependencies, deployment, private data, signed package or public bundle changed during this audit. No application tests/builds are claimed for this documentation-only checkpoint.

## Subsequent user decision

Larry explicitly directed proceeding on his public-domain source-rights decision after this audit. The stop/resume condition above is historical and superseded by that instruction. Original audit evidence remains immutable. [Local implementation](LXX-Implementation-2026-10-07.md) preserves original source notices and records that the decision is the user's, without claiming an independent resolution of the notices.
