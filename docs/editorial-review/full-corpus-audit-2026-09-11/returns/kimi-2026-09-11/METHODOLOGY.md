# Methodology — Ad Fontes NT Full-Corpus Editorial Audit

**Packet:** `afnt-full-corpus-audit-2026-09-11-v1` · **packetManifestSha256:** `7d54757af5da94553a87c0d546e78b34e54aea0c0f785ff82e4fb77e7fd62c06`
**Audit ID:** `afnt-full-corpus-audit-2026-09-11-kimi-work-01` · **Date:** 2026-09-11 · Report-only.

## 1. Packet establishment

1. Copied the supplied ZIP into the audit workspace and extracted it without renaming any file.
2. Read `README.md`, `PACKET-MANIFEST.json`, `PACKET-MANIFEST.sha256`, `SHA256SUMS`, `AUDIT-PROMPT.md`, all four files under `guidance/`, and all three files under `evidence/count-corrections/` completely, plus `FINDING-SCHEMA.json`, `OUTPUT-COVERAGE-TEMPLATE.json`, `INPUT-COVERAGE.json`, and `evidence/om-v5-manifest.json`.
3. Verified every packet file against `SHA256SUMS` (`shasum -a 256 -c`): **0 failures**.
4. Confirmed `INPUT-COVERAGE.json` contains exactly **250** `om-article` and **30** `comparison-commentary` records (280 total).
5. Recorded `packetManifestSha256` = `7d54757af5da94553a87c0d546e78b34e54aea0c0f785ff82e4fb77e7fd62c06` and bound all outputs to it.

## 2. Prior-correction handling

Before auditing, the ten approved v5 corrections (`evidence/count-corrections/CORRECTIONS.json`) were checked against the six affected articles. All ten `new` strings are present verbatim; none of the ten `old` (v4) strings remains anywhere in the corpus. The corrected language was found coherent (e.g. the two-word Greek confession vs. three-word English rendering distinction in `kyrios`; "three elements" in `pater`). These articles were then audited on their v5 text; no v4 wording was reported as if present.

## 3. Deterministic passes (all 250 articles + 30 units)

Custom Python scripts (see `COMMAND-AND-TOOL-LOG.md`) performed these exhaustive passes:

1. **Frontmatter vs. metadata:** YAML-parsed frontmatter of all 250 articles compared field-by-field with `corpora/word-metadata.json` (title, greek, translit, subhead, gloss, category, description, pronunciation, slug).
2. **Count claims:** every line matching a number word or digit near *word(s)/element(s)/phrase(s)/clause(s)/syllable(s)/letter(s)/time(s)/occurrence(s)/name(s)/title(s)* was extracted (1,291 lines) and manually reviewed; language-tied claims (Greek/Latin/Hebrew/Aramaic/English) were reviewed first; enumerated claims ("three elements…") were matched against the lists that follow them (102 patterns checked; bullet-count mismatches automatically flagged and adjudicated).
3. **Occurrence-frequency claims:** all "appears/occurs N times in the New Testament" claims extracted and checked for internal consistency; spot-verified against standard concordance data where anomalous (two findings resulted: AUDIT-008, AUDIT-009).
4. **Language identification:** all 1,629 lines naming Greek, Latin, Hebrew, Aramaic, or English reviewed for mislabeled languages, transliteration-presented-as-script, and count transfers between languages.
5. **Edition identity:** all 1,235 lines naming editions (BSB, BLB, MSB, YLT, Nestle, Robinson–Pierpont, Boyd/Textus Receptus, KJV, NET, etc.) reviewed. **Zero NET Bible references** remain in the article corpus; the only NET-like residue is the Matthew 1:21 wording finding (AUDIT-006/007).
6. **Scripture citations:** all 1,111 parenthetical citations extracted; cross-article comparison located every verse quoted with two or more distinct wordings (45 reference groups reviewed), surfacing the four conflicting-quotation findings (AUDIT-003 – AUDIT-006) and clearing the rest as partial-vs-full or same-edition variants.
7. **Quotation vs. comparison-unit spans:** every article quotation of a verse covered by the 30 comparison units was compared against the units' exact published BSB spans; all matched (one apparent mismatch was a two-verse quotation compared against a single-verse span — cleared as a false positive).
8. **Structure:** section-heading inventory (6 heading-set variants adjudicated), duplicated paragraphs within articles (0), identical long paragraphs across articles (28 — all shared Scripture quotations, legitimate), footnote reference/definition pairing (0 defects), asterisk/quote balance per line (1 true defect: AUDIT-010), placeholder markers (0 real; 39 hits were approval-comment uses of the word "placeholder"), broken internal `/greek/<slug>/` links (0), headword presence of frontmatter Greek in body (250/250), title contains Greek + transliteration (250/250).
9. **Strong's usage:** searched for Strong's-number claims (0 occurrences in articles).

