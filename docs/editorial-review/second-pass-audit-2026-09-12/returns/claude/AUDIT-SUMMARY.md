# Ad Fontes NT — independent second-pass editorial audit: summary

**Packet:** `afnt-second-pass-editorial-audit-2026-09-12-v1`
**Packet-manifest SHA-256:** `9b0a50e434974078125e877a6e8a703ea73eee643a2270fbc2ad55a0d23261a7`
**Article release audited:** `om-studies-2026-09-11-v7` (release-manifest SHA-256 `1d5f8d5242f4458d5bc7d6240413ed388b9302b9e5c6bc91bb59535cae9b4804`)
**Audit ID:** `afnt-second-pass-editorial-audit-2026-09-12-return-v1`
**Return date:** 2026-09-12
**Status:** report only. Every finding is a recommendation pending Larry Herzog Jr.'s review. No supplied source file, Scripture text, comparison record, application code, or `larryherzogjr.com` content was edited, and nothing was published or approved.

## 1. Packet verification

- `SHA256SUMS`: 298 of 298 entries verified OK. `PACKET-MANIFEST.sha256`: OK.
- `INPUT-COVERAGE.json`: exactly 250 `om-article` and 30 `comparison-commentary` records (280). Every listed SHA-256 recomputed and matched.
- Every article hash also matches `evidence/current-article-release/manifest.json` (`raw/<slug>.md`), which itself hashes to the `omReleaseManifestSha256` bound in `PACKET-MANIFEST.json`. `corpora/word-metadata.json` hashes to the bound `wordMetadataSha256`.
- The v7 corrections in `CORRECTIONS.json` (AUDIT-062/063/064/065/086) are present in the v7 files as recorded; no wording from older releases or the website was used.
- No supplied file was modified (`sha256sum -c` was re-run at completion).

## 2. Counts reviewed

| Corpus | Records | Disposition: finding | human-review only | no-finding |
|---|---|---|---|---|
| om-article | 250 | 80 | 2 | 168 |
| comparison-commentary | 30 | 1 | 3 | 26 |
| **Total** | **280** | **81** | **5** | **194** |

`COVERAGE.json` retains every input ID, file and SHA-256 with `reviewed: true` and a disposition. Two corpus-wide artifacts (PASS2-034, 38 files; PASS2-064, 14 files) are reported once and attached to every affected record's `findingIds`.

## 3. Findings

`FINDINGS.json` contains **66 findings**, all conforming to `FINDING-SCHEMA.json` (validated field-by-field).

By classification: confirmed-error 30 · probable-error 10 · needs-human-review 3 · editorial-consistency 15 · presentation-defect 8.
By severity: S1 0 · S2 12 · S3 29 · S4 25.
By confidence: high 56 · medium 10 · low 0.
By category: adaptation-seam 25 · presentation-affecting-meaning 8 · cross-record-consistency 7 · lexical-method-or-etymology 6 · lemma-form-or-transliteration 6 · scope-frequency-or-quantifier 5 · historical-confessional-or-source-attribution 3 · scripture-reference-or-quotation 2 · grammar-or-morphology 1 · translation-or-edition-identity 1 · internal-consistency 1 · duplication-or-template-artifact 1.
Human-review flag set on 50 findings.

### 3.1 The main discovery: whole-verse fallback seams (25 adaptation-seam + 8 presentation findings)

The v7 release manifest records `fallbackRuleVersion: smallest-supported-whole-verse-v1` with `fallbackCount: 243`. Where the BSB adaptation could not match a short inline phrase, it substituted a whole verse or verse-boundary segment. In dozens of places this left the surrounding sentence ungrammatical, glossed a Greek phrase with an entire verse, duplicated a verse already quoted, or — most seriously — cut the very words the article is discussing. This class is invisible to quotation-accuracy and count checks because the inserted text is correct BSB text; the defect is in the seam.

