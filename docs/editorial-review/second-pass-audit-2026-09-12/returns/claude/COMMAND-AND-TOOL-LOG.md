# Command and tool log

Packet-manifest SHA-256 `9b0a50e434974078125e877a6e8a703ea73eee643a2270fbc2ad55a0d23261a7`. All work in an Ubuntu 24 sandbox under `/home/claude/audit/`; the packet was extracted to `/home/claude/audit/Ad-Fontes-NT-Second-Pass-Editorial-Audit-2026-09-12/` and never written to. Helper scripts lived in `/home/claude/audit/work/`; outputs in `/home/claude/audit/out/`. No network requests were made for verification.

## 1. Packet establishment

```
unzip -l  <zip>                              # inventory: 299 entries
unzip -q  <zip>                              # extract, no renaming
sha256sum -c SHA256SUMS | grep -c ': OK$'    # 298
sha256sum -c PACKET-MANIFEST.sha256          # PACKET-MANIFEST.json: OK
python3: recompute sha256 of every INPUT-COVERAGE record; compare to evidence/current-article-release/manifest.json files map;
         hash manifest.json and corpora/word-metadata.json and compare with PACKET-MANIFEST.json sourceBindings
         -> 0 mismatches
cat README.md PACKET-MANIFEST.json PACKET-MANIFEST.sha256 guidance/*.md evidence/current-article-release/{APPROVAL.md,CORRECTIONS.json,REVIEW.md,VALIDATION.json}
head -c 9000 evidence/current-article-release/{CANDIDATE-MANIFEST.json,manifest.json}   # plus full hash of manifest.json
python3: inspect INPUT-COVERAGE.json / OUTPUT-COVERAGE-TEMPLATE.json structure; cat FINDING-SCHEMA.json
```

## 2. Corpus profiling

```
work/load.py            # loaders: articles() (YAML frontmatter + body), sections(), units(), meta()
python3: section inventory (250×So What/WCLH, 249×The Word/Range/Where You’ll Meet It, 191×Where People Get It Wrong), frontmatter key census, body-size stats (3.2 MB), comparison JSON structure
```

## 3. Deterministic scans (all 280 records)

```
work/scan1.py  -> scan1.json     # dup words, dup sentences/paragraphs/quotes/headings, quote labels, edition names, placeholders,
                                 # punctuation, curly/bold/italic/paren/bracket balance, non-terminal paragraphs, empty sections
python3: footnote ref/def reconciliation; internal /greek/ link resolution; stale forward-reference phrases
python3: frontmatter vs word-metadata.json cross-check; title/linkTitle/translit/greek consistency; NFC; description template
python3: inline long-quotation lead-in scan -> inline_seams.json (521 candidates, 243 flagged)
python3: count/quantifier sentence extraction -> counts.json (268)
python3: etymology / "literally" sentence extraction (242)
grep -o -E: declension/tense/voice/case statements
python3: confessional citation extraction (153)
python3: group-characterization sentences (23)
grep -n -E '\b(1[0-9]{3}|20[0-2][0-9])\b' (dated claims, bibliography lines excluded)
python3: automated Greek->Latin transliteration vs `translit`; accent presence on every Greek token in bodies
python3: BSB-labelled quotes with lowercase deity pronouns (41, all legitimate)
grep -c '\*The\* \*“\*\*' *.md            # 38 files / 71 hits (heading markup artifact)
grep -l '^# Front matter reconciled' *.md  # 14 files (stray YAML comment)
python3: comparison units — citation-token resolution, relatedUnits existence/reciprocity, per-edition state table, focus/presentation/publisherNotes dump
```

A cross-record occurrence-count comparison script was first written with a pathological regex and timed out (300 s); it was rewritten with a simpler pattern and completed (no numeric contradictions between files).

## 4. Contextual reading

```
work/ctx.py <slug> <needle> ...   # prints ±350 chars around each flagged excerpt with line numbers
```
Used for every dup-sentence hit, every lead-in/lowercase-start quotation flag, every count/etymology/morphology/confessional/historical item that looked doubtful, and the comparison-unit prose (printed in four batches: 01–08, 09–16, 17–23, 24–30 with states, focus, spans, sources, observation, interpretation).

## 5. Building the return

```
work/build_findings.py  -> out/FINDINGS.json     # each exactExcerpt located in the v7 bytes (NBSP-normalized); aborts on any miss;
                                                 # locator = line number (+ occurrence count); schemaVersion 2; packetManifestSha256 bound
python3: field-by-field validation against FINDING-SCHEMA.json (required, additionalProperties, enums, patterns, evidence keys, booleans) -> 0 errors
python3: COVERAGE.json from OUTPUT-COVERAGE-TEMPLATE.json — reviewed:true, disposition, findingIds; pattern findings PASS2-034/PASS2-064 attached to the 38 and 14 affected records; assert every findingId exists and every finding is referenced
AUDIT-SUMMARY.md, METHODOLOGY.md, HUMAN-REVIEW-QUEUE.md, CROSS-RECORD-REVIEW.md, COMMAND-AND-TOOL-LOG.md written by hand
sha256sum -c SHA256SUMS at completion -> 298 OK (no supplied file changed)
```

## 6. Tools not available / not used

`jq`, `jsonschema` (Python module) — unavailable; replaced by Python. No web search, no web fetch, no external Bible or lexicon lookups. No API calls.
