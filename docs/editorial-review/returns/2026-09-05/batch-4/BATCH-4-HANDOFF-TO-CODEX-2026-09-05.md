# Batch 4 handoff to Codex — Ad Fontes NT editorial review

Packet: **AFNT-M3-REVIEW-2026-09-05-v1**
Returned: 2026-09-05
Designated final reviewer: **Larry Herzog Jr.** — all five records below carry his affirmative approval.
Prepared by: Claude (AI drafting assistant), at the reviewer's direction.

## 1. Files returned

| Candidate | Passage | Filename | Revision approved | SHA-256 of returned file |
|---|---|---|---|---|
| candidate-01 | Matthew 6:13 | `candidate-01-RETURNED-2026-09-05.md` | **rev-2** | `b683bbc5de0762b4d31e0adce8f4b87bdb19d7a40ea08bfffed05670d8686995` |
| candidate-05 | Mark 1:1 | `candidate-05-RETURNED-2026-09-05.md` | **rev-2** | `d33441366411f2a62912b5dce9c54d370473af7886f13d4a9eef80b10dc71e0b` |
| candidate-13 | Luke 22:43-44 | `candidate-13-RETURNED-2026-09-05.md` | **rev-2** | `7a7381dd646a2acf3951a757ea62d42d4d511ed5955a9068bf5ab8d886dfb157` |
| candidate-22 | Romans 5:1 | `candidate-22-RETURNED-2026-09-05.md` | **rev-2** | `a21fb5eadca3670e97da60053ef61a11398f570134294b5ec88793fd34ff8077` |
| candidate-25 | 1 Corinthians 13:3 | `candidate-25-RETURNED-2026-09-05.md` | **rev-2** | `32e23ab1888541fcf32491cebd6aae77c6ad5acde9a55d91e61b54da8b848ef1` |

Every file: one decision box ticked (approved); reviewer fields filled; permission granted on the standing terms set at candidate-18; no placeholder tokens; **supplied evidence byte-identical to the original worksheet**; developer reconciliation hash preserved; R0 revision matching the latest change-history row.

Running total across batches 1–4: **twenty-one approved records** — candidates 01, 02, 03, 05, 06, 07, 08, 09, 10, 12, 13, 14, 16, 18, 19, 20, 21, 22, 23, 24, 25.

## 2. Candidate-13 carries a condition of approval, not a suggestion

**Luke 22:43–44 must not be presented as a comparison result.** All seven editions print both verses identically apart from punctuation; the app's comparison shows a reader nothing. The candidate was returned at draft-1 with a verdict of "not a suitable candidate as framed," and the reviewer **reframed rather than rejected** it: the approved note explains why a reader's Bible carries a footnote at a passage where the editions agree.

The integration consequence is a term of the approval. Any affordance implying "here is where these editions differ" must be **suppressed for this candidate**, or the panel's existence will contradict its own first sentence. If that suppression is not implementable, the note should be held rather than shipped.

**Standing pattern:** where the seven displayed editions agree but a publisher flags the passage, the candidate is kept and reframed as a note about the footnote — not rejected, and not presented as a comparison.

## 3. The most consequential display finding so far — candidate-25

At **1 Corinthians 13:3**, BSB and BLB translate the *boast* reading (καυχήσωμαι). **No bundled Greek edition carries it.** All three Greek texts read a form of "be burned" — N1904 καυθήσομαι, RP2018 and TR-BOYD καυθήσωμαι. So inside the Critical/Eclectic group, the Greek on display is not the Greek behind two of the English texts on display.

The source register already warns in general that Nestle 1904 is a documented fallback and is not asserted to be the Greek behind BSB or BLB. This verse is where a user collides with that warning. **Recommendation: disclose it locally**, at verses like this one, rather than relying on a register most readers will never open. The approved note states it as a limit of the comparison rather than a fault in the translations, but the interface should not leave the note to do that work alone.

## 4. Corrections and integration items

- **candidate-05 — N1904 marker inconsistency.** The same angle-marker convention is represented two ways in one release: `MRK.1.1` records the marked phrase as plain `present`, while `JHN.5.4` (candidate-16) records the marked verse as `bracketed`. Represent it consistently, and note that at Mark 1:1 the marker encloses part of a verse.
- **candidate-01 — partial-verse difference.** `MAT.6.13` is `present` in all seven, but the verse ends in two different places. Same shape as `JHN.5.3` and `ACT.24.6`; treat the same way.
- **candidate-01 — MSB models the note-tagging fix.** Three integration items (candidates 10, 14, 19) ask that notes combining a rendering alternative with a textual statement be split or tagged. At Matthew 6:13 **MSB already does this**, carrying `MAT.6.13.note.65` for the rendering and `MAT.6.13.note.66` for the text, where BSB combines both in `MAT.6.note.43`. Build toward MSB's structure; the desired shape exists in the corpus.

## 5. New standing rulings from this batch

1. **Christological variants state the doctrine and cite the Confessions.** Recorded in candidate-05, which cites Augsburg Confession III and the Nicene article on the Son at article level, as summary, with no confessional text reproduced. Two limits travel with it: the doctrine is stated as resting on the whole witness of Scripture rather than on the disputed phrase, so that citing a confession does not imply the doctrine was endangered by the variant. **Governs candidates 15 and 26.**
2. **Pastoral worries are answered from the text first, then one confessional sentence.** Recorded in candidate-22, which answers the "let us have peace" worry from the completed participle and then cites Augsburg Confession IV in a single article-level sentence, in that order.
3. **Where the disputed words are prayed or confessed in worship, the note answers that question directly.** Recorded in candidate-01. The candidate-09 licence to decline a confessional connection applies where the connection is incidental to the reader's question, not where it is the reader's question.
4. **No ceiling on the first-panel view; the passage decides its own length.** B+C in this batch runs 336–447 words against the §3B suggestion of 200–350, because rulings 1–3 and the per-note explanation ruling all add material to the same panel. Candidates 15, 26 and 27 will exceed this. Section D remains available for overflow but is not required to be used.

## 6. Constraints carried forward

Unchanged and still binding: no manuscript claims; the re-approval trigger for substantive historical, textual or manuscript additions; the AI-drafting disclosure requirement; per-candidate scope; publisher statements about unbundled editions attributed and not adopted; and the conventions for citing *Ad Fontes – Volume One* (printed page numbers, chapter body text only, author named in prose, no reproduction of its Scripture quotations, notes self-contained).

Confessional citations are now permitted under rulings 1–3 above, **at article level, as summary, with no confessional text reproduced**. Reproducing text from Kolb–Wengert would require a fresh decision and a rights check.

## 7. Next

Batch 5 as planned: candidates **15** (John 1:18), **26** (1 Timothy 3:16), **28** (Revelation 22:19), **29** (2 Corinthians 13:12–14), **30** (3 John 14–15). Candidates 15 and 26 are both covered by ch. 8 of the reviewer's book and both fall under ruling 1 above. Batch 6 then closes the queue with **04**, **11**, **17** and **27**.
