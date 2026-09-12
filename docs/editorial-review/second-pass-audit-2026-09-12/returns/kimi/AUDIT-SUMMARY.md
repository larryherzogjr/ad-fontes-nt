# Ad Fontes NT — Second-Pass Editorial Audit: Summary

- **Packet:** `afnt-second-pass-editorial-audit-2026-09-12-v1` (article release `om-studies-2026-09-11-v7`)
- **Bound to packet-manifest SHA-256:** `9b0a50e434974078125e877a6e8a703ea73eee643a2270fbc2ad55a0d23261a7`
- **Date of audit:** 2026-09-12
- **Mode:** independent second-pass editorial audit, report-only. No supplied file was edited; nothing was approved, published, or corrected in place. Every finding below is pending Larry Herzog Jr.'s review.

## Integrity and coverage

| Check | Result |
|---|---|
| SHA256SUMS verification (`sha256sum -c`) | **298/298 OK** — run at the start of the audit and re-run after the re-extraction at the end of the audit; zero failures both times |
| Input coverage counts | **250 om-article + 30 comparison-commentary** records, confirmed against INPUT-COVERAGE.json |
| Per-record SHA-256 re-verification against INPUT-COVERAGE.json | 280/280 match the bytes on disk |
| Records reviewed | **280/280** (see COVERAGE.json; every record has `reviewed: true`) |
| Output binding | All seven report files carry the packet-manifest SHA-256 above |

## Headline results

- **23 findings** across **22 of 250 articles**; **0 findings in any of the 30 comparison-commentary records.**
- By classification: 3 confirmed-error, 4 probable-error, 12 needs-human-review, 3 editorial-consistency, 1 presentation-defect.
- By severity: **S1: none. S2: 2. S3: 8. S4: 13.**
- The two S2 findings and the stronger S3 findings are the only plausible pre-v1 correction candidates; all require human review before any change.

## The most consequential findings

1. **PASS2-002 (S2, confirmed-error) — didaskalia.md.** The opening hook claims the phrase *hygiainousa didaskalia* "appears nine times in the Pastoral Epistles." The article's own later list names **four** passages (1 Tim 1:10; 2 Tim 4:3; Titus 1:9; 2:1), and the pinned Nestle 1904 morphology confirms the pairing occurs in exactly those four verses (the adjective alone, in any Pastoral collocation, occurs 8 times — never 9). The article contradicts itself, and the number is the article's opening argument.
2. **PASS2-005 (S2, probable-error) — amen.md.** Isaiah 65:16 is quoted as "the faithful God" with a BSB attribution, while the same article two paragraphs earlier quotes the same verse correctly as "the God of truth" (the BSB wording). The later instance is both a misquotation of the named edition and an internal contradiction.
3. **PASS2-001 (S3, confirmed-error) — anomia.md.** Verbatim duplicated phrase: `the "the man of lawlessness" the "the man of lawlessness" already at work`. The duplication also garbles the sense: in 2 Thessalonians 2 it is the *mystery* of lawlessness (v. 7) that is "already at work," not the man of lawlessness (v. 3) — the second duplicated phrase was very likely "the 'mystery of lawlessness.'"
4. **PASS2-004 (S3, confirmed-error) — prototokos.md.** Quotation-boundary cluster at Colossians 1:15–17: a quotation labeled "(v. 15)" runs through v. 16's text; the next sentence's "verse 16" quotation repeats the same BSB wording verbatim and continues into v. 17; both quotations begin mid-sentence inside broken sentence frames ("treating Christ as 'is the image…'").
5. **PASS2-003 (S3, probable-error) — authenteo.md.** "Parathēkē appears three times, eusebeia ten, epiphaneia five" states the **Pastoral** counts without a scope qualifier; the NT totals are 3/15/6, and eusebeia.md ("fifteen times in the New Testament") and parousia.md ("six times in the New Testament") say so explicitly.

