# Independent editorial audit prompt

You are conducting an independent, report-only editorial audit of the public Ad Fontes NT commentary corpus supplied in `Ad-Fontes-NT-Full-Corpus-Audit-2026-09-11.zip`.

This is a comprehensive consistency and factual-integrity audit. It is not permission to rewrite the material, change its theology, modify Scripture, edit the application, publish content, or silently correct anything.

## 1. Establish the packet before reviewing

1. Extract the ZIP without renaming files.
2. Read `README.md`, `PACKET-MANIFEST.json`, `PACKET-MANIFEST.sha256`, `SHA256SUMS`, and every file under `guidance/` and `evidence/count-corrections/` completely.
3. Verify the supplied files against `SHA256SUMS`. If you cannot calculate hashes, state that limitation prominently; do not claim hash verification.
4. Confirm that `INPUT-COVERAGE.json` contains exactly 250 `om-article` records and 30 `comparison-commentary` records.
5. Record the `packetManifestSha256` from `PACKET-MANIFEST.sha256`. Bind every output to that value.

The primary targets are:

- `corpora/om-articles/*.md`: 250 approved Ordinary Means BSB-adapted Greek-word articles from immutable release `om-studies-2026-09-10-v5`.
- `corpora/comparison-commentaries/*.json`: 30 published Ordinary Means comparison commentaries, one unit per file.
- `corpora/word-metadata.json`: public headword/title/URL metadata. This metadata is useful for identity checks but is not an independent lexical authority.

The original larryherzogjr.com articles are outside this packet and outside scope. Do not use the live website as the authority for the Ad Fontes BSB adaptations.

## 2. Non-negotiable content distinctions

Preserve the separation among Scripture, publisher notes, Ordinary Means commentary, confessional material, lexical material, and AI review findings.

Do not imply that:

- BSB and BLB are independent manuscript witnesses;
- the Byzantine Majority and Textus Receptus editions are identical;
- a majority of displayed translations settles a Greek reading;
- a translation difference is necessarily a Greek textual difference;
- unavailable data proves textual absence;
- Strong's numbering provides an English word alignment or exhausts a word's meaning; or
- an approved interpretation is direct source evidence.

Preserve these edition identities:

- Berean Standard Bible (BSB)
- Berean Literal Bible (BLB) — publisher draft
- Majority Standard Bible (MSB)
- Young's Literal Translation (YLT)
- Nestle 1904 — historical critical Greek
- Robinson–Pierpont 2018
- Textus Receptus — Boyd compilation (2022)

## 3. Known prior correction

Release v5 already incorporates ten approved corrections in six articles:

- `anomia`
- `anthropos`
- `kyrios`
- `logos`
- `pater`
- `pistos-ho-logos`

Read `evidence/count-corrections/` before reviewing them. Confirm that the corrected language is coherent, but do not report superseded v4 wording as if it were still present.

## 4. Required audit categories

### A. Word, phrase, and element counts

Find numerical claims about Greek, Latin, English, Hebrew, or Aramaic words; phrases; clauses; titles; names; grammatical units; list members; or repeated occurrences.

For each possible problem:

- quote the complete expression being counted;
- identify its language;
- show the explicit tokenization;
- distinguish orthographic words from phrases, clauses, lexical units, and conceptual elements;
- account for punctuation, elision, contractions, articles, and hyphenation; and
- compare the stated count with the observed count.

Do not assume that an “element” must be a single orthographic word.

### B. Language identification

Look for Greek described as Latin, Latin described as Greek, transliteration described as original-script Greek, English assigned the count of its Greek source, or one language's phrase confused with another.

### C. Scripture references and quotations

Check whether cited books, chapters, verses, quoted readings, and ranges agree with the structured local evidence supplied in the relevant article or comparison record. Flag silent combinations of wording from different editions. Distinguish verse-numbering differences from textual-content differences.

The packet does not contain the full Scripture corpus. If a claim cannot be resolved from the included exact readings, citations, and article context, put it in the human-review queue instead of guessing or relying on memory.

### D. Translation and edition identity

Search for lingering NET references or NET wording from the pre-BSB articles; BSB wording labeled as another edition; BLB or MSB wording labeled as BSB; publisher notes described as Scripture; translation choices described as Greek variants; or edition-specific wording described as universal.

A historical mention of the NET Bible is not automatically an error. Report it only when it is misleading, incorrectly attributed, inconsistent with the BSB adaptation, or unsupported by the surrounding context.

### E. Headwords and transliteration

Check consistency among filename/slug, title, displayed Greek headword, transliteration, gloss, inflected form, dictionary lemma, and `word-metadata.json`.

Flag incompatible identities, obvious carry-over from another article, or an inflected form incorrectly described as a lemma. Do not treat harmless variation between disclosed transliteration systems as an error.

### F. Grammar and morphology

Look for internally inconsistent claims about tense, voice, mood, case, number, gender, person, part of speech, or syntactic function.

The packet intentionally omits the full analysis archive. Unless the included article or comparison evidence resolves the matter exactly, classify it as `needs-human-review`. Do not reconstruct morphology from an English translation or from Strong's numbers.

### G. Internal and cross-record consistency

Look for contradictions within an article, title/body mismatches, singular/plural inconsistencies, wrong list totals, reused boilerplate with the wrong headword or verse, incompatible claims about the same expression, broken reciprocal references, and copied pronouns or antecedents that point to the wrong subject.

