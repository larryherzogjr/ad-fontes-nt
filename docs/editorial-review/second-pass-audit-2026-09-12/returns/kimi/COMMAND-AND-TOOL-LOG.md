# Command and Tool Log — Second-Pass Editorial Audit

- **Bound to packet-manifest SHA-256:** `9b0a50e434974078125e877a6e8a703ea73eee643a2270fbc2ad55a0d23261a7`
- Environment: Linux sandbox, Python 3.12 (IPython), standard CLI tools. All analysis read-only against the packet.

## 1. Packet intake and integrity

| # | Command / operation | Result |
|---|---|---|
| 1 | `unzip Ad-Fontes-NT-Second-Pass-Editorial-Audit-2026-09-12.zip` → `/tmp/adfontes/` | extracted |
| 2 | `sha256sum -c SHA256SUMS` (packet root) | **298/298 OK** |
| 3 | Python: `hashlib.sha256(PACKET-MANIFEST.json)` vs `PACKET-MANIFEST.sha256` | match — `9b0a50e4…d23261a7` |
| 4 | Python: parse INPUT-COVERAGE.json; count records | 250 om-article + 30 comparison-commentary |
| 5 | Python: re-hash all 280 record files, compare to INPUT-COVERAGE.json | 280/280 match |
| 6 | Read guidance: EDITORIAL-REVIEW.md, M2-Source-Decisions.md, M3-Acceptance.md, M3-Source-Decisions.md; evidence: CORRECTIONS.json, REVIEW.md | editorial rules and v7 corrections extracted |
| 7 | **(post-reset)** re-extract ZIP; `sha256sum -c SHA256SUMS` again | **298/298 OK** — confirms no supplied file changed during the audit |

## 2. External verification sources (read-only)

| # | Fetch | Result |
|---|---|---|
| 8 | `raw.githubusercontent.com/biblicalhumanities/Nestle1904/713f28a3b7d4d66132f5aa809fa223fe79762e5d/morph/Nestle1904.csv` | obtained (interrupted transfers; resumed) |
| 9 | BSB text: `raw.githubusercontent.com` BSB.json mirrors — truncated/failed; switched to `BSB-publishing/bsb2usfm` GitHub release **v5.9**, asset `BSB_usj.zip` | 66 books, USJ JSON; verse extraction skips `type:"note"` subtrees and section-heading paras |
| 10 | **(post-reset)** re-acquired Nestle 1904 via `codeload.github.com/.../tar.gz/713f28a3…` tarball → `morph/Nestle1904.csv` | 137,780 lines incl. header → 137,779 tokens, 5,401 NFC lemmas |

## 3. Analysis passes (all 280 records unless noted)

| # | Pass | Tooling | Result |
|---|---|---|---|
| 11 | Frontmatter parse; identity fields vs word-metadata.json (greek/translit/slug/gloss/subhead) | Python regex/YAML-lite parse | 250/250 consistent |
| 12 | Duplicate word/phrase sweep | Unicode-aware regex with sentence splitting + allow-list for liturgical doubling | 1 genuine: PASS2-001 |
| 13 | Leftover markers (TODO/FIXME/template vars/lorem/AI-voice), HTML-comment inventory, link-syntax check | regex sweeps | only intentional AD FONTES / COPY APPROVED comments; links resolve |
| 14 | Count-claim extraction (41 candidates) and lemma resolution | transliteration normalization + N1904 lemma index | 35 verified exact/hedged-OK; 6 findings (PASS2-002/-003/-013/-014/-015/-016/-017) |
| 15 | Verse-level scoped counts (Pastorals, Philippians, Acts, Matthew 24, Titus pattern) | N1904 BCV index | verified; evidence in FINDINGS.json |
| 16 | BSB quotation extraction & verification | boundary-safe anchor extractor; 629 instances | 468 exact, 97 partial-verbatim, 2 superset; deviations → PASS2-005…-012 |
| 17 | Initial naive quote regex → 118 candidate mismatches | triaged: nested-quote and USJ-heading artifacts; extraction corrected; all re-verified | no hidden defects beyond the 8 reported |
| 18 | Lexical-method sweep ("literally means", "root meaning", unhedged etymologies) | regex + contextual reading of 34 files | PASS2-018, PASS2-019 |
| 19 | Historical/confessional sweep (62 passages) | contextual reading + sampled factual checks (Trent, Marburg, Kaiserswerth, Colwell, Dodd, Aulén, Barr, Fliedner dates) | all sampled claims verify; 1 footnote-format defect (PASS2-023) |
| 20 | Comparison-commentary structural checks: edition set, states, focus⊆main nesting, state/span coherence, [Sn]/[Cn] resolution, range well-formedness, Boyd naming | Python over 30 JSON records (210 readings, 35 focus objects) | all pass; no findings |
| 21 | v7 correction verification (AUDIT-062/063/064/065/086) | text search per CORRECTIONS.json | all 5 present and correct |
| 22 | Pronunciation-field audit (metadata vs article templates) | template extraction over 250 files | PASS2-020, -021, -022 |
| 23 | FINDINGS.json validation | `jsonschema` against packet FINDING-SCHEMA.json | valid (schemaVersion 2; 23 findings) |
| 24 | COVERAGE.json build | OUTPUT-COVERAGE-TEMPLATE.json filled: 280 records, `reviewed: true` | dispositions: 14 finding, 11 human-review, 255 no-finding |

## 4. Incidents and corrections during the audit

- **Kernel reset mid-audit** wiped `/tmp` scratch state. Packet re-extracted from the original upload; all hashes re-verified (298/298 OK); Nestle 1904 morphology re-downloaded via the pinned-commit tarball; **every number quoted in FINDINGS.json was re-computed after the reset** (36 lemma counts + all scoped verse distributions re-verified identical to the pre-reset values).
- **BSB fetch instability:** two mirror paths truncated; the v5.9 release zip succeeded. All BSB findings carry the pinned-version caveat.
- **Quote-extraction false positives:** first-pass regex mismatched on nested curly quotes and USJ headings (118 candidates); extraction corrected and all candidates re-verified — no defects were hidden by the artifact.

## 5. Deliverables

Written to `/mnt/agents/output/`: AUDIT-SUMMARY.md, FINDINGS.json, COVERAGE.json, METHODOLOGY.md, HUMAN-REVIEW-QUEUE.md, CROSS-RECORD-REVIEW.md, COMMAND-AND-TOOL-LOG.md. No other files were created or modified in the packet or anywhere outside the output directory.
