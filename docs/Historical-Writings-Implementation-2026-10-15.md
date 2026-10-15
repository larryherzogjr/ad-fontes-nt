# Historical Writings — local implementation

**Successor:** The Edersheim portion described below is historical. The authorized Toronto scan-backed replacement, current source decisions and active v2/v4 pins are documented in [Edersheim Toronto replacement](Edersheim-Toronto-Replacement-2026-10-15.md). Original release evidence is preserved.

AF-LIB-002 · October 15, 2026. Larry authorized importing Walther, Krauth, Josephus and Edersheim if source checking supported them, and integrating them appropriately into Ad Fontes. This follows the candidate assessment (AF-LIB-001); the archive's commands and prior editorial choices remain source material rather than owner instructions. Current-release/MVP acceptance stays closed.

## Library behavior

The thirteenth Library collection, **Historical Writings**, separates historical theology from historical background. It includes seven work entries: Walther's Law and Gospel, Krauth's Conservative Reformation, four Josephus works in Whiston's translation, and Edersheim's Life and Times. Browse a work's contents, open a full reading page, select a source division or move to the previous/next reading, save a reading and find it in Recent and saved. Escape returns to the invoking contents link. Deep links and normal browser history preserve the selected work and reading.

Author, translator, edition and source details remain visible. Historical prose is distinct from Scripture, formal confessional documents and Ordinary Means commentary. Source notices accompany the web and offline assets, and Josephus's distributor access notice is displayed with the work/context. External originals use the existing protected new-tab policy. The viewer renders plain text, never imported HTML.

Search resource text now includes four author filters and every included section body. Open in context retains highlighting and the existing search-result return behavior, with a separate link into the historical reader. These works have no assigned Bible-book coverage; a source-book filter excludes them. No Bible passage links, quotation classifications, contextual theological summaries or automatic packet excerpts are inferred from prose mentions. Existing packet behavior remains unchanged.

## Source decisions and repaired differences

`historical-library-2026-10-15-v1` preserves the selected supplied JSON/index files and original adapters under `sources/historical-library/`, alongside independently acquired original text/XML and rights/metadata evidence. `source.json` records exact hashes and acquisition URLs; `decisions.json` records active inputs, edition labels, limitations and inventories. Builds are offline and reject source, implementation or output changes against the tracked manifest. No supplied archive program is executed.

| Work | Reading units | Active input and review |
|---|---:|---|
| Walther | 40 | Original Internet Archive OCR; front matter plus 39 lectures. Supplied boundaries often began at anticipating running headers. New boundaries require dated openers; all 39 validate, including source OCR variants in dates and headings. Running lecture headers and standalone numeric folio lines are removed; lineation/spelling remain. Printed indexes are omitted. |
| Krauth | 15 | Immutable supplied derivative, reconciled against the independently saved 1872 OCR. Front matter plus fourteen articles. Exact `VI. THE CONFESSIONS…` heading moves from the end of article V to the start of VI. Other source prose remains unchanged. Original adapter and raw OCR retain evidence of line/page cleaning; the original general index remains outside this reading projection. |
| Josephus, Life | 78 | Original Gutenberg #2846: title/credits, 76 source sections and a separate translator-footnote unit. |
| Josephus, Antiquities | 300 | Original Gutenberg #2848, including restored preface, book openings, chapters and notes. A repeated Book VIII table of contents remains explicitly labeled as source contents. |
| Josephus, Against Apion | 82 | Original Gutenberg #2849 with source sections and notes. These are not 82 canonical chapters. |
| Josephus, Wars | 127 | Original Gutenberg #2850 with preface and notes. Roman-numbered chapter V headings in books IV and VII are correctly recognized instead of merged into chapter IV. |
| Edersheim | 129 | Original CCEL XML, retaining the historical title page, prefaces, authorities/abbreviations, five books, appendices, two printed indexes and inline historical notes. Modern descriptive head metadata and CCEL-generated navigation indexes are excluded. |

