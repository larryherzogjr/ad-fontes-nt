# Hebrew / Aramaic and Clementine Latin — local implementation

## Authorization and scope (AF-LANG-023 / AF-HEB-024)

Larry authorized the recommended full reading editions and the foundations of a Hebrew word explorer on October 9, including read-only inspection of `/Users/lherzog/Documents/Codex/larryherzogjr`. This supersedes historical Hebrew-tooling non-goals for this addition. No website repository files were changed. No signing identity, version, hosted application, account service, original corpus, or canonical registry is changed. New native installers/publication remain separately authorized release work.

## Immutable source record

Release `original-languages-2026-10-09-v1` is independently reproducible with `scripts/original_languages/import_originals.py`. `sources/original-languages/raw` retains the supplied OSHB and CVUL ZIPs, supplied simplified exports for independent checks, four retrieved Wikisource HTML pages, source/provenance metadata, author article link metadata and the Noto Serif Hebrew font/license. The release pins each input, importer and generated output by SHA-256; normal imports are offline and fail on drift. `--freeze-new` creates only an absent release, never replaces a predecessor.

### WLC / OSHB

The supplied OSIS XML identifies WLC 4.20. Its text is public domain; OSHB lemma/morphology and annotations are separately attributed under CC BY 4.0. The source archive's LICENSE and README are authoritative and retained. The app states: “Original work of the Open Scriptures Hebrew Bible available at https://github.com/openscriptures/morphhb”. Derived indexing/display is identified; no endorsement is implied.

The importer walks the 39 actual source book XML files, producing 23,213 verse rows and 305,507 main written-text tokens. It retains exact word Unicode without NFC normalization, original slash-delimited forms, source IDs, lemma fields, morphology tags, homograph distinctions and Hebrew/Aramaic tags. Reading hides only the morpheme separators `/`; actual maqqef, sof pasuq, paseq and paragraph signs are preserved from their distinct source segments. The handoff incorrectly called the slash maqqef and its simplified JSON omitted punctuation. The reviewed difference report records re-derivation instead of silently substituting that flattened JSON.

Written text and qere/alternative reading notes remain distinct. 4,499 source annotations are retained with raw source XML and labeled reading fields. Qere is not silently substituted into Scripture or mixed into written-text occurrence counts. The packaged morphology descriptions come from the source `parsing/Oshm.xml`; missing descriptions remain unavailable rather than guessed.

The explorer indexes 9,255 source lexical keys. These are OSHB keys with Hebrew/Aramaic prefix and preserved homograph suffix, not a new scholarly dictionary or inferred lemma normalization. A displayed example form is explicitly not a dictionary headword or contextual definition. Prefix/suffix codes are preserved on tokens but not promoted into lexical entries. No English reverse interlinear, generated gloss, transliteration system, or exhaustive scholarly analysis review is claimed.

### Clementine Vulgate

The full supplied 73-book edition contains 35,810 source verse rows. Seventy books reproduce the supplied original CVUL SQLite source; Judith, Esther and Wisdom reproduce frozen HTML from the Clementine Text Project transcription on Latin Wikisource. Every resulting verse string matches the independently supplied JSON exactly. Retrieved source pages and revision evidence are recorded in `raw/provenance.json`.

- https://la.wikisource.org/wiki/Vulgata_Clementina
- https://la.wikisource.org/wiki/Vulgata_Clementina/Liber_Judith
- https://la.wikisource.org/wiki/Vulgata_Clementina/Liber_Esther
- https://la.wikisource.org/wiki/Vulgata_Clementina/Liber_Sapientiae

The provenance page identifies the 1598 Clementine edition and public-domain dedication of the transcription. This is labeled a historical Latin translation, not an original biblical language. Source book coverage includes 16-chapter Esther, 14-chapter Daniel, Baruch 6, and seven additional books; appendix books and Psalm 151 are not supplied and are not invented. The handoff's Psalm 147 mapping assertion is not adopted.

## Numbering and comparison

Source addresses remain independent of canonical references. Edition switches open the beginning of the same book when covered, otherwise Genesis. Source searches/deep links never validate Hebrew or Latin chapter/verse limits using the English registry.

WLC English reading context uses the pinned upstream `wlc/VerseMap.xml` difference catalogue, with the source's full/partial classifications retained. The catalogue describes WLC-to-KJV numbering, not equivalence of wording with Berean editions. The UI explicitly labels this as English reading context, not word alignment. Unchanged numbering falls back only within this catalogue's stated scope. English target existence is validated against the existing registry and adapter.

The catalogue folds unnumbered Psalm introductions into KJV verse 1. Ad Fontes preserves those source mapping rows but excludes title-only Hebrew verses preceding the mapped body verse 1 from automatic numbered English context. Psalm 51:1–2 therefore have no numbered English context; 51:3 opens English 51:1. Chapter-boundary fixtures include Genesis 32:1 → 31:55, Joel 3:1 → 2:28 and Malachi 3:19 → 4:1. No blanket Psalm offset is used. Additional source map limitations remain visible; no exhaustive verse-equivalence audit is claimed.

Latin comparison supports independently entered English passages. Automatic Latin verse synchronization is deliberately unavailable until a separately reviewed correspondence table exists. Both texts remain readable side by side. This is a disclosed implementation limit, not textual absence.

## Ordinary Means articles