## 4. Comparison commentary integrity (all 30 units)

For each of the 30 units, a parser checked: span offset arithmetic (`end − start == len(text)`); state/focus coherence (no `present` state with empty spans, no `absent` with spans); `relatedUnits` reciprocity (all reciprocal: 04↔12↔23, 07↔08, 15↔26, 23↔24, 29↔30 verified); edition coverage (all 30 units carry all seven editions); and range-vs-span segment coverage. Then the prose of `significance.sourceObservation` and `significance.interpretation` was read for all 30 units against their structured readings, with special attention to the checklist in the audit prompt (present/absent/bracketed/relocated/publisher-note-only/mixed distinctions; partial-verse vs. whole-verse; numbering vs. absence; rendering vs. Greek differences; publisher attribution; witness-claim limits; interpretation vs. observation). Key Greek claims were verified against the units' own spans (Romans 5:1 ἔχωμεν/ἔχομεν; 1 Corinthians 13:3 καυθήσομαι/καυθήσωμαι; John 1:18 μονογενὴς Θεός/ὁ μονογενὴς υἱός; 1 Timothy 3:16 Ὃς/Θεός; Romans 16:27 τῶν αἰώνων; Matthew 23:13–14 woe ordering) — all matched. Two findings resulted (AUDIT-040, AUDIT-041).

## 5. Close reading

- Every line extracted by the deterministic passes (counts, languages, editions, citations, Greek strings, structural markers) was manually reviewed in article context — this covers the overwhelming majority of audit-relevant assertions in all 250 articles.
- Complete articles were read across the corpus's sources and categories (Explorer articles, Just Enough Greek volumes 1 and 2, phrase articles, the six v5-corrected articles, and all articles surfaced by any flag).
- All 30 comparison units were read in full (prose plus structured data).

**Disclosed limitation:** a second complete, uninterrupted close read of all 3.4 MB of article prose was not feasible in one session. The method guarantees that every numeric claim, every language/edition name, every citation, every Greek string, and every structural element in all 280 records passed through manual review; residual risk is confined to prose-internal contradictions with no audited marker.

## 6. False-positive elimination

Every initial flag was rechecked before becoming a finding. Examples of flags rejected: YAML escape artifacts in raw frontmatter (≈100 false mismatches); apostrophe-driven single-quote imbalance (informational only); the `*“**term**”*` nested bold-in-italic pattern (valid CommonMark, intentional emphasis); shared Scripture block quotations across articles (legitimate reuse); "The other forty-nine words follow." was retained as a finding only as low-severity carry-over; the mysterion Romans 16:25–26 quotation (spans two verse segments — matches BSB exactly); theotes "five elements" (matches its five-item list); anamnesis "three of the four occurrences" and paliggenesia "two occurrences" (both accurate).

## 7. External verification (used sparingly, per §8 of the audit prompt)

External sources were consulted only where internal evidence could not identify which of two conflicting wordings/splits was correct:

| Claim | Source | Access date |
|---|---|---|
| BSB John 10:10 | https://biblehub.com/bsb/john/10.htm | 2026-09-11 |
| BSB Matthew 5:48 | https://biblehub.com/bsb/matthew/5.htm | 2026-09-11 |
| BSB Romans 11:6 | https://biblehub.com/bsb/romans/11.htm | 2026-09-11 |
| BSB / NET Matthew 1:21 | https://biblehub.com/matthew/1-21.htm | 2026-09-11 |
| πρόθεσις occurrences and senses | https://biblehub.com/greek/4286.htm (Strong's 4286 + Englishman's Concordance) | 2026-09-11 |
| μαθητής frequency in Acts | Strong's 3101 concordance listing | 2026-09-11 |

External claims are kept distinct from packet evidence inside each finding; every externally informed finding is marked `requiresHumanReview: true`. No supplied text was replaced or "updated."

## 8. Dispositions and outputs

All 280 input records received a coverage disposition: 36 `finding` (34 articles, 2 units), 244 `no-finding`. `FINDINGS.json` was validated against `FINDING-SCHEMA.json` (all required keys, enums, ID pattern, evidence object shape, no additional properties). Counts in `AUDIT-SUMMARY.md` reconcile exactly with `FINDINGS.json` and `COVERAGE.json`.
