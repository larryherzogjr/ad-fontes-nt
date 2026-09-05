# Ad Fontes NT — project status

2026-09-05 · **M3 accepted: comparison and Greek exploration** · Local only. M4 is next; the finished MVP remains incomplete. See [M3 acceptance](docs/M3-Acceptance.md).

## Completed work

M1 and M2 remain working. Their detailed inventories and verification are retained in `docs/M1-Verification.md` and `docs/M2-Verification.md`; all seven Scripture releases remain unchanged by M3.

- **AFNT-016:** Variant schema and local publication validation implemented. Canonical ranges, exact edition/release spans, citations, attestations, rights, authorship, significance and review state are explicit. Modified quotations, orphan spans, unknown releases, false absence, unresolved rights and missing approvals are rejected. Approval is tied to the content hash; a later rejection supersedes it.
- **AFNT-018:** Responsive comparison panel displays the seven named editions in Critical/Eclectic, Byzantine Majority and Textus Receptus groups. Publisher notes, brackets, source numbering and separate alternatives remain distinct. URL-selected passages and tools reload correctly. Uncovered passages explicitly have no reviewed note available. Chapter commentary markers and the first approved-unit navigation now work, including an absent verse. Inline OM markers now cover reviewed source verses, with coverage-note access for absent verses.
- **AFNT-019 (engineering):** Independently versioned Nestle 1904 lemma/morphology, Berean contextual glosses and public-domain Strong’s Greek Dictionary XML v1.4 are imported with original fields, pinned source/rights evidence and output checksums. Source tags and unknown values are preserved; independent RP source spot checks pass. The presented sampled Greek review and disclosed limits are accepted.
- **AFNT-020:** Greek-by-verse view, selectable words, readable source parsing, lemma, optional contextual gloss, labeled historical dictionary and paginated same-lemma occurrences work. URL token selection, occurrence links and return-to-word focus work. No English token alignment is inferred.
- **AFNT-021 (engineering fixtures):** Actual source readings, long units, placement differences, absent text, unavailable analysis and source-span integrity are checked. Curated explanations and the presented qualified review are accepted; source verification limits remain explicit.

## Editorial queue

**Current: all 30 initial explanations approved and locally published; 0 drafts or pending correction decisions.** M3 sampled source/analysis review and final inline-marker checks are now complete. Earlier dated counts below record prior stages.

**Larry Herzog Jr.** is the assigned reviewer. All 30 explanations have adopted prose, permission and exact content-hashed approvals. No independently established structured manuscript attestations were added. The three remaining M3 acceptance items received his explicit approval on 2026-09-05; no further samples or consulted sources were supplied with that response.

See `content/editorial/REVIEW.md` and [M3 acceptance](docs/M3-Acceptance.md). Publication remains a local bundle operation. The source decisions and recorded limitations remain in force; acceptance does not create evidence for unresolved historical claims.

## Data and decisions

Keep React/TypeScript, edition-neutral references, independent adapters and immutable per-chapter JSON. Analysis lives separately under `app/public/analysis/nestle-analysis-1.3-m3-v1/`, tied to `n1904-2026-09-05-m2-v1`. Lemma/dictionary entries load on demand. A future relational database, such as PostgreSQL, can sit behind these contracts; no database service is necessary for the current local milestone.

Analysis coverage: **7,940 matching source verses, 137,694 tokens, 5,400 source lemma keys, 5,624 historical dictionary entries**. Two apostrophe-shape mismatches (2TH.2.13, 1TI.1.16) remain explicitly unavailable analyses. Another 28 analyzed verses have no fully matched contextual gloss. The appended Mark shorter ending is excluded from main-text analysis. Occurrence counts are labeled as counts in this indexed Nestle subset. Full details and exact artifact identities: `docs/M3-Source-Decisions.md`, `sources/m3/manifest.json`, `reconciliation.json`, `output-checksums.json`.

The study panel accepts up to 80 canonical verses; chapter reading is unaffected. The 25–40 initial variant target is a recommendation; source fidelity, named editions, explicit review and content separation are fixed requirements. The local work introduces no accounts, payment, AI, group workflow, NET/ESV, OT feature, external Bible API or deployment.

M2 source assumptions remain visible: unavailable BGB uses the permitted Nestle fallback; BLB is a publisher draft; MSB’s exact underlying RP release is unspecified; YLT is not equated to Boyd’s compilation. No guessed source relationship blocks verified BSB reading.

