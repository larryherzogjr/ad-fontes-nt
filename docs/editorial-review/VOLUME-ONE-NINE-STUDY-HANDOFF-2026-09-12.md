# Handoff: merge the nine approved Volume One studies after audit-resolution work

Date: 2026-09-12  
Project: Ad Fontes NT  
Repository: private `larryherzogjr/ad-fontes-nt`  
Purpose: safely reconcile the nine approved Volume One additions with a tree in which the second-pass audit corrections have already been resolved.

## Requested outcome

Keep the audit-resolved tree as the authoritative base. Add or verify the nine exact, already approved Ordinary Means studies identified below. Preserve both bodies of work, regenerate the web and desktop editorial bundles, and verify them together. Do not change a frozen Scripture corpus, the supplied Volume One files, or `larryherzogjr.com`.

Do not push, deploy, or publish a new desktop release unless Larry separately authorizes those actions.

## Important shared-workspace warning

At the time of this handoff, the local branch was `codex/v1-public-release` at commit `89b42f449f1dc07d30ab596fa0c7532a6219bf72`, with uncommitted work from more than one task. The working tree already showed both:

- the nine-study additions in `content/editorial/variants.json`, `content/editorial/reviews.json`, and related documentation/tests; and
- audit-resolution work, including Word Explorer/OM changes and a proposed `om-studies-2026-09-12-v8` source release.

Treat the current filesystem as live shared state. Re-run `git status --short` before editing. Do not discard, reset, or overwrite changes merely because they are not described in this document. If the other Codex task uses this same working tree, the nine studies may already be present and should be verified rather than reapplied.

## Approval and immutable evidence

Larry Herzog Jr. explicitly approved the exact candidate manifest SHA-256:

`28ebb36b62d8cbd4cdbc2451b98586a3f9e1f6a9e043f08f7a9c9398f2d9c958`

Authoritative evidence directory:

`docs/editorial-review/volume-one-additions-2026-09-12/evidence/`

Required evidence identities:

| File | SHA-256 |
|---|---|
| `CANDIDATE-MANIFEST.json` | `28ebb36b62d8cbd4cdbc2451b98586a3f9e1f6a9e043f08f7a9c9398f2d9c958` |
| `NEW-UNITS.json` | `fc7170f9d6106ffbcae219d9879ada4daaee06a387683441b523aacfb928335d` |
| `CANDIDATE-SPEC.json` | `eb8dad0c41ccf70f48d5684bdb3e0ddf5d0bf7678530472b5d38adf6fc32cece` |
| `REVIEW.md` | `86870a94c4be88eab4b9441ce7cd026c02af22e6efd41ac090bd8134cb2d45b4` |
| `VALIDATION.json` | `e8104424ab268715c43fd12071629421c10006a3b3ce6f48563204a833b048ba` |
| `APPROVAL.md` | `44db1879fa702edb3f15b9b6643d01176363fd4256fd883d0947c29dd781f8df` |

The exact approval record also exists at:

`docs/editorial-review/volume-one-additions-2026-09-12/APPROVAL.md`

The approved manifest was built twice from the supplied EPUB/PDF and the frozen seven-edition corpus; both builds reproduced identical manifest and proposed-unit bytes. It validated 63 exact chapter snapshots and 22 exact BSB/MSB publisher-note bodies.

## Approved units

| ID | Passage | Title | Presentation |
|---|---|---|---|
| `candidate-31` | Mark 1:2 | Isaiah the Prophet, or the Prophets? Mark 1:2 | seven-edition comparison |
| `candidate-32` | Acts 20:28 | The Church of God—or of the Lord and God? Acts 20:28 | seven-edition comparison |
| `candidate-33` | Romans 8:1 | No Condemnation: Where Does Romans 8:1 End? | seven-edition comparison |
| `candidate-34` | Jude 5 | Who Saved Israel from Egypt? Jude 5 | seven-edition comparison |
| `candidate-35` | 2 Peter 3:10 | What Happens to the Earth? 2 Peter 3:10 | seven-edition comparison |
| `candidate-36` | Matthew 5:22 | Angry Without Cause? Matthew 5:22 | seven-edition comparison |
| `candidate-37` | Luke 11:2–4 | Luke’s Shorter Lord’s Prayer: Luke 11:2–4 | seven-edition comparison |
| `candidate-38` | Luke 23:34 | Father, Forgive Them: The Footnote at Luke 23:34 | **publisher-note only** |
| `candidate-39` | 1 Thessalonians 2:7 | Gentle or Little Children? The Footnote at 1 Thessalonians 2:7 | **publisher-note only** |

Exact review-payload hashes:

| ID | Approved review-payload SHA-256 |
|---|---|
| `candidate-31` | `1105d37c10b2542327c8ae1cfa33e28e5fe3952c572b2ceb19a318b44e37d001` |
| `candidate-32` | `bee63aec4d09bb17ae7710ffd7757b05b00dcfbf075d0401443bd90efddbccc5` |
| `candidate-33` | `47bdbc2507497c3c2aa91a288d97f51091b061a5367932ae8096f60c5e8027cb` |
| `candidate-34` | `c3ac13c223ae11b0cc33b5c979586e4f9bf7e81e4c28480edaebbea772f285ce` |
| `candidate-35` | `843ef43ed30d9a6b696905ba39bb008da01ec07a6b4ce0336373cbbdc159266b` |
| `candidate-36` | `a6863037ea45c372b1cdeab31315dc12054fc7cb0b564980467e64d4f43fb3f1` |
| `candidate-37` | `e60581ededbe7da356490c3f50c071e55623e33de8576c2c8cc309ca0d4b7c80` |
| `candidate-38` | `8420e562813fedd93919b91c757722d896ee8d9a1d8042237e50030c979dfd9a` |
| `candidate-39` | `7916233269b7fb0584eadb4a310218655e192949456d2165ab83ca5ef7915d77` |

