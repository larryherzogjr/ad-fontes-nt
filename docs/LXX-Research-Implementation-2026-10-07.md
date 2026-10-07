# Comprehensive Greek research expansion · October 7, 2026

Local web and desktop implementation; release/pilot remains incomplete. Native signing, updater, package identity and version 1.1.5 remain unchanged. The user's existing October 7 authorization covers the same public source resources; original notices remain bundled. No independent legal resolution is asserted.

## Source inventory

`lxx-research-2026-10-07-v1` is a new immutable derivative of all 59 non-helper JSON source files at the same pinned morphology repository commit `0a23df295de5e5710724c8b6e84edf99e89348aa`. Original gzip bytes, original SHA-256, compressed SHA-256, implementation hash, input and output hashes are pinned. No network access during builds. Original selected LXX v3 and original Greek lemma derivative remain reproducible and unchanged.

The inventory has 30,603 source verses, 623,440 tokens and 14,313 LXX lemma spellings. There are 3,706 exact NFC lemma spellings shared with the indexed Nestle NT. Counts include alternate texts; they are not totals for a single edition. Of the source verses, 22,886 have existing verified English correspondences and 7,717 have none, including 342 original unpaired verses and 7,375 additional or alternative verses. Additional books and variants have source identities only; no English canonical mapping is inferred.

Joshua's original 96-verse file is explicitly partial. Complete selected Joshua remains Vaticanus B. Judges Vaticanus B, Daniel Theodotion, Tobit Sinaiticus and alternate Susanna/Bel are independently labeled. Sirach chapter 0 is preserved as a source prologue. This is the available pinned collection, not exhaustive manuscript coverage. Raw records retain all original analysis; the research bundle projects source surfaces, lemmas, grammar, confidence and source identity without claiming English word alignment.

## Reader features

`/greek` supports exact Greek words, quoted contiguous phrases, optional accent folding for text only, exact NFC lemma identity, original morphology filters within the same token, source-book and source-only filters, pagination, and deep links to every available source verse and selected word. Original source order governs previous/next and chapter navigation. Word definitions, interlinear, source grammar, full-source concordance and existing approved OM Greek-word articles remain distinct. No new OT commentary is invented.

Full-source concordance counts include alternatives/source-only verses, display mapped/source-only totals and book filters, and verify highlights against exact stored token IDs and offsets. NT source coverage limitations remain unchanged.

Connected passage comparison allows bounded user-selected NT/OT ranges (60 verses per side), persistent deep links and restoration to original publisher selections. Shared lemmas and deterministic longest common subsequence of exact NFC forms/lemmas are mechanical aids, not literary dependence, English alignment, or an editorial quotation classification. Repeated words admit alternative equally long subsequences; very large comparisons ask for shorter passages.

## Connection coverage and review

Original BSB 698 records remain unchanged. A separately pinned MSB derivative has 698 records. Deduplicating reciprocal exact pairs yields 503 BSB pairs and 508 combined pairs. Five distinct MSB additions: Mark 9:44 / Isaiah 66:24, Mark 9:46 / Isaiah 66:24, Mark 15:28 / Isaiah 53:12, Acts 15:17 / Amos 9:11–12, Romans 6:23 / Proverbs 10:16. These are publisher links, not newly reviewed interpretations. Original edition coverage determines whether the linked verse text is present.

A third independently pinned derivative adds 552 explicitly marked BSB/MSB publisher-heading reference records. Source ranges identify the opening verse following the heading, not invented section or quotation extents. This increases the combined catalog from 508 to 876 distinct pairs. Predecessor connection records and v1 editorial review packet are preserved.

`/connections` browses by NT book, OT book and reviewed/unclassified category, preserves all 1,948 citation records and reciprocal navigation, and reports indexed coverage per NT book. Existing eight exact approved labels remain unchanged. New editorial inventory contains 876 exact pairs, 288 proposed quotation pairs with fuller draft display selections, original publisher evidence and pinned Scripture. It remains outside public/desktop bundles. Composite quotation selections require special review. See `Expanded-Connection-Review-v3-2026-10-07.md`; assignment is not approval.

