# Ad Fontes NT — textual commentary review handoff

**A New Testament study environment from Ordinary Means.**

Packet ID: **AFNT-M3-REVIEW-2026-09-05-v1**  
Prepared: September 5, 2026  
Prepared by: Codex, from the project's archived edition releases and editorial brief  
Designated final textual reviewer: **Larry Herzog Jr.**  
Status: **commissioning and review packet; no explanatory prose or publication approval supplied**

## Start here

This packet can be forwarded to a human reviewer without access to the application, source repository, or earlier conversations. Read this brief, then complete [candidate-18 — Acts 8:37](worksheets/candidate-18.md) first. Return that completed Markdown worksheet. The other 29 worksheets are an available queue, not a request to finish all 30 before returning the first example.

The assignment combines **source review and authorship of the missing explanation**. There is currently no finished commentary for the reviewer merely to endorse. Each worksheet supplies exact readings from the editions used in the application, relevant publisher notes, source locators and fill-in fields. The reviewer is asked to write the explanatory prose described below, or to identify a separate author and then review that author's work. Do not assume that Larry is the author simply because he is the reviewer.

If an outside scholar prepares or reviews a worksheet, identify that person and their role. Larry remains the designated final reviewer unless the product owner explicitly changes the assignment. Outside review and final approval have separate fields.

## 1. Product and audience

Ad Fontes NT is a New Testament reading and study environment for serious lay readers, Bible-study leaders and teachers. BSB is the foundational English reader. Readers can compare named English and Greek editions, explore Greek, and return to reading without leaving the passage.

The work is a locally runnable M3 engineering preview, not a completed MVP or a public release. All 27 NT books are readable. Comparison and Greek tools work. There are **30 draft textual candidates and zero published explanations** at the time of this packet. Later personal notes, resource libraries and pilot work are outside this review assignment.

The reader may have no knowledge of Greek, manuscript terminology or Lutheran confessional documents. The public explanation should answer an actual reading question in plain English, then offer more evidence for someone who wants it. It should stand alone without this packet or prior conversations.

## 2. Exactly what to return for one candidate

Complete the worksheet's **Reviewer's response** section, retaining its candidate ID and packet ID. Leave the supplied evidence unchanged; report corrections in the correction table.

Required deliverables:

1. **A source verdict:** Are the displayed edition readings, verse treatment, notes and canonical range accurately represented? Identify each needed correction with a precise source locator. If the candidate does not warrant a textual note, say so; rejection is a useful result.
2. **A concise public title** identifying the question, generally 4–12 words. Avoid titles that prejudge disputed textual history.
3. **Source-observation prose:** one or two paragraphs explaining what differs and what the cited sources support.
4. **Local significance/interpretation prose:** one or two paragraphs explaining the difference's effect on reading this passage, including warranted uncertainty and any clearly attributed theological interpretation.
5. **A claim-to-source citation table:** complete source identity and exact locator for every substantive historical, textual or theological claim. Distinguish quotations, paraphrases and your own inference.
6. **Real authorship, contribution provenance and permission information**, plus a clearly scoped review decision and date.

An unresolved evidence question may be returned as **changes requested / not ready for publication**. Do not fill gaps with plausible-sounding claims. The developer will handle JSON, references, content hashes, validation and app integration; the reviewer does not need to edit code or manufacture an approval hash.

## 3. Scope and nature of the public commentary

### A. Source observation — required public prose

Suggested length: **100–180 words**. This is a recommendation, not a quota. Use fewer words for a simple case; explain why a longer unit needs more.

Answer these questions in connected prose:

- What wording, clause, verse, punctuation or placement is at issue?
- Which **specific named editions** print it in main text, omit it from main text, bracket it, move it, or discuss it in a note?
- Is the observed difference in Greek wording, in English translation technique, or in numbering/layout? If these overlap, distinguish them.
- What background is needed to understand the evidence? Define unfamiliar terms briefly.
- Which historical conclusions are actually supported by your additional research, and which remain uncertain?

Begin with what the reader can observe. Printed editions are not manuscript witnesses. Publisher notes may themselves make claims; attribute those claims instead of silently adopting them. Do not say an edition “deleted” or “added” text merely because our local comparison shows presence/absence. Those words can imply a historical direction requiring evidence.

Current application destination: `significance.sourceObservation`. The proposed title maps to `title`.

### B. Local significance and interpretation — required public prose

Suggested length: **100–180 words**, usually keeping A and B together to roughly **200–350 words** for the first panel view. This is a short passage-specific textual note, not a sermon, comprehensive commentary, academic apparatus or position paper on all textual criticism.

Explain:

- What does this difference change in the immediate sentence, narrative, emphasis or argument?
- What remains clear from the surrounding passage? Cite that context where it supports a substantive claim.
- What can a reader or teacher responsibly say, and what conclusion would exceed the evidence?
- If there is an interpretive or theological implication, what exactly is it, whose judgment is it, and what supports it?

