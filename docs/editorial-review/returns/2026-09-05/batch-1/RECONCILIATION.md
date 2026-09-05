# Batch 1 reconciliation and local publication

2026-09-05 · AFNT-017/018/021 · Local M3 preview

## Outcome

Six approved notes are locally published: candidate-02 (Matthew 17:21), candidate-03 (Matthew 18:11), candidate-06 (Mark 7:16), candidate-07 (Mark 9:44), candidate-08 (Mark 9:46), and candidate-18 (Acts 8:37, revised). Twenty-four candidates remain drafts. No deployment or general corpus approval is implied.

The original archive is preserved as `../batch-1-original.zip`. `receipt.json` records its hash and the hashes of the eight original Markdown members. All six hashes match the batch handoff. Their supplied evidence sections match the frozen worksheets byte-for-byte; all 253 original packet file hashes still match. The digest is a working paper, not an approval. Review decisions were read from each candidate’s section I, with date-only precision (2026-09-05, Central); no clock times were invented.

The returns’ named revisions govern: 02/03/06 rev-2a, 07/08/18 rev-3. Some R0 participation/date descriptions and change-history ordering still refer to rev-2; this is recorded as stale historical metadata, not silently rewritten. Section I identifies the approved final revision. Final app payload hashes and preserved return identities are in `content/editorial/contributions/`. Earlier candidate-18 contribution, payload and approval remain in history; the newer same-date decision is appended and supersedes it.

## Exact prose handling

- A–C for 02/06/07/08 are incorporated verbatim apart from removing title Markdown delimiters for the title field. Citation descriptions and related-note links supply navigation without rewriting the commentary.
- Candidate-03 incorporates exactly the two factual clarifications approved in the project conversation: “BSB also records the omitted sentence” and “that verse is present in all seven editions compared here.” No other public prose change.
- Candidate-18 adopts rev-3’s new attributed confessional paragraph, retaining the two previously approved factual corrections (“from Philip” and the explicit BSB/MSB publisher-note sentence). The returned rev-3 had reintroduced the superseded wording. Existing user approval was preserved rather than discarded or requested again.
- Larry remains author of record; Ordinary Means is the public byline. Claude drafting history and all review/permission records remain in private contribution documents. Manuscript attestations, optional D material and the working digest are not published as commentary.

## Source checks

All six primary verse treatments and linked publisher notes reconcile with the pinned local chapter JSON. Mark 9:29 exists in all seven; BSB/BLB/N1904 omit “and fasting,” while the other four print it. The first note does not claim to enumerate BLB in that explanatory sentence, but its underlying chapter was checked too.

Luke 19:10 and Mark 4:9/23 are available in the complete local NT even though omitted from the limited review packet. Luke 19:10 is present in all seven and supports the approved narrowed claim. The hearing refrain occurs in Mark 4:9/23; those checks support the existing general statement in candidate-06 without adding unapproved public parallel references.

For Mark 9, verses 43/45/47/48 are present in all seven. MSB/YLT/RP2018/TR-BOYD print both 44 and 46; neither is printed in BSB/BLB/N1904. Within each edition printing all three, the wording of 44/46/48 matches when trailing punctuation is excluded. YLT has a semicolon at 48 and periods at 44/46. No manuscript history is inferred from these comparisons.

The supplied PDF, `Ad Fontes - Volume One.pdf`, is the second edition, September 2026, ISBN 979-8-25-947926-5. Its copyright/front matter and printed pp. 342, 348, 372–374 and 381 were inspected. Rendered-page inspection was necessary: much of chapter 10’s extracted text is corrupted. The relevant printed pages map to PDF pages 356, 362, 386–388 and 395. Candidate-18’s revised C6 accurately represents the author’s argument at printed pp. 342/373; this verifies attribution to his argument, not independent historical or patristic proof. Candidate-07/08’s optional book corroboration matches p. 348 but is not needed for their public evidence. C8’s numbering passage is at p. 381; optional D material is not integrated.

The book stays outside public assets. None of its ESV, NET or NASB95 quotations, manuscript lists, glossary entries or PDF images is reproduced in the app. The book’s broader statements about Byzantine text do not override the exact local MSB/RP coverage at Acts 8:37. No licensed-source permission is inferred from the book’s permissions.

## Working-paper corrections

The mixed-range finding is confirmed. Private draft records 16 and 20 now include per-anchor coverage; affected edition summaries say `mixed`. John 5:4 is absent in BSB/BLB and bracketed in Nestle, while John 5:3 is present. Acts 24:7 is absent in five releases despite verses 6 and 8 being present. No Scripture release or frozen packet was altered. See `mixed-range-supplement.md` and `mixed-range-drafts.json` for the next review batch.

The existing YLT survey correction remains: 29 packet chapter snapshots, 111 segments containing either bracket and 110 with an opening bracket; three cited passage locations span four segments. These internal counts remain uncorrected in the incoming Acts worksheet but do not enter the public note. The digest says “four” Boyd-footnoted candidates but lists five; do not treat that count or its blanket inference from unreported notes as verified manuscript evidence. Lack of a Boyd note establishes no reported difference under his stated method, not exhaustive agreement of all printed details.

## Presentation and verification

Mark 9:44 and 9:46 remain separate approved notes with reciprocal links. The selected note is listed first when a wider selection matches both. Publication rejects a related-note target absent from the approved bundle. The UI uses the established full-navigation path so related links actually change the selected passage and retain the original reading return location.

Browser checks: all five new direct note URLs load; corrected Matthew scope and revised Acts attribution display; citation targets resolve; Mark 9 related links work both ways with keyboard activation and reload. Mobile and desktop layout checks are recorded in PROJECT-STATUS.md. Automated tests cover mixed-range flattening, altered per-anchor coverage, related-note availability, the new Acts revision, and supersession of the earlier approval. Corpus/build results are recorded there after final validation.

Final checks passed: 22 Node test groups, 11 Python tests, typechecking and production build. All six published title/A–C records match the returns plus only the explicit user-approved corrections. The original worksheets’ relative links retain their original context; use the [frozen packet guide](../../../2026-09-05/Ad-Fontes-NT-Reviewer-Handoff.md) to follow original bundled evidence. Later batch suggestions remain recommendations, not approvals; the suggested next set is candidates 09/10/14/21/23.
