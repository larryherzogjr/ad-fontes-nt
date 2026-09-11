# Command and tool log

Environment: Ubuntu container, Python 3.12, standard coreutils. Session tools: `bash_tool`, `create_file`, `memory_read` (the reviewer's own project notes, read once for context; not used as evidence). No web search or web fetch was used.

| # | Command / action | Purpose | Result |
|---|---|---|---|
| 1 | `unzip -q …Ad-Fontes-NT-Full-Corpus-Audit-2026-09-11.zip` into `/home/claude/audit/` | Extract without renaming | 297 files |
| 2 | `sha256sum /mnt/user-data/uploads/*.zip` | Record received ZIP | `ea3584bf…e8ee` |
| 3 | `cat README.md PACKET-MANIFEST.sha256 PACKET-MANIFEST.json`; `cat guidance/*.md evidence/count-corrections/*` | Read required packet documents in full | Read |
| 4 | `sha256sum PACKET-MANIFEST.json`; `sha256sum -c SHA256SUMS`; `comm` of file list vs listed files | Hash verification | Manifest hash matches; 296 OK; only SHA256SUMS unlisted |
| 5 | Python: recompute hashes for INPUT-COVERAGE records; count corpora; compare with om-v5-manifest `files` | Coverage and release binding | 250/30; 280 match; 250 v5 match |
| 6 | Python + PyYAML: parse all front matter → `work/arts.json` | Structured article access | 250 parsed |
| 7 | Python: front matter vs word-metadata vs v5 manifest | Headword/metadata consistency | Pronunciation, subhead, tag discrepancies |
| 8 | Python `show.py`: render each comparison unit; `grep -v` to hide boilerplate S1–S7 locators | Close reading of 30 units | Read in batches 01, 02–04, 05–08, 09–11, 12–15, 16–17, 18–21, 22–25, 26–27, 28–30 |
| 9 | Python: source-marker vs `explanationSources`, reciprocal `relatedUnits`, span/focus offsets, state/coverage | Comparison structural checks | All pass; C4 (03) and C6 (24) uncited |
| 10 | Python: "The Word" headword/translit extraction | Headword check | Format variants only |
| 11 | Python: accent-ordinal regex vs pronunciation guide | Count check | 62 checked; hiereus, huiothesia errors |
| 12 | Python: number + unit regex (1,066 hits; 212 word/phrase items printed) | Count claims | Context reviewed; logos, hyios, hyper items |
| 13 | `grep` contexts for logos, paratheke, hyper, antilytron, hyios | Tokenization rechecks | See findings |
| 14 | Python: duplicate long quotations within a paragraph | Substitution detection | 6 hits |
| 15 | `grep -n` contexts (agorazo, apostolos, arche, soma, "fully God") | Read hits | John 1:1 / NWT issue found |
| 16 | Python: heuristic mid-sentence whole-verse detector (60 candidates); speech-introduction and italic-slot detector (227); residual mid-sentence detector (67) | Substitution detection | Candidates read individually |
| 17 | `grep -o` edition labels; `grep -n` NIV/KJV/NASB/BLB/MSB and series carry-over terms | Edition identity / carry-over | No NET labels; epiphaneia, eusebeia, diakonos items |
| 18 | Python: link target / text agreement, footnotes, placeholders, bold/quote balance, duplicate paragraphs, empty sections | Presentation | aphesis link, hades link |
| 19 | Python: same-reference quotation grouping (1,039 pairs) | Cross-record quotation consistency | 21 conflicting references examined |
| 20 | Python: context printer for conflicts | Evidence | Confirmed in-article conflicts |
| 21 | Python: NET-marker scan inside quotations | Edition identity screening | Additional theos/logos/iesous/kosmos hits |
| 22 | `grep -n` six corrected articles | Verify v5 corrections | Coherent |
| 23 | Python: every "Latin" context; Hebrew/Aramaic label screen | Language identification | theotes, parousia |
| 24 | Python: occurrence-count extraction | Count consistency | parousia item; rest in HR-04 |
| 25 | (turn 2) re-verified `sha256sum -c SHA256SUMS` | Confirm unchanged packet | 296 OK |
| 26 | `pip install jsonschema --break-system-packages` | Schema validation | Installed |
| 27 | Python: verbatim-context printer for all planned excerpts | False-positive recheck | All anchors found |
| 28 | Python: chapter-bound check of 4,528 references | Reference validity | 0 out of range |
| 29 | `create_file work/build.py`; `python3 build.py` | Build FINDINGS.json (verbatim-excerpt assertions, `jsonschema.validate`) and COVERAGE.json (hash assertions) | 88 findings; schema valid; 280 records |
| 30 | Python: anchor verification for queue items; corpus-wide counts | HUMAN-REVIEW-QUEUE and summary evidence | All anchors found |
| 31 | `python3 writemd.py` | Write the four Markdown reports | Written |

All work files were created under `/home/claude/work/` and outputs under `/mnt/user-data/outputs/`. No file under the extracted packet was opened for writing. SHA256SUMS verification before and after the work confirmed the packet unchanged.