Do not force a theological application into every note. If significance is limited or unresolved, state that specifically and explain why. Avoid automatic reassurance that “no doctrine is affected,” automatic alarm that the reading threatens faith, or a blanket ranking of entire Bible traditions.

Current application destination: `significance.interpretation`. These paragraphs will be visibly categorized as **Ordinary Means commentary**, with appropriate attribution, and will not be inserted into Scripture or publisher footnotes.

### C. Optional further detail and teacher note

A difficult unit may need **300–800 additional words** of evidence, competing explanations or teaching cautions. This is optional and separately labeled. A short teacher note or a few suggested reading links are also welcome if supported by evidence.

Do not hide material qualifications in optional detail while making an overconfident claim in the short explanation. The current application publishes the two required prose fields; extended detail and additional presentation fields must receive an explicit storage/display decision during integration. They will not silently be discarded or treated as already rendered.

## 4. Ordinary Means editorial voice

Fixed product requirements:

- Treat Scripture reverently and preserve every quoted edition's actual wording.
- Keep Scripture, publisher notes, Ordinary Means commentary, confessional sources, personal notes and any future AI material distinct.
- Represent named editions and competing readings fairly. Avoid sensational labels such as “corrupted Bible,” and do not count displayed translations as independent manuscript votes.
- Preserve Ordinary Means' **Lutheran/confessional identity**, while making the note understandable without confessional training. Do not invent a narrower denominational affiliation or an unprovided institutional doctrinal policy.
- Cite a confession by work, article/section and edition/translation when relevant. Label quotation versus summary. A historical work and a modern translation can have different rights.
- Do not describe this curated collection as exhaustive. An unmarked passage is not a claim that no variants exist.

Recommended tone: clear, restrained, charitable and useful for teaching. Use specific statements and ordinary words. Explain “Textus Receptus,” “manuscript,” or other necessary technical language rather than assuming it is known.

No authentic Ordinary Means writing samples, full doctrinal style guide, or pre-existing approved explanations were supplied for this task. Identify any additional style or theological authority you use. Any contributor's use of AI assistance should be disclosed in the contribution-provenance field; human review does not erase drafting history. This packet's instructions were prepared by Codex; its source extracts were generated mechanically from archived application data, not composed as Scripture or attributed commentary.

## 5. Where the supplied material comes from

The worksheets are snapshots of **the seven exact local releases**, not fresh transcriptions of live web pages. The source files were previously imported and mechanically reconciled. That engineering verification does not substitute for this qualified textual/editorial review.

| Group used in the interface | Named editions | Important boundary |
|---|---|---|
| Critical/Eclectic | BSB; BLB publisher draft; Nestle 1904 historical critical Greek | Nestle is a documented fallback, not asserted to be the exact Greek behind BSB/BLB; the English editions are not independent manuscripts |
| Byzantine Majority | MSB; Robinson–Pierpont 2018 | MSB's exact underlying RP release remains unspecified; do not assume uniform agreement |
| Textus Receptus | YLT 1898; Boyd TR compilation (2022) | YLT is not a translation of the selected Boyd compilation; TR editions are not uniform |

See [Source register](Source-Register.md) for release identities, publishers, archived artifact URLs and checksums. Each worksheet's **S1–S7** labels are local to that worksheet and correspond to the named editions. Citation labels are identifiers, not proof of every possible claim about an edition.

The ZIP includes complete relevant **chapter JSON snapshots**, their original source IDs/structured notes, release manifests, output checksum inventories, the original draft candidate records and this packet's file checksums. These are portable evidence without a running application. Full upstream Bible archives and a manuscript apparatus are not included; the source register identifies the archived originals by URL and hash. Live upstream files may change. If a current website disagrees with a supplied extract, report the difference rather than silently replacing the reviewed edition.

### What the material establishes, and what it does not

- Main-text presence or absence, source placement, literal punctuation/brackets and supplied publisher-note wording can be checked against the included snapshots.
- A missing verse in an edition is distinct from unavailable application data. Do not infer absence from a blank result or failed load.
- Supplied-word brackets, editorial textual brackets and ordinary punctuation are not interchangeable. Verify their function in that particular source.
- The data may contain a publisher's claim about a manuscript or another edition. That remains a publisher claim until independently checked or explicitly attributed.
- Manuscript support, dates, provenance, early citations, earliest attestation, scribal motives, originality and direction of change require **additional identified evidence**. The supplied edition comparison alone does not establish them.

## 6. Additional research and citations

Consult suitable primary textual evidence, the actual edition's apparatus or editorial documentation, and reliable scholarly discussion as needed. This brief does not prescribe or assert access to a particular copyrighted apparatus. Cite whatever you actually examine. No scholar, source, manuscript siglum or date should be invented to make a note look complete.

For each important claim, record:

- Claim ID (C1, C2, ...), and the sentence/field it supports.
- Author/editor, full work title, edition/version and year where known.
- Page, section, apparatus entry, manuscript folio, verse or other exact locator.
- Stable URL/DOI where available, and access date for web material. A paywalled or print source can still be cited precisely; identify access limitations.
- Whether the evidence is a direct observation, source quotation, paraphrase, or your reasoned inference.
- For manuscript claims: the precise witness identifier, what reading is actually attested, and the source supporting it. Distinguish extant support, absence, a lacuna and uncertainty.
- Any quotation/translation rights concerns. Prefer your own concise synthesis to reproducing a copyrighted commentary.

