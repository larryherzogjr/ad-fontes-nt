# OT import candidates — 2026-10-07 (AFOT-003)

## Result and publication boundary

Four OT corpus candidates are prepared at `artifacts/ot/ot-english-2026-10-07-candidate-v2/`, outside public assets and ignored by Git. Each contains 39 books, 929 chapters and exactly 23,145 text segments. BSB and MSB each preserve 3,542 publisher notes; BLB and YLT have no notes in the selected source layers.

Pinned metadata, exact engineering difference decisions, block-role decisions, registry proposals, implementation hashes and output checksums are in `sources/ot/releases/ot-english-2026-10-07-candidate-v2/`. These are engineering-verified candidates, not published editions or a recorded human source/display approval. No OT corpus is added to the production catalog or current reader. No Ordinary Means OT explanation or analysis is inferred.

Run `npm run prepare:ot` to reproduce/verify the current candidates and `npm run test:ot` for candidate reproduction followed by the dedicated fidelity checks. First preparation of a genuinely new reviewed candidate uses explicit `python3 scripts/ot/prepare_candidates.py --prepare`; this command never replaces existing pinned metadata or checksum records. There is no `--freeze` path. Unknown differences, changed input/evidence hashes, changed pinned implementation bytes and changed output bytes fail verification.

## Reconciliation decisions

Official Berean TXT controls every displayed Scripture character. USJ controls source block order, poetry/list markup, text-run positions, formatting marks and publisher notes. Original structured run text and original note objects are retained alongside the authoritative aligned text. YLT USFX provides paragraphs and independently verifies wording against VPL; VPL supplies exact displayed whitespace and source-line provenance. BLB retains plain verse layout and every supplied-word bracket.

### Scripture titles and publisher headings

Each Berean candidate contains **118 Scripture-title blocks**: 116 Psalm superscriptions, the introduction at Zechariah 12:1, and the closing musical instruction at Habakkuk 3:19. They remain text-bearing blocks attached to the existing numbered verse. No verse 0 is invented. Titles already present in TXT are represented once in the flattened Scripture segment and once at their intended position in the block/run representation; these are two representations, not two displayed copies.

Five Psalm book-range labels remain publisher headings. All 44 Psalm 119 `qa` blocks (Hebrew letter plus transliterated label for 22 stanzas) remain publisher headings, with no Scripture anchor. `qr` refrain blocks such as Selah remain text-bearing source structure. The precise decisions retain original markers and paths in the pinned review file.

### Remaining exact source discrepancies

After title/acrostic classification, each Berean source has 63 non-whitespace discrepancy pairs:

| Cause observed | BSB | MSB | Engineering decision |
| --- | ---: | ---: | --- |
| Extra closing quote strings | 50 | 50 | BSB has `[’’]`, MSB has `’’`; retain authoritative TXT wording. |
| Enumeration ellipses in Numbers 26 | 10 | 10 | USJ `. . .` is absent from TXT; retain TXT. |
| Supplied-word brackets only in USJ | 2 | 2 | BSB: Exodus 38:28, Judges 16:14. MSB: 1 Chronicles 1:17, Deuteronomy 32:43. Retain TXT; keep original structure and marks internally. |
| Stray `vvv` string in Genesis 35:18 | 1 | 1 | Retain TXT; preserve source string in original structured runs. |

Every exact pair is recorded with its decision and verified against a narrowly scoped transformation rule. No generic “accept all differences” rule is used. No discrepancy is presented as a manuscript variant or silently harmonized across translations. BLB's own supplied-word brackets are authoritative for BLB and remain intact.

Whitespace/run-boundary differences are also documented where normalized text differs: 1,112 BSB rows and 1,189 MSB rows. Including the 63 other pairs yields 1,175/1,252 normalized pairs. These numbers differ from AFOT-002's diagnostic extraction because the candidate correctly includes Scripture titles, excludes acrostic labels and introduces explicit block separators before distributing TXT text across source runs. Original run text, including whitespace, remains recoverable.

## Notes and canonical identities

Publisher-note originals and source paths are retained without alteration. Each note has a stable candidate ID, canonical verse anchor, original reference fragments and a recomputed character offset in the aligned authoritative segment. Fidelity verification checks every original Berean note against its pinned USJ object and verifies every note's final run position. This checks storage fidelity; rendered marker/focus behavior remains reader-integration work.

The isolated OT registry proposal uses source-verified chapter maxima. Its whole-Bible successor retains all existing NT entries and fields, changing only their display order by +39; it adds OT before NT. Active `registry.json`, `canonical-registry.json`, the edition catalog and frozen predecessor corpus outputs remain unchanged. YLT VPL source aliases and Berean Psalm/Psalms naming stay explicitly mapped, with original source paths retained.

## Candidate successor provenance

Candidate v1 metadata remains preserved. It represented exact TXT text correctly but concatenated adjacent structured blocks without explicit separators before diagnosing source differences. Candidate v2 adds layout separators so adapter-created missing spaces do not inflate source discrepancy counts; it preserves the same authoritative Scripture and original source records. The first incomplete v2 preparation caught a separator accidentally applied to BLB verse-only layout; that attempt wrote no release metadata/output. Correcting the plain-verse condition preceded the pinned v2 preparation. No predecessor metadata or source bytes were overwritten.

## Review samples and next step

[Readable source/display samples](OT-Import-Review-Samples.md) expose narrative, poetry, titles, acrostic headings, notes and the remaining discrepancy types from these exact candidates. They are source excerpts and engineering explanations, not new commentary.

AFOT-003 candidate engineering and deterministic preparation are complete. Source/display acceptance and promotion to a published corpus remain open. AFOT-004 is the next implementation step: integrate these candidates into a local OT reader, search, notes and English comparison, then verify deep links, keyboard navigation and phone layouts before any production release. The rebrand remains a coordinated later change; signing/package/updater identities remain unchanged.

## Verification recorded

`npm run test:ot` reproduces all 3,726 candidate JSON files byte-for-byte and passes six independent fidelity/gate tests. Every authoritative verse and aligned run is checked, alongside original USJ note objects/references/offsets, title/acrostic roles, candidate hashes, predecessor NT registry fields, and rejection of unexplained changes/pin replacement. `npm test` passed 76 Node and 20 Python tests; `npm run typecheck` and `npm run build` passed. No reading UI changed and no new browser checks are claimed.

## Candidate v3 and local reader successor (AFOT-004)

The current reproducible candidate is **ot-english-2026-10-07-candidate-v3**. Browser review exposed HTML presentation artifacts in 119 pinned BLB OT rows. This successor removes only the enumerated reference marker and three exact paragraph-marker forms, retaining original source text, every Scripture word and supplied-word bracket. Its 116 Psalm superscriptions have explicit Scripture-title blocks. Exact transformations, implementation identities and output checksums are pinned in the v3 metadata. V1/v2 metadata and implementation snapshots remain preserved; no raw source or predecessor checksum was replaced.

The local reader now consumes v3 only when `AFOT_LOCAL_PREVIEW=1`; see [local preview instructions and verification](OT-Reader-Local-Preview.md). Production remains NT-only. `npm run test:ot` verifies all 3,726 files and passes seven fidelity tests. The earlier sections record v2 engineering history; v3 supersedes their current-candidate and unimplemented-reader statements. Human source/display approval and public promotion remain open.

## Human approval and promotion

Larry approved the reviewed candidate v3 on 2026-10-07. The [acceptance record](OT-English-Acceptance-2026-10-07.md) supersedes the earlier pending-review wording. A separately pinned v1 successor enters normal local builds, preserving candidate content and predecessor metadata.