## Verification this increment

- **18 Node test groups passed**, including all previous reader/mapping/search checks and five M3 groups. Publication tests cover exact source spans, false absence, stale release, changed content, rights and superseded approval. The final queue test was made compatible with future real approvals and its five M3 groups were rerun successfully.
- **11 Python tests passed** (three M1, six M2, two M3). All 137,694 analysis tokens reconcile with original source fields, exact Scripture spans and occurrence inventories. Four grammatical examples independently reconcile with RP2018’s parsing source. This is not a claim that all source analyses have received scholarly review.
- Offline reimport reproduced pinned original/evidence hashes, reconciliation and every output checksum. Published bundle contains zero draft explanations. TypeScript checking and production build passed; build includes the offline imports and full test suite.
- Browser: John 1:1 Λόγος displays lemma, independent functional/form tags, “Word” gloss, historical Strong’s entry and 331 indexed occurrences. Page 2 works; a Matthew 5:32 occurrence opens the correct Nestle passage and selected word. Reload retains selection; return-to-verse focuses the selected token. Escape closes the dialog and restores focus to Explore Greek. Tab remains inside the native modal.
- Browser: Acts 8:37 compares all seven editions, distinguishing absence from YLT/Boyd text; MSB’s original publisher note opens separately. Mark 16:9–20 preserves the long unit, bracket notice and separate alternative. Romans 16:25–27 shows MSB/RP source positions at Romans 14:24–26.
- Browser: 2TH.2.13 retains Scripture with explicit unavailable analysis; Acts 8:37 reports no Nestle main-text segment. Invalid token links show an error. Screenshots reviewed at 320×740, 390×844 and 1280×900; Greek diacritics and content wrap without horizontal overflow. No full screen-reader certification is claimed.
- The retained development server encountered an HMR stack overflow after the first large asset import; stopping and restarting it cleared the issue. Import before starting `npm run dev` as documented.

Existing local-only limitations: the scaffold’s previously recorded 11 dependency advisories (8 high, 2 moderate, 1 low) need remediation and revalidation before public exposure. No formal WCAG audit, mobile-network benchmark, pilot, synchronization or offline PWA is claimed. Further units and inline marker coverage still need acceptance checks. Native touch-selection handles have not been tested on physical iOS/Android devices.

## In-reading selection follow-up

The user requested direct study actions while reading. AFNT-018/020 now include nearby actions on verse-number click/tap and a **Study selection** toolbar for native Scripture highlights. Highlighted words map to their containing canonical verses, including multiple verses; no English–Greek token alignment is inferred. Only annotated main-text spans contribute anchors. Publisher headings, notes and separate alternatives cannot become main-text selection. Modified clicks and link copying retain canonical passage links.

Opening a tool records the current reading URL, scroll position and invoking verse control in session storage. Close and browser Back restore reading/focus; the study range itself remains in the URL for reload. Escape dismisses the selection toolbar and returns focus. The toolbar fits within the viewport and offers ordinary keyboard-accessible buttons.

Browser verified: John 1:29 verse actions; a real drag highlight across John 1:29–30 opened both verses in seven-edition comparison; study reload retained the selection; close restored the original URL and exact 3,666-pixel scroll offset. Keyboard Enter/Tab opened comparison, Escape returned focus, and browser Back restored the reader at phone width. BSB 3 John 14 opened its joined canonical range 14–15. Screenshots at 320×740 and 1280×900 confirmed toolbar actions fit without horizontal overflow. Double-clicking a Scripture word selected its containing verse; selecting the publisher heading did not open a study toolbar. Automated corpus/domain checks remain 18 Node groups and 11 Python tests; no corpus bytes changed.

## Greek reading-aid follow-up

AFNT-020 now shows selected-form transliteration and the archived dictionary headword’s transliteration/written pronunciation. Headword pronunciation is explicitly distinguished from the selected inflected form; no audio or reconstructed Koine claim is made. Each occurrence snippet highlights its exact source token, including repeated words, with a background, bold weight and underline. Page changes resolve the corresponding token offsets against immutable chapter data; altered or missing source data cannot produce a guessed highlight.

