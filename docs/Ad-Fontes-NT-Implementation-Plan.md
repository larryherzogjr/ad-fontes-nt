# Ad Fontes NT — Implementation Plan

**A New Testament study environment from Ordinary Means.**

Version 1.0 · September 5, 2026 · Planning artifact; no implementation completed yet

Basis: [Product and engineering handoff](Ad-Fontes-NT-Handoff.md). Corpus evidence and editorial rules live in that document; this plan operationalizes them.

## 1. Recommended implementation boundary

Build one web application with independent modules for references, corpus access, search, textual variants, Greek analysis, resources, and notes. Publish verified public-domain Scripture as versioned local assets. Keep private notes in a separate browser store for the MVP. Add a server-side private store only when account synchronization is intentionally scheduled.

Start with the full BSB NT reading path. Complete the other English editions and one named Greek edition per textual grouping before calling the intended MVP complete. A BSB-only prototype is a useful milestone, not a substitute for the requested product.

The source choices remain conditional on file-level review: BGB preferred for critical/eclectic Greek, Nestle 1904 as fallback; RP2018 for Byzantine; Boyd's explicitly labeled TR compilation as a concrete candidate. A historical Scrivener or Stephanus source can replace that TR candidate if verified before fixtures freeze. Do not manufacture equivalence between these Greek editions and the English translations.

A TypeScript web frontend with static corpus delivery is the working technical direction. Framework, host, server runtime, and database version are setup decisions, not prerequisites to understanding the domain model. Use Sites' applicable build/hosting workflow when the website implementation begins in this environment; these planning files do not create or publish a site.

## 2. Decision log

| ID | Decision | Status | Reason / revisit trigger |
|---|---|---|---|
| D01 | NT-only with all 27 books | Fixed | Coherent first product; OT is a separately scoped expansion. |
| D02 | Exact supplied name and subtitle | Fixed | Preserve Ordinary Means identity. |
| D03 | Local BSB foundation and domain-level corpus interfaces | Fixed | Avoid a single Bible API dependency. |
| D04 | Canonical uppercase reference registry with explicit external mappings | Fixed convention; mappings to implement | Passage identity survives translation changes. |
| D05 | Three groupings with edition-specific readings | Fixed | Avoid conflating TR and Byzantine or treating critical editions as uniform. |
| D06 | Curated variant publication | Recommended | Editorial accuracy is the constraint; revisit coverage after pilot. |
| D07 | Local notes and export/import before sync | Recommended | Delivers personal study without identity infrastructure; revisit if pilot requires multiple devices. |
| D08 | Reviewed Greek edition explorer before full reverse interlinear | Recommended | Enables Greek study without invented word mappings. |
| D09 | Separate content types and provenance | Fixed | Scripture, interpretation, confessions, and AI are distinct. |
| D10 | No AI, billing, group workflows, NET, or ESV in MVP | Fixed initial scope | Not required for core study jobs; add only through later scope decisions. |
| D11 | Static public data within a modular application | Recommended | Practical delivery with room for later services. |
| D12 | 25–40 variants; 10–20 resource links | Proposed launch targets | Confirm against reviewed inventory; changes must be visible, not silently treated as done. |

## 3. Milestone sequence and dependencies

```text
M0: sources, references, editorial rules, technical setup
 -> M1: complete BSB NT reading/search
 -> M2: English/Greek imports and reference reconciliation
 -> M3: curated comparison + Greek explorer
 -> M4: notes + passage-linked resources
 -> M5: pilot, corrections, release verification
```

Resource inventory, editorial drafting, and note design may proceed alongside corpus engineering once their input contracts are stable. This is a dependency observation, not a request to delegate work to additional agents.

Suggested effort envelope: 8–12 full-time engineering weeks plus ongoing product/editorial work for a polished pilot, assuming usable source files and no account sync. This is an estimate, not a schedule commitment. A source-format problem or unavailable qualified reviewer can extend it materially. Re-estimate after M1 using actual import and review effort.

