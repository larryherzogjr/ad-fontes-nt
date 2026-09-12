# Methodology

Packet `afnt-second-pass-editorial-audit-2026-09-12-v1`, packet-manifest SHA-256 `9b0a50e434974078125e877a6e8a703ea73eee643a2270fbc2ad55a0d23261a7`.

## 1. Environment

Ubuntu 24 sandbox, Python 3, GNU coreutils (`sha256sum`, `grep`, `sed`), PyYAML. No network access was used for verification; no replacement editions were fetched. `jq` and `jsonschema` were unavailable, so JSON handling and schema validation were done in Python (validation was written field-by-field against `FINDING-SCHEMA.json`: required keys, `additionalProperties`, enums, patterns, evidence object keys, boolean types).

## 2. Packet establishment (prompt §1)

1. ZIP extracted without renaming.
2. `README.md`, `PACKET-MANIFEST.json`, `PACKET-MANIFEST.sha256`, `SHA256SUMS`, all four `guidance/*.md` files and all six `evidence/current-article-release/*` files read completely (the large `CANDIDATE-MANIFEST.json` and `manifest.json` were read as hashes plus their non-file-list sections).
3. `sha256sum -c SHA256SUMS` → 298 OK; `sha256sum -c PACKET-MANIFEST.sha256` → OK.
4. Every `INPUT-COVERAGE.json` record hash recomputed; every article hash cross-checked against `evidence/current-article-release/manifest.json`; the release manifest and `word-metadata.json` hashed and compared with `PACKET-MANIFEST.json` `sourceBindings`.
5. Counts confirmed: 250 + 30 = 280.

## 3. Deterministic searches (prompt §5.1) — run over all 250 articles and all 30 units

| Lens | Method | Volume |
|---|---|---|
| Adjacent duplicate words | regex `\b(\w+)\s+\1\b` | 2 hits (both intentional "God God") |
| Repeated sentences / paragraphs / block quotes / headings | exact-string counting per file | 34 repeated-sentence hits, each read in both contexts |
| Markdown / punctuation | unbalanced curly quotes, bold/italic/paren/bracket balance, double punctuation, placeholders, paragraphs lacking terminal punctuation, empty sections | 10 quote imbalances, 66 non-terminal paragraphs (mostly footnote markers), 3 double-punct (all citations) |
| Footnotes | reference/definition reconciliation | 0 undefined, 0 unused, 0 duplicates |
| Internal links | `/greek/<slug>/` targets checked against the 250 slugs; stale forward-reference phrases | 0 broken links; 1 stale reference |
| Quotation labels | block quotes with Scripture references but no edition label; non-BSB labels | 0 unlabelled, 0 non-BSB labels |
| Edition/version names in prose | NET, ESV, KJV, NIV, NASB, NRSV, CSB, NLT, LXX, Vulgate | all in translation-comparison contexts; no NET-era residue found by name |
| Inline long quotations | all `“…”` runs ≥60 chars outside block quotes, with lead-in word, dash and lowercase-start flags | 521 candidates, 243 flagged; every flagged item read with context |
| Deity-pronoun heuristic | BSB-labelled quotes with lowercase he/him/his near divine names (possible non-BSB text) | 41 hits, all legitimate human referents |
| Counts and quantifiers | digits and number words with occurs/appears/used/times; always/never/all/only/every + New Testament | 268 sentences extracted and checked |
| Etymology / "literally" | sentences containing literally, etymolog-, root, derives, comes from | 242 sentences extracted and read |
| Morphology | declension/gender/tense/voice/case statements | ~110 statements checked against the lemmata |
| Confessional citations | AC/Ap/FC/SA/SC/LC/Treatise with article numbers or pages | 153 citations checked |
| Group characterizations | tradition names + sweeping quantifiers/predicates | 23 sentences read |
| Dates and historical names | four-digit years outside bibliographies | all checked (Marburg 1529, Trent 1545–63/1547, Heidelberg 1518, Worms 1521, Kaiserswerth 1836, Dodd 1935/1936, dogmas 1854/1950, etc.) |
| Frontmatter vs `word-metadata.json` | greek, translit, gloss, subhead, description, category, tags, pronunciation, slug, title/linkTitle consistency, body headword | 4 metadata mismatches; 2 description templates (expected) |
| Transliteration / accents | automated Greek→Latin transliteration compared with `translit`; every Greek token checked for accent marks; NFC check | 6 convention inconsistencies; all Greek accented and NFC |
| Comparison units | citation tokens `[S#]/[C#]` vs `explanationSources`; `relatedUnits` existence and reciprocity; per-edition states vs prose; focus/presentation/publisherNotes vs prose | 0 missing tokens, 0 non-reciprocal links |

