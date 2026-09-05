# Batch 3 handoff to Codex — Ad Fontes NT editorial review

Packet: **AFNT-M3-REVIEW-2026-09-05-v1**
Returned: 2026-09-05
Designated final reviewer: **Larry Herzog Jr.** — all five records below carry his affirmative approval.
Prepared by: Claude (AI drafting assistant), at the reviewer's direction.

## 1. Files returned

| Candidate | Passage | Filename | Revision approved | SHA-256 of returned file |
|---|---|---|---|---|
| candidate-12 | Luke 17:36 | `candidate-12-RETURNED-2026-09-05.md` | **rev-2** | `75d8ea2e7a6b29ba233926b247d9c1acc23ffa2a9fd337934661d0fae47cf145` |
| candidate-16 | John 5:3-4 | `candidate-16-RETURNED-2026-09-05.md` | **rev-2** | `a3d1c3c4cc1828b07f969b171652952905432b59353f52feefa17d927af2c265` |
| candidate-19 | Acts 15:34 | `candidate-19-RETURNED-2026-09-05.md` | **rev-2** | `3c3170136f3dd48e51059950aaa28e334660872c2a3c3b346c2f8fed750537a2` |
| candidate-20 | Acts 24:6-8 | `candidate-20-RETURNED-2026-09-05.md` | **rev-2** | `c3f745bfebf714b8e88a001ea63f53e69334aae9883012e7edd5fc76e5347b8f` |
| candidate-24 | Romans 16:25-27 | `candidate-24-RETURNED-2026-09-05.md` | **rev-2** | `b94e9fb5fff2fc09e5d82407e97e5fd2eafaac71dceaa4d445a88e25a423d8ab` |

Every file: one decision box ticked (approved); reviewer fields filled; permission granted on the standing terms set at candidate-18; no placeholder tokens; **supplied evidence byte-identical to the original worksheet**; developer reconciliation hash preserved; R0 revision matching the latest change-history row.

Running total across batches 1–3: **sixteen approved records** — candidates 02, 03, 06, 07, 08, 09, 10, 12, 14, 16, 18, 19, 20, 21, 23, 24.

## 2. Two records carry a source verdict of "corrections needed"

Candidates **16** and **20** are approved *with* corrections standing. In both, the defect is in how the range is represented, not in the extracts, and the public prose is written to the corrected picture. Do not import their coverage shape as-is.

- **candidate-20, Acts 24:6–8 — the correction is load-bearing.** Coverage marks 24:6 and 24:8 `present` and 24:7 `absent`, which describes a missing verse. The Greek shows one continuous block: TR-BOYD's 24:6 ends with καὶ κατὰ τὸν ἡμέτερον νόμον ἠθελήσαμεν κρίνειν and its 24:8 opens with κελεύσας τοὺς κατηγόρους αὐτοῦ ἔρχεσθαι ἐπὶ σέ, neither carried by the other five. BSB's own note states the block in that shape. Represent it as a single span with partial-verse boundaries.
- **candidate-16, John 5:3–4 — two corrections.** (a) The disputed material begins *inside* verse 3, with the clause about waiting for the water; `present` at that anchor is true but incomplete. (b) N1904 carries one matched angle marker opening at `ξηρῶν<` in verse 3 and closing at `νοσήματι>` at the end of verse 4; coverage splits that single span into `present` + `bracketed`. All `<` and `>` in the chapter snapshot were accounted for by this pair — nothing is unpaired.

## 3. Approved cross-links — three pairs

Approved by the reviewer as integration requests. Each pair must be reachable from the other; the notes are written assuming it.

| Pair | Why |
|---|---|
| **07 ↔ 08** (Mark 9:44 / 9:46) | One phenomenon two verses apart. Candidate-08's counting caution reads as unmotivated without 07. *These two files are already approved at rev-3 and record this as an open integration item; it is now approved, recorded here rather than by reopening them.* |
| **12 ↔ 23** (Luke 17:36 / Romans 16:24) | Between them they carry the queue's clearest evidence that the two-camps picture fails: the Textus Receptus disagreeing with itself, and the modern critical editions disagreeing with each other. |
| **23 ↔ 24** (Romans 16:24 / 16:25–27) | Adjacent verses, encountered together, but different kinds of difference — a doubled sentence and a moved paragraph. Kept separate per §3A. |

## 4. New standing rulings from this batch

1. **Recurring explanations live in each note that needs them**, not in central material the notes point to. Editorial bracketing, the group labels and the verse-numbering history are therefore written afresh wherever they arise. Recorded in candidate-16's G. Consequence: the bracketing explanation will appear again, differently, at candidates 11 and 17, and note lengths will run longer than the §3B suggestion where background is needed.
2. **The Western text of Acts may be named**, sourced to *Ad Fontes – Volume One* ch. 11, p. 398, which supplies the category and sources its ten-percent figure to Metzger and Ehrman (4th ed., pp. 276–77) and to A. C. Clark (1933). Recorded in candidate-20. **This does not license further textual-family classifications elsewhere** without a fresh decision.

## 5. Integration items

Three publisher notes combine differences of different kinds under one anchor. If rendered undifferentiated, a reader will conclude the editions disagree about English wording — the error §9's first checklist item exists to prevent. Tag note kinds distinctly.

- **candidate-10** — BSB `MRK.15.note.117` (rendering alternative) and `MRK.15.note.118` (textual) share anchor `MRK.15.27`.
- **candidate-14** — MSB `LUK.23.17.note.373` combines a literal-rendering alternative with a textual statement.
- **candidate-19** — MSB `ACT.15.33.note.227` combines a wording variant at 15:33 with the presence of verse 34.

## 6. Corrections to packet data — reminder

Still outstanding from the batch 1 handoff, and now confirmed from the other direction: `evidence/draft-candidates.json` flattens mixed ranges to a single `present` at **candidate-16** (only John 5:4 is disputed, and partially 5:3) and **candidate-20** (only Acts 24:7, and partially 24:6 and 24:8). The worksheets are correct; the candidate records are not.

## 7. A pattern worth surfacing in app-level material

**MSB and RP2018 omit alongside the critical editions at four approved candidates** — Luke 17:36, Acts 8:37, Acts 15:34 and Acts 24:6–8. Any interface copy describing the three groups as "critical versus traditional" is contradicted by four approved notes, and by candidate-23, where modern critical editions disagree among themselves. Worth settling the group labels before they ship.

## 8. Constraints carried forward

Unchanged and still binding: no manuscript claims; the re-approval trigger for substantive historical, textual or manuscript additions; the AI-drafting disclosure requirement; per-candidate scope; and the conventions for citing *Ad Fontes – Volume One* (printed page numbers, chapter body text only, author named in prose, no reproduction of its Scripture quotations, notes self-contained).
