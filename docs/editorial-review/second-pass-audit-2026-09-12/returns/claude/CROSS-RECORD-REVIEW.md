# Cross-record review

Packet-manifest SHA-256 `9b0a50e434974078125e877a6e8a703ea73eee643a2270fbc2ad55a0d23261a7`.

Method: a working index was built programmatically from all 280 records — italicized lemma + occurrence-count pairs, `/greek/<slug>/` links, confessional citations (body/article/page), Scripture references, edition/publisher characterizations in the comparison notes, and `relatedUnits` — and each cluster below was compared by reading the relevant passages side by side. Clusters with no finding are listed to document that the comparison was made.

## Article clusters

| # | Cluster | Records | What was compared | Conclusion |
|---|---|---|---|---|
| 1 | Priesthood/office vocabulary | hiereus, archiereus, presbyteros, episkopos, diakonos, diakonia, leitourgia, leitourgos | Occurrence counts (archiereus 122; presbyteros ~60/66; diakonos ~30; episkopos+cognates ~10; leitourgia 6/5/3), AC V/VII/XIV/XXVIII usage, "Already cited in the Presbyteros entry" cross-references | Counts consistent; Acts 20:17,28 and Titus 1:5–9 correctly cross-referenced between presbyteros and episkopos. No finding. AC IV/AC XXVIII translation identity → PASS2-052 (filed on ergon) and queue item. |
| 2 | Inheritance | kleronomia, kleronomos, huiothesia | Same OT passages (Psalm 16:5–6; 73:26; Deut 32:9), same 1 Peter 1:3–5 exposition, counts (klēronomia 14, klēronomos 15, klēronomeō 18, klēros 11, synklēronomos 4), Galatians 4:7 linkage | Counts and passage readings consistent. Both files carry fallback seams on 1 Peter 1:4–5 (PASS2-014, PASS2-015). |
| 3 | Hope | elpis, elpizo, hypomone | Psalm 42–43 and Lamentations 3 quotations; *proelpizō* "used once" (both files: Ephesians 1:12); Titus 2:13 | Consistent. Seam in elpis Titus 2:13 apposition (PASS2-024). |
| 4 | Redemption/ransom | agorazo, apolytrosis, lytron, antilytron, eleutheria | 1 Timothy 2:6 (antilytron "once" in three files), Galatians 3:13/4:5, Exodus 13/21, forward references | Consistent; agorazo's "eventual treatment of lytron" is stale (PASS2-055). |
| 5 | Deity words | theos, theotes, hypostasis, monogenes, hyios, anthropos | Colossians 2:9 hapax (theotēs/theiotēs once each) in theos and theotes; AC I/III quotations; FC VIII citations | Colossians 2:9 handling consistent. Only theotes attaches the *genus* labels to FC VIII (PASS2-049); anthropos/hypostasis cite FC VIII without them. Declension statements: anthropos alone mislabels a -ος noun (PASS2-041). |
| 6 | Salvation words | iesous, sozo, soter | *sōtēr* counts (Father 6 / Christ 4 in the Pastorals; 5× in 2 Peter) agree across soter and mesites; Matthew 1:21 gloss | Counts consistent. Shared lexical-method error: sozo "etymological seed" and iesous "family connection" (PASS2-043/044). |
| 7 | Pastorals cluster | eusebeia, epiphaneia, paratheke, authenteo, hygiaino, didaskalia, mythos, pistos-ho-logos, orthotomeo, mesites, soter | Counts scoped to the Pastorals vs the NT (eusebeia 15/10, epiphaneia 6/5, parathēkē 3, mythos 5/4, pistos ho logos 5) | Internally consistent once the Pastoral scope is understood; authenteo states it without scope (PASS2-040). didaskalia's "nine times" does not reconcile with hygiaino's own count (PASS2-037). These 14 files also share the stray YAML comment (PASS2-064). |
| 8 | Church/calling | ekklesia, klesis, kaleō family | Etymological-fallacy treatment of "called-out ones" (both files agree it is a fallacy); counts (ekklēsia ~110 in klesis vs ~114) | Consistent (approximate counts within tolerance). Seams in ekklesia (PASS2-019). |
| 9 | Grace/joy/gift | charis, chara, charisma, charizomai, eucharistia | Counts (chara 59, chairō ~75, charisma 17 with 1 Peter 4:10 exception); AC IV quotation wording | Counts consistent. charis and ergon quote AC IV in different translations (PASS2-052). chara's etymological-connection paragraph is hedged (queue). |
| 10 | Law/sin | nomos, anomia, hamartia, paraptoma, thanatos, eikon | AC II quotations (hamartia, thanatos correct; eikon misattributes original righteousness — PASS2-050); FC V/VI citations; Romans 5:12–21 handling | Consistent apart from eikon. |
| 11 | Election | eklektos, proorizo, prognosis, eudokia, prothesis | FC XI citations (SD XI, Ep XI, "book of life" XI.13); rejection of double predestination stated identically in two places within eklektos | Consistent. Repetition inside eklektos is recapitulation, not contradiction. |
| 12 | Peace/blessing | eirene, eulogeo, hypakoe | Hebrews 12:11 quoted in eirene and karpos (identical BSB text); etymology-as-evidence pattern in eulogeo and hypakoe | Quotations consistent; method findings PASS2-045/046/047. |
| 13 | Firstborn/image | prototokos, eikon, arche | Colossians 1:15 handling; Revelation 3:14 *archē* reading; cross-links prototokos↔arche | Consistent readings; prototokos' Colossians seam (PASS2-001). |
| 14 | Word/Scripture | logos, rhema, graphe, theopneustos, didache | *logos* 330 vs *rhēma*; 2 Timothy 3:16 / 2 Peter 1:21 handled in graphe and theopneustos; "root fallacy" warnings | Consistent; rhema Psalm 33:6 seam (PASS2-004). |
| 15 | Metadata ↔ frontmatter | all 250 vs `word-metadata.json` | greek, translit, gloss, subhead, category, tags, pronunciation | 4 mismatches (PASS2-056…059); 166 metadata records have empty pronunciation (not a finding — field optional). |
| 16 | Transliteration conventions | all 250 | macrons, γγ, υ, υἱ, ρρ | 6 inconsistencies (PASS2-060…063 range); ρρ→rrh consistent. |
| 17 | Confessional citations corpus-wide | 153 citations in 96 files | article numbers vs. content | All article numbers matched the content cited except theotes (labels) and eikon (Ap II vs AC II). No invented citations found. |
| 18 | Historical dates corpus-wide | ~25 dated claims | year vs event | All correct except dikaioo's Apology/Trent sequence (PASS2-048). |