| Milestone | Working effort range | Demonstration |
|---|---|---|
| M0 | 3–5 engineering days, editorial work begins | Source manifests, frozen reference convention, sample mappings, selected deployment path |
| M1 | 5–8 days | Read any BSB NT chapter, navigate/search, follow a deep link |
| M2 | 8–12 days | Switch English editions; display named Greek texts and explicit coverage states |
| M3 | 10–15 days, editor availability dependent | Open reviewed variant panels and Greek word occurrences |
| M4 | 5–8 days | Create/export/import notes; open verified passage resources |
| M5 | 5–10 days | Pilot tasks, fixes, verified release report |

## 4. Initial implementation backlog

Priority: **P0** = prerequisite, text integrity, or release blocker; **P1** = required MVP experience; **P2** = explicitly later. Size: **S** roughly 0.5–1 day, **M** 2–3 days, **L** 4–6 days. Sizes exclude external permission response time and scholarly review. They are relative estimates; they do not add to a guaranteed delivery date.

Roles indicate responsibility, not staff already assigned. “Engineer” may be the same person across tickets; product owner and textual reviewer need not be.

### M0 — Foundation

| Ticket | Priority / size / owner | Work and acceptance criteria | Dependencies |
|---|---|---|---|
| AFNT-001 | P0 / M / Content steward + engineer | Create source registry for four English and three Greek slots. Record source URLs, edition labels, exact artifacts, hashes, rights evidence, ancillary-layer decisions, and unresolved flags. No artifact is marked approved solely because it is downloadable. | None |
| AFNT-002 | P0 / M / Engineer | Define all 27 book codes, ordering, aliases, chapter/verse anchors, ranges, and external-ID mappings. Resolve `Romans 3:23` and `ROM.3.23` identically; reject invalid NT references; retain absent-in-edition anchors. | None |
| AFNT-003 | P0 / M / Product owner + textual reviewer | Adopt content labels, variant review rubric, significance language, and correction workflow. Nominate 25–40 variant candidates and identify a human reviewer. Approve one worked sample only after source checking. | AFNT-001 |
| AFNT-004 | P0 / S / Engineer | Select deployment path and scaffold modules, content schemas, local data locations, release manifest, and validation commands. Document one reproducible local startup path; no live external Bible key needed. | D11 |
| AFNT-005 | P1 / M / Product owner + designer | Create reading, variant, word, and note states for desktop and mobile. Exact name/subtitle included; authentic Ordinary Means assets used when supplied. Prototype placeholders are labeled, not passed off as approved branding. | AFNT-003 |

### M1 — Reading vertical slice

| Ticket | Priority / size / owner | Work and acceptance criteria | Dependencies |
|---|---|---|---|
| AFNT-006 | P0 / L / Engineer | Import pinned BSB NT with paragraph, poetry, heading, and footnote roles. Preserve raw files; emit duplicate/gap/unmapped reports. Account for all 27 books and every expected source segment; unexplained missing data fails the build. | 001, 002, 004 |
| AFNT-007 | P0 / M / Engineer | Implement reference resolver and local corpus interface. Responses identify edition/release, coverage state, and ordered segments. Unknown references, unsupported edition, and load failure are distinguishable. | 002, 006 |
| AFNT-008 | P1 / L / Engineer | Build chapter reader, book/chapter picker, reference entry, previous/next, type-size setting, resume location, and share links. Direct links work after refresh; selected passage remains visible; Greek-compatible typography included. | 005, 007 |
| AFNT-009 | P1 / M / Engineer | Add selected-edition English search: words, literal phrases, book filter, pagination, no-results state. Reference input resolves before keyword search where unambiguous. Source footnotes and commentary do not contaminate Scripture results. | 006, 007 |
| AFNT-010 | P0 / M / Engineer | Automate importer/reference integrity checks and independently selected source spot checks. Compare chapter/segment inventories with source manifests, not a hard-coded universal verse count. Include single-chapter books and invalid ranges. | 006–009 |

### M2 — Edition comparison foundation

