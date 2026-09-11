# Full-corpus audit reconciliation v2

Date: 2026-09-11  
Status: **correction candidate only — not approved, selected, published, or deployed**

## Result

Claude's returned audit contained 88 findings. This reconciliation includes exact candidate corrections for 83 and leaves 5 in a named human-review queue. Local review of the fallback ledger added 14 phrase-slot and quotation-wrapper corrections.

Kimi's independent audit contained 41 findings. It independently confirmed 13 candidate-v1 corrections and contributed 28 supportable findings to candidate v2. Kimi's two count claims were recalculated against the pinned Nestle analysis: Acts contains 28 occurrences of *mathētēs*, 10 before Acts 11:26; the 12 occurrences of *prothesis* divide 4 showbread / 8 purpose. The observed `orthotomeo` section-order difference is recorded but deliberately not changed without an editorial decision.

The candidate changes 67 of 250 immutable-v5 article copies with 124 exact replacements, changes 3 word-metadata fields, and changes 15 comparison units. Every changed comparison unit is returned to `in-review`; its previous approval hash is explicitly invalidated. The separate fallback reconciliation accounts for all 243 fallback records and distinguishes candidate-corrected occurrences from retained records without treating retention as a blanket editorial endorsement.

Candidate manifest SHA-256: `634d06bd89eb99826c5f70ea726a6d7aaca1673558e6f790bfb6312ef8c4d213`

## Evidence boundary

Claude's and Kimi's returns are evidence, not authority. Claude reports automated checks across all 250 articles and close reading of flagged passages, plus close reading of all 30 comparison commentaries. Kimi reports complete deterministic coverage plus targeted/manual contextual review; neither return claims a fresh uninterrupted human-quality close read of every sentence in all 250 articles. The local reconciliation verified the immutable v5 hashes, checked proposed BSB wording against pinned sources, recalculated numerical claims against pinned analysis, and inspected all 243 fallback records through the deterministic ledger and targeted context review.

## Still requiring a decision or source

- `AUDIT-062` (hades): Internal-link destination requires a product/editorial decision.
- `AUDIT-063` (epiphaneia): The referenced study is not identified in the supplied evidence.
- `AUDIT-064` (eusebeia): The historical characterization needs textual-review approval.
- `AUDIT-065` (hyper): The intended three-syllable referent is authorial and cannot be inferred safely.
- `AUDIT-086` (candidate-18): The Erasmus/Textus Receptus history claim needs a directly adequate source or narrower wording.


## Approval gate

Do not promote this candidate by copying files into the immutable release or approved editorial paths. Larry Herzog Jr. must first review the before/after changes and approve the exact candidate manifest SHA-256. A later promotion must create a new immutable article release, update comparison approval hashes, rerun the full verification suite, and produce a new public-release manifest.
