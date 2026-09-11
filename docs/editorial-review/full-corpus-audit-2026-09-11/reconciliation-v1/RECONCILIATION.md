# Full-corpus audit reconciliation v1

Date: 2026-09-11  
Status: **correction candidate only — not approved, selected, published, or deployed**

## Result

The returned audit contained 88 findings. This reconciliation includes exact candidate corrections for 83 and leaves 5 in a named human-review queue. Local review of the fallback ledger added 14 phrase-slot and quotation-wrapper corrections.

The candidate changes 53 of 250 immutable-v5 article copies with 92 exact replacements, changes 3 word-metadata fields, and changes 15 comparison units. Every changed comparison unit is returned to `in-review`; its previous approval hash is explicitly invalidated. The separate fallback reconciliation accounts for all 243 fallback records and distinguishes candidate-corrected occurrences from retained records without treating retention as a blanket editorial endorsement.

Candidate manifest SHA-256: `acb12c2484982bd3b5f11a8d40b76c540cf24bbf7d629c75f7cd62dda7512836`

## Evidence boundary

Claude's return is evidence, not authority. It reports automated checks across all 250 articles and close reading of flagged passages, plus close reading of all 30 comparison commentaries; it is not a claim that every sentence of all 250 articles received a fresh human-quality close read. The local reconciliation verified the immutable v5 hashes, checked proposed BSB wording against the pinned BSB text, and inspected all 243 fallback records through the deterministic ledger and targeted context review.

## Still requiring a decision or source

- `AUDIT-062` (hades): Internal-link destination requires a product/editorial decision.
- `AUDIT-063` (epiphaneia): The referenced study is not identified in the supplied evidence.
- `AUDIT-064` (eusebeia): The historical characterization needs textual-review approval.
- `AUDIT-065` (hyper): The intended three-syllable referent is authorial and cannot be inferred safely.
- `AUDIT-086` (candidate-18): The Erasmus/Textus Receptus history claim needs a directly adequate source or narrower wording.


## Approval gate

Do not promote this candidate by copying files into the immutable release or approved editorial paths. Larry Herzog Jr. must first review the before/after changes and approve the exact candidate manifest SHA-256. A later promotion must create a new immutable article release, update comparison approval hashes, rerun the full verification suite, and produce a new public-release manifest.