| Ticket | Priority / size / owner | Work and acceptance criteria | Dependencies |
|---|---|---|---|
| AFNT-011 | P0 / L / Engineer | Import BLB, MSB, and verified YLT/replacement NT through dedicated adapters. All carry release/rights provenance and their original text. Repeated ingestion produces the same normalized result from the same source. | 001, 006, 010 |
| AFNT-012 | P0 / L / Engineer + textual reviewer | Import the three selected Greek editions. Preserve Unicode surface text, main-text/appended material roles, and source identifiers. Verify passages independently; identify any edition-internal alternatives. | 001, 002, 010 |
| AFNT-013 | P0 / M / Engineer + textual reviewer | Implement split/join/absent/bracketed/relocated mappings. Include one whole-verse absence and one multi-verse unit after verifying source treatment. A parser error never becomes a textual omission. | 011, 012 |
| AFNT-014 | P1 / M / Engineer | Translation switching preserves the canonical passage and focus. Selector spells out names and describes English style/textual grouping. Coverage differences produce explanatory context rather than a blank pane. | 008, 011, 013 |
| AFNT-015 | P0 / S / Engineer + content steward | Publish Sources & Editions view from manifests. Show exact editions, release details, source links, included layers, and attribution. Excluded or unresolved assets cannot be bundled accidentally. | 001, 011, 012 |

### M3 — Textual criticism and Greek

| Ticket | Priority / size / owner | Work and acceptance criteria | Dependencies |
|---|---|---|---|
| AFNT-016 | P0 / M / Engineer | Implement variant schema and publication validation: anchors, readings, attestations, citations, review state, significance. Reject orphan readings, missing release IDs, unresolved rights, and drafts in published bundles. | 003, 012, 013 |
| AFNT-017 | P1 / L / Textual reviewer + editor | Verify and publish initial variant collection. Each unit names actual editions, cites evidence, explains significance locally, and distinguishes editorial gloss from Scripture. Track completed, rejected, and pending candidates; target 25–40. | 003, 012, 016 |
| AFNT-018 | P1 / L / Engineer | Add subtle accessible markers and responsive comparison panel. Three groups use named editions; keyboard/focus/back navigation works; direct links open correct unit. Uncovered passages say no reviewed note is available, not that no variants exist. | 005, 014, 016, first 017 sample |
| AFNT-019 | P0 / M / Engineer + textual reviewer | Ingest verified lemma/morphology and a cleared lexicon source. Preserve source-specific analyses and unknown values. Audit sample tokens against independent references; one Strong's ID is not treated as an entire lexeme definition. | 001, 012 |
| AFNT-020 | P1 / L / Engineer | Build Greek-by-verse and lemma explorer with edition-specific occurrences, contextual snippets, glosses, and readable parsing. Clearly identify unavailable analyses. English token links appear only for verified alignments; no positional guessing. | 019, 008 |
| AFNT-021 | P0 / M / Engineer + textual reviewer | Check comparison fixtures across long units, differing placement, same reading with different English, and incomplete data. Every highlighted span matches the stored source release. Source observations and theological judgments have separate provenance. | 013, 017, 018, 020 |

### M4 — Notes and Ordinary Means

| Ticket | Priority / size / owner | Work and acceptance criteria | Dependencies |
|---|---|---|---|
| AFNT-022 | P1 / L / Engineer | Local passage notes with create/edit/delete, visible save/error state, stable IDs, timestamps, JSON export/import, and readable export. Round-trip preserves notes and quotation metadata; invalid imports do not erase data; translation switching retains passage notes. | 002, 008 |
| AFNT-023 | P0 / S / Engineer | Verify local-storage upgrade, quota failure, cleared-storage notice, duplicate import handling, and safe rendering. No private note body appears in share URLs, public data, or telemetry. Define conflict handling for repeated imports. | 022 |
| AFNT-024 | P1 / M / Content steward + product owner | Inventory Ordinary Means materials and register 10–20 approved passage links as available. Include type, byline, canonical URL, ranges, and excerpt rights. Incorporate Ad Fontes, Greek Word Explorer, studies, essays, confessional references, and teacher resources where actual inventory supports them. | 003 |
| AFNT-025 | P1 / M / Engineer | Build resource list, detail/link behavior, and reader suggestions using exact passage overlap. Separate Scripture, publisher notes, commentary, confessional quotation, and private notes visibly. Test all supplied links; no invented content or bylines. | 024, 007 |

