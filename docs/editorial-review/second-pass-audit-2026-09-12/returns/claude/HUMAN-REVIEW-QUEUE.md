# Human-review queue

Packet-manifest SHA-256 `9b0a50e434974078125e877a6e8a703ea73eee643a2270fbc2ad55a0d23261a7`. Items here are either findings whose resolution needs Larry Herzog Jr.'s judgment or a source I could not consult, or observations that did not meet the finding threshold but should be looked at. Nothing here is asserted as an error.

## A. Findings flagged `requiresHumanReview: true` (50) — what needs deciding

1. **All 25 adaptation-seam findings (PASS2-001…029 range) and the 8 presentation seams.** The proposed corrections restore phrase-level quotations; Larry needs to confirm the exact BSB wording of each phrase and decide whether to (a) hand-fix these, or (b) revisit the `smallest-supported-whole-verse-v1` fallback rule, since 243 fallbacks were applied and only those producing detectable grammatical seams were caught here. A linear read of the 114 *Just Enough Greek*-format articles is recommended before v1.
2. **PASS2-036 artos** — intended count for "this bread" needs the author's decision (four "bread" references in 11:23–28 is the defensible figure).
3. **PASS2-037 didaskalia** — decide whether the hook should count the phrase (4) or the verb (8), and re-label ὑγιαίνω as a verb.
4. **PASS2-038 thanatos** — please confirm from the morphology archive: ἀποθνῄσκω total (I have 111) and whether θνῄσκω has any present-participle occurrence in the NT (I have none).
5. **PASS2-039 chara** — 14 vs 16 depends on including συγχαίρω.
6. **PASS2-040 authenteo** — add "in the Pastoral Epistles" or leave as a study-internal statement.
7. **PASS2-042 theos / PASS2-043 sozo / PASS2-044 iesous / PASS2-045 eulogeo / PASS2-046 hypakoe / PASS2-047 eirene** — lexical-method items; the substance is doctrinally harmless but the formulations state or rely on etymology as evidence. Author's call on how far to soften.
8. **PASS2-048 dikaioo** — replace "Tridentine" with the Roman Confutation (1530) and adjust "four hundred years".
9. **PASS2-049 theotes** — decide whether to keep the three *genus* labels while attributing them to later dogmaticians rather than to FC VIII.
10. **PASS2-050 eikon** — move the original-righteousness description to Apology II.
11. **PASS2-051 pistos-ho-logos** — confirm whether the italic lines are meant as the author's paraphrase; if so label them, if not replace with BSB.
12. **PASS2-052 ergon (AC IV translations)** — pick one edition wording (Kolb–Wengert per your convention) for charis/ergon/dikaioo and decide whether articles should name the edition.
13. **PASS2-066 candidate-02** — decide whether BSB and MSB are to be described as one publisher or two across the 30 notes.

## B. Observations below the finding threshold

- **kaine-ktisis** — a three-sentence paragraph ("God's redemptive work is not limited … The creation that fell with humanity will be redeemed with humanity. The new creation is cosmic …") appears nearly verbatim twice (lines ~15796 and ~25378 by offset). It may be intentional recapitulation; it reads like a copy artifact.
- **hagios** — Romans 1:7 is quoted from "loved by God and called to be saints" (BSB: "To all in Rome who are loved by God…"). Acceptable as a salutation excerpt, but it is another fallback-boundary quotation.
- **lytron** — 1 Timothy 2:6 is quoted in full three times to gloss three different Greek phrases (*antilytron*, *hyper pantōn*, *to martyrion kairois idiois*); accurate but the gloss no longer isolates the phrase.
- **leitourgia** — "literally 'the work of the people'" is the popular liturgical gloss; λειτουργία is better rendered "public service (performed on behalf of the people)". The article hedges with alternatives, so not filed.
- **laos / ethnos** — the Indo-European "root for people" (λαός) and the link of ἔθνος to ἔθος are speculative; both are presented as background only.
- **theotes** — "the divine nature is not 'also outside' the body in the way the Reformed tradition has wanted to say" compresses the *extra Calvinisticum* dispute; Lutheran dogmatics does not deny divine omnipresence, only the inference that the Logos is ever apart from the flesh. The paragraph's slogan framing (*Logos non extra carnem*) is recognizable, so not filed; worth a second look for precision.
- **monogenes** — the two creedal wordings (PASS2-053) suggest one is from a hymnal and one from Kolb–Wengert; name the source if convenient.
- **iesous** — footnote cites Kolb–Wengert pp. 354–355 (SC, Creed II) and 433–440 for the Large Catechism "Second Article"; 433–440 appears to span the second and third articles. Please check against the print edition.
- **episkopos** — AC XXVIII is quoted at length ("the following jurisdiction belongs to the bishops as bishops…") without naming the edition; the wording looks like Kolb–Wengert (Latin). Rights/attribution is the author's call, as the guidance notes that no Kolb–Wengert text is reproduced in the comparison notes; the articles do quote it.
- **eleutheria** — Luther's double thesis is quoted in the LW 31 wording without attribution.
- **hyios / anthropos** — "its feminine form, when needed, can be supplied by *gunē* in compound or contrast" (anthropos) is an odd formulation; ἄνθρωπος is common-gender in usage rather than "supplied" a feminine.
- **candidate-01** — "Anyone who has prayed the Lord's Prayer in a Lutheran service has said these words" is a sweeping but ordinary pastoral statement; not filed.
- **candidate-05** — "Both Berean footnotes … the Editio Critica Maior … have it" is reported as the publishers' claim; I did not verify ECM Mark's text.
- **candidate-25** — "differing among themselves only over the verb's form" (καυθήσωμαι/καυθήσομαι between Nestle, RP and Boyd) rests on C1; I could not confirm Nestle 1904's exact form from the packet extracts.
- **Comparison notes generally** — statements about what BSB/MSB footnotes say (attributions to "BYZ and TR", cross-references) rest on the C-source chapter snapshots not included in the packet (except candidate-13's `publisherNotes`). They read as consistent across units but were not independently verifiable here.
- **Frontmatter dates** — 14 files carry `date: 2026-08-15` and `include_in_rss`; harmless, but they are the same 14 files carrying the stray YAML comment (PASS2-064).

## C. Things I could not check and did not guess

- Exact NT lemma counts for cognates listed in "The Word" sections beyond the ones I know well (e.g., *basileuō*, *basilikos*, *ktisma*, *eucharistia*): they looked correct, but the morphology archive would settle them.
- Whether any *Explorer*-format article contains NET-era wording that is not verbatim NET (only exact-NET text is detectable without the NET).
- Page references in the `[^jeg-…]` footnotes (TDNT volume/pages, publishers, years): plausible on their face; not verified.