`reviewPayload()` excludes only `status`, so advancing the evidence records from `in-review` to `approved` preserves these hashes.

## Non-negotiable editorial distinctions

- `candidate-38` and `candidate-39` must retain `presentation: "publisher-note"` and their exact pinned `publisherNotes`. All seven displayed editions print the prayer in Luke 23:34 and “gentle” in 1 Thessalonians 2:7. The alternatives must not be described or rendered as absences in a displayed edition.
- Acts 20:28 is not a simple critical-versus-TR division. Boyd’s displayed TR agrees with “church of God,” while MSB/RP2018 display “church of the Lord and God.”
- At 2 Peter 3:10, distinguish English rendering choices from the readings of the displayed Greek editions.
- No structured manuscript attestations were approved. Publisher abbreviations remain publisher claims, not an independently reconstructed apparatus.
- The three Western Acts cases—Acts 8:39, Acts 19:9, and Acts 15:20/29—remain deferred because the frozen corpus lacks the required Western-source readings.
- The prose is attributed to Larry Herzog Jr., publishing as Ordinary Means, with AI drafting and Larry’s exact-hash adoption disclosed in `provenance`.

## Safe reconciliation procedure

1. Read the repository `AGENTS.md` and its required project/acceptance/source-decision documents before changing scope.
2. Inspect the current tree and the audit-resolution diff. The audit-resolved versions of shared files are the merge base; do not replace them with whole files from this handoff.
3. Verify the evidence hashes above before using `NEW-UNITS.json`.
4. Inspect `content/editorial/variants.json` by ID:
   - If all nine IDs already exist, verify each exact `reviewPayload()` hash against the table and confirm each status is `approved`.
   - If none exist, append the exact nine objects from evidence `NEW-UNITS.json`, changing only `status` from `in-review` to `approved`.
   - If only some exist, or any existing ID has a different payload hash, stop and reconcile the collision explicitly. Never silently replace a same-ID record.
5. Inspect `content/editorial/reviews.json`. Each unit must have an approval record with reviewer `larry-herzog-jr`, the exact hash above, date `2026-09-12`, and decision `approved`. Add only missing records; do not duplicate exact records or discard earlier review history.
6. Merge the Volume One additions to `content/editorial/REVIEW.md`, `PROJECT-STATUS.md`, and `tests/m3.test.ts` semantically. Preserve the audit session’s newer entries and tests. Final counts should reflect 39 approved comparison/commentary units, not the former 30.
7. Run `npm run publish:variants`. It must report `39 approved units; 0 withheld` unless the audit work intentionally adds separately reviewed units; in that case explain the new total.
8. Run the complete combined verification:
   - `npm test`
   - `npm run typecheck`
   - `npm run build`
   - `npm run desktop:build:web`
   - `npm run test:desktop`
9. Browser-check all nine exact deep links in a local production build. Confirm the seven normal comparison panels, the two publisher-note panels, inline commentary markers, source links, keyboard close/reopen, and a phone-width layout without horizontal overflow.
10. Review `git diff --check` and `git status --short`. Confirm the frozen corpus and supplied book exports were not modified. Preserve the audit-resolution release/evidence and any unrelated user work.

## Do not rerun the historical promotion script on a newer base

`scripts/promote_volume_one_additions_candidate.ts` documents the original promotion, but it is intentionally bound to the pre-addition 30-unit predecessor hash:

`57f469676affe81a44491d3f28ec630bee89cb40d1395abd6a76294eb3cca308`

If the audit-resolution task changed the editorial base, that script should fail closed. Do not weaken or remove its predecessor guard. Perform the ID-by-ID merge described above, using the evidence hashes and the application’s existing publication validator.

`scripts/build_volume_one_additions_candidate.ts` likewise exists for reproducibility, not to generate revised prose. Any prose or metadata change invalidates Larry’s approval and requires a new candidate manifest and a new explicit approval.

## Verification already completed before handoff

Before the audit-resolution merge, this session recorded:

- deterministic candidate rebuild: pass;
- publication validator: 39 approved, 0 withheld;
- 59 Node tests and 19 Python tests: pass;
- TypeScript check and production build: pass;
- desktop bundle build: 13,371 released files staged;
- six desktop tests: pass;
- all nine web deep links: correct title and panel;
- Luke 11:2–4 at 390×844: no horizontal overflow;
- keyboard Escape closed the study and Enter on its commentary marker reopened it;
- browser console warnings/errors: none.

These results establish the nine-study candidate on its original base. The receiving session must rerun them after combining it with the audit resolutions.

## Suggested prompt to accompany this handoff

> Reconcile the already approved nine Volume One studies described in `docs/editorial-review/VOLUME-ONE-NINE-STUDY-HANDOFF-2026-09-12.md` with your completed audit-resolution work. Treat your audit-resolved tree as authoritative and preserve all unrelated or concurrent changes. Verify the immutable evidence and exact review-payload hashes; merge by candidate ID instead of replacing whole shared files. Retain the publisher-note-only limitations for candidates 38 and 39 and every other source distinction in the handoff. Run the full web and desktop publication/verification suite and browser-check the nine routes. Do not push, deploy, create a release, modify frozen corpora, or change `larryherzogjr.com` without separate authorization. Report any collision or approval-hash mismatch rather than resolving it silently.
