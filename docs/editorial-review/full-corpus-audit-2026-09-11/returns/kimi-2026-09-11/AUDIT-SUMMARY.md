# Ad Fontes NT Full-Corpus Editorial Audit — Summary

- **Packet ID:** `afnt-full-corpus-audit-2026-09-11-v1`
- **Packet-manifest SHA-256 (`packetManifestSha256`):** `7d54757af5da94553a87c0d546e78b34e54aea0c0f785ff82e4fb77e7fd62c06`
- **OM release audited:** `om-studies-2026-09-10-v5` (immutable)
- **Audit ID:** `afnt-full-corpus-audit-2026-09-11-kimi-work-01`
- **Audit date:** 2026-09-11
- **Mode:** report-only. **No source content was edited.** Every finding remains a recommendation pending Larry Herzog Jr.'s review and approval.

## Records reviewed

| Corpus | Reviewed | Coverage disposition |
|---|---|---|
| `om-article` (`corpora/om-articles/*.md`) | 250 / 250 | 34 `finding`, 216 `no-finding` |
| `comparison-commentary` (`corpora/comparison-commentaries/*.json`) | 30 / 30 | 2 `finding`, 28 `no-finding` |
| **Total** | **280 / 280** | 36 `finding`, 244 `no-finding` |

Packet integrity: all files verified against `SHA256SUMS` with zero mismatches; `INPUT-COVERAGE.json` contains exactly 250 `om-article` and 30 `comparison-commentary` records; all 280 output coverage entries retain their original ID, file, and SHA-256. The ten approved v5 corrections in the six previously corrected articles (`anomia`, `anthropos`, `kyrios`, `logos`, `pater`, `pistos-ho-logos`) are present and coherent; no superseded v4 wording remains.

## Findings overview

**Total findings: 41** across 36 records.

### By category

| Category | Count |
|---|---|
| internal-consistency | 15 |
| presentation-affecting-meaning | 9 |
| scripture-reference-or-quotation | 6 |
| headword-or-transliteration | 6 |
| word-or-element-count | 2 |
| comparison-integrity | 2 |
| translation-or-edition-identity | 1 |

### By classification

| Classification | Count |
|---|---|
| confirmed-error | 8 |
| probable-error | 5 |
| presentation-defect | 8 |
| editorial-consistency | 20 |
| needs-human-review | 0 |

### By severity

| Severity | Count |
|---|---|
| S1 | 0 |
| S2 | 5 |
| S3 | 8 |
| S4 | 28 |

### By confidence

| Confidence | Count |
|---|---|
| high | 35 |
| medium | 6 |
| low | 0 |

## Proposed pre-v1 correction candidates (high-confidence S1/S2 only)

Five findings qualify as possible pre-v1 corrections. All remain recommendations pending Larry Herzog Jr.'s approval.

1. **AUDIT-001 — `huiothesia` (S2, high, confirmed-error).** The etymology glosses υἱός as "my firstborn" — flatly wrong, and contradicted by the same sentence, the article's own family list, and the linked Hyios entry. Two related "my firstborn" substitutions at lines 133/173 should be reviewed with it. Suggested fix is a one-word replacement.
2. **AUDIT-003 — `zoe` (S2, high, confirmed-error).** John 10:10 quoted twice, both labeled BSB, with two different wordings; line 31 is not BSB (external BSB check matches line 92).
3. **AUDIT-004 — `teleios` (S2, high, confirmed-error).** Matthew 5:48 labeled BSB with non-BSB wording ("So then, be perfect …") at lines 31/77, conflicting with the correct BSB quotation at line 75.
4. **AUDIT-005 — `charis` (S2, high, confirmed-error).** Romans 11:6 labeled BSB with two conflicting wordings; line 31 is not BSB.
5. **AUDIT-006 — `sozo` (S2, high, confirmed-error).** Matthew 1:21 labeled BSB at line 31 with wording that is not BSB and is nearly identical to the NET Bible rendering — a likely pre-BSB (NET-era) leftover; conflicts with the correct BSB quotation at line 59.

Note on AUDIT-003 through AUDIT-006: the internal conflict is packet-evident; identifying *which* wording is BSB required an external edition check (Bible Hub BSB text, accessed 2026-09-11). Per the audit framework these fixes are classified as requiring human confirmation.

## Post-v1 / editorial backlog suggestions

