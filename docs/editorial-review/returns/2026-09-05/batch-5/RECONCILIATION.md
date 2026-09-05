# Batch 5 reconciliation — 2026-09-05

## Result and approval

Five returned rev-2 explanations are locally published: **15 (John 1:18), 26 (1 Timothy 3:16), 28 (Revelation 22:19), 29 (2 Corinthians 13:12–14), 30 (3 John 14–15)**. Larry explicitly approved all exact replacements in [PROPOSED-CORRECTIONS.md](PROPOSED-CORRECTIONS.md); the approval is recorded in [CORRECTION-APPROVAL.md](CORRECTION-APPROVAL.md). Final A–C prose matches the returns plus those replacements exactly. Source locators are reconciled to the final wording. Real date-only review events and exact payload hashes are in `content/editorial/reviews.json` and each contribution record.

**Current queue: 22 approved and locally published, 4 in review (batch 4), 4 drafts (batch 6).** The handoff’s running total of 26 counts returned document approvals; it does not include the still-pending application wording corrections in batch 4. Batch 5’s approval does not resolve them.

Ordinary Means remains the public byline and Larry Herzog Jr. the author of record. Claude’s drafting, Larry’s adoption, contribution permission, review precision and correction provenance remain recorded. A–C are public; D/F remain archival as in previous batches. No public deployment occurred.

## Intake

The exact ZIP is preserved as `../batch-5-original.zip`; `receipt.json` pins the archive and all six member hashes. All five candidate hashes match the handoff. All supplied-evidence sections match the original worksheets, and all 253 frozen packet files match their manifest. Original returns, source editions, canonical registries and the frozen packet remain unchanged.

## Source findings and corrections

- **15:** the Greek editions print God versus Son at John 1:18; the English editions express those readings differently. John 1:1 includes the Word-was-God statement in all seven, with different languages, capitalization and punctuation. The approved correction avoids claiming literally identical text. BSB/MSB each have a separate idiom-rendering note, while their first notes include textual and rendering information. App labels distinguish these roles without changing publisher wording.
- **26:** the local Greek forms are Ὃς versus θεὸς/Θεὸς. The YLT quotation is corrected to “God was manifested.” The manuscript account is explicitly reported from Larry’s book, and its lack of independent manuscript/apparatus checking appears next to the account as well as in C7. The admitted material is specific to this candidate; it creates no blanket permission for other notes. Structured `attestations` remain empty: the app has not independently established witness readings.
- **28:** BSB/BLB/MSB/N1904/RP2018 name tree; YLT reads “scroll of the life,” and Boyd reads book. The false six-versus-one claim is corrected to five-versus-two. MSB’s two source notes are separately labeled for the verb and noun. The note explicitly discusses two issues, without pretending these exhaust every Greek wording difference. The two issues remain in distinct prose paragraphs at one anchor; no invented word alignment or extra service is needed.
- **29:** Nestle joins canonical 12/13 under source 12 and numbers canonical 14 as source 13. The other six have source verses 12–14. Amen is present in MSB/YLT/RP/Boyd and absent in BSB/BLB/Nestle. BSB note 31 and MSB note 89 each combine numbering with Amen; MSB note 88 concerns “our.” The approved corrections distinguish the effect of numbering itself from wording differences and describe the shared benediction without claiming identical English renderings.
- **30:** Nestle splits source verses 14/15; the other six join the same closing material under 14. Separately, Nestle prints σε ἰδεῖν while RP/Boyd print ἰδεῖν σε. The corrected prose acknowledges that word order and limits “no words changed” to numbering itself. The book self-citation now names Larry in the prose. BSB/MSB’s identical note combines a literal rendering with a numbering observation.

Approved reciprocal links **15↔26** and **29↔30** are emitted. Existing links are unchanged. The recommended extension of `join`/`renumbered` to omissions is not adopted: those types express numbering relationships, not textual absence. The already-implemented reviewed partial-verse `focus` spans address 01/16/20 without changing immutable corpus mappings or confusing the two concepts.

## Book and confessional verification limits

The supplied *Ad Fontes – Volume One*, second edition (September 2026), was visually checked at printed pp. **250, 254–256, 288 and 381** (PDF pages 264, 268–270, 302 and 395). Page 288 supports the attributed higher-Christology observation; its locator is corrected to the actual page rather than repeating the worksheet’s chapter attribution. Page 250 describes the written forms; pp. 254–255 state the manuscript correction-layer account; p. 381 supports the verse-numbering attribution. No copyrighted Scripture excerpts from the PDF enter public assets. These checks verify attribution to the book, not independent historical truth.

The same article-level AC III/Nicene summary was checked during batch 4 against [CPH’s AC III](https://bookofconcord.cph.org/en/augsburg-confession/chief_articles/article_iii/) and [Nicene Creed](https://bookofconcord.cph.org/en/ecumenical-creeds/nicene-creed/). The specifically cited Kolb–Wengert print edition was not inspected; no confessional text is reproduced.

**Separate archival source concern:** candidate 26’s optional D/F list follows printed p. 255 in naming Codex Bezae at 1 Timothy. [Cambridge University Library’s collection description](https://specialcollections-blog.lib.cam.ac.uk/?p=15340) identifies Bezae as Gospels, Acts and a fragment of 3 John. That identification cannot support a Pauline-verse claim as written. The issue is recorded for the author; no substitute manuscript/reading is guessed. D/F remains unpublished, and Bezae is not named in the public A–C account. This catalog check does not verify the other witnesses, their readings, corrector chronology, versions or the book’s secondary references. No manuscript images, apparatus or Jongkind text were examined, and no additional witness claim was added.

## Verification

- Full offline import reproduced all seven corpus releases and the separate analysis release.
- **30 Node test groups and 11 Python fidelity tests passed**, as did typechecking and production build.
- New regression checks cover YLT’s book/scroll reading, YLT’s exact Timothy wording, Greek word order, joined/renumbered verse output, Amen presence, publisher-note distinctions, exact returned-plus-approved prose, contribution hashes and reciprocal links.
- Browser: all five explanations loaded with seven edition cards and no alerts. John’s chapter marker opened by keyboard; both reciprocal link pairs worked with Enter. Escape from the John/Timothy study flow returned to the original John chapter and focused the invoking marker.
- The manuscript verification limit was visible beside the account; C7 keyboard navigation focused the exact citation. The archival Bezae material was absent from the public note.
- Revelation showed the corrected count and the actual YLT text; its two MSB publisher notes opened and retained distinct noun/verb labels. Corinthians showed two Nestle source verses versus three in other editions; 3 John showed two Nestle verses versus one joined segment in the other six, without duplication.
- Phone reload/layout checks at 320px and 390px and desktop at 1280px showed no horizontal overflow. No full accessibility certification or physical-device test is claimed.

## Next

Receive batch 6 (04/11/17/27), resolve the four pending batch-4 corrections, and complete the remaining M3 editorial/source/analysis acceptance. M4 remains the next milestone after M3 acceptance; this is still a local engineering preview.