## Everything else

- **Quotation accuracy (BSB-labeled):** 629 quotation instances were extracted from all 250 articles and verified against the BSB text (BSB-publishing/bsb2usfm v5.9 USJ). 468 match exactly after normalization and 97 are verbatim partial quotations; the genuine deviations are reported as PASS2-005 through PASS2-012 (misquoted phrases, an ungrammatical quotation frame, a singular-for-plural word, two unmarked one-word elisions, one citation-range/quote-extent mismatch). All carry the caveat that verification ran against BSB v5.9 rather than the packet's pinned `bsb-2026-09-05-m2-v1` snapshot.
- **Count/frequency claims:** all exact and hedged lemma-count claims were checked against the pinned Nestle 1904 morphology (biblicalhumanities/Nestle1904 @713f28a3; 5,401 lemmas / 137,779 tokens — matching the packet's documented index). Dozens verify exactly (e.g., mathetes 28× in Acts, soter 6× Father / 4× Son in the Pastorals, hypostasis 5×, eklektos ~22×, proseuchē 36×, hiereus 31×). Six disagree or sit at a hedge boundary: PASS2-013 (karpos 67 vs 66), PASS2-014 (apostellō 132 ×2 vs 131), PASS2-015 (tithēmi "over a hundred" vs 99), PASS2-016 (artos "about ninety" vs 97), PASS2-017 (chara+chairō "sixteen" in Philippians vs 14; 16 only if the compound *synchairō* is silently included), plus PASS2-002/-003 above.
- **Lexical method:** the corpus's etymology treatments are generally careful and often explicitly anti-root-fallacy (e.g., hamartia debunks the archery etymology; diakonos flags the "through the dust" folk etymology as unreliable). Two entries assert disputed etymologies as fact and build a meaning claim on them: PASS2-018 (eirene from "bind/join") and PASS2-019 (ethnos from "habit/custom").
- **Editorial consistency:** PASS2-020 (proselytos intro writes *prosēlytos* against the packet's own "proselytos"), PASS2-021 (three one-off pronunciation-template variants), PASS2-022 (three metadata pronunciation fields mis-set), PASS2-023 (doubled punctuation in the Barr footnote).
- **Comparison-commentary corpus:** all 30 records passed every structural and content check — seven edition identities intact (BSB, BLB, MSB, YLT, Nestle 1904, Robinson–Pierpont 2018, Boyd compilation 2022), reading/focus states coherent, focus spans nested in main spans, all `[Sn]`/`[Cn]` source references resolvable, Boyd never conflated with Scrivener, the v7 correction to candidate-18's TR-family narrowing present and correct.

## What is clean (spotlight)

All headwords, transliterations, and identity fields match `corpora/word-metadata.json` exactly (250/250). No leftover TODO/FIXME markers, no template variables, no AI-voice residue, no lorem ipsum anywhere in the corpus. Internal `/greek/<slug>/` links resolve. The five v7 corrections listed in `evidence/current-article-release/CORRECTIONS.json` (AUDIT-062/063/064/065/086) are all present and correctly applied. Historical and confessional claims are well-footnoted and the sampled ones (Trent sessions and dates, Marburg 1529, Kaiserswerth 1836, Colwell 1933, Dodd 1935/1936, Aulén 1931, Barr 1988) check out.

## Limitations (full statement in METHODOLOGY.md)

- BSB quotations were verified against the public BSB v5.9 USJ release, not the packet's pinned snapshot; all BSB-quotation findings are therefore marked needs-human-review or probable-error with an explicit re-check instruction.
- Quotations labeled with translations other than BSB (e.g., KJV/YLT echoes in running prose) were not mechanically verified against pinned texts.
- Hebrew Bible / Septuagint frequency claims (e.g., *shalom* "over two hundred times") are outside the pinned verification sources and were not mechanically verified; the sampled ones are consistent with standard counts.
