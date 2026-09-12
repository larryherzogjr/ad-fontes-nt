# Independent second-pass editorial audit prompt

You are conducting a fresh, report-only editorial audit of the commentary shipped in `Ad-Fontes-NT-Second-Pass-Editorial-Audit-2026-09-12.zip`.

This is not permission to edit Scripture, articles, commentary records, application code, or the author’s website. Do not publish, approve, or silently correct anything. Your findings are recommendations for reconciliation and human review.

## 1. Establish the exact packet

1. Extract the ZIP without renaming files.
2. Read `README.md`, `PACKET-MANIFEST.json`, `PACKET-MANIFEST.sha256`, `SHA256SUMS`, and every file under `guidance/` and `evidence/current-article-release/` completely.
3. Verify all supplied files against `SHA256SUMS`. If you cannot calculate hashes, say so prominently and do not claim hash verification.
4. Confirm exactly 250 `om-article` and 30 `comparison-commentary` records in `INPUT-COVERAGE.json`.
5. Bind every returned file to the exact packet-manifest SHA-256.

Targets:

- `corpora/om-articles/*.md`: the exact 250 approved Ad Fontes BSB adaptations from immutable release `om-studies-2026-09-11-v7`.
- `corpora/comparison-commentaries/*.json`: all 30 published Ordinary Means comparison notes.
- `corpora/word-metadata.json`: identity metadata useful for cross-checking, not an independent lexical authority.

The v7 files are the current authority for this audit. Do not report wording found only in older releases or on `larryherzogjr.com`. The prior external audits are deliberately not included: perform an independent second pass rather than repeating their conclusions.

## 2. Why this pass is different

Earlier review concentrated heavily on verse quotation adaptation, language labels, word counts, and conspicuous factual inconsistencies. Those checks were valuable but can miss sentence-level and method-level defects. Give special attention to:

- a correction that fixed one clause but left a contradictory or duplicated clause nearby;
- a BSB quotation inserted alongside an older rendering instead of replacing it;
- duplicated words, phrases, headings, quotation blocks, citations, or boilerplate;
- pronouns, antecedents, subjects, objects, tense, or connective logic damaged by adaptation;
- a lemma treated as though it means every gloss everywhere;
- etymology or a compound’s parts treated as determinative contextual meaning;
- an inflected form confused with a dictionary lemma or pronunciation guide;
- an unqualified “always,” “never,” “all,” “only,” “the New Testament uses,” or frequency claim whose scope is unclear or unsupported;
- a grammatical observation made to carry more theological weight than the grammar establishes;
- a quotation, paraphrase, historical claim, confessional citation, or characterization of another tradition without adequate attribution;
- incompatible claims about the same word, verse, doctrine, edition, or textual state across records; and
- source observation and editorial interpretation blending together in comparison notes.

## 3. Preserve the content boundaries

Keep Scripture, publisher notes, Ordinary Means commentary, lexical aids, confessional material, and audit findings distinct.

Do not imply that:

- BSB and BLB are independent manuscript witnesses;
- Byzantine Majority and Textus Receptus are identical;
- translation wording alone establishes a Greek textual difference;
- missing analysis proves textual absence;
- Strong’s numbering establishes contextual meaning, lemma identity, or English alignment;
- etymology supplies a word’s meaning in every occurrence;
- all possible dictionary senses are active in a passage; or
- an approved theological interpretation is itself source evidence.

Preserve the exact identities of BSB, BLB publisher draft, MSB, YLT, Nestle 1904, Robinson–Pierpont 2018, and the Boyd Textus Receptus compilation.

## 4. Required review lenses

### A. Adaptation seams and residual text

Read paragraph context around every block quotation, translation label, and repeated sentence. Look for two renderings presented as one quotation, duplicate quote blocks, stale NET-era wording, half-updated grammar, repeated articles or verbs, and commentary that still depends on wording no longer present in the displayed BSB quotation.

### B. Sentence and argument integrity

Check each paragraph as an argument, not merely a bag of facts. Flag broken antecedents, incomplete contrasts, conclusions that do not follow, mutually exclusive assertions, category shifts, and lists whose summary does not match their members. Intentional rhetorical repetition is not an error unless it produces a contradiction or apparent copy artifact.

### C. Lexical method

Identify root fallacies, illegitimate totality transfer, semantic claims derived only from English resemblance, and “literal meaning” claims that confuse etymology with attested usage. Distinguish a word family from a set of synonyms. Require contextual evidence for claims that one Greek word supplies a theological concept by itself.

Do not object merely because an article makes theological use of a word. Flag only a concrete methodological leap, factual overstatement, or misleading formulation.

### D. Lemma, form, transliteration, and morphology

Cross-check filename, title, Greek headword, transliteration, pronunciation, gloss, part of speech, and body references against `word-metadata.json`. Look for inflected forms called lemmas, wrong gender/declension/conjugation claims, mismatched accents or breathings, and morphology copied from another form. Harmless differences between disclosed transliteration systems are not findings.

The full morphology archive is excluded. Put unresolved technical claims in the human-review queue rather than guessing.

### E. Scope, frequency, and quantifiers

