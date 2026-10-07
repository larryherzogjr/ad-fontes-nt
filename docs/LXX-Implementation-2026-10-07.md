# Septuagint local implementation — AFOT-007

Larry authorized completing Greek comparison, interlinear and existing OM Greek Explorer links without stopping for routine choices. After the initial source audit, he explicitly directed proceeding on his public-domain source-rights decision. That instruction supersedes the audit's stop/resume gate. Original upstream documentation/notices remain preserved and bundled; this records the user's decision rather than claiming independent resolution of the differing notices. No publisher messages were authorized or sent.

## Selected sources and reproducible releases

- Seth Kushniryk / Open Scriptorium word-token transcription and morphology: SourceHut mirror `0a23df295de5e5710724c8b6e84edf99e89348aa`. Greek word surfaces, lemmas, parsing, unknown values, confidence, automated-analysis provenance and original per-word records remain exact.
- Eliran Wong Rahlfs 1935 word list, glosses and Strong's identifiers: `a1b5ff1c739f93cdd18dbab4c9e3fc6b1043141c`. Glosses are quick lexical aids, not contextual translations. The upstream gloss README remains bundled.
- Independent upstream verse-pair dataset from the same pinned morphology commit maps source Greek references to English canonical numbering. The importer checks every target against the approved whole-Bible registry; original source pair objects, methods and divergence flags remain intact. Correspondence never establishes identical wording or inferred quotation classification.
- Selected data release: `lxx-rahlfs-1935-2026-10-07-v3`. Immutable compressed original bytes, source/evidence checksums, importer snapshot, implementation hash and all 11,707 JSON output checksums live under `sources/lxx/`. Builds only reproduce local pins; they do not fetch latest. A separate pinned `lxx-source-notices-2026-10-07-v1` bundles the original documentation and attribution for web/desktop.
- Engineering predecessors v1/v2 remain reproducible evidence with their original outputs/checksums and importer snapshots. v1 exposed the incomplete primary Joshua variant and missed several source-label aliases. v2 selects complete Vaticanus B Joshua and aliases spaced historical book abbreviations. v3 additionally uses explicit `JudgA` and `DanOG` word-list aliases. These are new successive pins, not rewritten predecessor data. Only v3 and source notices enter current bundles.

Joshua uses Vaticanus B; Judges uses Alexandrinus A; Daniel uses Old Greek, not Theodotion. The selection covers the Greek counterparts of the 39 English OT books (Ezra/Nehemiah share Greek 2 Esdras). It is not an edition menu for every Septuagint variant or a complete deuterocanonical library. Original word surfaces are displayed in original order with space separators; this token source does not supply punctuation. No Hebrew tooling or English word alignment is established.

## Behavior and coverage

OT verse selection and the reader's Greek toolbar open the existing study panel. Compare adds a labeled Septuagint section beneath the four English editions. Greek text/interlinear, optional transliteration/lemma/number/grammar rows, exact-word inspection and source-scoped occurrences use the shared web/desktop reader. Greek source verse labels remain separate from corresponding English reference labels, including Psalms, reordered Jeremiah and combined Esdras. Missing/corrupt files are errors; missing correspondences are explicit unavailable-data notices.

The release preserves 23,228 source verses / 480,105 tokens and 10,776 mapped lemma indexes. Whole-verse ordered NFC surface matching attaches Wong glosses to 23,209 verses; 19 retain text/morphology with glosses/numbers unavailable. The map connects 22,824 of 23,145 English references; 321 lack correspondence. Those gaps are not independent findings of textual absence. [Exact coverage report](LXX-Coverage-2026-10-07.json) lists them. The 342 unpaired Greek source verses remain available through an optional source-book disclosure, including when the selected English verse has no correspondence. Unpaired verses are excluded from linked occurrence counts. Upstream divergence flags remain visible.

Existing Dodson definitions require the same verified lemma/number agreement as NT lookup. Existing OM links use the released lemma/alias mappings and open the original approved offline article bundle. A label explains that these are Greek word studies, not newly authored OT passage commentary. No commentary article, approval hash or inferred theological content is changed.

## Verification and review boundary

Source tests independently compare all imported Greek word surfaces and original analysis objects to pinned raw bytes, and verify every output checksum. Domain tests cover exact gloss attachment, word offsets/highlighting, OM links, Psalm/Jeremiah/Esdras/Joshua correspondences, mixed-testament rejection, unavailable correspondences and missing/corrupt-file retries. Desktop tests require local packaged assets with external network forbidden.

Browser review confirmed the OT deep link, interlinear words/glosses, word inspector, existing Theos article and return, shared tool switching, desktop side panel/current-edition label, return-to-verse control, optional grammar rows and 390px/320px layouts without document/dialog/content horizontal overflow. The development server crashed after generated-asset reproduction triggered a mass RSC reload storm. Generated assets are now excluded from dev watching, and a stable production preview replaced that process. The browser recovered; final Escape dismissal, keyboard reopening/focus return, four-English/Greek Psalm comparison and unpaired Esther source text checks passed. Packaged desktop-browser checks also confirmed the interlinear, approved offline Theos article/return, 320px layout and Escape dismissal. User review remains next.

Final `npm run verify:both` passed typecheck, 87 Node tests, 31 Python tests, web/desktop production builds and six desktop tests. The packaged inventory contains 28,907 released assets. Final web refresh and Greek fidelity/domain reruns passed after the final synchronization/grammar/source-notice refinements. [Review image](../artifacts/review/lxx-interlinear-2026-10-07.png).

The Greek assets add approximately 576 MiB before installer compression. Storage reduction/paged occurrence optimization is future work, not a reading blocker. Web/desktop code remains local review scope. No Git push, hosted deployment, signed installer/updater publication, account restoration, native identity change or MVP acceptance occurs here.

Local review: `http://localhost:3016/read/GEN/1?translation=BSB&passage=GEN.1.1&panel=greek&greekView=interlinear`.

Packaged desktop-reader review: `http://127.0.0.1:1421/read/GEN/1?translation=BSB&passage=GEN.1.1&panel=greek&greekView=interlinear`. Both local previews are running; installed signed apps remain unchanged.
