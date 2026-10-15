# Edersheim Toronto scan-backed replacement — October 15, 2026

Larry authorized proceeding with the independent Toronto source and selected **scan-backed reading with searchable OCR**, accepting the larger offline app. This supersedes the CCEL-based Edersheim portion of the local Historical Writings enhancement. Current-release acceptance remains closed; version 4.2.0 and native identities are unchanged. No deployment or signed installer publication is included.

## Independent source and preservation

The authority is the **1899 eighth revised edition**, New York: Longmans, Green, and Co., in two Robarts Library / University of Toronto volumes, digitization sponsored by MSN:

- [Volume I](https://archive.org/details/lifetimesofjesus01ederuoft), identifier `lifetimesofjesus01ederuoft`, 742 PDF pages.
- [Volume II](https://archive.org/details/8edlifetimesofje02ederuoft), identifier `8edlifetimesofje02ederuoft`, 848 PDF pages.

Both saved distributor metadata records identify `NOT_IN_COPYRIGHT` in the United States. This historical edition, independent PDF scans and their own OCR replace the CCEL digital edition. No CCEL prose is used to repair the OCR. This resolves the previously recorded CCEL-source dependency for the prepared enhancement; it does not claim uniform copyright status worldwide or permission for other editions.

`sources/historical-library/historical-library-2026-10-15-v2/` preserves original PDFs, ABBYY XML, plain text, metadata, a source checksum inventory, exact boundaries/exclusions, legacy-link crosswalk, and frozen scan derivatives. PDF/XML acquisition bytes were compared to distributor MD5 records; original TXT checksums remain pinned. Preparation uses pypdfium2 5.14.0 and Pillow 12.3.0, recorded in `toronto.json`. Pages are rendered directly at 2,200 pixels along the long edge, grayscale WebP quality 75, method 4. Normal builds verify and copy these frozen images; they neither fetch sources nor render them anew. `scripts/prepare_edersheim_scans.py` is a separate one-time preparation recipe for a reviewed derivative. It refuses to overwrite a pinned release; a new source release needs a new destination. The original preparation snapshot remains frozen in source evidence; the active recipe additionally guards frozen destinations and records Pillow metadata directly.

The historical v1 manifest, original sources and exact v1 importer remain preserved. The search v3 manifest and exact builder/domain bytes are also retained. Their manifests remain byte-identical. Active web/offline assets omit both the old historical v1 projection and search v3, which contained the replaced CCEL digital text. The notices distributed with the successor describe the independent Toronto source; Gutenberg's full notices for Josephus remain included.

## Content and differences

The successor retains seven works and **783 readings**, of which Edersheim supplies **141**. Walther, Krauth and all four Josephus works retain their exact section payloads after normalization of only the historical release ID.

Edersheim contains 98 chapters across five books, all 19 appendices, both printed indexes, title/edition matter, dedication, publisher works, historical prefaces, authorities, abbreviations, printed contents and both volumes' explanatory notes/corrections. Existing 129 Edersheim reading IDs map to the corresponding book/chapter or named division in the 1899 edition. Newly included matter receives descriptive IDs. This preserves old reading URLs while clearly identifying the different print edition; it is not a claim of textual equivalence to the 1953-based CCEL edition.

**Correction to the earlier research description:** the prior catalog omitted Appendix **XIII**, not XIX. Toronto contains both; Appendix XIII now has its own reading. There is no fabricated Bible passage alignment, original-language transcription, new commentary or classification.

The boundary ledger partitions every physical OCR line exactly once into a reading or one of five explicit exclusions. Only library/digitization matter and the first duplicate scan of printed volume I pages 606–607 are excluded; the second occurrence is retained. Every nonempty ABBYY XML line matches the corresponding normalized nonempty raw TXT line, in order: 34,125 lines in volume I and 41,619 in volume II. XML object numbering matches PDF page numbering exactly. The displayed OCR preserves the included original nonempty physical lines and groups them by source page; blank layout lines are omitted. No spelling, hyphenation, marginal-reference or footnote-order repair is attempted.

**1,559** OCR-bearing pages are included. All 31 PDF pages omitted by this projection were visually checked as a contact sheet: covers, blank pages, library/digitizer matter, or the explicitly excluded duplicate pages. That audit and the contact sheet are saved in source evidence. It is not a claim that every page's typography or OCR was proofread.

## Reading and search

Printed pages are the default reading view, with previous/next page controls, page selection, fit-width and enlarged views, scrollable page areas and collapsible OCR for the selected page. Pages are identified by volume and **PDF scan number**, distinct from printed folios. Full page context can include adjacent reading material. Source notes, Greek and Hebrew remain visible in the scans; OCR does not reliably capture them or the reading order of two-column footnotes. Quotation checking requires the printed page.

Each scan has a SHA-256 pin, dimensions and source page identity. Runtime loaders reject missing/corrupt scan bytes; native CSP remains unchanged. Deep links use `scan=v2-p0100` within a reading. Invalid page IDs show an explicit recovery action rather than displaying an unrelated page. Existing chapter bookmarks continue to open their matching reading.

Search `library-search-2026-10-15-v4` indexes the independent OCR in page blocks and carries the exact page ID with each block. “Open matching printed page” opens the selected result's source scan. Ordinary match highlighting, return-to-results behavior and original author/source separation remain. Search uses OCR only; absence of a match is not absence in the printed text. The original five collections retain all 1,451 input hashes and 234 decoded predecessor payloads after search-release-ID normalization. Totals: **2,339 resources / 88,393 blocks / 373 compressed derivatives**. The different block count reflects page grouping and replacement text, not lost author works.

The frozen page images total **351,344,652 bytes (335.1 MiB)**, available in the offline package without remote source access. Original PDFs/XML remain source evidence and are not bundled as additional app downloads.

## Pins and verification

- Historical successor: `historical-library-2026-10-15-v2`; manifest SHA-256 `4f4482d188c29e145b0a0e4cc4a178b71a7ca888d19b28f5c6c481d0e606db4c`.
- Catalog SHA-256: `9d6fadf6a2288e7536c81a6e36a0321e86fde978bd94a05b3087dcc4227336db`.
- Search successor: `library-search-2026-10-15-v4`; manifest SHA-256 `c55ed48eebdeabd5647a89c14b9244dc9c20147d104019cf192781f48ced7689`.
- Historical predecessor manifest: `e2137d8b69d5c095352de1d4b1717999122fd5344f949842e1ea5d5bf09fb884` (unchanged).
- Search v3 predecessor manifest: `00ea94f60cb2d239666a8583e31d62455520985cabfa67c46190611abf1dae75` (unchanged).

Verification passes: `npm run build` including offline imports and `npm test` (192 application / 50 Python-source checks), `npm run typecheck`, `npm run desktop:build:web` (63,956 staged assets), and all 18 desktop checks. Browser review covers the preserved chapter links, page selection and reload, keyboard navigation and scrolling, Escape-to-contents focus, OCR disclosure, scan enlargement, unavailable-page recovery, restored Appendix XIII, exact phrase search to printed scan, and 1440/390/320px layouts. The offline frontend loads and navigates its own bundled scans. Captured web/offline console warnings/errors: none. Final observations are recorded in PROJECT-STATUS.md and `artifacts/review/edersheim-toronto/verification.json`. No signed-native or physical-device result is inferred from the offline frontend checks. Next: local owner review; any release/deployment is a separate step. Further OCR proofreading or multilingual transcription is future source work, not a current-release acceptance item.