Clearest cases (S2, high confidence): **prototokos** (Colossians 1:15–16 quoted three times, 'treating Christ as “is the image…”', v. 16 offered as the explanation of itself); **eulogeo** (the Luke 24:50 Greek phrase glossed with the BSB text of Leviticus 9:22); **parrhesia** (Acts 28:31 quoted without "Boldly and freely", the words the article is about — the file's own block quotation shows them); **rhema** (Psalm 33:6 quoted from "the LORD the heavens were made", dropping "By the word of"); **ethnos** (two renderings of Galatians 2:14 printed as one quotation).

### 3.2 Other likely pre-v1 corrections (high-confidence S2)

- PASS2-036 **artos** — "Paul says 'this bread' (1 Corinthians 11:26–28) eight times across five verses": the citation is three verses and the phrase occurs once (ἄρτος four times in 11:23–28).
- PASS2-037 **didaskalia** — "*hygiainousa didaskalia* … appears nine times in the Pastoral Epistles" (the phrase occurs four times; the verb eight) and ὑγιαίνω called an adjective.
- PASS2-041 **anthropos** — ἄνθρωπος labelled a third-declension noun.
- PASS2-042 **theos** — θεός linked etymologically to Latin *deus*/Sanskrit *dyaus*/Zeus (rejected by the standard etymological dictionaries).
- PASS2-043 **sozo** (with PASS2-044 iesous) — "the name *Jesus* is the etymological seed of every saving word in the New Testament" (σῴζω is native Greek; the link is theological, not lexical).
- PASS2-048 **dikaioo** — Apology IV said to answer "Tridentine accusations" (the Apology is 1531; Trent's decree is 1547, as the same article says elsewhere).
- PASS2-051 **pistos-ho-logos** — 2 Timothy 2:11–13 printed in unlabelled italics that match the NET verbatim, not the BSB.

### 3.3 Post-v1 suggestions (S3/S4)

- Historical/confessional formulation: FC VIII credited with the Latin *genus* labels (theotes); AC II credited with the doctrine of original righteousness that belongs to Apology II (eikon); Augsburg Confession IV quoted in three different unnamed translations across charis/ergon/dikaioo.
- Lexical method: etymology treated as evidence for doctrine in eulogeo and hypakoe; an uncertain Greek root treated as "the Greek conception" of peace in eirene.
- Scope/frequency: ἀποθνῄσκω "hundreds of times" (111); Philippians "sixteen times" reachable only with συγχαίρω; Pastoral-only counts stated without scope in authenteo.
- Metadata/transliteration: word-metadata pronunciation fields carrying transliterations (bema, eulogeo) or a different guide (mesites); a tag mismatch (karpos); macrons missing in Kerygma/Pater/Proselytos; gg/ng, u/y and Hui-/Hyi- conventions mixed.
- Presentation: a 38-file run-in-heading markup artifact (`*The* *“**…**”* *…*`); a 14-file stray YAML comment naming a different article; a stale "eventual treatment of lytron"; a missing sentence break in pneuma; two wordings of the Nicene clause in monogenes.
- Comparison notes: one cross-record inconsistency in whether BSB and MSB are "two publishers" or "both Berean editions" (PASS2-066). The 30 notes otherwise held up: readings, focus and presentation states are described accurately, source observation and interpretation are kept apart, book-attributed manuscript accounts carry their verification limits, and no note treats an English rendering as Greek evidence or a numbering difference as a missing verse.

## 4. Limitations (please read)

1. **Article review was scan-plus-excerpt, not a linear read.** Every one of the 250 articles went through the full set of deterministic lenses (duplication, markup, footnotes, links, quotation lead-ins, counts, quantifiers, etymology, morphology, confessional citations, group characterizations, metadata cross-checks), and every flagged excerpt — 243 quotation seams, 268 count/quantifier sentences, 242 etymology sentences, 153 confessional citations, all morphology statements, all duplicate-sentence hits — was read in context. Full sequential reading of every paragraph of every article was **not** achieved in this session. The 30 comparison notes were read in full. Because the fallback-seam class is large, a linear pass over the 114 *Just Enough Greek*-format articles is the single most valuable follow-up; expect additional S3/S4 seams beyond those listed.
2. Occurrence counts were checked against my knowledge of the Nestle/NA lemma counts; the packet's morphology archive is excluded, so counts I could not settle are in the human-review queue rather than asserted.
3. BSB wording was checked against the packet's own quotations (block quotations and comparison spans) and my knowledge of the BSB; no external fetch was made.
4. Confessional and historical claims were checked against my knowledge of the Kolb–Wengert edition and standard references; page numbers were not verified against a physical copy.
5. No theological positions were evaluated; findings are limited to concrete factual, source, method, seam, and presentation problems.

## 5. Completion statement

All 280 records carry a disposition; all supplied hashes reconcile; every finding quotes an exact excerpt verified programmatically against the v7 bytes; uncertain items are separated into `HUMAN-REVIEW-QUEUE.md`; cross-record work is documented in `CROSS-RECORD-REVIEW.md`; no supplied source file was changed. Subject to the reading-depth limitation in §4, the audit is complete. Every finding remains pending Larry Herzog Jr.'s review.
