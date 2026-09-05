# Ad Fontes NT — cross-candidate evidence digest

Packet: **AFNT-M3-REVIEW-2026-09-05-v1**
Prepared: 2026-09-05
Prepared by: Claude (AI drafting assistant), at Larry Herzog Jr.'s direction
Status: **verification working paper. Not a review, not a decision, not an approval for any candidate.**

This covers the R1-layer verification for all 30 candidates in one pass — the part of the assignment that scales. It does not contain public prose, and it approves nothing. Per §8 of the handoff, decisions belong on individual worksheets, one candidate at a time.

## 1. Seven-edition treatment matrix

Derived from the `coverage[]` entries in the bundled chapter snapshots, not from the draft candidate records. All 253 packet files were hash-verified against `packet-manifest.json` before this was built.

| ID | Passage | BSB | BLB | MSB | YLT | N1904 | RP2018 | TR-BOYD |
|---|---|---|---|---|---|---|---|---|
| 01 | Matthew 6:13 | present | present | present | present | present | present | present |
| 02 | Matthew 17:21 | absent | absent | present | present | absent | present | present |
| 03 | Matthew 18:11 | absent | absent | present | present | absent | present | present |
| 04 | Matthew 23:14 | absent | absent | present | present | absent | present | present |
| 05 | Mark 1:1 | present | present | present | present | present | present | present |
| 06 | Mark 7:16 | absent | absent | present | present | absent | present | present |
| 07 | Mark 9:44 | absent | absent | present | present | absent | present | present |
| 08 | Mark 9:46 | absent | absent | present | present | absent | present | present |
| 09 | Mark 11:26 | absent | absent | present | present | absent | present | present |
| 10 | Mark 15:28 | absent | absent | present | present | absent | present | present |
| 11 | Mark 16:9–20 | present | present | present | present | **bracketed** | present | present |
| 12 | Luke 17:36 | absent | absent | **absent** | present | absent | **absent** | present |
| 13 | Luke 22:43–44 | present | present | present | present | present | present | present |
| 14 | Luke 23:17 | absent | absent | present | present | absent | present | present |
| 15 | John 1:18 | present | present | present | present | present | present | present |
| 16 | John 5:3–4 | *split* | *split* | present | present | *split* | present | present |
| 17 | John 7:53–8:11 | present | present | present | present | **bracketed** | present | present |
| 18 | Acts 8:37 | absent | absent | **absent** | present | absent | **absent** | present |
| 19 | Acts 15:34 | absent | absent | **absent** | present | absent | **absent** | present |
| 20 | Acts 24:6–8 | *split* | *split* | *split* | present | *split* | *split* | present |
| 21 | Acts 28:29 | absent | absent | present | present | absent | present | present |
| 22 | Romans 5:1 | present | present | present | present | present | present | present |
| 23 | Romans 16:24 | absent | absent | present | present | absent | present | present |
| 24 | Romans 16:25–27 | present | present | **relocated** | present | present | **relocated** | present |
| 25 | 1 Corinthians 13:3 | present | present | present | present | present | present | present |
| 26 | 1 Timothy 3:16 | present | present | present | present | present | present | present |
| 27 | 1 John 5:7–8 | present | present | present | present | present | present | present |
| 28 | Revelation 22:19 | present | present | present | present | present | present | present |
| 29 | 2 Corinthians 13:12–14 | present | present | present | present | present | present | present |
| 30 | 3 John 14–15 | present | present | present | present | present | present | present |

## 2. Corrections and qualifications found

**A. Two candidate records flatten a mixed range to a single state.** Where a multi-verse range has some verses present and some absent, `draft-candidates.json` records the whole range as `present`. Verse by verse:

- **candidate-16, John 5:3–4.** v. 3 present in all seven. v. 4 absent in BSB and BLB; present in MSB, YLT, RP2018, TR-BOYD; **bracketed** in N1904. The candidate record says `present` for BSB, BLB and (as `bracketed`) N1904. Locators: `evidence/corpus/{bsb,blb}-…/JHN/5.json`, coverage anchor `JHN.5.4`.
- **candidate-20, Acts 24:6–8.** vv. 6 and 8 present in all seven. v. 7 absent in BSB, BLB, MSB, N1904 and RP2018; present only in YLT and TR-BOYD. The candidate record says `present` across the board. Locators: coverage anchor `ACT.24.7` in each release.

Neither is a wording error in the extracts; both are a metadata rollup that would mislead anyone reading the candidate record without opening the chapter snapshot. Both should be corrected before those two worksheets are drafted, since the whole point of each note is *which verse* is at issue.