### M5 — Pilot and release

| Ticket | Priority / size / owner | Work and acceptance criteria | Dependencies |
|---|---|---|---|
| AFNT-026 | P0 / M / Engineer | Run keyboard/screen-reader, touch, contrast, zoom, mobile layout, and polytonic Greek checks. Review performance against agreed device/network budgets. Resolve blocked reading or unreachable panel controls before pilot. | 018, 020, 022, 025 |
| AFNT-027 | P0 / M / Engineer | Produce release verification: immutable content manifest, source differences, restore/rollback rehearsal, sanitized markup, error states, safe caching, and no unexpected external Bible calls. A clean environment reproduces the corpus build. | 010, 015, 021, 023 |
| AFNT-028 | P1 / M / Product owner + engineer | Run 6–10-person pilot including teachers and unfamiliar readers. Record unassisted task completion, misunderstandings, note retention, and repeat-use feedback. Proposed gate: 80% completion for core reading tasks and no unresolved critical correctness/data-loss issue. | 026, 027 |
| AFNT-029 | P0 / M / Product owner + engineer + reviewer | Correct pilot blockers; record exact corpus, variant/resource counts, known gaps, and verification results. Publish only the reviewed release. If a launch target changes, update handoff and release scope explicitly. | 028 |

## 5. First implementation session

The next build should work through a concrete vertical slice rather than create all panels against fictional data.

1. Read the handoff, applicable workspace instructions, and Sites build/hosting skills when creating the web application. Establish the application directory and chosen deployment path.
2. Implement AFNT-001/002/004: manifests, canonical references, and a minimal application scaffold. Confirm BSB input format and license evidence; do not freeze Greek token IDs before choosing releases.
3. Import the full BSB NT. Inspect Romans 3, one narrative chapter, a poetic/formatted section, and a single-chapter book against source data. Keep a reconciliation report for the whole NT.
4. Implement navigation and the reading route. Demonstrate opening `ROM.3.23`, moving to its context, and restoring the location after reload.
5. Add search and reader verification. Then proceed to actual BLB/MSB/YLT imports and switching before building the three-group panel.

First demo acceptance: a real, correctly attributed BSB reader that resolves canonical references and has no dependence on a third-party Bible API. It does not yet claim to be the finished MVP.

## 6. Data contracts to freeze early

### Passage request and result

```ts
type PassageRequest = {
  editionId: string;
  releaseId?: string; // resolved to a published immutable release
  ranges: { start: string; end: string }[]; // canonical references
};

type PassageResult = {
  editionId: string;
  releaseId: string;
  ranges: { start: string; end: string }[];
  segments: TextSegment[]; // preserve source order and formatting
  coverage: {
    anchor: string;
    dataState: "available" | "unavailable" | "unmapped";
    textState: "present" | "absent" | "bracketed" | "relocated" | "unknown";
    publisherNoteIds: string[];
  }[];
};
```

`TextSegment` is defined in the corpus module, including edition-specific source labels and many-to-many canonical mappings. `dataState: unavailable` cannot establish `textState: absent`. Footnote treatment can coexist with absent main text. Resolver failure is an explicit error response, not an empty successful passage.

### Notes contract

Persist canonical ranges independently from optional `quotation: { editionId, releaseId, text }`. If attaching to tokens, retain release-specific token IDs and an anchor status. Export includes a schema version and checksums or validation sufficient to detect malformed payloads; import is additive or explicitly merges by note ID. Deletion affects the selected note only. No sync claim appears in the MVP UI.

### Content publication contract

Source manifest -> imported release -> checked mappings -> reviewed editorial content -> public release bundle. Each step records its predecessor. A build cannot publish a variant referring to a missing release or a resource with unresolved rights. A draft explanation and a published Scripture footnote use different record types.

