# Batch 4 reconciliation — 2026-09-05

## Original intake state (superseded by completion below)

Candidate 01 (Matthew 6:13), returned rev-2, is locally published with Larry Herzog Jr.’s supplied approval and unchanged A–C prose. Exact payload hash is recorded in `content/editorial/reviews.json` and its contribution record. Candidates 05/13/22/25 are **in review**, with proposed corrected prose staged outside the public bundle. Their returned approvals are preserved, but do not approve these material factual replacements. See [the exact proposed corrections](PROPOSED-CORRECTIONS.md). No affirmative reply to that correction request has been recorded yet.

Current queue: **17 approved and locally published; 4 in review; 9 drafts**. Optional D material remains archival. Larry is author of record; Ordinary Means is the public byline; Claude’s initial drafting and Larry’s adoption, permission and date-only approval remain in contribution records. No invented review time or manuscript attestation was added.

## Intake and fidelity

The original ZIP is preserved next to this folder as `batch-4-original.zip`; `receipt.json` pins its SHA-256 and all six member hashes. All five candidate hashes match the returned handoff. All five supplied-evidence sections match their original worksheets exactly. All **253** files in the frozen packet manifest verify. Original returns and the frozen packet were not rewritten.

Corpus imports reproduce all seven immutable releases. Book/chapter numbering and verse coverage have not changed. Source comparison uses the full local NT, including contextual chapters outside the original review packet.

## Findings and implementation

- **01 — Matthew 6:13:** all seven have the verse. MSB/YLT/RP2018/Boyd include the doxology; BSB/BLB/N1904 lack that portion. Exact `focus` spans distinguish the clause from whole-verse coverage. BSB `MAT.6.note.43` combines a rendering alternative with textual material; MSB `MAT.6.13.note.65` and `.66` separate them. Application labels require exact release, note ID, anchor and body; original publisher wording remains unchanged.
- **05 — Mark 1:1:** all seven include the Son-of-God phrase. Nestle’s literal source span is `<Υἱοῦ Θεοῦ>` inside a verse whose corpus state remains `present`. The staged focus carries `bracketed`, backed by the exact paired source markers. Validation also rejects an unmarked phrase mislabeled as bracketed. The proposed prose avoids inferring the editor’s intentions from unverified marker conventions. Mark 1:11 and 15:39 were checked locally. Claims about other Greek editions stay attributed to BSB/MSB notes.
- **13 — Luke 22:43–44:** all seven include both verses, but Greek wording is not identical: N1904 has καὶ ἐγένετο where RP/Boyd have Ἐγένετο δὲ. Proposed prose narrows agreement to inclusion. The condition of approval is implemented with `presentation: publisher-note` and exact BSB/MSB publisher-note records. A dedicated `panel=notes` view omits comparison results and tabs. Legacy comparison links targeting such a note select the same note-only view. A broader comparison keeps these explanations as separate links, rather than treating them as comparison results. The staged record remains unpublished, so final browser acceptance of its live view awaits prose approval.
- **22 — Romans 5:1:** N1904 prints ἔχωμεν; RP/Boyd print ἔχομεν. The four English editions render the statement. BSB/MSB footnote the alternative. The proposed replacements remove the unsupported historical pronunciation assertion and acknowledge the visible Greek difference. The pastoral interpretation remains Larry’s adopted commentary, separate from source observations.
- **25 — 1 Corinthians 13:3:** BSB/BLB render the boast reading; all displayed Greek editions print a form of burning (Nestle καυθήσομαι, RP/Boyd καυθήσωμαι). The staged comparison notice explicitly discloses the mismatch; its text is part of the approval-hashed payload. The proposed clarification names BSB/MSB as the publishers providing footnotes, avoiding the preceding BSB/BLB ambiguity. No Greek-to-English alignment is inferred.

## Explanatory source checks and limits

For 01, the supplied *Ad Fontes – Volume One*, second edition (September 2026), printed p. 292 / PDF page 306, was visually checked. It supports the attributed account of the doxology as liturgical response and names the Lutheran hymnals. The app imports none of the book’s Scripture quotations; self-citation remains explicit. The hymnals themselves were not independently inspected.

