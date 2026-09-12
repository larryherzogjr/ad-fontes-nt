# Human-Review Queue — Second-Pass Editorial Audit

- **Bound to packet-manifest SHA-256:** `9b0a50e434974078125e877a6e8a703ea73eee643a2270fbc2ad55a0d23261a7`
- Every item below is pending Larry Herzog Jr.'s review. Nothing has been changed anywhere.
- Ordered by priority for pre-v1 consideration. Full evidence for each item is in FINDINGS.json under the same ID.

## Tier 1 — likely pre-v1 corrections (high-confidence S2)

| ID | Record | Issue | Suggested minimal correction |
|---|---|---|---|
| PASS2-002 | didaskalia.md | "appears nine times in the Pastoral Epistles" — the article's own list has four passages; pinned morphology confirms 4 (phrase) / 5 (same-verse) / 8 (adjective alone) — never 9 | "nine times" → "four times" (1 Timothy 1:10; 2 Timothy 4:3; Titus 1:9; 2:1) |
| PASS2-005 | amen.md | "the faithful God" (Isaiah 65:16, BSB) — BSB reads "the God of truth," as the article itself quotes earlier | Re-check against pinned BSB; then quote "the God of truth" or unquote the gloss and drop the BSB label |

## Tier 2 — probable errors (S3)

| ID | Record | Issue | Suggested minimal correction |
|---|---|---|---|
| PASS2-001 | anomia.md | Duplicated phrase garbles the sentence: `the "the man of lawlessness" the "the man of lawlessness" already at work` | Second instance was likely "the 'mystery of lawlessness'" (2 Thess 2:7) — restore and de-duplicate |
| PASS2-004 | prototokos.md | Quote labeled "(v. 15)" contains v. 16 text; the "verse 16" quote repeats the same text; broken frames ("treating Christ as 'is the image…'") | Split quotations at the verse boundary; fix labels; delete the duplicated quotation |
| PASS2-003 | authenteo.md | "three times … ten … five" are Pastoral counts stated without scope; NT totals are 3/15/6 and sibling articles say so | Add "in the Pastoral Epistles" scope (or switch to NT totals) |
| PASS2-006 | didaskalia.md | "spreads false teachings" (1 Tim 6:3, BSB) is not BSB wording and breaks the sentence frame | Quote "teach another doctrine" per BSB and repair the frame |
| PASS2-008 | proseuche.md | "made 'all people' (1 Tim 2:1, BSB)" — BSB reads "for everyone"; sentence ungrammatical; article quotes the verse correctly elsewhere | "made 'for everyone' (1 Timothy 2:1, BSB)" |
| PASS2-007 | sarx.md | "human credentials" in quotation marks labeled (Phil 3:3–4, BSB); words not in BSB — likely a gloss | Unquote the gloss or use BSB wording "confidence in the flesh" |

## Tier 3 — needs human decision (S4)

| ID | Record | Issue | Question for the reviewer |
|---|---|---|---|
| PASS2-009 | agape.md | "love your enemy" vs BSB "enemies" (Matt 5:44) | Fix to plural, or drop the BSB label? |
| PASS2-010 | anomia.md | 1 Cor 9:21 quote drops "am" with no ellipsis | Add ellipsis or bracket? |
| PASS2-011 | basileia.md | Col 1:13 quote drops "us" with no ellipsis | Add ellipsis or restore "us"? |
| PASS2-012 | elpis.md | Quote covers Lam 3:21–22 but is cited as 3:21-24 | Narrow citation to 3:21–22 or add ellipsis? |
| PASS2-013 | karpos.md | "sixty-seven" vs pinned count 66 | Author's counting edition/convention? |
| PASS2-014 | apostolos.md | "132 times" ×2 vs pinned count 131 (132 is a common TR-based count) | Keep with a note, or align to the project edition? |
| PASS2-015 | prothesis.md | "over a hundred" vs pinned count 99 for τίθημι | Weaken to "about/nearly a hundred"? |
| PASS2-016 | artos.md | "about ninety" vs pinned count 97 | Re-hedge ("about ninety-five")? |
| PASS2-017 | chara.md | "sixteen times in four short chapters" vs 14 for the two named lemmas (16 only if *synchairō* included) | Say "fourteen," or name the compound? |
| PASS2-018 | eirene.md | Etymology ("bind/join") asserted as fact; standard dictionaries mark it uncertain; meaning claim built on it | Hedge and detach meaning from etymology? |
| PASS2-019 | ethnos.md | Same pattern ("habit/custom" root) | Same question |
| PASS2-020 | proselytos.md | Intro writes *prosēlytos*; rest of file (22×) and metadata write *proselytos* | Normalize which direction? |
| PASS2-021 | pater.md, hyios.md, theos.md | One-off pronunciation-template phrasings vs the 61-article standard | Normalize template? |
| PASS2-022 | mesites.md, bema.md, eulogeo.md | Metadata `pronunciation` fields: "mes-EE-tace" (article: "mes-EE-tays"); "bēma" / "eulogeō" (transliterations, not pronunciation guides) | Correct metadata to BAY-mah / yoo-lo-GEH-oh / mes-EE-tays? |
| PASS2-023 | huiothesia.md | Barr footnote: doubled punctuation "'Daddy,'." + dropped opening quote + journal not italicized | Apply the corrected citation form |

## Reviewed and cleared (no action needed)

- All 30 comparison-commentary records (candidate-01 … candidate-30).
- 228 om-article records with no findings (see COVERAGE.json).
- Verified-clean counts worth noting because they look similar to the flagged ones: mathetes "twenty-eight times in Acts" (exactly 28); soter "six for the Father, four for the Son" in the Pastorals (exact); parousia "about twenty-four" (24) and "four times in Matthew 24" (exact: vv. 3, 27, 37, 39); hypostasis five times (exact, with the article's own verse list); hiereus 31 (exact); proseuchē 36 (exact); eklektos "about twenty-two" (22); amen "about 129" (126 pinned — hedged, within tolerance, **not** flagged); episkopos family "about ten" (5+4+1=10 — **not** flagged); klesis family hedges (148/11/10/114 — **not** flagged).
- Hebrew Bible/LXX frequency claims (shalom "over two hundred," Ezekiel "son of man" ~90×, ʿam in the LXX) — outside pinned sources; sampled values consistent with standard counts; **not** flagged.
