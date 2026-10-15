# Full-text Library search exploration — October 14, 2026

Subsequent instruction authorized local implementation. See [the implemented review candidate](Full-Text-Search-Implementation-2026-10-14.md); this proposal remains the design rationale.

AF-SEARCH-001. Larry requested exploration of the feature after accepting the current release. This is a proposal grounded in the local application, not an implemented or released feature.

## Existing functionality

- Scripture search is a separate reader capability. Preserve its selected-edition behavior and Scripture-only results.
- The Library searches textual-comparison titles, summaries and the published observation/interpretation text. Greek word-study search uses titles, descriptions, glosses, categories and tags rather than article bodies.
- Lenski and Keil & Delitzsch already provide full paragraph substring search within a selected biblical book. Commentary results link to paragraph indexes through `commentaryParagraph`.
- The approved active Greek study release has 250 articles; the active Hebrew study release has seven. Existing Hebrew studies can be indexed without commissioning additional studies. There are 110 approved textual comparisons.
- Existing commentary search JSON contains 31,730 Lenski rows (26,057,813 bytes) and 29,773 K&D rows (30,834,562 bytes). Local parsing is quick, but disk parsing does not establish browser/network performance. Fetching all 54.3 MiB to perform an initial all-Library query would be a poor default to adopt without measurement.

## Proposed first experience

Add a Library-wide “Search the Library” entry with one query field. Search approved Greek/Hebrew article bodies, approved textual explanations and both historical-commentary collections. Retain existing collection browsing and Scripture search.

Show results with source/author, article title or commentary source chapter group, a short highlighted excerpt, and an “Open in context” link. Support collection filters and pagination. Where book metadata is established, allow a book filter; never infer that a word-study mention establishes commentary coverage or that a K&D chapter group identifies an exact canonical verse.

Default ordinary English queries to all entered words within one indexed paragraph/block; quoted phrases require consecutive words. Explain these modes in a short example, such as `baptism forgiveness` and `"forgiveness of sins"`. Match case-insensitively and use token boundaries for ordinary words. Treat punctuation and phrase boundaries consistently. Do not silently add synonyms, cognates, fuzzy matches or theological equivalences. Original-language lookup/morphology remain their existing separate research capabilities in the first increment.

Rank exact title/phrase matches ahead of other paragraph matches, with stable ties. Prevent long works from filling the first page with near-identical hits: show each study once with expandable matching excerpts; group commentary hits by source chapter group with matching paragraph counts. Expose collection counts so readers can narrow results.

Opening a result should scroll to and highlight the matching passage of the resource. Back returns to the query, filters, page and position. Commentary has paragraph navigation already; article and comparison destinations require additional stable block navigation and highlight support. Query normalization needs a mapping back to original character offsets so accents and decomposed Unicode cannot corrupt excerpts or highlights. The displayed original prose remains exact.

## Proposed implementation boundary

Generate a separate versioned search derivative from an explicit allowlist of active, published releases. Pin input release IDs/hashes, extractor/tokenizer version, block locators and output hashes. Build only after the existing import/publication steps produce the approved projections. Do not scan raw source directories or every generated predecessor directory: older and unapproved content can exist locally.

Prototype a compact token-to-block index with separately loaded metadata/snippet text. Search in a Web Worker, cancel obsolete queries, and share the same static assets and engine between web and offline desktop. Determine shard boundaries and whether to reuse existing commentary search files through measured size, cold/warm query and memory results. No account, database or hosted search service is required by this proposal.

Keep commentary source chapter groups and verified verse metadata distinct. Exact destinations use source collection/release + book/group + paragraph index, not guessed Scripture identity. A search hit inside a quotation remains a result from its containing commentary or article, with that source label.

Missing/corrupt shards must report incomplete search or an explicit error; never present partial results as a complete zero-result search. Exclude drafts, predecessor editions, private evidence, linked-only websites/PDFs and manuscript image OCR. Preserve all notices and approved content hashes.

## Next concrete increment

Implement a local vertical slice covering all approved article/comparison bodies and both commentary collections. Include collection filtering, word/phrase matching, source-labeled excerpts, deterministic pagination, direct match navigation, return behavior and offline assets. Benchmark a compact index against the existing commentary rows before fixing the storage format.

Verify body-only hits, phrase/word boundaries, original-character highlights, all active-release coverage, draft/predecessor exclusion, corrupted/missing shards, rapid query cancellation, deep links/Back, keyboard operation and 320px/390px layouts. Run `npm test`, `npm run typecheck`, `npm run build`, offline build and desktop verification after implementation. Release/version/publication work follows the existing workflow separately.

Boolean expressions, wildcard/fuzzy search, semantic/AI answers, cross-resource concordance, new content acquisition and additional Hebrew studies remain later options. The first goal is reliable access to prose already included in Ad Fontes.