- **AUDIT-002 (`theos`)**: John 1:1 first-clause gloss reproduces the whole verse. (S3)
- **AUDIT-007 (`iesous`)**: Matthew 1:21 appears in two renderings; the two non-BSB instances are unlabeled. Same correction batch as AUDIT-006. (S3)
- **AUDIT-008 (`mathetes`)**: "over thirty times in Acts before reaching this verse" count claim (~11 is the standard count before Acts 11:26; ~28–29 total). Needs human confirmation. (S3)
- **AUDIT-009 (`prothesis`)**: twelve occurrences split "six showbread / six purpose"; standard data is 4 showbread / 8 purpose. Needs human confirmation. (S3)
- **AUDIT-011 (`agorazo`)**: a two-word Greek phrase is "glossed" with the entire Revelation 5:9 verse. (S3)
- **AUDIT-039 (`hyios`)**: the third "Old Testament echo" quotes the whole Matthew 3:17 sentence and labels it Isaiah 42:1. (S3)
- **AUDIT-040 (`candidate-08`)**: interpretation locates the once-printed warning "at verse 47's conclusion"; the packet's own evidence places it at Mark 9:48. (S3)
- **AUDIT-041 (`candidate-17`)**: "These seventeen Berean notes" misattributes MSB's thirteen notes to Berean; the arithmetic (17) is right, the publisher label is wrong. (S3)
- **AUDIT-010 (`pater`)**: unclosed italics around the PIE reconstruction `*pH₂tér-`. (S4)
- **AUDIT-012 – AUDIT-018**: systematic missing terminal period after closing Scripture quotations (7 articles). One batch fix. (S4)
- **AUDIT-019 – AUDIT-031**: straight vs. typographic apostrophe in the "Where You'll Meet It" heading (13 articles); `orthotomeo` also swaps section order. (S4)
- **AUDIT-032 – AUDIT-037**: frontmatter vs. `word-metadata.json` mismatches (subheads, two pronunciation guides containing transliterations, one apparent pronunciation typo). (S4)
- **AUDIT-038 (`logos`)**: dangling book-series line "The other forty-nine words follow." (S4)

## Human-review queue

Uncertain lexical, grammatical, historical, and evidence-limited questions are separated into `HUMAN-REVIEW-QUEUE.md`. It covers the two count claims needing external confirmation (AUDIT-008, AUDIT-009), the four externally verified quotation fixes (AUDIT-003 – AUDIT-006), cross-reference claims in comparison units that point outside the packet's verse spans, and corpus-wide lexical frequency/morphology claims that the packet's evidence cannot resolve. Nothing in the queue is asserted as an error.

## Limitations

1. **Scripture verification scope.** The packet contains no full Scripture corpus. BSB-labeled quotations were checked (a) for internal consistency across and within articles and (b) against the exact BSB spans inside the 30 comparison units where the verse overlaps. Only four verses required external verification (John 10:10; Matthew 5:48; Romans 11:6; Matthew 1:21); each was checked against the publisher-public BSB text at biblehub.com on 2026-09-11, and each such finding is marked `requiresHumanReview: true`. Quotations not covered by these checks were not verifiable and are not asserted correct.
2. **Frequency and morphology claims.** "Appears N times in the New Testament" statements and grammatical analyses (tense, case, declension) cannot be resolved from packet evidence; they were checked only for internal consistency and against standard reference data where a claim looked anomalous. See the human-review queue.
3. **Reading depth.** Every article was processed line-by-line by deterministic extraction (all numeric/count claims, language names, edition names, citations, Greek strings, structural markers) and every extracted claim was manually reviewed; all flagged passages were read in full context, and complete articles were read across all sources and categories. A full second human-style close read of all 3.4 MB of prose was not feasible in a single session; the residual risk is prose-internal contradictions carrying none of the audited markers.
4. **Theology not re-judged.** Approved interpretations, theological judgments, and the ten approved v5 corrections were not reopened. The original larryherzogjr.com articles were not consulted; the live website was not treated as authority.
5. **Metadata role.** `word-metadata.json` was used for identity checks only, per the packet instructions; mismatches are reported as mismatches, not as adjudications of which surface is right.

## Attestations

- **No source content was edited.** The packet was extracted into a working copy; all corpus files remain byte-identical to the supplied ZIP (hash-verified after the audit).
- **Every finding remains a recommendation pending Larry Herzog Jr.'s review and approval.** Nothing in this audit is self-approved, and no successor release is proposed or created.
