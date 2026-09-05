# Batch 3 reconciliation

2026-09-05 · AFNT-016/017/018/021 · Local M3 increment.

## Intake and approval

Preserved `../batch-3-original.zip` (SHA-256 `fb6a6e044c158e69b84527e4b26901769867f366d435a5c102ce23ec51a15037`), all six Markdown members and `receipt.json`. All five returned hashes match the handoff. Each supplied evidence section matches its frozen worksheet; all 253 frozen packet files still match their manifest.

Candidates 12, 16, 19, 20 and 24 carry Larry Herzog Jr.’s rev-2 approval and commercial publication permission. Claude drafting history and Larry’s adoption remain in each original and contribution record. Only A–C and referenced citations are public; optional D remains archival. Review dates have date-only precision.

Larry approved every replacement in `PROPOSED-CORRECTIONS.md`: “Approve all proposed corrections.” The final titles and A–C were independently checked against the returns plus those exact replacements. Corrections address BLB’s actual ending, non-identical healing wording, unknown marker semantics, the two textual matters in Acts 15:33, non-identical doxology wording, and the continuation of the weak/strong discussion into Romans 15. Original returns were not edited.

Current local bundle: **16 approved units, zero drafts; 14 drafts withheld**. No other explanation was approved. Candidate 23 changed only its expressly approved related links; its prior payload/contribution and approval remain in history. All final records have newly computed matching approval hashes.

## Source findings and boundaries

- **12, Luke 17:36:** YLT/Boyd print the verse; the other five do not. Boyd’s local note records Stephanus’ absence. His [published introduction](https://ebible.org/grctr/INT01.htm), checked 2026-09-05, defines ST and describes collating Stephanus 1550, Elzevir 1624 and Scrivener 1881 with the minority reading footnoted. This supports the reported edition distinction; it is not independent manuscript inspection. Matthew 24:40 and Luke 17:35/37 were also checked in all seven local releases.
- **16, John 5:3–4:** Added one reviewed continuous textual unit per edition, beginning inside verse 3. N1904 includes its original matched angle markers through verse 4. The labels do not infer Nestle’s intended degree of doubt; that editorial convention remains unverified. Whole-verse coverage stays unchanged: e.g. N1904 still records verse 3 present and verse 4 bracketed. BSB/BLB omit the disputed unit while retaining the opening of verse 3. The narrative of healing stands in all seven, with wording differences.
- **19, Acts 15:34:** YLT/Boyd include the verse; the other five do not. MSB `ACT.15.33.note.227` contains two textual matters: wording in verse 33 and inclusion of verse 34. Both now have an explicit combined display label, separate from the untouched publisher note. The surrounding reference to Silas at 15:40 was checked.
- **20, Acts 24:6–8:** YLT/Boyd contain a continuous extra unit starting inside verse 6, passing through verse 7, and ending inside verse 8. Its precise original excerpts are now shown separately from the full context. The other five retain neighboring verse text while omitting that unit. Frozen whole-verse coverage was not rewritten to pretend entire verses 6/8 were absent.
- **24, Romans 16:25–27:** All seven contain the doxology. MSB/RP2018 resolve it at source 14:24–26; the other five at 16:25–27. Exact wording is not identical: N1904 has τῶν αἰώνων beyond RP/Boyd at the end. The note now distinguishes that wording question from placement. Romans 15:1 continues the weak/strong discussion. The original publisher references and corpus mappings remain untouched.

## Book and historical limits

Visually checked *Ad Fontes – Volume One*, supplied second edition, printed pp. 381 and 398 (PDF pages 395 and 412). Page 381 supports the cited 1551 numbering discussion. Page 398 and its footnote give the Western-text length estimate and identify Metzger/Ehrman and Clark as the author’s sources. Their books were not independently inspected. The application does not claim a fresh word-count study or add manuscript attestations.

Candidate 20’s Western-text category is expressly authorized in the return, with the citation’s limit retained: the cited book passage supplies the category, but does not itself name Acts 24:6–8. The note’s application of that category is the reviewer’s judgment. The approval does not authorize unrelated textual-family claims or assertions about which form Luke wrote. No book PDF or third-party Scripture quotations entered public assets.

## Implementation and verification

`readings[].focus` is a separate reviewed textual-unit layer: state plus ordered exact segment offsets. Validation requires available corpus data, exact original substrings and continuous boundaries; modified excerpts, reversed order and broken boundaries are rejected. Whole-verse coverage and full contextual readings remain separate. The comparison displays the continuous unit with its source segment labels, or explicitly says the unit is absent while context remains. This is not a new corpus release.

Cross-links are reciprocal for 07/08 (already present), 12/23 and 23/24. Returned bold emphasis now renders as bold rather than stray asterisks. The new MSB note classification is pinned to exact release, note identity, anchor and wording, as with batch 2.

Passed **26 Node test groups, 11 Python tests, TypeScript checking and production build**. Imports reproduced all frozen corpus/analysis outputs. Added tests exercise partial boundaries, bracket continuity, edition exceptions, neighboring reference presence, relocation, wording differences and related links. Source/prose/archive checks passed.

Browser checked all five new notes, exact partial-verse excerpts, marked Nestle span, citation targets, bold formatting, the MSB combined note, related-note keyboard navigation and reload. Narrow-screen and desktop checks cover 320×740 and 1280×900. No formal accessibility audit, physical touch-device test or manuscript review is claimed.

## Next

Continue the remaining 14 reviews and M3’s qualified source/analysis sign-off and broader inline-marker acceptance. M4 remains subsequent work; this is not the finished MVP. Recurring explanations may remain local to each note under the returned editorial ruling, but that ruling does not approve unverified bracket semantics or other new historical claims.