## 7. Verification matrix

These are required tests/reviews for future implementation, not work claimed to have already passed.

| Concern | Verification | Failure means |
|---|---|---|
| Text fidelity | Checksum raw files; reconcile every source segment; independent spot checks; inspect import diffs | Block affected corpus release |
| References | Valid aliases/ranges; book ordering; one-chapter books; split/join/absence fixtures | Block navigation/comparison release |
| Edition differences | Verify main text, brackets, notes, and alternate placements against actual source | Block affected variant or mapping |
| Greek correctness | Unicode round-trip, token-span checks, sampled morphology, edition-specific occurrence counts | Disable affected enrichment until corrected |
| Editorial evidence | Reviewer checks each published explanation and cited reading | Keep draft unpublished |
| Notes | Save/reload, quota errors, export/import, upgrade, duplicate conflict handling | Block notes release if data loss remains |
| Content distinction | Users identify Scripture versus commentary/confession in pilot | Revise labeling and presentation |
| Accessibility | Keyboard, focus return, screen reader, text zoom, phone layouts | Resolve core-flow barriers |
| Privacy | Public bundles/URLs/logs exclude notes; no unapproved personal-data collection | Block release |
| Performance | Agreed mobile cold/warm reading and search budgets | Fix bottleneck or revise documented budget with evidence |
| Operations | Repeatable build, atomic manifest update, rollback rehearsal | Block public release |

Do not assert a single expected verse count across all editions. The verification target is each source's inventory plus documented reference mappings. Likewise, do not use a selected English translation as the truth set for Greek word counts.

## 8. Later backlog, explicitly outside MVP

| Ticket | Priority | Trigger and scope |
|---|---|---|
| AFNT-101 | P2 | Account synchronization after demonstrated cross-device demand; authentication, ownership tests, conflict resolution, backups, export and deletion. |
| AFNT-102 | P2 | Teacher collections and printable lesson/handout views after observing preparation workflows; preserve edition and resource attribution. |
| AFNT-103 | P2 | Group workflows after teacher collections prove useful; define invitation, membership, privacy, and moderation before discussions. |
| AFNT-104 | P2 | More Ordinary Means/confessional material after rights review and metadata cleanup; avoid treating an entire website as cleared. |
| AFNT-105 | P2 | NET/ESV only after applicable commercial rights are documented; enforce storage/search/export limitations per edition. |
| AFNT-106 | P2 | Expanded verified English–Greek alignments and richer morphology search; report provenance and coverage per release. |
| AFNT-107 | P2 | Offline reading bundles after explicit demand; public data only initially, with update/recovery behavior tested. |
| AFNT-108 | P2 | Optional AI assistance only after editorial policy, source-grounding, labeling, and evaluation are defined; no autonomous Scripture or variant publication. |
| AFNT-109 | P2 | Paid teacher tools or subscriptions after willingness-to-pay evidence; keep foundation and rights strategy intact. |
| AFNT-110 | P2 | Evidence-centered visual aids for approved comparison articles: derive accessible edition summaries only from frozen variant data; add manuscript evidence plates only through a separate checksum-pinned, item-rights-cleared and editorially reviewed visual release that also works offline. |
| AFNT-111 | P2 | Expand manuscript-evidence coverage across all 39 approved comparison articles through a preserved CSNTM passage/page inventory, direct reading verification, item-level rights and credit records, restrained witness selection, exact-hash editorial approval, and size-controlled offline derivatives. Discovery matches are never manuscript-reading claims. |
| AFNT-113 | P2 | Expand the 39 approved textual-comparison articles by a combined 65-unit release, preserving frozen edition evidence and separately reviewed CSNTM manuscript plates. Keep the additional ten-unit viability reserve unpublished until the owner reviews it after the 65-unit production release. |

Old Testament expansion is intentionally not a routine backlog ticket. It requires a new product brief for its different textual witnesses, languages, scope, and UX.

## 9. Open-decision defaults

