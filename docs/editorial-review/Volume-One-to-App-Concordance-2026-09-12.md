# *Ad Fontes — Volume One* to Ad Fontes NT concordance

Date: 2026-09-12  
Status: read-only planning report; no new commentary is approved or published by this report

## Executive result

The current app is not a passage-by-passage mirror of *Ad Fontes — Volume One*, and it was never recorded as one. The app has 30 approved Ordinary Means comparison units selected from a broader initial variant queue. The book has a different organizing purpose: it develops a sustained account of textual criticism and uses some variants as full case studies, others as recurring examples, and still others only in passing.

Using the counting rule below, Volume One contains **24 substantive or recurring variant case-groups**:

- **12 case-groups are represented in the app**, using 13 of the app's 30 approved units. Mark 9:44/46 accounts for two app units within one book case-group.
- **12 case-groups are not represented.**
- Of those 12 gaps, **7 can be demonstrated directly by the present seven-edition corpus**, **2 can be treated only with an explicit publisher-note limitation**, and **3 require a reviewed additional source** before the app could display the particular Western Acts reading discussed in the book.

This makes a second editorial round worthwhile. It does **not** justify mechanically importing every book discussion. Nine proposed additions can be responsibly prepared from the material the app already preserves; three should remain blocked until a suitable Western-text source and its rights/provenance have been reviewed.

## Sources and method

The supplied EPUB and PDF identify the same current work: second edition, September 2026, ISBN 979-8-25-947926-5. They were treated as complementary exports, not assumed to be byte-equivalent:

- EPUB SHA-256 `93854ce53f749eff51a79df2f550cf8adf88b4302ec395077f024d0498011d1a` — systematic text extraction, chapter/heading inventory, and reference searching.
- PDF SHA-256 `a12a2da5fc09203c2005201242079f248c67986b7dea313b0345ecf009df61a2` — 468 pages; printed-page and visual verification. The PDF's embedded custom fonts make some extracted characters unreliable, so it was not used as the sole text authority.

The comparison side used the 30 approved records in `content/editorial/variants.json` and the frozen BSB, BLB, MSB, YLT, Nestle 1904, Robinson–Pierpont 2018, and Boyd Textus Receptus releases. No supplied book file was copied into the repository, no source release was altered, and no commentary was drafted.

For counting, a “case-group” is a textual locus—or a tightly related pair of loci—that receives a headed treatment or repeated substantive use in the book. Thus Mark 9:44/46 is one group, Acts 15:20/29 is one group, and the distinct doubled benediction and wandering doxology questions in Romans 16 are two groups. Incidental verse citations that do not function as textual examples are excluded.

The machine-readable ledger is [volume-one-to-app-concordance-2026-09-12.json](volume-one-to-app-concordance-2026-09-12.json).

## Already represented

| Volume One case-group | Book location | Approved app unit(s) |
|---|---|---|
| Mark 16:9–20 | Chapter 5, beginning p. 82 | candidate-11 |
| John 7:53–8:11 | Chapter 6, beginning p. 106 | candidate-17 |
| 1 John 5:7–8 | Chapter 7, beginning p. 130 | candidate-27 |
| Revelation 22:19 | Chapter 3; recurring Erasmus example | candidate-28 |
| John 1:18 | Chapter 8, beginning p. 160 | candidate-15 |
| 1 Timothy 3:16 | Chapter 8, beginning p. 167 | candidate-26 |
| Matthew 6:13 | Chapter 9, beginning p. 195 | candidate-01 |
| Mark 9:44 and 9:46 | Chapter 10, beginning p. 229 | candidate-07 and candidate-08 |
| Luke 17:36 | Chapter 10, beginning p. 234 | candidate-12 |
| Acts 8:37 | Chapter 10, beginning p. 239 | candidate-18 |
| Romans 16:24 | Chapter 10, beginning p. 248 | candidate-23 |
| Romans 16:25–27 | Chapter 11, beginning p. 288 | candidate-24 |

This overlap uses only 13 of the 30 app units. The remaining 17 approved app units are not errors or scope drift: they are additional comparison targets not developed as substantive Volume One cases. Previous review records already note examples such as Matthew 17:21, Luke 22:43–44, and Romans 5:1 as app candidates without a corresponding book treatment.

## Recommended second-round additions

The priority order balances clarity of the present edition split, strength of the book treatment, usefulness to readers, and how little special UI/source qualification would be required.

