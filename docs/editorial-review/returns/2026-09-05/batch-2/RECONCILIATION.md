# Batch 2 reconciliation

2026-09-05 · AFNT-017/018/021 · Local M3 increment, not the finished MVP.

## Intake and decisions

The current ZIP was preserved as `../batch-2-original.zip`; six original Markdown files and per-file SHA-256 values are in `receipt.json`. ZIP SHA-256: `dc339acbb94a384a158da40369774349a0117e577518bc239f29a52604ff997e`. All five returned-file hashes match the handoff. All five supplied evidence sections are byte-identical to their frozen worksheets, and all 253 frozen packet files still match their manifest.

Five rev-2 returns contain Larry Herzog Jr.’s affirmative review and permission: 09 Mark 11:26, 10 Mark 15:28, 14 Luke 23:17, 21 Acts 28:29, 23 Romans 16:24. Their public title and A–C prose were integrated; D, internal reviewer discussion and witness material were not imported. Claude drafting history and Larry’s adoption remain in the original files and contribution records. Review dates preserve date-only precision; no clock time was invented.

Larry explicitly approved all replacements in `PROPOSED-CORRECTIONS.md` in the project conversation: “Approve all proposed corrections.” See `correction-approval.json` and each contribution record. Candidate 10’s A–C is unchanged. The other four match their returns plus exactly the approved replacements. Corrected citation locators identify the evidence; original worksheet citations remain archived. Approval hashes were calculated from each final application payload, not copied from the unwritten draft hash.

The local publication bundle now contains **11 approved explanations and zero drafts**; 19 candidates remain drafts. No other candidate received approval, and no public deployment occurred.

## Fact checks

- All five primary verses: BSB/BLB/N1904 have available data with absent main text; MSB/YLT/RP2018/TR-BOYD print the verse. Source quotations, releases and canonical spans pass publication validation.
- **09:** Three Greek editions, not four. Matthew 6:15 is present in all seven. MSB notes `.67` and `.68` at that verse report a wording difference and a literal rendering; the return’s no-footnote claim was false.
- **10:** Mark 15:27–28 and Luke 22:37 reconcile. RP2018 and Boyd have the identical quoted Greek clause in both places. BSB notes `MRK.15.note.117` and `.118` are separate rendering and textual notes. Isaiah remains an attributed publisher cross-reference, not an independently imported OT text.
- **14:** Mark 15:6 is present in all seven, with literal-rendering notes in BSB/MSB. MSB `LUK.23.17.note.373` combines a literal rendering and a textual statement. Original note text and markup remain unchanged.
- **21:** Acts 28:28 and 28:30 stand in all seven; the two publisher notes supply no cross-reference. The title and conditional prose now follow the return’s stated narrowing. No exhaustive no-parallel claim or direction-of-change conclusion was adopted.
- **23:** Verse 20 stands in all seven. Both RP2018 and Boyd add “all” in verse 24; only RP adds Amen relative to verse 20, since Boyd already has it there. The “only place” claim was removed. BSB/MSB’s statements about SBL remain attributed publisher statements. As an additional read-only check, the official [SBLGNT repository’s Romans text](https://github.com/Faithlife/SBLGNT/blob/master/data/sblgnt/text/Rom.txt), accessed 2026-09-05, prints Romans 16:24; the [official edition page](https://www.sblgnt.com/) identifies it as critically edited. This does not add an eighth corpus or manuscript evidence.
- **Book:** Visually verified printed p. 376 (PDF page 390) of the supplied second edition of *Ad Fontes – Volume One*: the named section and pastoral judgment support candidate 23’s self-attributed paraphrase. This is verification of what the author wrote, not independent confirmation of the book’s historical claims. The PDF and its Scripture quotations were not copied to public assets.
- MSB’s original note wording “Romans 14:24–26” remains untouched. Existing canonical placements already map the relocated doxology in MSB/RP2018. Candidate 24 remains draft; a reciprocal related-explanation link waits for its approval.

## Interface and validation

The requested note classifications are separate, exact-release annotations, labeled “Note type (Ad Fontes NT).” They appear in both chapter notes and the comparison panel. They do not rewrite publisher wording or classify other notes by guessing from sigla. The combined Luke note identifies which clause concerns rendering and which concerns textual inclusion. A changed release, ID, anchor or body suppresses the annotation.

Passed: **24 Node test groups, 11 Python tests, TypeScript checking and production build**. Offline imports reproduced all pinned corpus/analysis outputs. New checks cover all five omission patterns, cross-reference presence, actual footnotes, the shared Greek clause, Boyd’s Amen, and annotation identity/failure behavior. The five final title/A–C records were independently compared with returns plus approved replacements.

Browser checked all five new deep links and citation targets. Mark’s separate note labels and Luke’s combined label display correctly; Luke’s label also appears in chapter notes. Keyboard Enter opens a chapter commentary marker; Escape closes study; reload retains the selected unit. Romans C5 focuses the source entry without closing study. Screenshots at 320×740 and 1280×900 show no page or dialog horizontal overflow. This is targeted browser verification, not a formal accessibility audit or physical-device test.

## Next

Continue M3 with the remaining 19 returned reviews, especially candidate 24 for the separate doxology explanation and eventual cross-link. Keep human source/analysis sign-off and broader inline marker acceptance open. M4 remains personal notes and Ordinary Means resources, after M3 acceptance.
