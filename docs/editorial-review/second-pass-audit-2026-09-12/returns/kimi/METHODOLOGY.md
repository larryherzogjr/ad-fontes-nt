# Methodology — Second-Pass Editorial Audit

- **Bound to packet-manifest SHA-256:** `9b0a50e434974078125e877a6e8a703ea73eee643a2270fbc2ad55a0d23261a7`
- **Packet:** `afnt-second-pass-editorial-audit-2026-09-12-v1`; article release `om-studies-2026-09-11-v7` (immutable inputs; verified, not modified)

## 0. Posture

Report-only. No file in the packet, no article, no commentary record, no application code, and no external website was edited, replaced, or refetched for the purpose of altering content. External sources were used strictly as read-only verification references. No finding in this audit approves or certifies anything; all 23 findings are pending Larry Herzog Jr.'s review.

## 1. Integrity binding

1. Extracted the supplied ZIP to a scratch directory (`/tmp/adfontes/`).
2. Ran `sha256sum -c SHA256SUMS` from the packet root: **298/298 OK**.
3. Verified `PACKET-MANIFEST.sha256` matches the computed SHA-256 of `PACKET-MANIFEST.json`: `9b0a50e4…d23261a7`.
4. Confirmed INPUT-COVERAGE.json counts: 250 `om-article` + 30 `comparison-commentary` = 280 records.
5. Independently re-hashed every record file in Python and compared against INPUT-COVERAGE.json (280/280 match) — this double-checks coverage against the manifest path rather than trusting SHA256SUMS alone.
6. After the analysis environment was reset mid-audit (see §7), the packet was re-extracted from the original uploaded ZIP and `sha256sum -c` re-run: 298/298 OK again, confirming no supplied file changed during the audit.
7. All seven output files carry the packet-manifest SHA-256.

## 2. Verification sources (pinned where the packet pins them)

| Source | Use | Identity |
|---|---|---|
| Nestle 1904 morphology | all Greek lemma counts, verse-level lemma checks | `biblicalhumanities/Nestle1904` commit `713f28a3b7d4d66132f5aa809fa223fe79762e5d`, `morph/Nestle1904.csv` (tab-separated; NFC lemma grouping → 5,401 lemmas, 137,779 tokens; the packet documents 5,400 lemma keys / 137,694 indexed tokens after excluding the Mark 16 shorter ending and two apostrophe-shape verse mismatches — consistent) |
| BSB text | verification of BSB-labeled quotations | `BSB-publishing/bsb2usfm` GitHub release v5.9, `BSB_usj.zip` (66 books, USJ JSON; section headings and footnote subtrees excluded from verse text) |
| `corpora/word-metadata.json` | identity cross-check only (title/greek/translit/slug/gloss/subhead/pronunciation), per the audit prompt — **not** used as an independent lexical authority | packet-supplied |
| `guidance/*`, `evidence/*` | editorial rules, prior-review context, v7 correction list | packet-supplied |

**Known verification limit (applies to PASS2-005…-012):** the packet pins `bsb-2026-09-05-m2-v1`; the downloadable public artifact is BSB v5.9. Wording drift between the two is possible. Every BSB-quotation finding therefore carries an explicit instruction to re-check against the pinned snapshot, and none is classified confirmed-error on quotation wording alone.

## 3. Review lenses and how each was executed

All ten lenses ran over **all 280 records**; programmatic checks covered every record mechanically, and every flagged item plus a rotation of unflagged records received full-text human-style reading. Method notes per lens:

