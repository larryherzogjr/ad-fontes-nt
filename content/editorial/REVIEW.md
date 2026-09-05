# Textual review queue

**Reviewer: Larry Herzog Jr.** Assignment was supplied by the user. It is not approval of any explanation. Current queue: **0 draft candidates, 0 in review, 30 approved, 0 rejected, 30 locally published**.

`variants.json` contains exact quotations and source references from the seven local editions. Candidates include omissions, brackets, longer units, placement and numbering examples. Their spans may be narrowed during review. All 30 initial candidates are approved and locally published. The six batch-1 notes contain Larry’s adopted explanations, with explicitly approved factual clarifications for candidates 03 and 18. Candidate-18 now uses rev-3; its previous payload and approval remain in history. Its full return and AI drafting history are retained in `contributions/candidate-18.json` and the linked archival documents. No manuscript attestations were added.

## Work on one candidate

1. Inspect a candidate with `node scripts/review_candidate.ts candidate-01`. It prints the complete record and content hash without changing review state.
2. Check its exact source readings, canonical anchors, cited evidence and any witness claims. Reject an unsuitable candidate or refine its boundaries. Record a real author and provenance; clear rights for any contributed or quoted explanation.
3. Supply `significance.sourceObservation` and `significance.interpretation` separately. The former describes the source evidence; the latter is attributed editorial judgment. Do not turn a source gloss into an endorsed theological explanation. Add cited witness attestations only when verified.
4. Set `status` to `in-review` and obtain Larry’s explicit decision on the complete record. Generate its final hash again after all edits. Changing content, attribution, rights, citation or reviewer changes the hash; status changes alone do not.
5. Only after actual approval, append a record to `reviews.json` with `unitId`, `reviewerId: larry-herzog-jr`, the exact `contentHash`, actual ISO `reviewedAt` date (or date/time when supplied; never invent clock precision), and `decision: approved`. Then set the candidate status to `approved`. For a rejection, record `decision: rejected` and candidate status `rejected`. Later decisions supersede earlier ones. Do not backdate or manufacture review events.
6. Run `npm run publish:variants`, then the required tests/typecheck/build. Publication validates source spans, release identity, citations, rights and approval. Drafts remain outside `app/public/editorial/variants.json`. Confirm the first approved explanation, direct unit link, markers and keyboard behavior before calling AFNT-018 or M3 complete.

The publisher only writes a local application bundle; it does not deploy. A preview link for a reviewed unit is `/read/<BOOK>/<CHAPTER>?translation=BSB&passage=<CANONICAL-RANGE>&panel=compare&unit=<ID>`. The complete unit range should be used. For passages without an approved unit, the panel explicitly says that no reviewed note is available; it does not imply that the passage has no variants.

The original candidate generator refuses to overwrite an existing queue. Edit records deliberately, preserving rejected and pending history. Reviewer files are local records, not an authentication or signature service; source-control and human review remain operational responsibilities.

## Supplied editorial reference

Batch-1 returns identify Larry Herzog Jr.’s *Ad Fontes – Volume One*, second edition (September 2026), ISBN 979-8-25-947926-5, as the author’s style/theological reference. The user supplied the matching PDF locally. Use printed chapter-body page numbers, not PDF indices; avoid the glossary (reported errata). Attribute self-citation explicitly, keep notes self-contained, and do not transfer the book’s Scripture-quotation permissions to this app. Named editions and local source evidence remain authoritative for corpus claims. These conventions do not approve other candidates. See the batch reconciliation for verification limits.

Units 16/20 contain `mixed` range summaries and exact per-anchor coverage. Publication validation rejects flattening a mixed range into a single text state. The frozen original packet is accompanied by a separate mixed-range supplement.

## Batch 2 and further review

Five more returned rev-2 notes (09/10/14/21/23) carry Larry’s approval. The user explicitly approved the exact factual corrections recorded in the [batch-2 reconciliation](../../docs/editorial-review/returns/2026-09-05/batch-2/RECONCILIATION.md). Preserve returned originals and final approval hashes. Candidate 24 was subsequently approved in batch 3; its reciprocal links are now emitted.