## 4. Reading (prompt §5.2–5.3)

- Articles: read in deterministic filename order at the level of (a) full frontmatter, (b) structure and section inventory, and (c) every extracted sentence and every flagged excerpt with ±350 characters of context (more where needed). Full linear reading of every paragraph was not achieved; see AUDIT-SUMMARY §4. Records with no flags of any kind received `no-finding` on the strength of the complete lens set, not on a paragraph-by-paragraph read.
- Comparison units: all 30 read in full in ID order — `significance.sourceObservation`, `significance.interpretation`, `readings` (with span text for mixed/bracketed/relocated states), `focus`, `presentation`, `publisherNotes`, `comparisonNotice`, `explanationSources`, `relatedUnits`, `provenance`.

## 5. Cross-record clustering (prompt §5.4)

Recurring Greek terms, word-family links, Scripture passages, confessional citations and recurring claims were indexed programmatically (occurrence-count claims per italicized lemma across files; confessional article citations per file; edition/publisher characterizations across comparison units) and compared. Clusters and conclusions are in `CROSS-RECORD-REVIEW.md`.

## 6. Rechecking flags (prompt §5.5)

Every automated hit was re-read in context and false positives removed: e.g., the 'Ref — “whole verse”' list-citation pattern (accepted), intentional rhetorical repetition and hook/keystone re-quotation (accepted: charis, zoe, kerygma, kenoo), verse-boundary quotations that begin with a lowercase conjunction because the BSB verse does (accepted: apolytrosis Romans 3:24, hypakoe Romans 16:26, huiothesia Romans 9:4), and comma-final quotations that end at a BSB verse boundary (accepted: prautes 1 Peter 3:15).

## 7. Finding construction (prompt §6–7)

- Each finding was written into a builder script that locates the `exactExcerpt` in the v7 file bytes (non-breaking spaces normalized), aborts if not found, and records the line number and occurrence count as the locator. Every excerpt in `FINDINGS.json` therefore exists verbatim in the packet.
- Severity follows the prompt: S2 for clear factual/source/lexical-method/grammar/quotation/edition/reference problems; S3 for localized seams, contradictions and overstatements; S4 for minor presentation and consistency defects. Theological importance was not used to raise severity.
- Only high-confidence S1/S2 findings are proposed as likely pre-v1 corrections (AUDIT-SUMMARY §3.1–3.2).
- Two corpus-wide artifacts are reported once (PASS2-034, PASS2-064) and attached to every affected record in `COVERAGE.json`.

## 8. External sources

None fetched. Claims about BSB wording rely on quotations present in the packet and on my knowledge of the BSB; claims about Nestle/NA lemma counts, Kolb–Wengert content and etymological dictionaries rely on my knowledge. Where that was insufficient the item was placed in `HUMAN-REVIEW-QUEUE.md`.

## 9. Content boundaries (prompt §3)

No finding treats BSB and BLB as independent witnesses, equates Byzantine Majority with Textus Receptus, infers Greek variation from English wording, infers textual absence from missing analysis, uses Strong's numbering as lexical authority, or treats an approved interpretation as source evidence. Edition identities are named as the packet names them.
