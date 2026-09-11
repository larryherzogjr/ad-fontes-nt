# Methodology

## 1. Packet setup

1. **Extraction and reading.** Extracted the ZIP without renaming files. Read `README.md`, `AUDIT-PROMPT.md`, `PACKET-MANIFEST.json`, `PACKET-MANIFEST.sha256`, `FINDING-SCHEMA.json`, all four `guidance/` files and all three `evidence/count-corrections/` files in full.
2. **Hash verification.** Ran `sha256sum -c SHA256SUMS` (296 OK, 0 failures). Compared the file list with the list in `SHA256SUMS`: only `SHA256SUMS` itself is unlisted.
3. **Coverage verification.** Recomputed the SHA-256 of every `INPUT-COVERAGE.json` record (280 match) and checked the corpus split (250/30). Compared all 250 article hashes with `evidence/om-v5-manifest.json` (250 match).
4. **Manifest binding.** Bound all outputs to the packet-manifest SHA-256 `7d54757af5da94553a87c0d546e78b34e54aea0c0f785ff82e4fb77e7fd62c06`.

## 2. Comparison commentaries (30 of 30, close reading)

Each unit was rendered in a compact form showing readings, coverage, focus spans, publisher notes, citations, provenance, explanation sources and both significance fields. Each was then read in full. For every unit the checks were:

- **Readings vs prose.** The source observation was compared with the structured readings, edition by edition: present, absent, bracketed, relocated, mixed and publisher-note states; edition counts (such as "four of the seven"); partial-verse focus; and Greek quoted in the prose.
- **Observation vs interpretation.** Checked whether the interpretation stays consistent with the observation and with the unit's attribution limits.
- **Automated structural checks** (all passed): span length equals end minus start; focus text equals the reading text at the stated offsets; mixed/uniform state matches coverage; absent readings have no spans; every `[S#]`/`[C#]` marker in the prose exists in `explanationSources`; every `relatedUnits` link is reciprocal. Defined-but-uncited C-sources were listed, and those supporting uncited prose claims became findings.
- **Cross-unit consistency.** Wording for the same pattern in different units was compared: publisher cross-references, "Berean editions," verse placement, the bracket-marker sentence.

## 3. Articles (250 of 250, automated full-text checks plus context reading of every flag)

All checks ran over the full body text of every article:

| Check | Scope / result |
|---|---|
| Front matter vs `word-metadata.json` vs v5 manifest (slug, title, greek, translit, gloss, subhead, category, description, url, tags, pronunciation, approval date) | 250 records; title = "Translit (Greek)" and slug = normalized transliteration in all 250 |
| Headword and transliteration in "The Word" section vs front matter | 250 records |
| Accent-syllable ordinal claims vs the pronunciation guide in the same sentence | 62 claims; 2 errors |
| Numeric expressions attached to words, letters, phrases, elements, clauses, syllables, terms etc. | 1,066 expressions extracted; 212 word/phrase/element items read in context; tokenization done for each suspect |
| Occurrence-count claims ("appears N times") | all extracted and read for internal contradiction; not verifiable against a concordance |
| Inline quotations | 4,518 found; long capitalized quotations in mid-sentence position, italic heading slots and speech-introduction quotations listed and read (about 350 contexts) |
| Same verse quoted more than once | 1,039 reference-anchored quotations grouped by reference; 21 references with conflicting wording examined |
| Language labels (Latin, Greek, Hebrew, Aramaic) vs the labeled phrase | every "Latin" context read in full; Hebrew/Aramaic labels screened |
| Edition labels (NET, NIV, ESV, KJV, NASB, BLB, MSB etc.) | every occurrence read; no "NET" label remains |
| Series carry-over ("forty-nine", "volume", "this book", "hook", "entry") | all hits read |
| Internal links `/greek/<slug>/` | target existence and text/target agreement |
| Footnote references and definitions; duplicate paragraphs; empty sections; odd bold markers; unbalanced curly double quotes; placeholders | none found except the link items reported |
| Chapter-bound validity of references | 4,528 references; 0 out of range (verse bounds not checked) |
| The six v5-corrected articles | every correction line and its surrounding sentence read |

**What "no-finding" means.** Articles were not each read end to end. In COVERAGE.json, `reviewDepth: automated-full-text-checks-plus-context-read-of-flags` records this. A `no-finding` disposition on such an article means the checks above raised nothing reportable.

## 4. Finding threshold and false-positive recheck

- A finding was created only where a specific passage could be quoted and the concern stated concretely.
- Every `exactExcerpt` and every article evidence anchor was machine-verified as a verbatim substring of its source file (article line numbers computed) or of the named JSON field (comparison records) before writing.
- Candidates were dropped after recheck where the apparent problem was harmless, for example:
  - Several apparent substitutions that read acceptably after a reference label.
  - Translation-system variation in transliteration.
  - "Both Berean editions" in units where the cited notes are BSB and MSB.
  - Candidate-23's Amen wording, which is consistent once each edition's verse 20 is taken into account.
- The FINDINGS.json output was validated against `FINDING-SCHEMA.json` with the Python `jsonschema` library.

## 5. Classification rules applied

- **Confirmed error:** the packet itself proves an error or contradiction, for example two BSB-labeled wordings of one verse in the same article, or a stated syllable ordinal that contradicts the guide in the same sentence.
- **Probable error:** the packet shows an inconsistency, but which side is wrong depends on data not in the packet (the BSB text).
- **Needs human review:** lexical, grammatical, historical or citation-support questions the packet cannot resolve.
- **Presentation defect:** a broken sentence, heading or quotation whose meaning is obscured.
- **NET identifications** are noted as the reviewer's knowledge and always require human confirmation.
- **Severity:** S1 was used only where the text now states the opposite of its argument (theos, John 1:1). Approved theological judgments were not reopened.

## 6. External research

None. No web pages, Bible texts or live website content were consulted. The only package installed was `jsonschema` (from PyPI), used for schema validation.
