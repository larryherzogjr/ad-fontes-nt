# Encyclopedias — local first phase, October 16, 2026

AF-LIB-005 · Larry authorizes integration of both supplied encyclopedias with Library browsing, article pages, full-text search and offline access, for local review before release. Archive instructions and rights assertions are source claims; they do not authorize deployment, account extraction, revised ISBE, a new commentary classification or restoration of retired collections.

## Included behavior

A twelfth Library collection, **Encyclopedias**, provides a work selector, A–Z filters, accent/case-insensitive heading search, pagination and separately addressable articles. Exact heading matches rank first. Full-page article readings retain source wording and author signatures, with work/editor/year labels, source notes, bookmarks/recent readings, preserved browsing state and Escape return. Direct URLs and browser history are supported. Both front-matter/abbreviation sections are separate readings.

- ISBE, Orr general editor, 1915: 9,347 articles plus front matter.
- The Lutheran Cyclopedia, Jacobs and Haas, 1899: 2,121 articles plus front matter.

Each work is separately filterable in unified full-text search. Search retains the existing same-block word/phrase matching and exact paragraph context. Standard-viewer links open the article. Encyclopedia entries have no inferred Bible-book coverage; a source-book filter excludes them. No Scripture citation parser, automatic passage recommendations, packet inclusion, lexical alignment, or restoration of Historical Writings/Confessional Connections is included.

Shared generated Library assets are copied into the offline desktop frontend. Only runtime catalog/article/search projections ship; extraction scripts, ZIP, duplicate plain-text exports and raw account sessions do not. No signed installer is produced by this request.

## Source and data decisions

The supplied ZIP is preserved unchanged at `sources/encyclopedias/raw/encyclopedias-adfontes-package.zip`, SHA-256 `7b79616088929d354eebc26a29309be308e9206c0848587a832e59b60414bb23`. It is 26,702,202 bytes. ZIP CRC verification passes. All 11,468 article JSON records parse, have expected fields and nonempty text. The two indexes agree with article counts. Every article also occurs exactly in its supplied combined plain-text export. The importer retains 22,288,529 ISBE and 3,424,217 Lutheran article characters; front matter is additional. Original supplied text can be reconstructed exactly by joining projection paragraphs with double newlines, and its SHA-256 is retained per article. The publication/title/copyright notices remain in the front-matter readings.

`build_encyc.py`, `toc_walk.py`, `chain_extract.py` and the handoff are preserved inside the ZIP as evidence, never executed as import or app code. There are no network calls or authenticated account dependencies. The article-chain/TOC JSONL logs are absent from the ZIP, but were subsequently recovered from the local preparation folder explicitly named by the supplied builder. Their exact original bytes are preserved in four checksum-pinned gzip wrappers under `sources/encyclopedias/extraction/`. The independent `scripts/audit_encyclopedias.py` checks the full chain, next links, offsets, every level-2 TOC anchor, title/text inventory and front matter against the supplied ZIP. No account extraction or source script was executed.

ISBE has 20,585 raw chain records / 20,572 unique records, with offsets 8,752–23,315,379; Lutheran Cyclopedia has 2,200 raw / 2,199 unique records, offsets 114–3,514,636. Both chains tile with zero gaps or overlaps after duplicate removal. All 9,368 ISBE and 2,123 Lutheran level-2 offsets align to article starts. In the alphabetic entry projection, ISBE has 9,348 TOC entries (one decorative letter excluded) and Lutheran 2,121 (none decorative); 20 ISBE and two Lutheran level-2 entries are outside the alphabetic groups. Front matter is preserved separately; the ISBE back index remains outside the article projection. These independently observed counts supersede the handoff's implication that all count differences were decorative letter removals.

Thirteen ISBE and one Lutheran resumed records differ in ephemeral `marker`/`hw` DOM IDs. Their offsets, lengths, next pointers and HTML after only those ID replacements are identical, and independently extracted prose is identical. Both raw instances remain preserved; the adapter retains the first, matching the supplied builder's behavior. The evidence ledger records every duplicate and original HTML hashes.