Verification: transliteration fixtures cover Unicode normalization, rough breathing, diphthongs, nasal gamma, iota-subscript handling and inflected forms. Source dictionary lógos / log'-os fields reconcile; three John 1:1 occurrences resolve to distinct offsets. Altered snippets and token IDs fail validation. All **19 Node groups and 11 Python tests**, TypeScript checking and the production build passed. Browser checks verified Logos reading guides, all 20 exact highlights on each of the first two occurrence pages, reload, and 320-pixel/1280-pixel layouts without overflow. See `docs/M3-Source-Decisions.md` for conventions and source evidence.

## Sidebar dismissal follow-up

AFNT-018: clicking the dimmed reading area now closes either study panel through the existing reading-position/focus restoration path. Both pointer press and click must be outside the dialog; interior clicks and text drags that end outside do not dismiss it. Browser verified outside-click close, inside-click retention and outward-drag retention at desktop width. Close button and Escape remain available on full-width phone layouts. Typechecking and the production build (including all 19 Node groups and 11 Python tests) passed.

## External review handoff

Created `docs/editorial-review/Ad-Fontes-NT-Editorial-Review-Packet-2026-09-05.zip` with a self-contained Markdown commissioning/review guide, source register, 30 independently returnable worksheets, original candidate snapshot, 205 exact chapter bundles and release/file checksum records. Recommended first return is `worksheets/candidate-18.md` (Acts 8:37). Required prose is explicitly split into source observation and local significance/interpretation, with separate author, external consultant, final reviewer, citation, contribution-provenance, permission and decision fields. Suggested lengths are recommendations; scope and source distinctions remain requirements. No completed commentary or approval is invented.

Validation passed for all extracted readings/notes/alternatives, unchanged chapter bytes against their original release checksums, all packet file hashes, 569 local Markdown links and ZIP contents. Editorial queue remains 30 drafts with no explanations or review events. Return documents must be preserved and reconciled before content approval/publication is recorded. This handoff is documentation only; it does not change application behavior or corpus releases.

## Returned editorial draft intake

AFNT-017: received and preserved [candidate-18 draft-1](docs/editorial-review/returns/2026-09-05/candidate-18-DRAFT-2026-09-05.md) with [intake findings](docs/editorial-review/returns/2026-09-05/candidate-18-INTAKE-NOTES-2026-09-05.md). The submission identifies Claude as drafting assistant, explicitly selects “Not reviewed,” and leaves permission unresolved. No prose, author, approval or publication state was added to the application queue. Larry’s qualified review remains pending.

Verified unchanged supplied evidence, all packet hashes, 205 release snapshots, 569 local links and ZIP contents. YLT recount confirms 29 bundled chapters and 111 segments with either bracket (110 with opening brackets); the draft’s segment-versus-passage classification needs correction. Intake also flags scope of publisher-note wording, an unsupported “first time” narrative claim, confessional citation precision and optional historical evidence. Original packet remains frozen. Documentation-only intake; no app tests/build rerun.

## Approved return received — candidate-18

AFNT-017: preserved [Larry’s rev-2 return](docs/editorial-review/returns/2026-09-05/candidate-18-RETURNED-2026-09-05.md), including his explicit approval, adopted authorship, Ordinary Means byline, permission and retained AI drafting history. This supersedes the earlier draft’s missing decision/permission at the document level. See [reconciliation](docs/editorial-review/returns/2026-09-05/candidate-18-REV2-RECONCILIATION-2026-09-05.md).

Source evidence and A–C prose match the earlier submission exactly. Prepared [two narrow public-wording corrections](docs/editorial-review/returns/2026-09-05/candidate-18-PROPOSED-PUBLIC-TEXT-2026-09-05.md) for acceptance; theological wording is unchanged. Internal YLT count corrections remain attached separately. C8 has a citation, but its URL returned HTTP 403 during this intake. No application approval event or publication was generated: document-level approval is received, exact-content integration remains pending. Review time-of-day is unspecified and must not be invented. Documentation-only checks; no app changes or app test/build run.

## First approved local explanation

AFNT-017/018: candidate-18 (Acts 8:37) now contains the returned title and A–C prose with exactly the two corrections explicitly approved in the project conversation. Larry is author of record; the public byline is Ordinary Means. Full Claude drafting history, returned-file/proposal hashes, permission, exclusions and correction approval are retained in `content/editorial/contributions/candidate-18.json`. Review date is 2026-09-05 with date-only precision; no time was invented. Approved payload SHA-256: `3eae80da95849f0a59c236d6c16a699a8ea3835acd2bc3174cf40de648378e15`.

