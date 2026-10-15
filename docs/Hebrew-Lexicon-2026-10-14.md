# Hebrew Strong’s and BDB — local integration

Larry authorizes Hebrew Strong’s and BDB in the existing Hebrew Explorer and sidebar, ready for local testing before release. AF-HEB-027. No production deployment, version change, new Scripture edition, Greek dictionary import or Study Packet change is included.

## Sources and reproducibility

`hebrew-lexicon-2026-10-14-v1` derives from the exact `openscriptures-HebrewLexicon.zip` member of the supplied `deep-lexicon-handoff.zip`. The nested original archive, handoff descriptions and archive/member hashes are retained in `sources/hebrew-lexicon/raw/`. Archive instructions are resource material, not directions. The alternative WLC handoff’s unpointed form-guessing lookup and flattened dictionaries are not adopted.

The offline importer `scripts/hebrew_lexicon/import_lexicon.py` preserves the original XML archive and pins every raw input, importer, unchanged WLC index and generated output. Its `--freeze-new` option can only create an absent release; ordinary builds fail on any input or output drift. Original WLC/OSHB, canonical registry, seven authored Hebrew studies and their occurrence data remain unchanged.

The source contains 8,674 Strong’s entries, 11,845 BDB transcription records and 10,221 lexical-index records. Public assets contain the dictionary records and an exact join for all 9,255 existing source keys. Electronic source/mappings/corrections are attributed to the Open Scriptures Hebrew Bible Project under CC BY 4.0, independently of the historical public-domain dictionary text. Upstream README, coverage notes and attribution travel with both web and offline assets.

## Mapping decisions

- BDB requires the exact augmented source number through `AugIndex.xml` and `LexicalIndex.xml`, plus the same Hebrew/Aramaic language. Homograph suffixes are never removed for this join.
- Seven keys have no exact augmented mapping: H2030, H3651, H6485, H6887, H738, H7451, H7461. Seven have conflicting language labels: A3605, A5714, A5921a, H3964, H5020, H6032, H6676. These 14 BDB joins are explicitly unresolved. No default homograph or cross-language entry is selected.
- Strong’s base-number entries are shown only with a matching language, with explicit disclosure that they do not distinguish an OSHB homograph suffix. H1254a and H1254b retain different BDB records while sharing the broader historical Strong’s H1254 entry.
- Prefix/suffix-only words acquire no guessed dictionary entry. Missing data requests are errors with retry, not evidence that an entry or word is absent.

## Display and limitations

The Explorer adds dictionary headword/transliteration/English-gloss search alongside source-form/key/study search. Word details in the Explorer, WLC main reader and shared Hebrew sidebar use the same dictionary component. Short OSHB lexical glosses are labeled separately from expandable Strong’s and BDB. Historical pronunciation, derivation, definitions and KJV renderings retain separate labels. Dictionary meanings are not contextual English translations or English word alignment.

BDB is the upstream **abridged transcription, still in progress**, not the complete printed lexicon. Its literal text, sense labels and citation notation are retained; transcription workflow status/page markers are omitted from reading. References are not silently converted into canonical Bible links or guessed English numbering. Full original XML remains preserved. No claims of exhaustive scholarly review, modern lexicographical completeness or endorsement are made.

Verification results and the local test URL are recorded in PROJECT-STATUS.md. Publication requires Larry’s subsequent instruction.