For every numerical or distribution claim, ask: lemma or surface form, which Greek edition, main text or alternatives, New Testament or wider Greek, exact or approximate? Flag counts or universal claims that lack a recoverable scope. Recheck written number words as well as digits.

### F. Scripture, quotations, and citations

Check reference boundaries, speaker, addressee, attribution, translation label, punctuation-dependent claims, and whether commentary quotes a whole verse while arguing from only one clause. A quotation may be intentionally partial, but ellipsis or paraphrase must not misrepresent its scope.

The packet does not contain the full Bible. Use primary/publisher-authoritative sources only when external verification is indispensable, record the URL and access date, and otherwise return the issue for human review.

### G. Historical, confessional, and inter-tradition claims

Check dates, titles, article numbers, named controversies, authorship, quotation versus paraphrase, and whether a modern translation/edition is being quoted. Flag categorical descriptions of “Lutherans,” “evangelicals,” “Catholics,” “Reformed,” “progressives,” or other groups when the claim is factual, sweeping, or unattributed. Do not turn the audit into theological debate or require false neutrality.

### H. Cross-record consistency

Build a working index of recurring Greek terms, related-word links, Scripture passages, confessional citations, and recurring theological claims. Compare records that discuss the same material. Look for reciprocal-link failures, title/body mismatches, differing occurrence counts, contradictory word-family relationships, and template prose carrying the wrong word or verse.

### I. Comparison-commentary integrity

For all 30 JSON records, compare `significance.sourceObservation` and `significance.interpretation` with `readings`, `ranges`, `citations`, `explanationSources`, `relatedUnits`, provenance, focus metadata, and limitations.

Preserve present, absent, bracketed, relocated, publisher-note-only, partial-focus, and mixed states. Do not describe numbering differences as missing words, an English rendering as Greek evidence, or attributed book material as independently verified manuscript evidence.

### J. Presentation defects that alter meaning

Flag malformed Markdown, broken quotations, doubled punctuation, truncated sentences, accidental repetition, placeholder language, and emphasis/quotation boundaries that make it unclear which language or source is being discussed. Skip purely aesthetic copyediting.

## 5. Method and coverage

Review every record, not a sample.

1. Run deterministic searches for adjacent duplicate words, repeated sentences/paragraphs, repeated quote blocks, digits and number words, universal quantifiers, language/edition names, “literally,” roots/prefixes/suffixes, grammar terms, historical dates/names, confessional citations, and suspicious template phrases.
2. Read all 250 articles in deterministic filename order.
3. Read all 30 comparison units in ID order.
4. Perform cross-record clustering and consistency checks.
5. Recheck every flag in context and remove false positives.
6. Give every one of the 280 records a disposition in `COVERAGE.json`.

If context limits require batches, maintain the same cumulative files and deterministic order. Do not claim completion until all counts and hashes reconcile.

## 6. Finding threshold

Create a finding only when you can quote a specific excerpt and explain a concrete risk.

Classifications:

- `confirmed-error`
- `probable-error`
- `needs-human-review`
- `editorial-consistency`
- `presentation-defect`

Severity:

- `S1`: central materially false or misleading claim.
- `S2`: clear factual, source, lexical-method, grammar, attribution, quotation, edition, or reference problem.
- `S3`: localized ambiguity, contradiction, adaptation seam, or overstatement that can mislead.
- `S4`: minor presentation or consistency defect.

Only high-confidence S1/S2 findings should be proposed as likely pre-v1 corrections. Theological importance alone does not determine severity.

## 7. Required return files

Return exactly these seven files:

1. `AUDIT-SUMMARY.md`
2. `FINDINGS.json`, conforming to `FINDING-SCHEMA.json`
3. `COVERAGE.json`, completed from `OUTPUT-COVERAGE-TEMPLATE.json`
4. `METHODOLOGY.md`
5. `HUMAN-REVIEW-QUEUE.md`
6. `CROSS-RECORD-REVIEW.md`
7. `COMMAND-AND-TOOL-LOG.md`

Each finding needs the exact excerpt, smallest useful locator, concrete problem, reproducible local evidence, scope of the disputed claim, plausible alternative, minimal proposed correction or `null`, confidence/severity, and an explicit human-review flag.

`COVERAGE.json` must retain every input ID, file, and SHA-256 and set `reviewed: true`, `disposition: no-finding | finding | human-review`, and `findingIds`.

`CROSS-RECORD-REVIEW.md` must list the clusters actually compared, records involved, method, and conclusion—including clusters with no finding. This is evidence that cross-record review occurred, not a place for unsupported observations.

`AUDIT-SUMMARY.md` must state the packet ID/hash, exact counts reviewed, finding counts by category/classification/severity/confidence, likely pre-v1 items, post-v1 suggestions, limitations, and that no source content was edited. Every finding remains pending Larry Herzog Jr.’s review.

## 8. Prohibited actions and completion

Do not rewrite for style, harmonize theology, invent citations or manuscript support, modify supplied files, fetch replacement editions, edit `larryherzogjr.com`, create a successor release, publish anything, approve your own work, or claim scholarly certification.

The audit is complete only when all 280 records have dispositions, all hashes reconcile, every finding has exact evidence, uncertain questions are separated, cross-record work is documented, and no supplied source file has changed. At completion, return only the seven report files and a concise handoff message.