- **A. Adaptation seams / residual text.** Swept all 250 articles for duplicate word/phrase collisions (Unicode-aware), broken sentence frames around quotations, template phrasing variants, leftover markers (TODO/FIXME/placeholder), HTML-comment consistency, and mixed straight/curly quote boundaries. Positive results: PASS2-001, PASS2-004, PASS2-006 (frame break), PASS2-021. The packet's own `<!-- AD FONTES BSB ADAPTATION: pending Larry Herzog Jr. review … -->` markers and `COPY APPROVED` comments are intentional and were not flagged.
- **B. Sentence/argument integrity.** Digest-level review of section flow for all articles; full reads of flagged and high-risk articles (quotation-dense, count-dense, polemic-dense). The quotation-frame breaks in PASS2-004/-006/-008 surfaced here and were confirmed verbatim.
- **C. Lexical method.** Swept for high-risk patterns ("literally means," "root meaning," "true meaning," unhedged etymology claims) and read each hit in context. Most treatments are careful (several articles explicitly argue against etymological fallacies). Two unhedged, meaning-bearing etymology assertions were flagged: PASS2-018, PASS2-019.
- **D. Lemma/form/transliteration/morphology vs metadata.** Identity fields of all 250 articles cross-checked against word-metadata.json: **0 mismatches** in greek/translit/slug/gloss/subhead. Headword template presence verified in all 250 (248 word entries + 2 phrase entries, kaine-ktisis and pistos-ho-logos). Field-content defects in `pronunciation` for three entries: PASS2-022.
- **E. Scope/frequency/quantifiers.** Extracted every numeric count claim and hedged quantifier tied to a Greek lemma (41 candidate claims), resolved each to the pinned N1904 lemma, and compared. Verified-exact examples retained as evidence of the check's sensitivity: mathetes 28× in Acts (exact), "ten times in Acts before 11:26" (exact), soter 6/4 Father/Son in Pastorals (exact), parousia 4× in Matthew 24 (vv. 3, 27, 37, 39 — exact), mesites 6 occurrences with the article's own verse list (exact), hypostasis 5× (exact), hiereus 31× (exact), proseuchē 36× (exact), eklektos ~22× (22), kerygma "more than sixty" (61), klesis family claims (148/11/10/114 — hedges hold). Findings: PASS2-002, -003, -013, -014, -015, -016, -017. Claims about Hebrew Bible/LXX frequencies (shalom ~200+, ʿam, Ezekiel's "son of man" ~90×) are outside the pinned sources; the sampled ones are consistent with standard counts and were not flagged.
- **F. Scripture quotations/citations.** Re-extracted **629** BSB-labeled quotation instances with a boundary-safe extractor (anchor on each `(Ref, BSB)` parenthetical, walk back to the nearest unmatched opening quote) after an initial naive regex produced 118 false mismatches (nested-quote and USJ-heading artifacts — all resolved and re-verified). Result: 468 exact normalized matches, 97 verbatim partial quotations, 2 superset quotations; the residual deviations became PASS2-005 through PASS2-012. Every cited reference resolved to a real verse in the BSB text (no dangling references).
- **G. Historical/confessional/inter-tradition claims.** Extracted and read all 62 historical-claim passages (hist_hits sweep). Sampled verifications all passed: Trent 4th session 1546 / 6th session 1547 on justification; Marburg Colloquy October 1529 and 14-of-15 articles; Luther's *Freedom of a Christian* November 1520; Kaiserswerth 1836 (Fliedner); Chicago-Lambeth 1886/1888; Colwell 1933 quote wording; Dodd 1935 (*The Bible and the Greeks*) and 1936 (*Apostolic Preaching*); Aulén *Christus Victor* 1931; Barr JTS 39 (1988) 28–47. One footnote-formatting defect: PASS2-023. Luther's 1517 theses-posting narrative (metanoia.md) follows the standard traditional account; not flagged as an error.
- **H. Cross-record consistency.** All clusters listed in CROSS-RECORD-REVIEW.md, including no-finding clusters.
- **I. Comparison-commentary integrity.** All 30 records: seven edition IDs exactly {BSB, BLB, MSB, YLT, N1904, RP2018, TR-BOYD} in every record; 210 reading objects — 35 with focus sub-objects, all focus spans nested within their main spans; state/span coherence (present⇒spans, absent⇒no spans) holds everywhere; all `[S1–S7]`/`[C1–C7]` references resolve to `explanationSources` entries; ranges are well-formed BCV segments; the Boyd compilation is named consistently ("Boyd's Textus Receptus" / "compilation of Robert Adam Boyd (2022)") and never conflated with Scrivener 1894 (the two "Scrivener" mentions are correct historical references to the 1881 Scrivener edition as one of Boyd's sources); the v7 correction to candidate-18 (TR-family narrowing) is present. **No findings.**
- **J. Presentation defects altering meaning.** Covered by the seam/quotation sweeps; the Barr footnote punctuation (PASS2-023) and the garbled anomia sentence (PASS2-001) are the instances.

## 4. Classification and severity conventions

- **confirmed-error:** objectively false or self-contradictory on the face of the packet (internal contradiction, verbatim duplication, citation label contradicted by any edition of the text).
- **probable-error:** almost certainly wrong, but a plausible authorial intention or an unpinned verification source leaves residual doubt.
- **needs-human-review:** a real deviation, but a defensible convention could explain it (hedged counts, edition-sensitive counts, possible gloss-in-quotes).
- **editorial-consistency:** determinate inconsistency between records or between record and metadata, low reader risk.
- **presentation-defect:** formatting/typography defect.
- **Severity:** S1 would be meaning/doctrine corrupted (none found). S2: a false statement a checking reader would trip on. S3: localized defect; meaning recoverable but text wrong as written. S4: minor precision/consistency issue.
- `requiresHumanReview` is **true for all 23 findings**, per the audit's rule that every finding remains pending Larry Herzog Jr.'s review.

## 5. Known limitations

1. BSB-quotation verification used the public v5.9 USJ, not the pinned `bsb-2026-09-05-m2-v1` snapshot (not publicly fetchable); affected findings say so.
2. Non-BSB quotations (KJV/YLT echoes, untagged quotations) were reviewed by reading but not machine-verified against pinned texts.
3. Hebrew Bible / Septuagint frequency claims are outside the pinned verification sources.
4. Etymology findings (PASS2-018/-019) rest on the standard etymological literature's uncertainty judgments; they are flagged for human review, not asserted as errors.
5. This audit checks the packet as supplied; it does not certify the theological positions argued in the articles.

## 6. Environment note

The analysis ran in a sandboxed Python 3.12 environment. Midway through the audit the execution kernel was reset (wiping `/tmp` scratch state); the packet was re-extracted from the original upload, all hashes re-verified, and every quantitative result used in FINDINGS.json was **re-computed from freshly downloaded pinned sources after the reset** (Nestle 1904 CSV re-acquired via the codeload tarball of the pinned commit; all 36 lemma counts and verse-level distributions re-verified). See COMMAND-AND-TOOL-LOG.md.