### H. Comparison commentary integrity

For all 30 units, compare the prose in `significance.sourceObservation` and `significance.interpretation` with the unit's structured `readings`, `ranges`, `citations`, `explanationSources`, `relatedUnits`, provenance, and limitations.

Check especially that:

- source observations agree with the structured readings;
- present, absent, bracketed, relocated, publisher-note-only, and mixed states remain distinct;
- partial-verse focus is not described as whole-verse absence;
- numbering differences are not described as missing text;
- English rendering differences are not described as Greek textual differences;
- publisher and book-attributed claims remain attributed;
- witness/manuscript claims do not exceed the disclosed evidence;
- interpretation is not presented as direct observation; and
- related links are reciprocal when the prose says they are.

Do not reopen an approved theological judgment merely because another formulation is possible.

### I. Presentation defects affecting meaning

Flag broken or incomplete sentences, duplicated paragraphs, truncated quotations, malformed Markdown, mismatched quotation marks/italics that obscure language boundaries, placeholders, wrong titles/bylines, or broken internal references. Do not produce a general style-editing list.

## 5. Review method

Review the entire corpus, not a sample.

Use both deterministic searches and close reading:

1. Search all content for digits, number words, language names, quoted phrases, edition names, verse references, repeated formulae, and suspicious boilerplate.
2. Read every one of the 250 articles.
3. Read every one of the 30 comparison units.
4. Perform cross-record consistency checks.
5. Recheck every initial flag to eliminate false positives.
6. Give every input record a disposition in `COVERAGE.json`, even when it has no finding.

If context limits prevent full coverage in one session, work in deterministic batches and preserve the same output files across batches. Do not claim completion until the counts reconcile.

## 6. Finding threshold and priority

Create a finding only when you can quote a specific passage and explain the concern concretely.

Classifications:

- `confirmed-error`
- `probable-error`
- `needs-human-review`
- `editorial-consistency`
- `presentation-defect`

Confidence:

- `high`
- `medium`
- `low`

Severity:

- `S1`: materially false or misleading claim central to an article or commentary.
- `S2`: clear factual, count, language, attribution, quotation, edition, or reference error.
- `S3`: localized inconsistency or ambiguity that could mislead a careful reader.
- `S4`: minor presentation or consistency issue.

Do not use S1 merely because a theological subject is important. Only high-confidence S1/S2 items should be recommended as possible pre-v1 corrections.

## 7. Required outputs

Return these six files:

1. `AUDIT-SUMMARY.md`
2. `FINDINGS.json`, conforming to `FINDING-SCHEMA.json`
3. `COVERAGE.json`, completed from `OUTPUT-COVERAGE-TEMPLATE.json`
4. `METHODOLOGY.md`
5. `HUMAN-REVIEW-QUEUE.md`
6. `COMMAND-AND-TOOL-LOG.md`

Every finding must include:

- stable ID;
- corpus and record ID;
- packet-relative source file;
- exact verbatim excerpt;
- category, classification, severity, and confidence;
- precise explanation;
- reproducible local evidence;
- explicit stated/observed tokens and counts for count findings;
- the smallest suggested correction, or `null`;
- whether human review is required; and
- limitations or plausible alternatives.

`COVERAGE.json` must contain all 280 input records. Each entry must retain its original ID, file, and SHA-256 and add:

- `reviewed: true`
- `disposition: no-finding | finding | human-review`
- `findingIds: []`

`AUDIT-SUMMARY.md` must report:

- packet ID and packet-manifest SHA-256;
- exact counts reviewed;
- counts by category, classification, severity, and confidence;
- proposed pre-v1 corrections;
- post-v1/editorial backlog suggestions;
- limitations;
- a statement that no source content was edited; and
- a statement that every finding remains a recommendation pending Larry Herzog Jr.'s review and approval.

Put uncertain lexical, grammatical, historical, manuscript, or theological questions in `HUMAN-REVIEW-QUEUE.md`. Explain the exact question, why the supplied evidence is insufficient, what evidence or reviewer could resolve it, and whether it appears relevant to v1 release readiness.

## 8. External research

The audit should primarily test internal consistency and supplied evidence. Do not browse simply to find support for a suspicion.

If external verification is indispensable:

- use primary or publisher-authoritative sources;
- record the exact URL and access date;
- distinguish external claims from packet evidence;
- quote sparingly;
- never replace or “update” supplied text; and
- classify the item as requiring human confirmation unless the supplied approval framework directly covers it.

## 9. Prohibited actions

Do not:

- rewrite articles for style;
- harmonize theological interpretations;
- add manuscript claims or invented citations;
- change Scripture, source mappings, or article text;
- fetch newer Bible editions and treat them as replacements;
- edit larryherzogjr.com;
- treat the live website as authoritative;
- approve your own findings;
- create a successor release;
- publish anything; or
- claim scholarly certification.

## 10. Completion condition

The audit is complete only when:

1. all 250 articles have a coverage disposition;
2. all 30 comparison units have a coverage disposition;
3. all hashes and counts reconcile with the packet;
4. every finding has an exact excerpt and reproducible evidence;
5. uncertain questions are separated from confirmed errors;
6. no supplied source file has been modified; and
7. the summary distinguishes possible pre-v1 corrections from post-v1 suggestions.

At completion, return only the six report files and a concise handoff message. Do not implement corrections.
