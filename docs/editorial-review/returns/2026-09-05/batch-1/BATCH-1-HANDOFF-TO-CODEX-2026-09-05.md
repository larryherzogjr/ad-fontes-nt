# Batch 1 handoff to Codex — Ad Fontes NT editorial review

Packet: **AFNT-M3-REVIEW-2026-09-05-v1**
Returned: 2026-09-05
Designated final reviewer: **Larry Herzog Jr.** — all six records below carry his affirmative approval.
Prepared by: Claude (AI drafting assistant), at the reviewer's direction.

## 1. Files returned

| Candidate | Passage | Filename | Revision approved | SHA-256 of returned file |
|---|---|---|---|---|
| candidate-02 | Matthew 17:21 | `candidate-02-RETURNED-2026-09-05.md` | **rev-2a** | `52257a3d2b951ce2b8d1394a5e05893436735de9c8fe55b250c60dfe854520c9` |
| candidate-03 | Matthew 18:11 | `candidate-03-RETURNED-2026-09-05.md` | **rev-2a** | `bfce9426e95aebf2149063e23926f8445eb14f8e2139936f376e343d9fcc9fa6` |
| candidate-06 | Mark 7:16 | `candidate-06-RETURNED-2026-09-05.md` | **rev-2a** | `859109db7bdd311f298f9e6b6c8add5e9ec9ab16ce9dff9afd7a073b930de76c` |
| candidate-07 | Mark 9:44 | `candidate-07-RETURNED-2026-09-05.md` | **rev-3** | `6cf1d07419afc4b56c013b9a2b84084a0b45e40e9c172dcc371c37721b7f6290` |
| candidate-08 | Mark 9:46 | `candidate-08-RETURNED-2026-09-05.md` | **rev-3** | `ba4a2d692b353eb5f2903a0ed9c7b2f58c816ea565702c7ff32080de5bbee35a` |
| candidate-18 | Acts 8:37 | `candidate-18-RETURNED-2026-09-05.md` | **rev-3** | `b3764f8d5fe7a6ae57e22b77bae946b00f52e13ab931dbf4a02f1cef359ec71a` |

Every file: exactly one decision box ticked (approved); reviewer name, role, date and timezone filled; permission granted; no placeholder tokens; **supplied evidence section byte-identical to the original worksheet**; developer reconciliation hash preserved unchanged.

The R0 revision field matches the latest change-history row in every file. Map each approval to the revision named in section I, not to the filename.

## 2. Candidate-18 supersedes an earlier return

Codex may already hold `candidate-18-RETURNED-2026-09-05.md` at **rev-2**. The file in this handoff is **rev-3** and replaces it. What changed:

- Section **C** — the confessional paragraph was replaced with the reviewer's own published argument (*Ad Fontes – Volume One*, p. 373). The author is named in the prose.
- **C6** rewritten to cite that book; **C8** re-cited to the same book at p. 381, replacing a Trinitarian Bible Society web article. No web citation now remains in the note.
- Section **G** gained the §4 style-authority record (see §4 below).
- Exclusions in **I** now record that available witness evidence was considered and declined, rather than merely absent.

The rev-2 content hash should not be carried forward. Recompute against the rev-3 file above.

## 3. Corrections to packet data — not to any worksheet

These are defects in `evidence/draft-candidates.json` found during verification. They affect candidates **not** in this batch and live in no approved file, so they are handed over separately. Both should be fixed before those candidates are drafted, because in each case the whole point of the note is *which verse* is at issue.

- **candidate-16, John 5:3–4** — recorded as `present` across the board. Verse 3 is present in all seven releases; **verse 4** is the disputed one: absent in BSB and BLB, bracketed in N1904, present in MSB, YLT, RP2018 and TR-BOYD. Locator: coverage anchor `JHN.5.4` in each release.
- **candidate-20, Acts 24:6–8** — recorded as `present` across the board. Verses 6 and 8 are present in all seven; **verse 7** is the disputed one, present only in YLT and TR-BOYD. Locator: coverage anchor `ACT.24.7` in each release.

A third apparent mismatch, **candidate-17 (John 7:53–8:11)**, is *not* a defect — it straddles a chapter boundary and only appears wrong to a single-chapter check. Verified verse by verse across both chapters: present in six editions, bracketed throughout in N1904. No action.

## 4. Standing conventions recorded in all six files

§4 of the handoff recorded that no Ordinary Means writing sample or doctrinal style guide was supplied. That gap is now closed by **Larry Herzog Jr., *Ad Fontes – Volume One: New Testament Textual Criticism for the Laity*, 2nd ed. (September 2026), ISBN 979-8-25-947926-5**, identified in section G of every file as the style and theological authority. The reviewer's standing conventions for its use, which apply to the rest of the queue:

1. Cite **printed book page numbers**, not PDF pagination (the PDF runs about fourteen ahead).
2. Cite **chapter body text only, never the glossary** — the glossary carries known errata.
3. **Name the author in the prose** wherever a note leans on the book; it is not to appear as neutral third-party support.
4. **Do not reproduce the book's Scripture quotations.** Its ESV, NASB95 and NET permissions were granted to that work and do not extend to Ad Fontes NT. Notes quote only the seven public-domain packet editions.
5. App notes stay **self-contained**, taking a different entry point where the book covers the same passage, with no cross-promotion in either direction.

## 5. Constraints that ride with these approvals

- **No manuscript claims.** None of the six notes names a witness, dates a reading, or asserts a direction of change. Witness evidence available in the book was considered and deliberately declined. Nothing published under these approvals may add it.
- **Re-approval trigger.** Any change adding a substantive historical, textual or manuscript claim, or altering the confessional statement in candidate-18's section C, requires a fresh review decision. Copy-editing, house-style changes, retitling and length trims do not.
- **AI-drafting disclosure** must remain in each contribution record. Human review does not erase drafting history (§4).
- **Scope.** Each decision approves its own candidate at its own revision. None approves public deployment, the remaining candidates, or the wider corpus.
- **Open integration item:** candidates 07 and 08 cover one phenomenon two verses apart and are approved as **separate** notes. A reader landing on 9:46 must be able to reach the 9:44 note, or the counting caution in 9:46's section C reads as unmotivated.
- **Unresolved and excluded:** the Erasmus marginal-note account for Acts 8:37 stays out. Sources disagree on whether the manuscript is GA 2816 or 2818, and the book's text layer was too corrupted to search reliably. No siglum is to be published.

## 6. Length note

Candidate-18's B+C runs 406 words against the §3B suggestion of 200–350, because its confessional paragraph carries five scriptural supports and a patristic one. The reviewer is aware; the overrun is deliberate and the note is approved as it stands. The other five sit between 330 and 364.