For 05, article-level summaries were checked against [CPH’s Augsburg Confession III](https://bookofconcord.cph.org/en/augsburg-confession/chief_articles/article_iii/) and [Nicene Creed](https://bookofconcord.cph.org/en/ecumenical-creeds/nicene-creed/). For 22, the summary was checked against [Augsburg Confession IV](https://bookofconcord.org/augsburg-confession/of-justification/). These public editions support the content of the summaries; **the cited Kolb–Wengert print edition was not inspected**. No confessional text is reproduced or newly licensed through this check. No phonology history, manuscript count, dating or direction of change is inferred.

The handoff’s standing rulings are retained as editorial preferences: answer worship questions directly; allow article-level confessional summaries for relevant Christological notes; answer pastoral questions from the text before a confessional summary; treat recommended lengths as guidance. They do not approve other candidates or establish historical claims.

## Verification

- `npm run typecheck`: passed.
- `npm run build`: passed; its prebuild reproduced all corpus/analysis releases, published only approved notes, and ran **28 Node test groups plus 11 Python fidelity tests**, all passing.
- New tests cover partial-verse scope, paired source markers, exact publisher-note identity/body/release, note-only versus mixed comparison selection, notice hash sensitivity, Luke’s wording difference, Romans’ vowel difference and Corinthians’ three Greek forms.
- Browser: Matthew chapter marker opened with Enter; the deep link/reload showed exactly one approved explanation and seven edition cards. Four doxology excerpts and three clause-absence notices were verified. BSB/MSB note details opened with keyboard and showed their distinct labels. C4 keyboard navigation focused the correct source citation. At 320px, document and dialog had no horizontal overflow; screenshot visually inspected.
- Live browser verification of the four withheld explanations, including the note-only screen and local Corinthians notice, remains to be completed after correction approval. Unit-level selection/validation checks already pass. No pending note was temporarily published for testing.

## Next action

After Larry’s correction decision, update the four staged records and contribution audit, reconcile source locators to the final prose, record exact final approval hashes, publish locally and browser-check them. Then receive batch 5 (15/26/28/29/30), followed by batch 6 (04/11/17/27). M3 remains an engineering preview pending editorial and qualified source/analysis acceptance.

## Completion after explicit correction approval

Larry replied **“Approve all proposed corrections”** on 2026-09-05 to the question linking the exact batch-4 replacements and requesting local publication. [CORRECTION-APPROVAL.md](CORRECTION-APPROVAL.md) records that decision. The four staged A–C records were checked against the original returns plus only the approved replacements (including removal of the space before the replacement semicolon). No further prose rewrite was made. Source locators now state the corresponding scope and verification limits. Final contribution hashes and date-only approval events are recorded for 05/13/22/25.

**All 30 initial explanations are now approved and locally published; none remain draft or in review.** This completes batch 4 and the initial explanatory queue, not all M3 acceptance. Originals, source corpora, packet evidence and earlier approvals remain unchanged.

Final verification: **33 Node test groups, 11 Python fidelity tests, typecheck and production build passed.** The new regression checks compare all four public records to the exact returned-plus-approved prose and verify original-return and final approval hashes. Full offline corpus and analysis reproduction passed.

Browser acceptance:

- Luke’s direct `panel=notes` link shows the two exact BSB/MSB publisher notes and the reviewed explanation, with no edition comparison cards or tool tabs. A legacy `panel=compare&unit=candidate-13` link selects the same publisher-note view. Citation keyboard navigation and Escape work; closing restores the reading control.
- Mark shows seven edition cards and the exact Nestle partial-verse `<Υἱοῦ Θεοῦ>` excerpt, while its whole verse remains present.
- Romans shows Nestle’s ἔχωμεν and RP/Boyd’s ἔχομεν; the BSB note disclosure opens by keyboard.
- Corinthians shows seven cards and the prominent approved notice that no displayed Greek edition carries the BSB/BLB boast reading. At 320px the dialog and all edition cards have no horizontal overflow; the screenshot showed legible stacked controls and the full notice. Desktop was restored to 1280px. These are focused browser checks, not a physical-device or accessibility certification.

Next: complete remaining M3 qualified source/analysis and broader inline-marker acceptance. M4 remains local personal notes and verified passage-linked Ordinary Means resources after M3 acceptance. No public deployment occurred.
