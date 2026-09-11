# Command and Tool Log — Ad Fontes NT Editorial Audit

**Audit ID:** `afnt-full-corpus-audit-2026-09-11-kimi-work-01` · **Date:** 2026-09-11
**Environment:** macOS; Kimi Work agent runtime (managed Python 3, ripgrep-backed search, FetchURL/WebSearch). All work performed on an extracted working copy of the packet inside the audit workspace; no packet file was modified.

All paths below are relative to the audit workspace. The packet root is `packet/Ad-Fontes-NT-Full-Corpus-Audit-2026-09-11/`.

## 1. Packet establishment

| Command / action | Purpose | Result |
|---|---|---|
| `cp <supplied zip> . && unzip -o -q Ad-Fontes-NT-Full-Corpus-Audit-2026-09-11.zip -d packet` | Extract packet without renaming | 250 articles, 30 units, metadata, guidance, evidence present |
| `shasum -a 256 -c SHA256SUMS` (in packet root) | Hash verification of every supplied file | **0 failures** (all lines `: OK`) |
| `cat PACKET-MANIFEST.sha256` | Record packet-manifest hash | `7d54757af5da94553a87c0d546e78b34e54aea0c0f785ff82e4fb77e7fd62c06` |
| Python: parse `INPUT-COVERAGE.json` | Coverage count check | exactly 250 `om-article` + 30 `comparison-commentary` records |
| Read `README.md`, `guidance/*.md` (4 files), `evidence/count-corrections/*` (3 files), `FINDING-SCHEMA.json`, `OUTPUT-COVERAGE-TEMPLATE.json`, `PACKET-MANIFEST.json`, `evidence/om-v5-manifest.json` | Establish rules, prior corrections, output contract | completed in full |

## 2. Deterministic scan scripts (written to workspace, run with managed `python3`)

| Script | Function | Key outputs (in `scans/`) |
|---|---|---|
| `scan1.py` | Count-claim extraction; language-name lines; edition-name lines; citation lines; Strong's lines; intra-article duplicate paragraphs; placeholders; headword inventory | `count_claims.txt` (1,291), `language_mentions.txt` (1,629), `edition_mentions.txt` (1,235), `citations.txt` (1,111), `strongs_mentions.txt` (0), `duplicated_paragraphs.json` (0), `placeholders.txt` (39, all benign), `frontmatter_vs_metadata.json` (superseded) |
| `scan_fm.py` | YAML-parsed frontmatter vs. `word-metadata.json`, field-by-field | `frontmatter_vs_metadata2.json` — real mismatches: agorazo/haima/soma subheads; mesites/bema/eulogeo pronunciation (title/pronunciation absence in metadata schema noted as structural) |
| `scan_struct.py` | Quote/asterisk balance; headword-in-body; cross-article duplicate paragraphs; heading inventory; enumerated claims vs. following lists; title completeness; footnote pairing | `struct_*.json` — 1 asterisk defect (pater); 6 heading-set variants; 102 enumeration patterns; 28 cross-article duplicate paragraphs (all shared Scripture quotations, cleared); 0 footnote defects; 0 missing headwords; 0 broken links |
| `scan_units.py` / `scan_units2.py` | Per-unit digest; span arithmetic; state/focus coherence; relatedUnits reciprocity; edition coverage; range-vs-span coverage | `comparison_digest.txt`, `units_prose.txt`; 0 structural issues in 30 units |
| `scan_quotes.py` | Cross-article same-verse quotation wording comparison | `quote_wording_diffs.json` — 45 reference groups; 4 true conflicts (zoe, teleios, charis, sozo), rest cleared as partial/full or same-edition variants |
| `scan_bsb_quotes.py` | Article quotations of unit-covered verses vs. exact BSB spans in the 30 units | 1 candidate (mysterion, Rom 16:25–26) — cleared as two-verse span false positive |
| `build_findings.py` | Assemble FINDINGS.json | 41 findings; schema-validated (manual validator against `FINDING-SCHEMA.json`: required keys, enums, `^AUDIT-[0-9]{3,}$` IDs, evidence object shape, `additionalProperties: false` respected) |

## 3. Targeted shell inspections (grep/sed over the corpus)

- v5 correction strings: all ten `new` strings present; zero `old` v4 strings anywhere (`grep -l` over all articles).
- NET Bible references: none (`grep -inE "\bNET\b"` — only "net worth"/"fishing net" hits).
- Internal `/greek/<slug>/` links: 0 broken (checked against 250 slugs).
- "my firstborn" occurrences: huiothesia ×3, corroborating AUDIT-001; prototokos entry confirmed as likely carry-over source.
- Missing-terminal-period pattern after closing Scripture quotations: instances confirmed in hyios, theos, amen, agorazo, anastasis, prototokos, theotes (AUDIT-012 – AUDIT-018).
- Heading apostrophe census: 13 straight-apostrophe articles vs. 237 typographic; orthotomeo section-order swap (AUDIT-019 – AUDIT-031).
- Verbatim excerpt and line-number collection for every finding (grep -n per article).

## 4. External lookups (all accessed 2026-09-11; used only where packet evidence was insufficient)

| URL | Claim checked |
|---|---|
| https://biblehub.com/bsb/john/10.htm | BSB John 10:10 wording (AUDIT-003) |
| https://biblehub.com/bsb/matthew/5.htm | BSB Matthew 5:48 wording (AUDIT-004) |
| https://biblehub.com/bsb/romans/11.htm | BSB Romans 11:6 wording (AUDIT-005) |
| https://biblehub.com/matthew/1-21.htm | BSB vs. NET Matthew 1:21 wording (AUDIT-006, AUDIT-007) |
| https://biblehub.com/greek/4286.htm | πρόθεσις occurrences/senses (AUDIT-009) |
| Strong's 3101 concordance data (WebSearch) | μαθητής frequency in Acts (AUDIT-008) |

A first attempt at BibleGateway returned no usable text (rendered page shell only); Bible Hub was used instead. No other external sources were consulted. The live larryherzogjr.com site was not consulted or treated as authority.

## 5. Output generation and verification

- `FINDINGS.json` — 41 findings, bound to `packetManifestSha256`; validated against `FINDING-SCHEMA.json`.
- `COVERAGE.json` — built from `OUTPUT-COVERAGE-TEMPLATE.json`; all 280 records `reviewed: true`; 36 `finding` / 244 `no-finding`; original IDs, files, and SHA-256 values preserved byte-for-byte and re-compared against `INPUT-COVERAGE.json` (0 mismatches).
- `AUDIT-SUMMARY.md`, `METHODOLOGY.md`, `HUMAN-REVIEW-QUEUE.md`, `COMMAND-AND-TOOL-LOG.md` — this set.
- Post-audit integrity: packet files re-hashed after the audit; identical to the supplied `SHA256SUMS` (no source content edited).

## 6. Session note

The audit session was interrupted once by a laptop shutdown and resumed from the workspace; all intermediate scan outputs persisted, and the audit completed without re-running packet establishment (hashes re-verified on resume).