Proceed with local notes, reviewed static resource metadata, and a small curated variant collection unless the product owner changes those choices. Use neutral prototype typography with exact supplied branding until authentic assets arrive. A missing logo is not a reason to stop source ingestion or reading implementation.

Source approval and a qualified textual review remain genuine release dependencies. If BGB cannot be cleared promptly, use the documented Nestle 1904 fallback after checking the chosen artifact. If an ancillary lexicon or alignment is unresolved, keep the named Greek text accessible and mark that enrichment unavailable; do not silently omit a required core corpus and declare the MVP complete.

No domain, paid service, publisher license, public deployment, or third-party message is authorized merely by appearing as an option in this plan. Those actions belong to the later implementation context. This handoff completes the requested planning work and provides a concrete starting point for building.

## Accepted M4 scope amendment — 2026-09-05

The user chose Google identity, a once-only shared registration password, account-backed private notes and siloed Ubuntu/Docker/PostgreSQL hosting for `ad-fontes.app` before M4 began. This supersedes D07's browser-local-only recommendation and advances AFNT-101 into M4. AFNT-022/023 now use server ownership, session/CSRF checks, optimistic versions, transaction-safe imports, explicit save/error state and database backup/restore checks in place of browser-storage quota/upgrade handling. No offline note-editing claim is added. Reading remains available without an account. AFNT-024/025 resource inventory remains separate and uncompleted. Implementation and deployment limits are in `M4-Accounts-and-Hosting.md`; public deployment is not implied by preparation.

## M4 acceptance — 2026-09-05

Larry explicitly accepted M4 after confirming the final note export/import, persistence and live UI checks. AFNT-022–025 and the advanced AFNT-101 slice are accepted under the account-backed and initial link-only scope. See `M4-Acceptance.md`. Off-host backups remain deferred; M5 AFNT-026–029 is next. This supersedes the earlier pending resource-inventory status.

## M5 and MVP acceptance — 2026-09-12

Larry explicitly accepted all M5 tasks as completed to his satisfaction. AFNT-026–029 and the defined MVP are accepted with the evidence boundaries and continuing limitations recorded in `M5-Acceptance.md`. This supersedes earlier incomplete-M5 status language. It does not itself authorize a new release, rename RC9 bytes to v1.0, or include later P2 work such as AFNT-110 in a published release.

## Authorized desktop prototype — 2026-09-08

Larry advanced AFNT-107 after discussing a self-contained Windows/Linux/macOS edition. The first deliverable is an offline desktop reader prototype sharing the existing React reader/domain logic, with one bundled approved OM Greek study to establish the publishing path. Desktop accounts, registration and note synchronization are excluded; optional local notes are deferred. The hosted M4 account-backed notes remain accepted and unchanged. AFNT-104 covers expansion of the approved authored-study collection. See [Desktop workflow](Desktop-Workflow.md) for code boundaries, reproducible builds, verification and remaining distribution work. This authorizes local prototype work, not a live website deployment or a public desktop release. M5 remains incomplete.

## Accepted native prototype and shared article viewer — 2026-09-08

Larry reported “Works perfect” after trying the native app. This is user acceptance of the presented macOS prototype, not certification of other platforms or a completed M5. He explicitly requested the same embedded Greek articles in the web application, with links to their originals on larryherzogjr.com. AFNT-104 now includes the shared web/desktop article viewer and common pinned content build. The first local implementation uses the existing approved Nekros snapshot; a reviewed larger export is next. Hosted accounts remain web-specific. No live deployment is included in this local change.

## All Greek articles approved — 2026-09-08

Larry confirmed that all 250 Greek word articles were reviewed and approved for use and should be live on larryherzogjr.com. This supersedes the 39 historical pending-review flags and the one-article content limit. AFNT-104 now includes the full immutable article snapshot shared by both builds, on-demand article loading and preserved footnotes/cross-links. All 250 author-site URLs were verified live and equal to the local production build; no deployment was required there. This does not close Windows/Linux packaging, signing, Ad Fontes NT website deployment or M5 acceptance.