The Josephus partition roundtrips **every source body character**, with only CRLF→LF normalization; titles, contents, prefaces and translator notes are retained. Reader paragraphs roundtrip each stored reading's exact text. Counts are source reading units, not claims of canonical coverage or independently reviewed ancient authorship divisions.

Walther and Krauth remain **unproofread OCR**, with visible warnings. Krauth has corrupted words and interleaved marginal notes/footnotes. Rendering collapses single-line OCR wrapping within paragraphs while retaining the exact underlying text; no spelling correction or dehyphenation is invented. Readers should check linked scans before quoting.

Edersheim's original XML explicitly names **Wm. B. Eerdmans, 1953** as its print source. The work's first-publication date, 1883, does not replace that digital-edition provenance. The source reports proofread/corrected text and explicitly says **Hebrew text has not been entered**. The reader and search context retain that limitation. No missing Hebrew is generated.

## Rights and publication boundary

The exact Josephus originals include Gutenberg's full notices and license, which accompany the local projection. Distributor source links and attribution remain. Walther's Internet Archive metadata identifies the 1929 Dau/Concordia edition; the U.S. duration assessment follows the maximum 95-year term and calendar-year expiration in [U.S. Copyright Office Circular 15A](https://www.copyright.gov/circs/circ15a.pdf). It is not an approval of a later revised translation. Krauth's saved Internet Archive metadata identifies a historical edition not in U.S. copyright. These records do not assert uniform worldwide status.

Edersheim's XML marks the historical text Public Domain, but the saved [CCEL distributor policy](https://ccel.org/about/copyright.html) separately requests permission for republication/commercial use and distinguishes special copyrighted contents. Local evaluation is prepared with historical text only and attribution preserved. **Before public web/native distribution of this new collection, resolve the CCEL republication terms or replace Edersheim with an independently cleared source.** No publisher contact or new rights approval is inferred from Larry's conditional import request, the bundle's public-domain assertion or the existing Lenski/K&D decisions.

No source-quality warning is treated as a new current-release acceptance blocker. This is an enhancement candidate for local review; no deployment, signed installer, release version bump, commit or push is included.

## Search successor and preservation

Release manifest SHA-256: `e2137d8b69d5c095352de1d4b1717999122fd5344f949842e1ea5d5bf09fb884`. Search successor manifest SHA-256: `00ea94f60cb2d239666a8583e31d62455520985cabfa67c46190611abf1dae75`. The independently saved Copyright Office circular and its own acquisition/hash record are under `sources/historical-library/evidence/`; PDF SHA-256 `6ff3c5612e1cd56469b3eb7d35eba7fd3374843d82744c63ab909225f53b7aef`.

`library-search-2026-10-15-v3` adds 771 historical reading documents and 33,157 blocks. The complete index contains 2,327 resources / 107,060 blocks across nine search collections; 373 compressed derivative files total 48,891,805 bytes. Historical reading assets total 13,028,631 bytes, including catalog and distributor notices, excluding the small release manifest. Text and search are loaded in separate section/shard requests.

All 1,451 predecessor input hashes, all five predecessor collection counts, and all 234 decoded v2 payloads are unchanged after normalizing only the search release ID. `predecessor-decoded.json` records comparison hashes and tests them against v3. Original v1/v2 manifest pins remain untouched, including v2 hash `70017093d90f97ccedd89edbc9d99663c18bd43b52de59bcbc24ab8f56c10a1d`; the exact v2 builder/domain implementation is additionally preserved in its evidence directory. No original source approval or corpus mapping is replaced. Desktop staging includes the new historical assets and active v3 search, excluding predecessor search bundles.

## Verification

The initial complete `npm run build` passes its offline import pipeline, `npm test` (190 application and 50 Python/source checks), and production compilation. `npm run typecheck` passes. Five new source/data tests cover all raw/output hashes, Josephus's complete body roundtrip, Walther dated openers, Krauth VI, Edersheim source layers, historical search prose, unchanged predecessor search payloads and explicit corrupt/missing-data failures.

Browser review, final presentation build and desktop verification are recorded in PROJECT-STATUS.md as completed. No signed-native or physical-device verification is inferred from an offline frontend build.