Source observation and interpretation display separately with paragraph breaks and navigable S1–S7/C6/C7 citations. Publication now rejects unresolved explanation citation markers; changing citation metadata invalidates the content hash. No optional D teacher material, Irenaeus attestation, speculative YLT bracket explanation or erroneous internal survey count is published. C6 retains the reviewer’s article/part-level citation precision. The original packet, returned revisions and Scripture releases remain unchanged.

Acts 8 has a keyboard-accessible chapter commentary entry even in editions lacking verse 37. It opens the exact unit URL and returns focus to the invoking marker on close. Browser verified corrected wording, all seven treatments, internal citation focus, direct link/reload, Escape/Close restoration, and 320/390-pixel layouts without horizontal overflow. Final validation: all **20 Node test groups and 11 Python tests**, TypeScript checking and production build passed. All 253 frozen packet hashes and exact approved B/C prose matched. Desktop 1280-pixel layout and invalid unit/passage rejection also passed browser checks. First-note automated fixtures check absence distinctions, corrected prose, missing citations and approval invalidation. M3 remains incomplete; other candidates require their own decisions.

## Batch 1 incorporated

AFNT-017/018/021: five new explanations (Matthew 17:21; Matthew 18:11; Mark 7:16; Mark 9:44; Mark 9:46) and Acts 8:37 rev-3 are locally published. The original ZIP and eight Markdown files are preserved under `docs/editorial-review/returns/2026-09-05/`, with per-file hashes and [reconciliation](docs/editorial-review/returns/2026-09-05/batch-1/RECONCILIATION.md). All six supplied evidence sections and 253 frozen packet hashes match. No other candidate was approved.

Matthew 18:11 includes exactly the two user-approved factual scope clarifications. Acts 8:37 rev-3 retains the earlier user-approved corrections and adopts the newly reviewed confessional paragraph, explicitly attributed to Larry’s book. The supplied PDF’s edition/ISBN and printed pages 342, 348, 372–374 and 381 were checked, using rendered pages because the text layer is corrupt. This verifies the paraphrase’s attribution, not independent historical/patristic evidence. The PDF and its restricted Scripture quotations remain outside public assets. Previous Acts payload, contribution and approval remain in history; the appended decision governs the new exact hash.

Mark 9:44 and 9:46 remain separate notes with reciprocal links. A wider selected passage shows the requested note first. Related targets must exist in the approved bundle. Browser verification: all five new direct links and revised Acts prose; both Mark links via keyboard/click and reload; multi-note ordering; resolved citation targets; Escape from a related note restores the original chapter/marker focus. Inspected 320/390/1280-pixel layouts without horizontal overflow. Browser access initially timed out, then succeeded on the permitted retry. A related-link navigation issue found during QA was fixed before the final check.

Drafts 16 (John 5:3–4) and 20 (Acts 24:6–8) now represent mixed text states explicitly with verified per-anchor coverage; the generator also preserves mixed ranges, while still refusing to overwrite an existing queue. No original source, registry or frozen review packet was edited. A [mixed-range supplement](docs/editorial-review/returns/2026-09-05/batch-1/mixed-range-supplement.md) and updated private draft snapshots are ready for the next review batch. The internal YLT survey-count and other digest qualifications are recorded separately rather than copied into public notes.

Validation: **22 Node test groups and 11 Python tests passed**, along with TypeScript checking and the production build. All six titles and A–C records matched their returned versions plus only the explicitly approved factual corrections. All source-span and corpus fidelity checks passed. M3 remains in progress; broader inline per-verse marker coverage, remaining explanatory reviews and qualified source/analysis sign-off are still open.

## Next steps

Finish **M3** with the remaining candidate reviews, broader inline marker coverage, and qualified source/analysis sign-off. Do not manufacture review to close the milestone. Then proceed to **M4 — local personal notes and verified passage-linked Ordinary Means resources (AFNT-022–025)**, using actual supplied resource inventory.

Launch: `npm run dev` from the project root; open `http://localhost:3000/`. Setup and example passage/study URLs are in `README.md`.

## Batch 2 incorporated

