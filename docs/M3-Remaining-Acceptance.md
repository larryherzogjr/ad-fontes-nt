# M3 remaining review and acceptance

Prepared 2026-09-05 for Larry Herzog Jr. **Accepted by Larry Herzog Jr. on 2026-09-05.** All 30 initial explanations have already been individually approved and locally published. Their approval is not being reopened. This checklist covers the remaining Greek/source review and product acceptance; it does not certify every historical claim or close unfinished engineering work.

## 1. Qualified Greek analysis review — AFNT-019/021

Please inspect each sample in the local Greek explorer. Check the selected surface form, lemma (standard form), readable parsing, contextual gloss, historical dictionary label, and at least two occurrence snippets. Record whether the analysis is correct and whether the display could mislead a lay reader. These four samples already agree with a separately sourced RP2018 parsing file in automated checks; that agreement is evidence for a human review, not a substitute for one or a claim that both editions always agree.

| Open sample | Imported analysis to review |
|---|---|
| [John 1:1 · Λόγος](http://localhost:3000/read/JHN/1?translation=BSB&passage=JHN.1.1&panel=greek&token=JHN.1.1%215) | Lemma λόγος; N-NSM (noun, nominative singular masculine); Strong’s 3056; contextual gloss “Word.” |
| [Romans 3:23 · ἥμαρτον](http://localhost:3000/read/ROM/3?translation=BSB&passage=ROM.3.23&panel=greek&token=ROM.3.23%213) | Lemma ἁμαρτάνω; V-2AAI-3P (verb, second aorist active indicative, third person plural); source Strong’s field 264&5627; gloss “have sinned.” |
| [Philippians 2:6 · μορφῇ](http://localhost:3000/read/PHP/2?translation=BSB&passage=PHP.2.6&panel=greek&token=PHP.2.6%213) | Lemma μορφή; N-DSF (noun, dative singular feminine); Strong’s 3444; gloss “[the] form.” |
| [Philemon 4 · Εὐχαριστῶ](http://localhost:3000/read/PHM/1?translation=BSB&passage=PHM.1.4&panel=greek&token=PHM.1.4%211) | Lemma εὐχαριστέω; V-PAI-1S (verb, present active indicative, first person singular); source Strong’s field 2168&5719; gloss “I thank.” |

Source material: Ulrik Sandborg-Petersen’s Nestle 1904 morphology v1.3, archived Berean interlinear glosses, Strong’s original Greek Dictionary XML v1.4. Independent sample comparison: pinned RP2018 with-parsing CSV. Exact artifacts, rights evidence and matching rules: [M3 source decisions](M3-Source-Decisions.md), `sources/m3/manifest.json`, `sources/m3/reconciliation.json`, and `tests/m3_fidelity_test.py`. The source-decisions document’s original editorial counts are historical; the current queue has 30 published explanations.

Decision: **accept this sampled analysis/display / corrections required / additional qualified reviewer needed**.

Reviewer, references actually consulted, sample-specific findings, and any further samples required:

> To be completed.

## 2. Accept the disclosed scope of the Greek tools — AFNT-019/020

Please assess whether the following scope is appropriate and sufficiently clear for M3:

- The explorer analyzes the named historical Nestle 1904 text, not a modern critical edition or an English reverse interlinear. BGB availability and exact MSB Greek-source identity remain unresolved source questions; no alignment is invented.
- 7,940 source verses have matched analysis. [2 Thessalonians 2:13](http://localhost:3000/read/2TH/2?translation=BSB&passage=2TH.2.13&panel=greek) and [1 Timothy 1:16](http://localhost:3000/read/1TI/1?translation=BSB&passage=1TI.1.16&panel=greek) remain readable Scripture with explicitly unavailable analysis because apostrophe forms do not match. Twenty-eight analyzed verses lack matched contextual glosses. These are enrichment gaps, not absent Scripture.
- Occurrences describe the indexed Nestle subset, grouped by the source lemma, not by an assumed one-to-one Strong’s identity. No English word alignment is established.
- Selected-form transliteration is a display aid. Strong’s written historical pronunciation belongs to its standard form and is not necessarily the selected inflection. It is not audio or a reconstructed Koine pronunciation claim.
- Contextual glosses and historical dictionary entries are source aids, not Ordinary Means interpretation or exhaustive definitions.

Decision: **accept these disclosed limits for M3 / changes required**.

Required changes, if any:

> To be completed.

## 3. Product acceptance of the existing study experience — AFNT-018/020/021

Please try these tasks as a reader/teacher:

1. Select Scripture in the reader and open Compare editions or Explore Greek. Is the route discoverable and the selected range clear?
2. Open [Mark 16:9–20](http://localhost:3000/read/MRK/16?translation=BSB&passage=MRK.16.9-MRK.16.20&panel=compare&unit=candidate-11), [Luke 22:43–44](http://localhost:3000/read/LUK/22?translation=BSB&passage=LUK.22.43-LUK.22.44&panel=notes&unit=candidate-13), and [1 John 5:7–8](http://localhost:3000/read/1JN/5?translation=BSB&passage=1JN.5.7-1JN.5.8&panel=compare&unit=candidate-27). Can you distinguish Scripture, publisher notes, Ordinary Means commentary, and a partial clause from an entire absent verse?
3. Follow an explanation citation and a related-note link. Close with Escape, Close, or the outside reading area where visible. Reopen a direct link. Does the context stay understandable?
4. Use a Greek sample above: select a word, inspect its standard form and aids, follow an occurrence, and return. Are the highlighted word and source limits clear?
5. Try the views on a phone or narrow window. Record any difficult controls, distracting layout, or misleading labels.

Decision: **accept the current experience for M3 subject to remaining engineering checks / changes required**.

Observations, passage/device and requested changes:

> To be completed.

## Engineering work still owned by Codex

- Complete and test subtle, accessible verse-level commentary markers across the 30 units, including absent verses and cross-chapter passages. Current commentary buttons are at chapter level. Human approval cannot substitute for implementing this.
- Recheck direct-link, keyboard/focus/return and unavailable-data behavior for the final marker implementation; retain exact source-span and approval-hash validation.
- Reconcile old status language and produce the final M3 acceptance record with the actual human decisions, evidence and any unresolved conditions. Existing verification: 33 Node groups, 11 Python tests, typecheck/build and focused browser checks passed before this checklist.

M3 is complete only when required engineering work and qualified review are complete. M4 then introduces local personal notes and verified passage-linked Ordinary Means resources. No public deployment is requested by this checklist. Previously disclosed manuscript/apparatus limitations remain in force; no additional witness verification is implied by accepting this experience.

## Recorded acceptance

Larry Herzog Jr. replied **“All accepted/approved.”** to the three-item review prompt on 2026-09-05. This records acceptance of (1) the sampled Greek analysis/display, (2) the disclosed Greek-tool scope and limits, and (3) the existing study experience, subject to the remaining engineering checks. No time of day, additional reference consulted, device used, or sample-specific written findings were supplied; none is inferred. This is not an independent manuscript/apparatus audit or an approval of unspecified future changes.

The engineering completion and final verification are recorded separately in [M3 acceptance](M3-Acceptance.md). The original checklist and unfilled detail prompts above are retained to show precisely what was presented.