The returns record three editorial rulings: permit an honestly unresolved question; do not force a nearby catechetical connection when the textual difference does not bear on it; permit reviewed general transcriptional discussion, while specific added/dropped or direction-of-change claims require identified evidence and a new approval. Optional D material is still archival only in this implementation. These rulings do not establish any historical claim or approve other prose.

## Batch 3

Five rev-2 returns (12/16/19/20/24), with explicitly approved factual corrections, are integrated. [Reconciliation](../../docs/editorial-review/returns/2026-09-05/batch-3/RECONCILIATION.md) records exact source boundaries, book verification limits, approvals and tests. Candidate 23’s existing prose is unchanged; its approved links to 12/24 have a new payload hash and retained predecessor. Partial-verse `focus` is reviewed editorial metadata, separate from immutable whole-verse coverage. Never flatten it back into an entire-verse absence.

The returns permit recurring explanatory background inside each note that needs it. Optional D remains archival in this increment. The Western-text category in candidate 20 is specifically approved with stated citation limits; it does not authorize other textual-family claims. Never treat the general permission as verification of a source convention or manuscript reading.

## Batch 4

Candidate 01 is published with unchanged returned prose; 05/13/22/25 are published with the explicitly approved exact factual corrections. See the [batch-4 reconciliation](../../docs/editorial-review/returns/2026-09-05/batch-4/RECONCILIATION.md). Preserve the publisher-note-only condition for 13. `presentation`, exact `publisherNotes`, `comparisonNotice` and partial-verse `focus` are approval-hashed editorial metadata; they do not modify source corpus coverage. A source pair of angle markers may support a bracketed partial-verse focus even when the entire verse remains present.

The four contribution hashes, publication and focused live browser acceptance checks are complete. Do not interpret the returned approvals as approval of materially revised prose. Confessional citations are article-level summaries; no Kolb–Wengert text is reproduced, and that print edition has not been independently inspected.

## Batch 5

Five rev-2 notes (15/26/28/29/30) and their exact proposed factual corrections are explicitly approved and locally published. See [reconciliation](../../docs/editorial-review/returns/2026-09-05/batch-5/RECONCILIATION.md). Preserve links 15↔26 and 29↔30 and the exact author-adopted prose. Batch-4 pending records are unaffected.

Candidate 26 alone has explicit permission for a manuscript account attributed to Larry’s book. Preserve the adjacent statement that manuscript images/apparatus have not been independently checked. It is not a set of independently established structured attestations. Any expanded or substituted witness material needs a fresh decision. D/F remains archival; its Bezae identification has an unresolved source concern recorded in reconciliation. Other candidates retain their individual exclusions.

## Batch 6

Four rev-2 returns (04/11/17/27), including all explicitly approved corrections, are locally published. See [reconciliation](../../docs/editorial-review/returns/2026-09-05/batch-6/RECONCILIATION.md). Matthew includes both verses and reciprocal 04/12/23 links; predecessor approvals remain archived. The 1 John focus uses an exact continuous square-bracket pair across verses while whole-verse coverage stays present. The bracket validator accepts literal paired square or angle markers; never infer whole-verse absence from a partial focus.

Book-attributed accounts in 11/17/27 have individual permission with visible independent-verification limits. Do not expand those accounts, add witnesses or treat them as structured attestations without evidence and review. D/F remains archival. Batch-4 corrections were subsequently explicitly approved and published; all 30 initial records are now approved.

## M3 acceptance

Larry accepted the remaining sampled Greek review, disclosed limits and study experience on 2026-09-05. Inline markers and final engineering checks are complete; [acceptance record](../../docs/M3-Acceptance.md). This does not change any explanation payload or add manuscript evidence. All 30 initial publication hashes remain valid. M4 is next.