AFNT-017/018/021: Mark 11:26, Mark 15:28, Luke 23:17, Acts 28:29 and Romans 16:24 are locally published from the five approved rev-2 returns. The original archive, per-file hashes, proposed corrections, explicit user approval and [reconciliation](docs/editorial-review/returns/2026-09-05/batch-2/RECONCILIATION.md) are preserved. All five evidence sections and all 253 frozen packet hashes match. The final A–C prose matches the returns plus only the explicitly approved replacements; drafting provenance and date-only review precision are retained.

Corrected the Greek-edition count, false no-footnote claims, the overbroad no-parallel wording, Boyd’s already-present Amen, and the unsupported collection-wide uniqueness claim. Verified candidate 23’s self-citation visually at printed p. 376 of the supplied book. The original MSB Romans 14:24–26 reference remains unchanged. Candidate 24 stays separate and draft; its related link waits for approval.

The two BSB Mark 15:27 notes now have separate rendering/textual labels. The combined MSB Luke 23:17 note identifies its two kinds of content. Labels are separate Ad Fontes annotations keyed to exact source release, note ID, anchor and wording; original corpus bytes and markup remain untouched.

Passed **24 Node test groups, 11 Python tests, TypeScript checking and production build**. All five new deep links and citations were browser-checked; chapter labels, keyboard opening/Escape, reload, and source-link focus work. 320-pixel and 1280-pixel screenshots showed no horizontal overflow. No full accessibility certification or physical-device test is claimed. Current total: **11 approved/local explanations, 19 drafts**. Continue M3 editorial/source review and broader inline marker acceptance; M4 follows M3 acceptance.

## Batch 3 incorporated

AFNT-016/017/018/021: five approved rev-2 explanations (Luke 17:36; John 5:3–4; Acts 15:34; Acts 24:6–8; Romans 16:25–27) are locally published. Current total: **16 approved/local explanations, 14 drafts**. Originals, checksums, exact proposed corrections and Larry’s affirmative correction approval are retained in [batch-3 reconciliation](docs/editorial-review/returns/2026-09-05/batch-3/RECONCILIATION.md). All five prose records match returns plus approved replacements; all 253 frozen packet files match.

Continuous reviewed textual units now have exact partial-verse boundaries, without changing immutable whole-verse coverage. John’s Nestle markers remain a matched source pair; Acts’ disputed unit spans parts of verses 6/8 and all of 7. The comparison shows those excerpts with full context separately. Related links connect 12/23 and 23/24 reciprocally; 07/08 remain linked. Candidate 23’s prior approval and payload remain archived. MSB’s Acts 15:33 note distinguishes its two textual matters, and returned bold formatting is supported.

Book citations checked visually at printed pp. 381/398; candidate 20’s expressly approved Western-text category retains the reviewer’s stated source limit. No manuscript attestations or public deployment were added. Passed **26 Node groups, 11 Python tests, typechecking and production build**, with focused browser verification of notes, boundaries, citations, keyboard links, reload and responsive layouts. M3 remains open for the remaining 14 explanations, qualified source/analysis sign-off and broader inline-marker acceptance.

## Batch 4 intake and first publication

AFNT-016/017/018/021: Matthew 6:13 is published unchanged from the approved return. All five batch-4 returns and the archive are preserved and verified; candidates 05/13/22/25 remain in review pending the [exact factual corrections](docs/editorial-review/returns/2026-09-05/batch-4/PROPOSED-CORRECTIONS.md). Current count: **17 published, 4 in review, 9 drafts**.

Implemented exact partial-verse scopes, paired-marker validation, the separate publisher-note presentation and approval-hashed local comparison notices. Added exact-source labels for the Matthew publisher notes. The four pending explanations remain outside the public bundle. [Reconciliation and verification limits](docs/editorial-review/returns/2026-09-05/batch-4/RECONCILIATION.md).

Passed 28 Node groups, 11 Python fidelity tests, typecheck and build. Browser-checked Matthew’s chapter marker, keyboard citations/note disclosures, seven edition cards, exact excerpts, reload and 320px layout. The withheld note-only and Corinthians-notice views still require live browser checks after approval. Next: resolve the four corrections, finish batch 4 publication, then batch 5 (15/26/28/29/30). M3 remains incomplete.

## Batch 5 incorporated

AFNT-017/018/021: John 1:18, 1 Timothy 3:16, Revelation 22:19, 2 Corinthians 13:12–14 and 3 John 14–15 are published with the exact user-approved corrections. Current total: **22 published, 4 in review (batch 4), 4 drafts (batch 6)**. [Full reconciliation](docs/editorial-review/returns/2026-09-05/batch-5/RECONCILIATION.md) preserves source findings, author approvals, original file hashes and verification limits.

