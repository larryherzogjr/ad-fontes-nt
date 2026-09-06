# Dodson definitions and Word Explorer links

2026-09-05 · AFNT-020 extension / AFNT-029 pilot feedback. User authorized Dodson short definitions, longer word-detail entries, accessible popups and links to existing Ordinary Means word studies. This does not approve new theological commentary or establish exhaustive lexical coverage.

## Pinned inputs

- John Jeffrey Dodson, Greek Lexicon (2010), Biblical Humanities repository commit `74f70358d4acfaf2f980bf2feb58ab7115cbbcbc`. `sources/dodson/raw/dodson.xml` is the Unicode authority for this adapter. All 5,410 entries are preserved in the pinned source. Its XML contains brief/full definition roles; these are displayed without paraphrasing, with XML layout whitespace collapsed to spaces.
- Saved README and original author notice explicitly dedicate the lexicon to the public domain, including commercial use; saved LICENSE supplies CC0. The repository includes differing CSV/README field descriptions: the downloaded CSV actually uses Beta Code and five columns. It is retained as evidence, but is not the importer authority. No encoding reconstruction is used.
- `sources/dodson/manifest.json` pins every raw/evidence checksum and the exact derived lookup checksum. `scripts/import_lexicon.py` runs offline, fails on unexpected source/output differences, and has no rebaseline flag. Existing Scripture, analysis, Strong’s and editorial releases remain unchanged.
- `sources/word-explorer/words.json` is the public website metadata retrieved from https://larryherzogjr.com/greek/words.json on September 5, 2026: 114 article records. Only headword, title, original URL and access metadata enter the public lookup. Article prose, glosses, summaries and pronunciation are not imported into definitions. Links preserve website access restrictions. New site articles require a reviewed snapshot update.

## Matching and limits

The lookup normalizes Unicode NFC and letter case only. It does not strip accents/breathings, guess spelling variants, translate headwords or equate Strong’s numbers with lemma identity. A Dodson entry must match both the token’s standard form and one number in its source Strong’s field; multiple candidates yield no linked definition. Morphology suffix numbers are not used independently of headword equality. Word Explorer links require exact normalized headword equality and an original URL matching the expected HTTPS domain/path. Inflected words reach their source lemma’s article. Uncertain matches remain unlinked.

Across the pinned analysis, 9,755 of 10,332 distinct lemma/Strong’s-field pairs match a single definition; 218 pairs have Word Explorer links. These are pair counts, not unique lemmas or verse coverage. No exhaustive scholarly audit is claimed. Missing lexicon data is distinguished from a legitimately unmatched entry.

## Display and verification

Both Greek text and interlinear word controls open the short entry on hover or keyboard focus. Enter/click/tap opens existing word details with the longer entry; Arrow Down enters the popup and Escape dismisses it. Popups are portaled inside the native study dialog so they remain visible in its top layer. New-tab links carry `noopener noreferrer` and separate Ordinary Means attribution. Berean contextual glosses, Dodson definitions and Strong’s historical material remain distinct. Definitions express a meaning range, not an automatically selected verse sense.

Automated tests cover source/output checksums, offline reproduction, Unicode equivalence, accent and source-number mismatch, ambiguous entries, composite number fields, and all link metadata/target constraints. Browser checks cover John 1:1 popup, word details, keyboard link access/Escape/focus return, 320px layout without dialog overflow, and reload. Existing source gaps remain unchanged.

## September 6 index refresh

`dodson-2010-v2` preserves the original Dodson entries byte-for-byte at the JSON data level and adds the September 6 Word Explorer snapshot (211 records; 97 additions, no removals). All 114 existing headwords, titles, access labels and URLs remain identical; changed site categorization/description fields are not imported. Original `manifest.json`, `words.json` and v1 output remain reproducible. New input/output checksums are in `sources/dodson/manifest-v2.json`.

Five explicit article-only mappings are pinned in `sources/word-explorer/aliases-2026-09-06.json`. These do not change lexicon definitions or corpus lemmas:

| Stored analysis lemma | Explorer headword | Evidence checked |
|---|---|---|
| δοῦλος (II) | δοῦλος | Source 2CO.4.5, Strong’s 1401, servants; website Doulos article’s “The Word” identifies slave/bondservant. The numbered analysis headword is retained. |
| ἔξεστι(ν) | ἔξεστιν | Source 2CO.12.4, 1832, being permitted; website Exestin article identifies the impersonal permission verb. Parenthesized movable nu only. |
| σπλάγχνον | σπλάγχνα | Website Splanchna “The Word” explicitly identifies the plural of σπλάγχνον; source 2CO.6.12, 4698. |
| στοιχεῖον | στοιχεῖα | Website Stoicheia “The Word” explicitly identifies the plural of στοιχεῖον; source HEB.5.12, 4747. |
| ζῳοποιέω | ζωοποιέω | Website Zōopoieō “The Word” explicitly identifies the spelling with iota subscript as the same verb; source 2CO.3.6, 2227. |

The five website articles were inspected in the user-supplied local website project. Their prose was not imported or treated as instructions. With these mappings, all 97 added articles have a corresponding indexed analysis lemma. Three pre-existing website entries remain outside exact indexed matching; this update does not guess further equivalences. All 211 records are retained in the link index. Future additions continue to need a deliberate snapshot update.
