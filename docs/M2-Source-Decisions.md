# M2 source and reference decisions

Read alongside the unchanged handoff and implementation plan. This records engineering observations from pinned sources; it is not an endorsed theological explanation or a claim of qualified textual review.

## Artifacts and layers

All originals and saved evidence are outside `app/public`. Per-edition `m2-manifest.json` files identify exact artifacts, URLs, hashes, retrieval date, rights, version limitations and included/excluded layers. The app receives only NT Scripture and the listed publisher material. Full source archives may contain OT or other layers; those do not enter reading/search bundles.

- **BLB:** official `literalbible.com/blb.txt`, UTF-8. The header explicitly says early draft. The file supplies no paragraph/heading/note markup, so the reader uses verse layout and says so. Supplied-English-word brackets are preserved, not interpreted as textual omissions.
- **MSB:** official `majoritybible.com/msb.txt`, **Windows-1252**, is text authority. Publisher repository `MSB_usj.zip` at v5.9 supplies structure and 3,104 notes. Independent reconciliation found 738 discrepancies: 728 spacing differences and 10 converter artifacts (nine unwanted closing-quote strings and a John 21:7 ellipsis). The exact pairs are in `sources/msb/m2-reviewed-differences.json`. TXT wording is aligned onto retained USJ positions; original runs and files are preserved. Four source verse markers have empty main text, confirmed by both formats. Publisher notes at the preceding verse preserve the TR readings.
- **YLT:** eBible engylt USFX and independent VPL export. Embedded metadata explicitly gives completion year 1898. Source date 2025-12-12, generated 2026-08-08; retrieved snapshot 2026-09-05. Public-domain declaration is embedded and archived. No claim of equivalence to a particular displayed Greek TR.
- **Nestle 1904:** BGB download attempts failed (host resolution/timeout); no BGB artifact is included. The authorized fallback uses biblicalhumanities/Nestle1904 commit `713f28a3b7d4d66132f5aa809fa223fe79762e5d`, **xhtml base text** by Diego Renato dos Santos. That directory’s README records the transcriber’s public-domain declaration; CrossWire independently records the edition’s public-domain status. The whole repository does not have one license: the XML markup layer is CC BY-SA; morphology has separate CC0 evidence. Both are excluded from the reader. The morphology file’s text column is used only for independent spot checks, not published analysis.
- **RP2018:** official byztxt repository v3.3.2, commit `27a45ff1b7be6c17ccbfeac414f3f55732ae8e28`. Public-domain repository declaration is archived. Main Unicode CSV is checked against the original CCAT inventory and Greek letters across the NT; the original CCAT remains ultimate source authority. CSV characters/diacritics are copied intact. `¶` becomes a paragraph boundary while original CSV text remains stored. `PA.csv` and `ACT24.csv` are separately identified Byzantine alternatives, never substituted into the main text or search.
- **Boyd TR:** eBible grctr source/export 2026-09-03. Introduction identifies Robert Adam Boyd, September 2022: compilation of Stephanus 1550, Elzevir 1624 and Scrivener 1881, with an explicit Acts 27:13 exception. Name it **Boyd compilation (2022)**, never Scrivener 1894. eBible expressly dedicates comparison notes to the public domain. All 342 NT notes remain publisher notes; 14 `d` subscriptions are separate labeled blocks. VPL folds these subscriptions into final verse rows; verification accounts for that format difference without treating them as verse text.

The authoritative English text and all Greek Unicode characters are retained. Layout whitespace may be normalized for search; Greek accents/case are never normalized in stored surface text. Source paragraph markers and raw note objects are retained. No morphology, gloss, lexical definition or English word link is inferred.

## Canonical registry and explicit mappings

`registry.json` remains the frozen M1 base for reproducing its original BSB release. `canonical-registry.json` is the M2 union registry used by the resolver. It adds 3 John 1:15, Romans 14:24–26 and Revelation 12:18. Source identifiers remain separate. `scripts/m2/mappings.py` contains the structural mappings; every emitted coverage row identifies actual source placements.

| Canonical address | Verified source treatment |
|---|---|
| Romans 14:24–26 / 16:25–27 | Equivalent placement anchors for the doxology. MSB/RP2018 place it at 14:24–26; other installed editions place it at 16:25–27. The app preserves source order, prints source verse labels and loads the actual source chapter for a selected relocated passage. |
| 3 John 1:14–15 | Nestle separates verse 15; other installed editions combine it into source verse 14. Joined verse links retain both anchors. |
| 2 Corinthians 13:12–14 | Nestle source 12 includes the two greetings (canonical 12/13); source 13 maps to canonical 14. |
| Revelation 12:18 / 13:1 | Nestle prints the shore clause at 12:18 and the following clause at 13:1. The other installed editions join that material at 13:1. These are coarse segment mappings, not word-by-word equivalence or agreement of readings. |
| Acts 19:40–41 | The Nestle XHTML transcription prints both sentences under source 40, without a 41 marker. Map that source segment to both anchors; do not claim verse 41 is omitted by the historical edition. |
| Acts 8:37 | BSB/BLB/MSB/RP2018/Nestle lack main text at this anchor; YLT/Boyd contain it. Publisher-note or alternative treatment is separately preserved. |
| Mark 16:9–20 | Nestle encloses the whole unit in double brackets; the separate shorter ending follows the ΑΛΛΩΣ heading. It is an appended alternative, not additional words in verse 20. |
| John 7:53–8:11; John 5:4 | Nestle preserves angle-bracket treatment; bracket characters remain visible. This does not supply an interpretive explanation of the brackets. |

The Nestle XHTML also has six ordinary verse numerals outside spans (Matthew 5:27; Mark 4:32, 14:28; Luke 20:22; Romans 6:14; 1 Corinthians 6:15). The parser handles those actual numerals. A superscript `1913` at Mark 1:1 is a source annotation, not a verse or Greek Scripture. Both the original annotation object and the surrounding surface text are retained. No corrected transcription or uniform “pure 1904” claim is made.

A whole-verse absence requires an explicit edition-specific approved engineering gap list, source inventory checks and successful data loading. Incomplete JSON, missing placements or failed loads are application errors. An edition’s appended alternative can contain an anchor absent from its main text without changing that main-text coverage state.

## Reproducibility and change procedure

`npm run import:all` is offline. Inputs, evidence, exact reconciliation pairs, source inventories and output bytes are checked. `scripts/download_m2_sources.py` can recover missing raw files only when their bytes match the pinned hash. Upstream “latest” data is never fetched during builds.

`--freeze` is an explicit engineering operation for a newly reviewed release; it creates missing manifests/checksums and refuses replacement of existing pinned records. Give changed source or mapping behavior a new release ID and retain predecessor records. The active edition catalog is a generated pointer to validated releases. MSB v2 supersedes local v1 solely to link the four absent anchors to their actual publisher notes; the original text is unchanged.

Public release still needs qualified source/mapping review and the broader M5 checks. M3 explanations, morphology, lexicons and English alignments have independent gates. Lack of those enrichments does not block reading these verified local source snapshots.