## Preserved gaps

321 canonical English addresses still lack verified LXX correspondence. They do not indicate Greek textual absence. The source research workspace makes independent source passages available without guessing mappings. `LXX-Research-Gaps-2026-10-07.json` preserves the full inventory.

Original 19 unmatched gloss verses remain unmatched. Across all 59 source texts there are 64 non-exact verse matches (19 word-count differences and 45 missing gloss-source verse references); exact original differences are documented in `LXX-Gloss-Differences-2026-10-07.json`. Glosses/Strong’s align only to exact ordered NFC word-surface matches. No fuzzy match or changed core importer baseline hides these differences. Additional transcription gaps and edition differences remain possible.

## Packaging and outstanding release work

Research adds approximately 135 MiB of uncompressed JSON to existing offline assets. Package size and pilot performance require review before release. Initial all-source searches load source-book shards; later searches share cached immutable data. Hebrew remains undecided. New source/correspondence fixes require successor releases with reviewed differences. M5 pilot, signed distribution and deployment remain next; no deployment performed in this expansion.

Heading derivative v2 corrects 267 opening anchors: original paragraph whitespace can retain the preceding verse anchor, so the explicit following verse marker governs navigation. v1 source/output/implementation bytes and editorial packets are preserved. Exact reviewed engineering differences: `sources/testament-connections/publisher-heading-connections-2026-10-07-v2/reviewed-differences.json`. Current editorial packet is v3 (288 proposed quotation pairs); predecessor v1/v2 packets are historical.

Final local validation: 94 Node tests, 32 Python checks, six desktop packaging/runtime tests, type checking, web production build and offline desktop build passed. Browser checks verified exact Greek phrase search, morphology search in Tobit Sinaiticus (126 matching noun/genitive/singular source verses), full-source θεός counts (4,006 LXX / 1,309 NT), source-only token links and interlinear, keyboard next-verse navigation, Sirach prologue, catalog book/evidence filters, restored comparison deep links and 390px phone widths without horizontal overflow. No browser errors in the final desktop preview. Uncompressed native content staging is about 1.3 GiB; compressed signed package size and real-device pilot performance are still release work.


## October 7 · expanded quotation approval

Larry Herzog Jr. approved all 288 proposed quotation records in the v3 packet (user: “All approvec.”). Exact packet SHA-256 remains `0eeda81dcc72f5d95ec6a5f9bcabaa93612ccd0fc2161f31d4e2fa0f3d543574`; historical draft bytes are preserved. Per-unit exact hashes, reviewer, date and decision are recorded in `content/editorial/connections/expanded/reviews.json`. The 588 records without new quotation approval retain their prior classification status: one previously approved allusion and 587 unclassified publisher pairs.

AF-OT-013 is implemented locally through `reviewed-connections-2026-10-07-v2`: 288 quotation classifications and approved fuller NT display selections. Original eight-label v1 bytes remain preserved; seven overlapping quotation labels are superseded for active display, retaining the original allusion: 289 active classified pairs (288 quotations, one allusion). The connections panel defaults to approved spans, supports persistent manual overrides, and can restore publisher anchors or approved selections. This records classification/display approval, not exclusive LXX dependence or new theological commentary.

M5 pilot, package-size/performance evaluation, signed distribution and release acceptance remain outstanding; MVP is incomplete. No deployment or native signing identity change.

Approval-release verification: `npm run build` reproduced immutable inputs and passed all 96 Node and 32 Python checks; `npm run typecheck` passed. Desktop production bundle built from 28,996 staged released files; six desktop offline checks passed after build completion. Browser checks passed on web and packaged desktop preview: catalog 288 quotation pairs/289 active classifications; automatic HEB 8:8–12 / JER 31:31–34 selection from HEB 8:12; publisher/restored reviewed selection; keyboard activation; manual URL override preserved on reload; ordered Greek forms 108 matches over 135 NT/133 OT tokens; 390px phone without horizontal overflow. No browser errors observed. Local web review runs at http://localhost:3016. No deployment.
