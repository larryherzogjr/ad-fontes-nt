# Batch 5 handoff to Codex — Ad Fontes NT editorial review

Packet: **AFNT-M3-REVIEW-2026-09-05-v1**
Returned: 2026-09-05
Designated final reviewer: **Larry Herzog Jr.** — all five records below carry his affirmative approval.
Prepared by: Claude (AI drafting assistant), at the reviewer's direction.

## 1. Files returned

| Candidate | Passage | Filename | Revision approved | SHA-256 of returned file |
|---|---|---|---|---|
| candidate-15 | John 1:18 | `candidate-15-RETURNED-2026-09-05.md` | **rev-2** | `18254655f46862a6ba8afca57a8c4f306a42b03dbdf591654039efe923a7dbd7` |
| candidate-26 | 1 Timothy 3:16 | `candidate-26-RETURNED-2026-09-05.md` | **rev-2** | `d7ada2695ecd26ed11d83dde7907e90bc7ca8aef63f597268dcc480af1c25d69` |
| candidate-28 | Revelation 22:19 | `candidate-28-RETURNED-2026-09-05.md` | **rev-2** | `dbde257a202bc5e4bd20003772866b1a41116e50063854645163281e6d6852f0` |
| candidate-29 | 2 Corinthians 13:12-14 | `candidate-29-RETURNED-2026-09-05.md` | **rev-2** | `88660b35cd5d1ec1701afb7630ad35b610a547cf92525db77ad39d4105b89824` |
| candidate-30 | 3 John 14-15 | `candidate-30-RETURNED-2026-09-05.md` | **rev-2** | `902a2484c0074ff92d8f8b458b9c795d1e43fc255950316da70ca077b9f79957` |

Every file: one decision box ticked (approved); reviewer fields filled; permission granted on the standing terms set at candidate-18; no placeholder tokens; **supplied evidence byte-identical to the original worksheet**; developer reconciliation hash preserved; R0 revision matching the latest change-history row.

Running total across batches 1–5: **twenty-six approved records**. Four candidates remain undrafted: 04, 11, 17, 27.

## 2. Candidate-26 is the queue's only exception, and its approval reads differently

**1 Timothy 3:16 carries named manuscript witnesses.** Every other approved note in the queue — all twenty-five — is written under a standing exclusion barring named witnesses, dated readings and claims about direction of change. **That exclusion is lifted for candidate-26 alone**, by the reviewer's express decision, and its section I records a different set of exclusions accordingly. Do not read across from it.

Three limits are conditions of that approval and must survive integration:

1. The evidence is cited to *Ad Fontes – Volume One*, pp. 254–55, with **the author named in the prose** — never presented as neutral scholarship.
2. It was **not independently verified**. No manuscript was examined, no apparatus consulted, and neither Dirk Jongkind's *Scribal Habits of Codex Sinaiticus* (Gorgias, 2007) nor codexsinaiticus.org — both cited in the book's own footnote — was checked in preparing the worksheet.
3. The book's imprecisions are **preserved rather than sharpened**: "the Old Latin tradition broadly," "some Coptic witnesses" stand as the book has them.

A fourth condition attaches: the witness material may not be extended, updated or supplemented from any other source without a fresh decision.

**This does not travel.** Candidates 11, 17 and 27 will raise the same question far more strongly. Each requires its own decision.

## 3. Approved cross-links — now five pairs

| Pair | Why |
|---|---|
| 07 ↔ 08 (Mark 9:44 / 9:46) | One phenomenon two verses apart. |
| 12 ↔ 23 (Luke 17:36 / Romans 16:24) | The TR disagreeing with itself; the critical editions disagreeing with each other. |
| 23 ↔ 24 (Romans 16:24 / 16:25–27) | Adjacent verses, different kinds of difference. |
| **15 ↔ 26** (John 1:18 / 1 Timothy 3:16) | **The load-bearing pair.** At John 1:18 the critical edition reads *God* where the traditional text reads *Son*; at 1 Timothy 3:16 it reverses. A reader meeting either alone will draw a conclusion the other contradicts. |
| **29 ↔ 30** (2 Corinthians 13 / 3 John) | The queue's two verse-numbering cases. |

Note an asymmetry in the 15/26 pair: candidate-26 carries witnesses and candidate-15 does not, so the two panels will differ visibly in depth. This is deliberate and recorded in candidate-15's D.

## 4. A recommendation the developer should act on

**The mechanism for partial-verse differences already exists in this corpus.** Candidates 29 and 30 are verse-numbering cases, and their coverage models them correctly using `mappingType: "join"` and `mappingType: "renumbered"` — nothing lost, nothing misdescribed.

Three approved candidates needed exactly that mechanism and did not have it, requiring corrections in R1 instead: **candidate-01** (`MAT.6.13`, the verse ends in two different places), **candidate-16** (`JHN.5.3`, the difference begins mid-verse) and **candidate-20** (`ACT.24.6`/`ACT.24.8`, a block beginning inside one verse and ending inside another). Extend `join`/`renumbered` to cover them.

## 5. Display item — candidate-28

**Revelation 22:19 carries two independent differences at one anchor:** a noun (*tree* against *book* of life, where TR-BOYD stands alone among the seven) and a verb mood (RP2018's optative *may God take away* against the future indicative in N1904 and TR-BOYD). The note keeps them separate; the interface may not be able to. Decide whether two differences can be surfaced at a single anchor, or whether the note alone must carry the distinction.

## 6. Constraints carried forward

Unchanged and binding for every candidate **except 26 as scoped in §2**: no manuscript claims; the re-approval trigger; the AI-drafting disclosure; per-candidate scope; publisher statements about unbundled editions attributed and not adopted; confessional citations at article level as summary with no text reproduced; and the conventions for citing *Ad Fontes – Volume One* (printed page numbers, chapter body text only, author named in prose, no reproduction of its Scripture quotations, notes self-contained with no cross-promotion).

## 7. Next

Batch 6 closes the queue: **04** (Matthew 23:14), **11** (Mark 16:9–20), **17** (John 7:53–8:11), **27** (1 John 5:7–8). Three of the four are the largest passages in the New Testament textual conversation and each has a full chapter in the reviewer's book — chapters 5, 6 and 7 respectively. The reviewer has ruled that notes stay **self-contained** with no cross-promotion, and that recurring explanations are written afresh in each note rather than centralised, so each will carry its own bracketing explanation.