Read-only inspection found seven published (`draft: false`) Hebrew entries. Only existing headword/transliteration/subtitle, attribution, source hash and external URL are bundled. Their bodies are not republished or silently changed from NET quotations. Links require internet; Scripture, morphology and occurrences work offline.

| Article | Exact source lexical key | Sample source verification |
|---|---|---|
| tam | H8535 | Job 1:1 |
| hinnam | H2600 | Job 1:9 |
| ha-satan | H7854 | Job 1:6 |
| ed | H5707 | Job 16:19 |
| goel | H1350a | Job 19:25 |
| mokiah | H3198 | Job 9:33 |
| naham | H5162 | Job 42:6 |

Article links are labeled Ordinary Means commentary by Larry Herzog Jr., separately from source analysis. Linking an article to a lemma does not claim its inflected heading applies to every occurrence or merge related roots. New written commentary was not generated.

## Verification and next steps

Automated fidelity checks cover complete source reproduction, every Hebrew main-text word and tag, all Latin verse strings including patches, punctuation and qere separation, numbering exceptions, article-key links, search and offline packaging. Browser/build results and remaining limits are recorded in PROJECT-STATUS.md after final checks. The next product step is Larry's local review, then separately authorized web/native publication. Further work includes a reviewed Latin mapping table, a Hebrew lexical-definition layer, broader word-study coverage, and physical-device/accessibility acceptance. M5/MVP remain incomplete.

## Hebrew study interaction follow-on (AF-HEB-025)

Larry requested Greek-style interaction parity and explicitly authorized proceeding. Seven already published Hebrew studies are now reproduced, unchanged, from the read-only website checkout in a separate `hebrew-studies-2026-10-09-v1` release. Originals and exact input/output SHA-256 pins are under `sources/om-hebrew/`; `scripts/import_hebrew_studies.py` reproduces them offline and rejects any unexplained change. Their bytes match the previously inspected article hashes in the original-languages release. This authorization imports existing authored prose; it does not claim a new scholarly review or approve altered theology. No original-language corpus bytes or mapping release changed.

The shared Greek/Hebrew article dialog preserves author attribution, saved date, and the website's NET quotation identification for Hebrew. It supports related Greek articles in place, a previous-article control, Escape, and focus return to the originating control. The immutable Greek collection and its BSB adaptation remain unchanged. Desktop staging includes the seven complete Hebrew articles; only external website links require internet. The website directory remains read-only.

Hebrew occurrence results show preserved source verse context, highlighting the exact source token rather than a string match. Reader-to-explorer links retain chapter, selected word/verse and comparison state. Occurrences carry a link back to their results, including the result page and query; the explorer includes an explicit return to the original Scripture position. Return destinations accept only local WLC reader / Hebrew explorer routes. Nested explorer origins are removed from reader return links to prevent recursive URL growth.

This establishes interaction parity for the available data, not lexical completeness. OSHB morphology, source lemma keys, written-text occurrence counts, and authored studies remain distinct. A general Hebrew dictionary, universal transliteration/pronunciation guide, English word alignment, and reviewed Latin correspondence remain future work. No definitions or pronunciation were invented to fill missing sources. No production release or version change is included.

## Hebrew alongside Greek in the reader (AF-HEB-026)

Larry requested a Hebrew action beside Greek for OT reading, opening the same split study experience. The canonical English reader (BSB, BLB, MSB and YLT) now includes Hebrew in its main actions, selected-passage actions and shared study tabs. `panel=hebrew` preserves the left translation and opens source-numbered WLC text on the right. Existing pane close/return, width, study history and verse synchronization mechanisms are reused. Selectable Hebrew words open source morphology, occurrence links and the saved Ordinary Means studies. A Word analysis display lays out source keys/morphology; it is not labeled an English interlinear because sourced English glosses are unavailable.

`hebrewPassage` reverses the unchanged source numbering catalogue and retains partial relationships. It does not copy English verse numbers onto Hebrew. Regression fixtures include Psalm 51:1 → WLC 51:3, Joel 2:28 → WLC 3:1 and Genesis 31:55 → WLC 32:1. Missing correspondences remain explicit. Original token IDs, punctuation, reading notes and source text are preserved. No corpus/mapping release is changed.

For LXX2012 and Clementine Latin, Hebrew is also offered when the source book has WLC coverage. These editions lack a verified direct Hebrew crosswalk, so users independently choose the Hebrew chapter; the interface does not infer verse alignment or offer synchronized scrolling there. Chapter/word display state has local deep-link parameters. NT and books outside WLC coverage have no Hebrew action. WLC's own reader retains its existing word controls and Explorer access.

## October 9 · BSB Hebrew article adaptation

Larry requested removal of NET references and replacement with BSB. `hebrew-studies-2026-10-09-v2` supersedes v1 for active web/offline article reading. Seven adapted Markdown articles, exact replacement/quotation ledgers, pinned official BSB authority and input/output hashes are recorded in `sources/om-hebrew/hebrew-studies-2026-10-09-v2/`. Original author snapshots and v1 manifest remain unchanged and reproducible. The importer checks original bytes, every documented substitution, all 34 Scripture quotations/excerpts and generated output hashes. The shared article notice names BSB. Three NET notes recommendations were removed rather than falsely attributed to Berean; surrounding translation explanations now match actual BSB wording. No author website edit, original-language corpus/analysis change or new scholarly approval is implied.