The recovered HTML includes publisher page milestones. This phase does not guess corresponding paragraph/page spans from the flattened transcription; readings use stable article-heading/source-edition locators. A future visual/layout and page-locator projection can use this preserved evidence. The package does not silently replace a released ISBE corpus (none is currently active).

The supplied handoff asserts public-domain status for the original works and identifies modern Logos resource versions. Local implementation follows Larry's explicit instruction to integrate this supplied material. No independent worldwide-rights guarantee, publisher permission or clearance of a distinct modern editorial layer is claimed. Exact-artifact provenance and these limits remain recorded in `sources/encyclopedias/source.json`; publication review must retain the distinction. The copyrighted Revised ISBE resource `LLS:14.0.24` is not an input and is explicitly rejected in source labels.

### Headings, identity and references

All supplied filenames are retained as stable source IDs. Neither canonical references nor new headword slugs are guessed. Lutheran Cyclopedia has **17 repeated-heading groups / 18 additional records**. These include distinct persons/synods and separate theological treatments. All records survive. Unique display labels append a stable catalog ordinal ("source entry N of M"), with exact source openings as previews and links to other entries sharing that heading. Ordinals distinguish records; they are not print section numbers or evidence of an intended article order. The manifest records every duplicate group for review.

The importer recognizes only a complete entry of the form `Headword. See Target.` and matches a punctuation/accent-insensitive target within the same work. No prose is changed or automatic redirect forced. Of 783 recognized references, **395 have one verified target**, **386 have none**, and **2 have multiple candidates**. Article pages offer verified destinations or candidate choices; unresolved targets remain visibly unresolved. Inline/compound/qualified references remain original prose. The audit retains every recognized target/status, so future corrections require evidence rather than fuzzy matching.

The supplied print-volume grouping was generated alphabetically by the package builder. It remains `suppliedVolume`, expressly described as metadata, not a verified print-page citation. Source identity never depends on it. Exact author signatures remain in the text; editors are not represented as the author of every article.

The supplied text conversion omitted images/maps and ISBE's indexes. The recovered TOC also exposes an unprojected Lutheran appendix and contributor index; these remain preserved in the raw source, explicitly disclosed in the app, and outside this supplied-article browsing phase. The complete 11,468-entry alphabetic article inventory and both front-matter sections are reproduced; no claim of an unabridged facsimile is made. Margin headings can interrupt sentences, and the flattened article projection does not retain semantic HTML hierarchy. Original HTML remains preserved privately in the recovered source evidence. The projection preserves those paragraphs rather than silently reordering or guessing headings. Source notices disclose these limits. New OCR, image recovery, page citations and semantic-layout reconstruction are separate source work.

## Reproduction and pins

`python3 scripts/import_encyclopedias.py` verifies the raw ZIP and all source input hashes, reconciles combined exports, reproduces the catalog/articles/audit and rejects differences against `content/encyclopedias/encyclopedias-2026-10-16-v2/manifest.json`. The pin includes importer SHA-256, original inputs, output SHA-256, the recovered-extraction audit checksum and the full duplicate/reference audit. Routine imports independently recheck the recovered evidence as well. The reader also checks catalog and article bytes before showing readings. The initial delivery-only candidate (`encyclopedias-2026-10-16-v1` / search v6) is preserved with its exact importer, source metadata and search implementation in evidence directories. The recovered original extraction logs require the explicit v2 encyclopedia / v7 search successors. Article prose remains unchanged. No frozen predecessor pins are overwritten.

- Encyclopedia manifest SHA-256: `7e10816b620c740ab0e587aba616e7d28a3071dd8489aab70534d9297ca80bf8`.
- Search successor: `library-search-2026-10-16-v7`; manifest SHA-256 `d2057a7858209b30ce53161c09c9a6ef8baa04a85a92db39e313d3b6d5683f5b`.

