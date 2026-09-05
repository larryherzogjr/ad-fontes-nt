# M3 analysis and editorial decisions

2026-09-05. This layer extends the verified M2 reader. It does not change any Scripture release or establish a reviewed theological position.

## Sources and rights

- **Morphology:** Ulrik Sandborg-Petersen, Nestle 1904 morphology v1.3 (2017-04-15), from the already pinned biblicalhumanities/Nestle1904 commit `713f28a3b7d4d66132f5aa809fa223fe79762e5d`. The morphology README dedicates this layer under CC0. Source text, lemma, Strong’s field, functional and form tags remain separate, unchanged fields.
- **Contextual glosses:** Berean interlinear glosses in the same archived repository. Its original README points to Berean’s licensing page; the archived official Berean terms corroborate the public-domain dedication effective April 30, 2023. These are source translation aids, not Ordinary Means commentary or verified English-reader token alignment.
- **Lexicon:** James Strong’s Greek Dictionary (1890), Ulrik Petersen XML v1.4, released 2007-09-14. Exact artifact: `StrongsGreekDictionaryXML_1.4.zip` from openscriptures/strongs commit `0acd2f251c2d35ff8db2dece4e0593979d3ac223`. Its XML prologue explicitly says Public Domain. Only this original XML data is imported; no merged dictionary or repository software license is assumed to license every layer.

Raw files and evidence hashes are in `sources/m3/manifest.json`. The Strong’s ZIP SHA-256 is `fe91d26bf97d9c6d5ccf4384a580543a2dea46ee4383ccd984c612ab78439d1e`; the Nestle archive is `2f7a4fa3754c91569022fd552acca0632563a79bbb0a019f41409bdda231dae1`. The original XML for each lexical entry is retained with the displayed transcription. The historical dictionary lists senses and translation uses; one Strong’s ID does not determine a word’s contextual meaning or lemma identity.

## Matching and coverage

`nestle-analysis-1.3-m3-v1` is explicitly tied to Scripture release `n1904-2026-09-05-m2-v1`. The independent importer verifies original/evidence hashes, reconciliation inventory and every generated output checksum. Normal builds are offline. `--freeze` can create missing baseline files but rejects changed existing baselines; it is not a repair command.

Matching requires the complete ordered Greek word sequence and source verse identifier. Only Unicode NFC equivalence is permitted. Stored Scripture Unicode and source analyses remain unchanged; word offsets refer to the stored Scripture. There is no approximate or English positional matching.

- 7,940 of 7,942 main-text source verses match, yielding 137,694 indexed tokens and 5,400 source lemma keys. Lemma grouping uses NFC, not Strong’s IDs or inferred synonyms.
- **2TH.2.13 and 1TI.1.16** differ in apostrophe shape between the Scripture and analysis transcriptions. Their Scripture remains readable, with analysis explicitly unavailable. This is an alignment limitation, not textual absence.
- Source **MRK.16.99** is appended shorter-ending material, excluded from main-text analysis. It remains available as separate source material in the reader/comparison panel.
- 7,912 complete verses also match the contextual gloss sequence. Twenty-eight analyzed verses have no attached gloss. One source gloss lacks an address and is excluded. Exact exclusions are recorded in `sources/m3/reconciliation.json`.
- The historical Greek dictionary contains 5,624 entries. No Hebrew lexicon or OT browsing feature is introduced.

Independent spot checks reconcile source Strong’s fields and grammatical tags with the separately sourced RP2018 with-parsing CSV for John 1:1 (λόγος), Romans 3:23 (ἥμαρτον), Philippians 2:6 (μορφῇ), and Philemon 4 (Εὐχαριστῶ). This verifies selected source analyses; it does not claim that the two editions or every analytical decision agree. Full automated checks verify every indexed token against its original source row, stored Scripture span and occurrence index. Larry Herzog Jr. accepted the presented sampled analysis/display and disclosed limitations on 2026-09-05; see `docs/M3-Remaining-Acceptance.md`. No exhaustive scholarly audit is claimed.

## Editorial scope and architecture

M3 requires cited, reviewed explanations; the target of 25–40 initial units is a planning recommendation. Thirty explanations are approved and locally published, with exact edition/release quotations and retained contribution and correction records. Publisher-note-only and numbering cases are explicitly distinguished from textual differences.

Larry Herzog Jr. is assigned by the user as qualified reviewer. Each publication needs an author, cleared rights, distinct source observation and interpretation, and an explicit approval bound to the exact content hash. A later rejection supersedes an earlier approval. Thirty units are currently published. See `content/editorial/REVIEW.md`.

Keep static immutable chapter, lemma and dictionary JSON, fetched on demand through the domain layer. The local editorial JSON queue is adequate for this milestone; no PostgreSQL service is needed yet. A relational store can later implement the same domain contracts. Comparison uses actual named editions in three groups; English wording differences alone do not establish Greek variants. Source numbering, absence, brackets, publisher notes and appended alternatives remain distinct.

Initial explanation review and the presented sampled Greek review are accepted. Chapter and verse-level commentary markers are implemented, including absent-verse notices. BGB availability and exact MSB Greek-source identity from M2 remain unresolved and explicitly outside the claimed alignment. Broader scholarly audits can expand the evidence; this milestone does not claim exhaustive manuscript verification. M4 notes/resources have not begun.

## Greek reading aids and occurrence highlighting

Selected-form transliteration is a display-only application aid based on the [ALA-LC Greek letter table (2010)](https://www.loc.gov/catdir/cpso/romanization/greek.pdf). It distinguishes eta/omega with macrons, handles marked rough breathings, diphthongs and nasal gamma, and omits accents and iota subscript. It deliberately does not supply unmarked breathings or claim full bibliographic romanization or phonetic reconstruction. Original Greek bytes remain unchanged.

The dictionary headword’s transliteration and written pronunciation are extracted from the already archived XML `greek@translit` and `pronunciation@strongs` attributes. These belong to that dictionary headword, not necessarily the selected inflected form. The UI names Strong’s historical guide and makes that distinction explicit; no audio or reconstructed Koine pronunciation is claimed. Missing source guides stay unavailable.

Occurrence highlighting resolves each result’s token ID against its pinned analysis chapter, validates release IDs, full snippet text, surface and exact offsets, then wraps only that token in a display `<mark>`. Repeated words within one verse receive separate correct positions. Page-sized analysis loads are cached; failures retain the original snippets with a visible highlighting error. No corpus release or source checksum changes.