Corrected YLT’s Revelation book/scroll reading and Timothy quotation, narrowed identical-wording assertions, acknowledged 3 John’s word order and separated numbering from textual differences. Added exact-source publisher-note labels and reciprocal links 15↔26 / 29↔30. The partial-verse `focus` mechanism remains distinct from joined/renumbered source mappings.

Candidate 26’s admitted manuscript account stays attributed to Larry’s book and explicitly unverified against manuscripts/apparatus. The optional D/F Bezae identification is flagged for author review and remains archival. This exception does not extend to other candidates. Book pages 250, 254–256, 288 and 381 were visually checked for attribution.

Passed **30 Node groups, 11 Python tests, typecheck and build**. Browser checked all five notes, both reciprocal link pairs, source numbering, note labels, citation focus, Escape restoration, reload and phone/desktop layouts. Next: batch 6 (04/11/17/27), pending batch-4 decisions and remaining M3 qualified review. No public deployment.

## Batch 6 incorporated

AFNT-016/017/018/021: Matthew 23:13–14, Mark 16:9–20, John 7:53–8:11 and 1 John 5:7–8 are locally published with the exact user-approved corrections. Current total: **26 published, 4 in review (batch 4), 0 drafts**. [Reconciliation](docs/editorial-review/returns/2026-09-05/batch-6/RECONCILIATION.md) records preserved originals, approval hashes, source findings and limitations.

Matthew includes both verses with source-specific order and mixed coverage; approved reciprocal links connect 04/12/23 and retain 23→24. Earlier payloads and reviews remain archived. The 1 John longer clause has exact partial-verse focus across 7–8; balanced square source markers are validated without changing whole-verse coverage. Mark’s existing separate shorter ending and John’s actual note counts are correctly described. No immutable corpus or frozen review packet changed.

The three admitted manuscript accounts remain attributed to Larry’s book with adjacent verification limits; unsupported details are withheld, and no structured attestations were added. Printed pp. 133/166/199 were visually checked for attribution. **32 Node groups, 11 Python tests, typecheck and build passed.** Browser checks covered all four notes, seven edition cards, Matthew’s ordering, related-link keyboard navigation, Mark’s alternative, John’s cross-chapter notes, 1 John excerpts, citation focus, Escape, direct-link reopening and 320px layout without overflow.

Next: resolve four pending batch-4 corrections and their acceptance checks, then complete remaining M3 qualified source/analysis and inline-marker acceptance. M4 follows M3 acceptance. No public deployment; still an engineering preview.

## Batch 4 final corrections and publication

AFNT-016/017/018/021: Larry explicitly approved all four pending batch-4 replacements. Mark 1:1, Luke 22:43–44, Romans 5:1 and 1 Corinthians 13:3 are now locally published. **All 30 initial explanations are approved; none remain in review or draft.** Original returns, exact corrections, contribution provenance and final approval hashes are preserved. [Completion and verification](docs/editorial-review/returns/2026-09-05/batch-4/RECONCILIATION.md).

Luke’s note-only view displays the exact two publisher notes and excludes comparison cards, including through legacy links. Mark preserves the exact partial-verse markers; Romans shows the Greek vowel difference; Corinthians displays the approved comparison limitation notice. No corpus, canonical mapping or source evidence changed.

Passed **33 Node groups, 11 Python tests, typecheck and production build**. Focused browser checks covered all four live notes, Luke’s two routing modes, keyboard citations/disclosures/Escape, exact source excerpts and a readable 320px Corinthians layout without overflow. M3 still requires qualified source/analysis and broader inline-marker acceptance; M4 follows. Local-only engineering preview, not the finished MVP.

## M3 accepted and engineering completion

Larry accepted all three remaining review items. Completed inline OM commentary markers and full-chapter access to reviewed absent-verse notices. Canonical source mappings drive the complete reviewed ranges; chapter links remain available. Verified all 30 notes across seven editions in regression coverage, with live John cross-chapter, Acts absence and Luke publisher-note routing/focus checks. Phone Scripture layout and unavailable Greek analysis were checked. **34 Node groups, 11 Python tests, typecheck and production build passed.**

[M3 acceptance record](docs/M3-Acceptance.md) contains the exact approval scope, tests and continuing limitations. M3 is accepted locally; M4 notes/resources is next. Historical entries above retain the progression of earlier states. No public deployment or finished-MVP claim.


