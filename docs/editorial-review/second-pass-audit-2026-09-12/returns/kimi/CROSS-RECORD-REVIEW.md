# Cross-Record Review — Second-Pass Editorial Audit

- **Bound to packet-manifest SHA-256:** `9b0a50e434974078125e877a6e8a703ea73eee643a2270fbc2ad55a0d23261a7`
- This file lists every cross-record cluster that was compared, **including clusters where the comparison produced no finding**.

## Clusters with findings

### C1. Pastoral-Epistles vocabulary counts — authenteo / eusebeia / parousia (+ pinned N1904)
- authenteo.md: "Parathēkē appears three times, eusebeia ten, epiphaneia five" (unscoped).
- eusebeia.md: "The noun *eusebeia* occurs fifteen times in the New Testament. Ten are in these three letters."
- parousia.md: "*Epiphaneia* … Used six times in the New Testament, five of them in the Pastoral Epistles."
- Pinned N1904: NT totals παραθήκη 3 / εὐσέβεια 15 / ἐπιφάνεια 6; Pastoral counts 3 / 10 / 5.
- **Result:** PASS2-003 — authenteo's numbers are the Pastoral counts with the scope dropped; inconsistent with the sibling articles as written.

### C2. didaskalia internal + phrase count — didaskalia.md vs itself (+ pinned N1904)
- Opening (line 29): the phrase *hygiainousa didaskalia* "appears nine times in the Pastoral Epistles."
- Later section: "1 Timothy 1:10 (sound doctrine), 2 Timothy 4:3 (sound teaching), Titus 1:9, 2:1 (sound doctrine)" — four passages.
- Pinned N1904: adjective–noun pairing in exactly those 4 verses; same-verse co-occurrence 5; ὑγιαίνω alone in Pastorals 8.
- **Result:** PASS2-002 (confirmed self-contradiction).

### C3. amen internal quotation consistency
- Earlier: "Isaiah 65:16 speaks twice of 'the God of truth' (BSB)."
- Later: "the Old Testament's 'the faithful God' (Isaiah 65:16, BSB)."
- **Result:** PASS2-005 — the two quotations of the same verse disagree; the second mismatches the BSB text.

### C4. proseuche internal quotation consistency
- Earlier quotations of 1 Tim 2:1: "…thanksgiving be offered for everyone—" (BSB wording).
- Later: intercession "to be made 'all people' (1 Timothy 2:1, BSB)."
- **Result:** PASS2-008.

### C5. proselytos transliteration — article vs packet metadata
- Intro: *prosēlytos*; elsewhere in the same file: *proselytos* (22×); word-metadata.json `translit`: "Proselytos".
- **Result:** PASS2-020.

### C6. Pronunciation template — pater / hyios / theos vs 61-article standard
- Standard sentence in 61 articles: "pronounced in the Erasmian convention as …".
- Variants: pater "academic Erasmian convention"; hyios "Erasmian convention used here"; theos "academic Erasmian convention used here".
- **Result:** PASS2-021.

### C7. Metadata pronunciation fields — mesites / bema / eulogeo vs articles
- mesites: metadata "mes-EE-tace" vs article "mes-EE-tays"; bema: metadata "bēma" vs article "BAY-mah"; eulogeo: metadata "eulogeō" vs article "yoo-lo-GEH-oh". (Field otherwise holds true pronunciation strings, e.g. proselytos "pros-AY-loo-tos".)
- **Result:** PASS2-022.

### C8. Count claims vs pinned N1904 — karpos / apostolos / prothesis / artos / chara
- karpos "sixty-seven" vs 66; apostolos "132" ×2 vs 131; prothesis "over a hundred" vs 99; artos "about ninety" vs 97; chara+chairō "sixteen in Philippians" vs 14 (16 only with συγχαίρω).
- **Result:** PASS2-013, -014, -015, -016, -017.

## Clusters compared — no finding

### C9. Lord's Prayer articles (epiousios / thelema / peirasmos) quoting Matthew 6:9–13 and Luke 11:2–4
All BSB-labeled quotations verified verbatim against the BSB text; the Matthew and Luke forms are correctly distinguished in each article. No finding.

### C10. Philippians 2:5–11 cluster (kenoo / morphe / harpagmos / tapeinoo / kyrios / homologeo)
Six articles quote overlapping runs of the Carmen Christi; all quotations verified verbatim (including "let this mind be in you which was also in Christ Jesus" variants of framing). Cross-article usage of *kenoo*/*harpagmos*/*morphe* is mutually consistent. No finding.

### C11. Philippians 1:1 pair (diakonos / episkopos)
Both quote "…overseers and deacons" verbatim; counts consistent (episkopos family "about ten" = 5+4+1 ✓; diakonos "about thirty" = 30 ✓; presbyteros "about sixty" vs 66 noted as loose but hedged — not flagged). No finding.

### C12. soter / mesites Pastoral pattern
soter.md: "six times for the Father and four for the Son across the three letters" — exact (God: 1 Tim 1:1, 2:3, 4:10, Tit 1:3, 2:10, 3:4; Christ: 2 Tim 1:10, Tit 1:4, 2:13, 3:6). mesites.md's six-occurrence list for μεσίτης (Gal 3:19–20; 1 Tim 2:5; Heb 8:6; 9:15; 12:24) — exact. No finding.

### C13. Last Supper cluster (soma / artos / anamnesis / diatheke)
Institution quotations (Matt 26, Mark 14, Luke 22, 1 Cor 10–11) verified verbatim across the four articles; edition labels consistent; no cross-article contradictions. No finding.

### C14. Sin vocabulary cluster (hamartia / paraptoma / anomia)
Word-family boundaries (hamartia vs paraptōma vs parabasis vs anomia) are drawn consistently; hamartia's anti-archery-etymology argument does not conflict with paraptoma's treatment; opheilēma/paraptōmata in Matthew 6:12–15 handled identically where both articles touch it. (anomia's internal duplication is a separate within-record finding, PASS2-001.) No cross-record finding.

### C15. Comparison-commentary edition identity (30 records × 7 editions)
Every record carries exactly {BSB, BLB, MSB, YLT, N1904, RP2018, TR-BOYD}; the Boyd compilation is consistently "Boyd's Textus Receptus" / "compilation of Robert Adam Boyd (2022)"; the two "Scrivener" mentions are correct historical references to Scrivener's 1881 edition as a source of Boyd's compilation, never as its name; candidate-18's v7 correction (TR-family narrowing, AUDIT-086) is present. No finding.

### C16. Headword identity across corpus (250 articles × word-metadata.json)
greek, translit, slug, gloss, subhead fields: 250/250 consistent. Headword introduction sentence present in all 250 (248 word entries; kaine-ktisis and pistos-ho-logos are phrase entries by design). No finding.

### C17. v7 corrections cross-check (evidence/current-article-release/CORRECTIONS.json)
All five listed corrections are present in the release: AUDIT-062 (hades link now absolute), AUDIT-063 (epiphaneia sentence removed), AUDIT-064 (eusebeia 1 Tim 3:16 wording: *hos* in Nestle 1904 vs *theos* in RP/TR), AUDIT-065 (hyper "the two syllables 'for you'"), AUDIT-086 (candidate-18 sourceObservation TR-family narrowing). No finding.

### C18. Quotation verification corpus-wide
629 BSB-labeled quotation instances across all 250 articles: 468 exact normalized matches, 97 verbatim partial quotations, 2 superset quotations, 12 genuine deviations (PASS2-005 … PASS2-012). Every cited reference resolves to an existing verse. No further findings.