| Priority | Proposed ID | Passage | Why it belongs | What the current app can show |
|---:|---|---|---|---|
| 1 | AFNT-V2-01 | Mark 1:2 | The book's worked example for the method; a particularly clean teaching case. | BSB/BLB/N1904 read “Isaiah the prophet”; MSB/YLT/RP2018/TR-BOYD read “the prophets.” BSB and MSB give reciprocal notes. |
| 2 | AFNT-V2-02 | Acts 20:28 | One of the book's three principal Christological cases. | The corpus directly shows “church of God” versus “church of the Lord and God,” with publisher-note alternatives. Boyd's TR agrees with the God reading here, so the article must avoid reducing the split to “critical versus TR.” |
| 3 | AFNT-V2-03 | Romans 8:1 | The book's opening concrete example and a recurring demonstration of harmonization. | The shorter form is printed by BSB/BLB/N1904; the closing clause appears in MSB/YLT/RP2018/TR-BOYD. Reciprocal notes are present. |
| 4 | AFNT-V2-04 | Jude 5 | The book's concrete CBGM case and a textually compact Christological difference. | BSB/BLB read “Jesus”; the other five editions read “Lord.” BSB/MSB notes explicitly document the split. |
| 5 | AFNT-V2-05 | 2 Peter 3:10 | A recurring example connecting versions, CBGM, and changing critical editions. | The current sources expose “will not be found,” “will be found,” “burned up,” and BSB's “laid bare,” with unusually useful notes. The article must distinguish Greek-edition readings from English rendering choices. |
| 6 | AFNT-V2-06 | Matthew 5:22 | A full dominical-saying case with clear pastoral consequences in the book. | BSB/BLB/N1904 omit “without cause”; MSB/YLT/RP2018/TR-BOYD include it, with reciprocal notes. |
| 7 | AFNT-V2-07 | Luke 11:2–4 | A recurring, concrete harmonization example that complements the existing Matthew 6:13 unit without duplicating it. | The shorter Lukan form and later Matthean expansions are directly visible across the seven editions and documented by BSB/MSB notes. Scope should stay on harmonization into Luke, not re-litigate Matthew's doxology. |
| 8 | AFNT-V2-08 | Luke 23:34a | A full, pastorally important case in chapter 9. | All seven editions print the prayer; only BSB/MSB notes expose its omission in some manuscripts. This must be labeled as a publisher-note-supported difference, not as an absence displayed by one of the seven editions. |
| 9 | AFNT-V2-09 | 1 Thessalonians 2:7 | The book's worked reasoned-eclecticism example and a useful one-letter boundary case. | All seven editions print “gentle”; BSB/MSB notes preserve the “young children” reading. Like Luke 23:34a, the alternative is note-supported rather than directly printed by a displayed edition. |

### Suggested batching

For the cleanest review process:

1. **Batch A — seven directly displayed splits:** Mark 1:2; Acts 20:28; Romans 8:1; Jude 5; 2 Peter 3:10; Matthew 5:22; Luke 11:2–4.
2. **Batch B — two note-limited cases:** Luke 23:34a and 1 Thessalonians 2:7. Their worksheets should contain a mandatory, reviewer-visible statement that no current displayed edition embodies the alternative reading directly.
3. **Batch C — source research only:** the three Western Acts cases below. Do not draft public app commentary until source selection, rights, exact mapping, and immutable import evidence are settled.

## Book cases the current corpus cannot yet represent

| Proposed source-gap ID | Passage | Book location | Gap |
|---|---|---|---|
| AFNT-V2-S01 | Acts 8:39 | Chapter 11, beginning p. 267 | All seven editions preserve the standard reading; none displays or notes the Codex Bezae/Old Latin expansion discussed by the book. |
| AFNT-V2-S02 | Acts 19:9 | Chapter 11, beginning p. 273 | The corpus shows only the smaller “Tyrannus”/“a certain Tyrannus” difference. It does not contain the Western fifth-hour-to-tenth-hour expansion that is the book's subject. |
| AFNT-V2-S03 | Acts 15:20 and 15:29 | Chapter 11, beginning p. 279 | All seven editions print the fourfold decree; none displays or notes the Western ethical form discussed by the book. |

These are not “unavailable because absent.” They are outside the evidentiary reach of the present edition set. Adding them would require a separately reviewed source decision, licensed or public-domain raw evidence, an immutable adapter/release, explicit canonical mapping, checksums, and tests. The book itself can guide the editorial topic but should not be repurposed as the app's underlying Scripture witness.

## Editorial cautions for the next round

- **Do not clone book prose into the app.** The book supplies the author's treatment and priorities, but each app unit still needs comparison-specific observation, restrained interpretation, rights/provenance, and its own exact approval hash.
- **Keep displayed evidence and external manuscript history separate.** The seven editions establish what the app may say it displays. Historical witness claims require their own cited evidence and review.
- **Avoid a binary “critical text versus TR” template.** Acts 20:28, 1 Thessalonians 2:7, and 2 Peter 3:10 demonstrate why that shortcut fails.
- **Treat publisher-note-only readings honestly.** A note that some manuscripts omit a clause is not the same thing as having an app edition whose main text omits it.
- **Preserve distinct neighboring variants.** At Acts 19:9 the visible `τινός` difference is not the Western hours expansion; at 2 Peter 3:10 “laid bare” may involve both textual and translational judgment; at Luke 11 the topic is harmonization into Luke, not merely the Matthew 6 doxology.
- **Retain the current gate.** Draft candidates stay outside public bundles until exact source spans, explanations, permission, reviewer decision, and content hash are all complete.

## Proposed next action

Prepare private review worksheets for Batch A only. Reconcile their exact spans and publisher notes against the frozen releases, then obtain Larry Herzog Jr.'s item-level textual approval before creating any immutable editorial candidate. Batch B can follow with its limitations prominent. Batch C should begin as a source/licensing memorandum, not as commentary.
