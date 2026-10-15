# Library full-text search — local review candidate

Larry accepted the local experience on October 14: “The Library search looks good.” AF-SEARCH-001 is locally accepted; coordinated release publication remains separate. Printable study packets (AFNT-102) are the next authorized feature.

AF-SEARCH-001 · October 14, 2026. Larry authorized implementation for local testing before release. The shared web/offline frontend now provides a **Search the Library** collection. No version, signed installer, deployment or public release changed.

## Reader experience

Search the complete published bodies of 250 Ordinary Means Greek studies, seven existing Hebrew studies, 110 approved textual explanations, 260 Lenski chapters and 929 K&D source chapter groups. Results identify collection/author, highlight original prose, group matches by resource, and offer additional excerpts. Collection counts, source-book filters and 20-resource pages are available.

All ordinary words must occur in one paragraph/block. Quoted phrases require consecutive tokens; matching ignores case and accents and respects word boundaries. Punctuation is a word separator. No synonyms, stemming, related lemmas or theological equivalences are inferred. Title matches rank first, followed by consecutive phrase matches; remaining ties are stable. Word studies have no assigned book coverage and are excluded by a source-book filter.

“Open in context” opens the full resource in a search context view with a focused/highlighted block, a sticky return control and a link to its standard viewer (or the Hebrew study's author website). Escape or the return control restores the results; browser Back also preserves query/filter/page, scroll and the invoking result link's focus where session storage is available. Markdown structure is retained for studies and explanation prose; historical commentary preserves exact paragraph strings. Scripture quotations stay labeled as part of their containing resource. Existing Scripture search, source-language research and collection browsing remain available.

K&D source groups and Hebrew numbering are explicitly labeled; search does not establish verse alignment. The comparison context contains the approved explanation prose; full edition readings, citations, publisher notes and plates remain in the standard passage viewer. Linked-only websites/PDFs, lexicon datasets, publisher footnotes as a separate collection, image OCR, private evidence, drafts and predecessor study releases are outside this first full-text index. No additional Hebrew studies were commissioned.

## Data and reproduction

`library-search-2026-10-14-v1` is a new derived search release. Its tracked manifest at `content/library-search/library-search-2026-10-14-v1/manifest.json` pins 1,451 active public inputs, builder/tokenizer implementation hashes, 234 output hashes and complete counts: 1,556 resources / 73,903 blocks (including resource title blocks). Manifest SHA-256: `6d4f672643d5b9c4abc0024168a4ee137487a24e05cd82ec8c0784bf3553bd80`.

The normal offline import pipeline reproduces the index after publication/import steps and rejects differences against the tracked pin. This derivative adds no corpus mapping, source text or editorial approval changes. A future derivative correction needs a documented successor, with predecessor pins retained; do not overwrite the manifest to accept an unexplained failure.

Five small metadata indexes and 32 word-data shards per collection use delta-coded token positions and gzip-compressed binary payloads. The `.bin` suffix avoids the preview server's reserved `.gz` precompression handling. A Web Worker loads only needed word shards, matches phrases using recorded token positions, and suppresses superseded query responses. Excerpts load separately; the worker retains at most twelve text-shard promises. SHA-256 checks reject missing/mismatched assets before results are displayed. Failed searches never claim complete zero-result coverage.

Metadata totals 207,119 compressed bytes. Local disk/Node measurements, excluding excerpt downloads: “baptism” requires 692,709 metadata/term bytes; “baptism forgiveness” 1,387,884; “forgiveness of sins” 2,271,230. Observed local query computation was roughly 0–39 ms for those samples. These are not phone/network performance guarantees. Total derived assets are approximately 38.6 MB; only active search assets are staged offline.

## Verification and local review

The full production build ran normal imports and `npm test`: 132 Node/application tests and 44 Python/source checks passed. Typecheck and production web compilation passed. The offline desktop frontend build passed; ten packaging/offline tests include every search derivative hash, the exact pinned manifest, and the built worker. Browser review covered body-only Nekros results, word/phrase searches, K&D/Genesis filters, existing Hebrew studies, approved Hebrews comparison links, context highlighting, keyboard opening, page-two navigation, browser Back/focus/scroll restoration, and 320px/390px layouts without horizontal overflow. The packaged frontend search uses only local assets; this is not a new signed native installer or physical-device certification.

During review, fixes addressed query loss on direct reload, reserved `.gz` static assets, build/import overlap in preview asset copying, and rendering invalid new queries while older excerpts remained visible. Fresh-tab final checks confirm inline malformed-quote feedback without a render failure, correct latest-query results after rapid submissions, normal-query recovery, and Escape return. No error/warning logs were captured in that final tab. Refreshed web/offline builds, typecheck and all ten desktop checks passed after the last UI correction.

Local web review: `http://localhost:3034/library?view=fulltext`.

Suggested checks for Larry:

1. Search `baptism forgiveness`, then filter to Lenski or an Ordinary Means collection.
2. Search `"forgiveness of sins"` and inspect highlighted phrase excerpts.
3. Search `"rescue story"` to find prose inside Nekros that its title/description search did not expose.
4. Open a match, read its context, and use Escape or Back to return to the same results.
5. Select K&D and Genesis, then search `faith`; confirm the source-group labels are clear.

Next: Larry's local review and any corrections, then separately authorized release preparation. No hosted service, legacy account data, private configuration, supplied source archive, approved editorial payload or signing/updater identity was modified.


## 4.0.0 cross-platform derivative correction

The first clean GitHub build rejected the v1 search bytes. Local Homebrew Node 26 links zlib 1.2.12 and emits gzip OS byte 19; the pinned official Node 24.18.0 links zlib 1.3.1-e00f703 and reproducing the same decoded Greek metadata does not reproduce its gzip bytes. Thus the initial local-only compressed-byte pins were environment dependent. This is a packaging reproduction failure, not evidence of changed study prose. Workflow 38659959387 failed before native Windows packaging; no artifact from it is publishable.

Successor `library-search-2026-10-14-v2` uses the already locked MIT fflate 0.7.5 implementation as an explicitly pinned development dependency, pure-JavaScript gzip level 9 with zero timestamp and a fixed OS header. The implementation bytes are included in the derivative manifest. Code-point term ordering and explicit ASCII book/numeric chapter ordering remove host collation dependencies. The v1 manifest remains unchanged and its original builder/tokenizer are preserved in its evidence directory. Generated v1 assets are excluded from the active public/offline bundle.

All 1,451 source hashes and all five collection counts remain identical (1,556 resources / 73,903 blocks). All 234 decompressed JSON payloads compare deeply equal after only normalizing their release ID; postings, document/block ordering, exact prose, context URLs and matching behavior are unchanged. No corpus/editorial/source approval is replaced. New manifest SHA-256: `70017093d90f97ccedd89edbc9d99663c18bd43b52de59bcbc24ab8f56c10a1d`. Local Node 26 and official Node 24 reproduction and clean CI verification are required before publication.


Release reproduction confirmation: official Node 24.18.0 on macOS and the clean Linux shared-build job in workflow 38660620144 reproduce the exact v2 pin. Official Node 22.23.3 on macOS also reproduces it, covering the production Dockerfile’s Node major version in addition to the native build runtime. The original Homebrew Node 26 reproduction remains verified. No predecessor pin was overwritten.