## M4 accounts and private notes — local implementation, 2026-09-05

AFNT-022 implemented locally: account-owned canonical notes, create/edit/delete, explicit save/errors, stable IDs/timestamps, edition quotations, JSON import/export and readable export. AFNT-023 has server ownership/CSRF/version/conflict/import/quota checks under the scope amendment; local PostgreSQL backup/restore passed. AFNT-101 advanced into this slice: Google OIDC and once-only registration-password admission implemented, with live Google acceptance pending. AFNT-024/025 await verified resource inventory.

Architecture: Vinext on Node, dedicated PostgreSQL 16 for private data, immutable corpus files unchanged. Dedicated Docker/network/volume/database role/OAuth credentials and localhost:8135 Nginx template preserve isolation. Interactive secret setup writes an ignored private file. Host inspection remains read-only; DNS resolves to the supplied host and port 8135 was available.

Passed 36 Node groups, 11 Python fidelity tests, typecheck, production build and four PostgreSQL integration groups. Browser checked synthetic admission, keyboard verse-to-note save, BSB quotation retention after reload into YLT, export controls and 320px layout. Separate local database restoration passed. npm audit reported zero vulnerabilities after updates.

Next: configure dedicated Google credentials/registration secret, complete live OAuth and Docker/Nginx/TLS acceptance with privileged installation access, rehearse container backups, then resource inventory/M4 acceptance. Browser file-picker import/download-content QA remains open. No offline editing or full accessibility/security certification is claimed. See docs/M4-Accounts-and-Hosting.md. No public deployment; M4 and the MVP remain incomplete.

### M4 secret setup portability fix

The user's macOS Python lacks `hashlib.scrypt`. `scripts/configure-hosting.py` now uses the required Node runtime's scrypt with the app's parameters, passing the password only through stdin. It checks Node availability before prompting, validates the app's password length limit, and reports hashing failures without exposing subprocess output. Verified with disposable files: Unicode password accepted by the real application verifier, wrong password rejected, mode 0600, overwrite refusal, and mismatch leaves no file. No real credentials read or changed. Rerun the interactive setup to finish configuration.

### M4 live installation authorized and staged

User explicitly approved deployment after credentials were configured and checked without printing values. Prepared `deployment/install-host.sh` for interactive sudo on the host: isolated build/health checks, container backup/restore rehearsal, webroot TLS and dedicated Nginx site with validation. Added persistent ACME challenge routing for renewal. Shell syntax and exact Compose configuration validation passed. Source staging and private secret transfer use authenticated SSH; privileged installation and actual container/live Google verification are still pending. No existing game services or permission groups are modified.

### Initial HTTPS deployment verified

The user ran the approved installer and obtained the ad-fontes.app certificate. Its immediate post-reload curl reported a hostname mismatch; subsequent independent checks from the host and externally returned verified HTTPS 200, and the served certificate explicitly names ad-fontes.app. This is consistent with graceful Nginx reload timing, not a persistent certificate mismatch. Updated the final installer probe to retry briefly with full TLS validation retained. Existing unrelated Nginx protocol-option warnings were not changed.

Live health, reader deep link and account endpoint return 200. Accounts report enabled, anonymous sessions have no user, responses are no-store and the session cookie is __Host-, Secure, HttpOnly and SameSite=Lax. Real Google admission/return sign-in and private-note acceptance remain next; public reader is now deployed. Container restart and off-host backup checks remain open.

## Private GitHub workflow

User requested private GitHub push-from-Mac/pull-on-host updates. Created `larryherzogjr/ad-fontes-nt` as private with branch `main`; local pushes use existing GitHub authentication. The server has a dedicated repository-only read-only deploy key and GitHub API-published host keys pinned in its own known-hosts file. No existing app keys or services are reused.

Excluded environment secrets, backups, private keys, generated bundles/builds/dependencies and the supplied review-book PDF. Checked the staged files for all configured secret values and private-key markers: no matches; no files exceed GitHub's single-file limit. Source artifacts, provenance and editorial review history remain tracked privately. Added docs/GitHub-Workflow.md and a routine update script that builds, backs up PostgreSQL, then recreates only this app's Compose services. Routine updates require interactive sudo, not stored passwords. No live container rebuild/restart is performed merely to establish Git.
