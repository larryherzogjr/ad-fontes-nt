# OT English source selection — 2026-10-07

## Scope and authority

Larry authorized the first OT source-selection step after agreeing on a future whole-Bible reading environment, NT-to-OT connections and the public name **Ad Fontes: A biblical study environment from Ordinary Means**. This is an expansion decision, not a retroactive change to NT milestone acceptance. The existing application name and technical signing/package/updater identities are unchanged in this step.

This review inspects existing pinned artifacts only. No upstream replacement, importer change, new corpus release, public bundle, deployment or editorial publication is included. The NT-only handoff remains the historical baseline; this document records the newly authorized direction.

## Findings and proposed edition set

| Edition | Pinned OT inventory | Proposed role | Qualification |
| --- | --- | --- | --- |
| BSB | 39 books, 929 chapters, 23,145 verse rows | Default OT reading edition | Official TXT remains text authority; USJ structure and notes need a separate OT reconciliation. |
| BLB | 39 books, 929 chapters, 23,145 verse rows | Literal comparison, explicitly labeled Draft | Existing September 5 artifact already contains the OT. Header identifies an early draft; supplied-word brackets must remain intact. No structured notes/headings are supplied by this TXT. |
| MSB | 39 books, 929 chapters, 23,145 verse rows | Retain selected-edition continuity | Every inspected OT TXT address and its text match the pinned BSB TXT exactly. It adds no independent OT translation. MSB USJ structure/notes still require review. |
| YLT | 39 books, 929 chapters, 23,145 verse rows | Distinct historical literal comparison | Preserve the pinned 1898 transcription label, archaic English, and supplied-word brackets. USFX structure/text must be reconciled with VPL for OT independently of the existing NT checks. |

**Recommendation:** prepare all four existing English selections for OT reading, using BSB as the default. BSB, BLB Draft and YLT provide three distinct translation choices; MSB provides continuity with a clear BSB-OT disclosure. No additional English translation is necessary for this first expansion. This recommendation is source selection, not approval to publish the OT bytes or notes.

The earlier conversation's uncertainty about BLB coverage is resolved by inspecting the pinned full-Bible TXT. No newer BLB download is needed to obtain these 39 books.

## Evidence and verification performed

[Machine-readable audit](OT-English-Source-Audit-2026-10-07.json) records every inspected artifact's full SHA-256, agreement with its existing M2 manifest, and per-book chapter/verse-row inventories. All artifact hash checks passed. All four TXT/VPL inventories contain 39 OT books and no empty captured OT verse text rows. BSB and MSB have identical OT address sets and zero differing OT text rows. A separate line scan found zero duplicate OT addresses and zero internal verse-number gaps from 1 through each chapter’s highest captured verse. Both USJ archives contain 66 book files; their OT content has not been fully reconciled in this selection review.

Inventory method: parse source lines as book name/code, chapter, verse and text; take books before Matthew/MAT in source order; count distinct chapters and captured verse addresses. YLT uses `engylt_vpl.txt` inside its pinned VPL archive. Berean TXT is UTF-8 except MSB, decoded as Windows-1252 according to its source manifest. Compare BSB and MSB at exact decoded verse-text strings, without accent, punctuation or wording normalization.

These counts establish available source inventory, not exhaustive fidelity certification. The preliminary inventory stores rows by address; independent expected-address checking, chapter continuity, Psalm titles, poetry, joined/split verses, note attachment, and structured-source reconciliation remain release gates. A universal verse count must not replace edition-specific checks.

## Rights and provenance

- BSB/MSB: archived `sources/bsb/evidence/terms.html` records the April 30, 2023 public-domain dedication for Berean and Majority Bible texts. Existing BSB/MSB manifests retain exact artifacts and evidence; MSB also retains repository licensing evidence for its structured source.
- BLB: the pinned TXT header explicitly dedicates the text to the public domain and calls it an early draft. Existing `sources/blb/m2-manifest.json` records this alongside publisher evidence and the Berean terms reference.
- YLT: archived `sources/ylt/evidence/copr.htm`, details and metadata identify the public-domain transcription and 1898 edition. The USFX/VPL hashes remain those of the existing NT release inputs.

These findings support selecting the Scripture candidates. They do not automatically clear every ancillary layer, font, image, commentary or modern lexical resource. Publisher notes and structure must retain their own provenance and OT review.

Current publisher cross-checks from the preceding discussion: [Berean downloads](https://berean.bible/downloads.htm) lists the complete BSB; [MSB publisher](https://majoritybible.com/) describes BSB OT plus Byzantine NT; [BLB publisher](https://literalbible.com/) advertises a full draft while the central download listing still labels BLB NT; [YLT inventory](https://ebible.org/engylt/) lists all OT books. These live-page observations do not replace saved evidence or pinned files.

## Next work and backlog

| ID | Work | Completion boundary |
| --- | --- | --- |
| AFOT-001 | English source selection | This review and pinned inventory completed; proposed edition set recorded. |
| AFOT-002 | OT references and source mappings | Define a new OT registry/release strategy; audit all 39 books, numbering, superscriptions and structured sources. Preserve predecessor NT registry/release bytes. |
| AFOT-003 | OT imports and fidelity | New reviewed releases with per-edition inventories, duplicate/gap checks, TXT/USJ or USFX/VPL reconciliation, explicit differences and output checksums. Never freeze unexplained failures. |
| AFOT-004 | OT reading and English comparison | Navigation, search, notes and version comparisons; NT Greek/group labels must not become OT classifications. Browser/keyboard/phone checks and required application gates. |
| AFOT-005 | NT-to-OT connections and Septuagint selection | Separate source/editorial review; distinguish quotations, allusions and edition-specific Greek wording. No inferred word alignment. |
| AFOT-006 | Coordinated public rebrand | Exact approved name/subtitle across public surfaces, preserving technical identities; prepare for review with the OT reading release. |

First reading scope is the 39-book OT represented in these English sources. Septuagint book inventory and treatment of additional books need their own explicit decision. Hebrew/Aramaic enrichment remains a later phase. No existing NT analysis or approved commentary is reclassified or implicitly extended to OT passages.
