# Human-Review Queue — Ad Fontes NT Editorial Audit

**Packet:** `afnt-full-corpus-audit-2026-09-11-v1` · **packetManifestSha256:** `7d54757af5da94553a87c0d546e78b34e54aea0c0f785ff82e4fb77e7fd62c06`
**Audit ID:** `afnt-full-corpus-audit-2026-09-11-kimi-work-01` · **Date:** 2026-09-11

This queue contains questions the supplied packet evidence could not settle. None of these items is asserted as an error. Findings with their own IDs are cross-referenced; unnumbered items are corpus-level questions with no finding attached.

---

## Q1. `mathetes` — mathētēs count in Acts (AUDIT-008, probable-error, S3, medium)

- **Question:** Is "Luke uses *mathētēs* over thirty times in Acts before reaching this verse [Acts 11:26]" correct?
- **Why the packet is insufficient:** the packet contains no Scripture frequency data; the claim cannot be checked against any supplied evidence.
- **What would resolve it:** a concordance count of μαθητής in Acts by pericope (e.g. Strong's 3101 listing or the owner's pinned Nestle 1904 analysis release). External reference data suggests ~11 occurrences before Acts 11:26 and ~28–29 in the whole book, which would make both the "before" figure and the "over thirty" total wrong; the same claim recurs at lines 89 and 151.
- **v1 relevance:** moderate — a concrete factual count in an approved article; recommend confirming before v1 if the correction batch is opened.

## Q2. `prothesis` — 6/6 sense split (AUDIT-009, probable-error, S3, medium)

- **Question:** Are the twelve New Testament occurrences of πρόθεσις really split six showbread / six purpose?
- **Why the packet is insufficient:** no frequency or concordance data is supplied.
- **What would resolve it:** concordance listing (Strong's 4286). External reference data (Bible Hub Englishman's Concordance, accessed 2026-09-11) lists showbread at Matthew 12:4, Mark 2:26, Luke 6:4, Hebrews 9:2 (4) and purpose at Acts 11:23; 27:13; Romans 8:28; 9:11; Ephesians 1:11; 3:11; 2 Timothy 1:9; 3:10 (8).
- **v1 relevance:** moderate — the total (12) is right and only the split is in question.

## Q3. Four quotation fixes verified against external BSB text (AUDIT-003 `zoe`, AUDIT-004 `teleios`, AUDIT-005 `charis`, AUDIT-006 `sozo`; plus AUDIT-007 `iesous`)

- **Question:** Confirm that the identified wordings are the intended BSB text and approve the alignment corrections.
- **Why the packet is insufficient:** each article quotes the verse twice with two wordings (internal conflict is packet-evident), but the packet contains no BSB corpus to identify which wording is BSB.
- **What would resolve it:** the owner's pinned BSB release (`bsb-2026-09-05-m2-v1`). The audit used the publisher-public BSB text at biblehub.com (accessed 2026-09-11): John 10:10, Matthew 5:48, Romans 11:6, and Matthew 1:21 all match the *other* wording in each article. The Matthew 1:21 outlier wording is nearly identical to the NET Bible rendering, consistent with pre-BSB residue.
- **v1 relevance:** high — these are Scripture quotations carrying an incorrect edition label (S2); recommend including in any pre-v1 correction batch, subject to the owner's confirmation against the pinned BSB release rather than the public mirror.

## Q4. Corpus-wide lexical frequency claims (no finding attached)

- **Question:** Are the dozens of "appears N times in the New Testament" claims (e.g. `amen` "about 129", `basileia` "about 162", `ethnos` "162", `laos` "142", `hiereus` "thirty-one", `archiereus` "122") correct?
- **Why the packet is insufficient:** no frequency data is supplied; only internal consistency and obvious outliers could be checked. Spot-checks against standard concordance data found the reviewed claims accurate or acceptably hedged ("about"), but no exhaustive verification was possible.
- **What would resolve it:** a deterministic count against the owner's pinned analysis release, or a qualified lexical reviewer.
- **v1 relevance:** low — claims are individually small and mostly hedged; a systematic one-time verification would retire the whole class.

## Q5. Grammar and morphology statements (no finding attached)

- **Question:** Are statements such as "*Katoikei* — present indicative active" (`theotes`), "third-declension feminine noun" (many articles), and the Romans 9:5 punctuation discussion (`theos`) correct?
- **Why the packet is insufficient:** the packet deliberately omits the full analysis archive; per the audit prompt these were not reconstructed from English or Strong's numbers, and no finding was filed where internal evidence was absent.
- **What would resolve it:** the owner's pinned Nestle 1904 morphology release (`nestle-analysis-1.3-m3-v1`) or a qualified Greek reviewer.
- **v1 relevance:** low — no internally inconsistent morphology claim was found.

## Q6. Cross-reference claims pointing outside the comparison units' spans (no finding attached)

- **Question:** In units 03, 09, 12, and 14 the prose states that the parallel verse (Luke 19:10; Matthew 6:15; Matthew 24:40/Luke 17:35,37; Mark 15:6) "stands in all seven editions." These verses are outside the units' structured `ranges`/`spans`, so the packet cannot confirm them.
- **Why the packet is insufficient:** the units quote spans only for the unit ranges; the parallel verses are not included as readings.
- **What would resolve it:** the owner's published Scripture releases for those four anchors (all four are ordinary, non-variant verses, so the claims are very likely correct, but they are unverified here).
- **v1 relevance:** low — these are conservative, publisher-cross-referenced claims; no contradiction was found.

## Q7. Book-attributed manuscript accounts (no finding attached)

- **Question:** Units 11, 17, 26, and 27 carry manuscript accounts attributed to Larry Herzog Jr.'s *Ad Fontes – Volume One* with explicit verification limits ("manuscript images/apparatus have not been independently checked").
- **Status:** the guidance files record individual approval for exactly these accounts with their stated limits. The audit confirmed the limits are visibly stated in each unit and that no unit exceeds them (e.g. candidate-26's account stays within its candidate-specific permission; D/F remains archival). Nothing further is requested; recorded here so the limits stay visible at v1 review.
- **v1 relevance:** none, provided the attribution and limits remain intact.