## Comparison-commentary clusters

| # | Cluster | Units | What was compared | Conclusion |
|---|---|---|---|---|
| C1 | "Byzantine + TR vs critical" absences with cross-references | 02, 03, 06, 09, 10, 14, 21 | Which editions print the verse; where BSB/MSB footnote; whether a cross-reference is given ("not at Mark 7:16 … here neither does") | Edition states in prose match `readings` in every unit; unit 21's statement about which units lack cross-references is consistent with 06. No finding. |
| C2 | Mark 9 refrain | 07, 08 | Identical wording claim, reciprocal `relatedUnits`, "no edition prints one without the other" | Reciprocal; consistent. |
| C3 | TR-only readings (Byzantine agrees with critical) | 12, 18, 19, 20, 27 | Edition states; Boyd footnote claims about Stephanus vs Elzevir/Scrivener (12, 04); post-correction wording of 18 (AUDIT-086) | States match `readings` (MSB/RP absent); 18 carries the approved narrowed TR sentence; links 12↔19, 12↔04, 12↔23 reciprocal. No finding. |
| C4 | Bracketed passages | 05, 11, 16, 17 | "A bracket is not a deletion"; markers' meaning "not established"; shorter ending as appended alternative (11) vs M2 guidance | Consistent with `guidance/M2-Source-Decisions.md`; N1904 spans show the markers; 16's focus starts inside v. 3 as stated. No finding. |
| C5 | Numbering/placement | 24, 29, 30, 20 | Relocated doxology (RP/MSB 14:24–26), 2 Cor 13 division, 3 John 14/15, Acts 24:6–8 partial verses; "sixteenth century / 1551" | Placement facts match spans; word-order/Amen differences correctly separated from numbering; 29 and 30 reciprocal. No finding. |
| C6 | Christological readings | 15, 26, 05 | John 1:18 / 1 Tim 3:16 / Mark 1:1; shared AC III + Nicene formula; 26 cross-cites John 1:18 | Consistent and reciprocal (15↔26); book-attributed manuscript accounts carry their disclaimers. No finding. |
| C7 | Book-attributed manuscript accounts | 01, 11, 15, 17, 18, 20, 23, 26, 27, 30 | Presence of the "reported from his book; not independently checked" limit where manuscript detail is given | Present in 11, 17, 26, 27; 01/15/18/20/23/30 cite the book for judgments or history only. Consistent with `EDITORIAL-REVIEW.md` batch permissions. No finding. |
| C8 | Publisher identity | all 30 | "two publishers/both publishers/neither publisher" (02, 03, 21) vs "both Berean editions/footnotes" (05, 06, 09, 10, 12, 14, 15, 22, 26, 29, 30) | Inconsistent characterization → PASS2-066. |
| C9 | Citation integrity | all 30 | every `[S#]`/`[C#]` token resolves to `explanationSources` | All resolve. Eleven units cite only C-sources in prose while listing S1–S7; not a defect. |
| C10 | Publisher-note-only | 13 | `presentation: publisher-note`, two `publisherNotes`, prose | Prose matches the notes verbatim in substance; no comparison card implied. No finding. |

## Reciprocal links

All 11 units with `relatedUnits` are reciprocal (04↔12, 04↔23, 07↔08, 12↔19, 12↔23, 15↔26, 23↔24, 29↔30). All `/greek/` links in the 250 articles resolve; no self-links.