The new search has **13,026 resources / 151,940 blocks / 327 derivative files** across seven collections. All **1,451 predecessor input hashes**, original five collection counts and **234 decompressed predecessor payloads** are unchanged after release-ID normalization. The old v5 implementation is saved in its evidence directory; all predecessor manifests remain unchanged. Runtime staging excludes retired collections and inactive search releases, including v5 and the initial local v6 candidate.

Raw runtime catalog/articles total **38,339,261 bytes**, excluding the audit manifest. The uncompressed catalog is **5,479,172 bytes**. All search derivatives total **61,118,988 bytes** (about 22.5 MB more than predecessor); compressed metadata totals **599,218 bytes**. Article bodies load separately, and search word/excerpt shards load on demand. These are file measurements, not phone/network guarantees or signed installer growth measurements.

## Verification and local review

Final verification passes:

- `npm test`: 189 application checks and 51 Python/source checks (the final active v2/v7 suite also runs inside the successful normal `npm run build` prebuild).
- `npm run typecheck` and the normal production `npm run build` pass after the final changes.
- Final offline staging (`node scripts/prepare_desktop.mts`) includes **73,035 assets**. The desktop Vite production build passes; `npm run test:desktop` passes **20 checks**, including every encyclopedia output hash, all search hashes, active-only inventories and preserved native identities. The final offline build used the verified normal-import web outputs, then the same desktop staging/Vite steps without repeating imports a fourth time.
- Browser checks cover both work labels, A–Z/work filters, heading search and ordering, all three Predestination records and related-entry navigation, page-two/three focus, article keyboard opening, Escape and browser Back with filter/page/scroll/focus preservation, direct reload, immediate bookmark/recent-shelf updates, the verified Means of Grace reference, explicit missing-entry recovery, and Greek/Hebrew in Aaron. Test-created bookmarks were removed.
- Production web search checks find the body-only ISBE phrase `"three good harbors"` in Corinth, preserve highlighting/context and open the standard article viewer. Lutheran phrase `"standing or a falling church"` finds Justification. Packaged offline browsing opens Aaron with Greek/Hebrew; its worker finds Justification and displays exact phrase context. There are no captured browser warnings/errors in the final checks.
- Phone layouts at 320px (article/browser/offline search context) and 390px (web search) have no horizontal overflow. Viewport overrides were reset. Screenshots are under `artifacts/review/encyclopedias-2026-10-16/` (ignored review artifacts).
- All 11,470 v2 article/front-matter payloads are identical to the initial v1 payloads after only normalizing the release ID. All 234 predecessor v5 search payloads remain identical after derivative-ID normalization; the permanent tests check predecessor inputs/counts, original decoded payload reproduction and preserved implementation evidence. `git diff --check` passes.

Local web review: `http://127.0.0.1:3036/library?view=encyclopedias`.

Suggested review: search headings for Baptism and Predestination; read both works; follow Means of Grace; search full text for either phrase above; reload an article and return to filtered results. The local production preview can be restarted with `npm --prefix app run start -- --hostname 127.0.0.1 --port 3036`. Offline QA preview is stopped after testing; the built offline frontend remains available. No physical-device, signed-native or external-network-offline measurement is inferred from a browser preview. The packaged asset/checksum checks establish that the new reading/search data are local and complete relative to the selected source projection.

Next: Larry's local review and any corrections, then separately authorized release preparation. The known layout, image/back-matter coverage, publisher-locator and source-rights distinctions above remain explicit. Existing accepted M5/MVP status remains closed; this follow-on has its own local review. Version remains 4.3.3. No commit/push, publication, deployment, signing or host change is included. Source/corpus/editorial predecessor pins and accepted M5/MVP status remain preserved.

## Release acceptance

Larry accepts this exact local candidate and authorizes commit, push and website plus signed Mac/Windows release **4.3.4**. This supersedes the local-review next step above and records the owner decision to publish the supplied historical resources with their existing attribution and source limitations. Source v2/search v7 pins remain unchanged; no broader worldwide-rights certification is inferred. See [4.3.4 release record](V4.3.4-Desktop-Release-2026-10-16.md).