The supplied homepages and raw-artifact links are provenance entry points. They are not substitutes for exact locators supporting new historical or interpretive claims.

## 7. Specific first assignment: Acts 8:37

Complete [candidate-18](worksheets/candidate-18.md). Its canonical anchor is `ACT.8.37`; the packet includes BSB Acts 8:35–39 as narrative context.

Questions for this unit:

1. Confirm the displayed treatment in all seven editions. In particular, check that absence in the local MSB and RP2018 main texts is represented correctly rather than assuming the Byzantine group agrees with the TR group.
2. Distinguish the verse printed in YLT/Boyd main text from BSB/MSB's publisher note attached to source verse 8:36. Check the meaning of YLT's printed brackets before describing them.
3. Write a plain explanation of why a reader can encounter a missing verse number here. Separate that observable situation from any historical explanation requiring additional evidence.
4. Explain what the presence or absence of the confession exchange changes in this immediate baptism narrative. If discussing confession, faith, baptism or a Lutheran/confessional interpretation, make the scope precise and supply appropriate support. Do not treat a comparison of editions alone as deciding that doctrinal question.
5. Identify what a teacher should avoid overstating, and what historical questions remain unresolved in the material actually examined.

No answer to those questions is pre-approved or embedded as commentary in the worksheet. The first completed note will also serve as a proposed style model for later notes, subject to separate approval; it does not automatically approve other candidates.

## 8. Return process and decision meanings

1. Work in a copy of a worksheet. Preserve packet ID, candidate ID, source labels and the supplied evidence section.
2. Fill the response fields. Replace placeholders with actual prose or an explicit explanation of what is unresolved. Unfilled fields are not approval.
3. Complete the contribution and review records. Keep author, external consultant and final reviewer distinct where applicable.
4. Save as, for example, `candidate-18-RETURNED-2026-09-12.md`, using the actual return date. Markdown is preferred; a Word document with the same labeled fields is acceptable. Do not assume the example date is a review date.
5. Return the completed file and any permitted supporting attachments to the product owner, who will give them back to Codex. Keep the original packet for reference. No accounts, application access, code editing, deployment or direct messaging by Codex is needed.

Choose one decision and identify the exact document revision it covers:

- **Not reviewed:** preparation or incomplete work only.
- **Changes requested:** the note is not ready; list changes and unresolved questions.
- **Rejected as a candidate:** explain why it should not become this kind of note; keep the record.
- **Textual review complete; final approval pending:** useful for an outside consultant's return. Identify who must act next.
- **Approved for the specified local Ad Fontes NT commentary record:** only the designated final reviewer should choose this after reviewing the complete exact prose, citations, readings and attribution. This does not authorize public deployment, approve the full corpus or approve the rest of the queue.

On return, Codex will preserve the submitted document, map the fields, compare any corrections with source data, and validate the resulting record. Clear approval for the exact final content can be recorded; materially altered prose, new claims, changed evidence or incomplete permission information will require resolution before publication. No new substantive wording will be passed off as already approved. Content hashes are an engineering check, not a substitute for a human decision.

## 9. Acceptance checklist for the completed prose

- [ ] I can explain the difference without relying on an English wording difference as proof of a Greek variant.
- [ ] Every displayed reading and treatment is tied to a named edition/release; proposed corrections are explicit.
- [ ] My historical claims have evidence beyond merely counting these editions.
- [ ] Source observation, my inference and theological interpretation are distinguishable.
- [ ] The immediate context and limits of significance are explained, without stock alarm or reassurance.
- [ ] A thoughtful lay reader can understand the short explanation without Greek or confessional prerequisites.
- [ ] Quotations, authorship, contribution provenance, citations and permission questions are recorded.
- [ ] My decision applies only to the exact completed candidate/revision identified in my response.

These checklist boxes are deliberately unmarked. The worksheet repeats the essential approval fields so each returned file can stand on its own.

## 10. Packet contents

- [Queue and worksheet index](Review-Queue.md): all 30 draft candidates with stable IDs.
- [Source register](Source-Register.md): exact editions, layers, archive identifiers and source URLs.
- `worksheets/`: one independently returnable Markdown worksheet per candidate, with exact source extracts and response fields.
- `evidence/corpus/`: unchanged chapter bundles used in the extracts, including source paragraph/note distinctions.
- `evidence/manifests/`: unchanged source release manifests and output checksum inventories.
- `evidence/draft-candidates.json`: the original unapproved queue snapshot.
- `packet-manifest.json`: SHA-256 of every other distributed packet file. It identifies the original handoff, not a completed review or signed approval.

Use the worksheets, not the original product handoff's historical milestone status, as the current review assignment. Final public-release approval and the wider MVP remain outside this packet.