**B. candidate-17 is not a discrepancy.** John 7:53–8:11 straddles a chapter boundary, and a naive single-chapter check reports a mismatch. Checked verse by verse across both chapters, all twelve verses agree with the candidate record: present in six editions, bracketed throughout in N1904.

**C. Three group-behaviour patterns worth stating once rather than thirty times.**

1. **The Byzantine group does not track the TR group.** In candidates 12, 18 and 19 (Luke 17:36, Acts 8:37, Acts 15:34), MSB and RP2018 side with the critical editions and omit; only YLT and TR-BOYD print. Every worksheet in this queue that assumes "Byzantine = TR" would be wrong. This is the single most common error the notes need to avoid.
2. **In the majority of the omission candidates the split is clean and identical**: BSB / BLB / N1904 omit, MSB / RP2018 / YLT / TR-BOYD print. That holds for candidates 02, 03, 04, 06, 07, 08, 09, 10, 14, 21, 23. Eleven near-identical cases invite eleven near-identical notes; they should be written together so the phrasing is deliberately varied and the reader is not told the same thing eleven times.
3. **BSB and MSB are related Berean editions.** Their notes are frequently word-identical and their English often identical. No note in this queue may present them as two independent witnesses.

**D. Publisher-note counts are indicative only.** I counted notes anchored *within* each candidate range. For omitted-verse candidates the publisher note usually attaches to the **preceding** verse — that is exactly what happens at Acts 8:37, where the note sits at 8:36. So the zeros at candidates 17, 18 and 19 do not mean "no note exists"; they mean "no note anchored inside the range." Each worksheet needs its own note sweep of the neighbouring verses. Do not read the counts as a coverage claim.

**E. TR-internal disagreement exists at four candidates.** Boyd footnotes a reading where his three collated editions (Stephanus 1550, Elzevir 1624, Scrivener 1881) disagree. Within these candidate ranges he footnotes at **04 (Matthew 23:14), 11 (Mark 16:9–20), 12 (Luke 17:36), 24 (Romans 16:25–27), 25 (1 Corinthians 13:3)**. At those candidates the note cannot speak of "the Textus Receptus" as a single text without qualification. At Acts 8:37 he footnotes nothing, which is why that note could speak more simply.

## 3. What the remaining 29 notes will actually require

Acts 8:37 was a favourable case: the public prose could be written without any manuscript claim, because the reader's question ("why does my Bible skip a number?") is answered entirely by observable edition behaviour. Most of this queue is not like that.

**Group 1 — omission candidates with a clean split (02, 03, 04, 06, 07, 08, 09, 10, 14, 21, 23; also 12, 19).** Closest to the Acts 8:37 model. Each still needs its own passage-specific significance paragraph, and 12 and 19 need the Byzantine-does-not-follow-TR point made carefully.

**Group 2 — wording variants, not presence/absence (01, 05, 13, 15, 22, 25, 26, 28, 29, 30).** All seven print something; they differ in what. These cannot be handled by a presence/absence template at all, and several turn on Greek the reader cannot see in English — Romans 5:1 (ἔχομεν / ἔχωμεν, one letter), 1 Corinthians 13:3 (καυχήσωμαι / καυθήσομαι). The §9 checklist item about not using an English difference as proof of a Greek variant bites hardest here.

**Group 3 — the heavy ones (11, 15, 17, 26, 27, 28).** Mark's longer ending, John 1:18, the pericope adulterae, 1 Timothy 3:16, the Comma Johanneum, Revelation 22:19. These are the passages the whole TR-versus-critical-text argument is fought over, and four of them bear directly on Christology or the Trinity. They are also where an Ordinary Means note will be quoted back at its author. Each needs real sourcing, not a template, and 1 Timothy 3:16 and John 1:18 in particular should not be written without a critical apparatus in hand — which this packet does not contain and I did not have for candidate-18.

**Group 4 — structural rather than textual (24).** Romans 16:25–27 is a *relocation* in MSB and RP2018, not an omission. §3A of the handoff specifically asks that placement differences be distinguished from wording differences. This one needs its own treatment.

## 4. Recommended sequence

Batches of about five, grouped so that near-identical cases are drafted together and deliberately varied:

1. **02, 03, 06, 07, 08** — the cleanest omission cases; establishes the Group 1 pattern.
2. **09, 10, 14, 21, 23** — remainder of Group 1.
3. **12, 19, 20, 16, 24** — the ones needing correction or structural care first (see §2A and Group 4).
4. **01, 05, 13, 22, 25** — wording variants.
5. **15, 26, 28, 29, 30** — includes two of the heavy Christological cases.
6. **11, 17, 27** — Mark's ending, the pericope adulterae, the Comma. Slowest; most sourcing.

Corrections at §2A should be applied to `draft-candidates.json` by the developer before batch 3 is drafted.
