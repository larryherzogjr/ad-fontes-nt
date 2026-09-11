# Ad Fontes NT full-corpus editorial audit: summary

**Packet ID:** `afnt-full-corpus-audit-2026-09-11-v1`
**Packet-manifest SHA-256:** `7d54757af5da94553a87c0d546e78b34e54aea0c0f785ff82e4fb77e7fd62c06`
**Audit ID:** `afnt-full-corpus-audit-2026-09-11-v1-external-review-claude-1`
**Uploaded ZIP SHA-256 (as received):** `ea3584bf181efbcee446c9c9d8998b97586a8ae6493c9742a4b974fb793ae8ee`
**Date:** 2026-09-11

This is a report-only audit. **No source content was edited.** Every finding below is a recommendation pending Larry Herzog Jr.'s review and approval. Nothing here approves, certifies, or publishes anything.

## Packet verification

- All 296 files listed in `SHA256SUMS` match their SHA-256 values. `SHA256SUMS` itself is the only unlisted file.
- `PACKET-MANIFEST.json` hashes to the value in `PACKET-MANIFEST.sha256`.
- `INPUT-COVERAGE.json` has exactly 250 `om-article` and 30 `comparison-commentary` records, and every record hash matches its file.
- All 250 article hashes also match `evidence/om-v5-manifest.json` (release `om-studies-2026-09-10-v5`).

## Records reviewed

| Corpus | Records | no-finding | finding | human-review |
|---|---|---|---|---|
| om-article | 250 | 194 | 52 | 4 |
| comparison-commentary | 30 | 14 | 14 | 2 |

**Depth of review (stated plainly):**
- **Comparison commentaries:** all 30 were read closely against their structured data.
- **Articles:** all 250 went through automated full-text checks, and every flagged passage was read in context. Not every article was read end to end.
- **COVERAGE.json:** this depth is recorded per record in an added `reviewDepth` field. A `no-finding` article disposition means none of the checks raised an issue, not that a full close reading found none. See METHODOLOGY.md.

## Findings: 88 total (72 article, 16 comparison)

| Severity | Count |
|---|---|
| S1 | 2 |
| S2 | 21 |
| S3 | 35 |
| S4 | 30 |
| **Total** | **88** |

| Classification | Count |
|---|---|
| confirmed-error | 13 |
| probable-error | 17 |
| needs-human-review | 8 |
| editorial-consistency | 14 |
| presentation-defect | 36 |
| **Total** | **88** |

| Confidence | Count |
|---|---|
| high | 71 |
| medium | 13 |
| low | 4 |
| **Total** | **88** |

| Category | Count |
|---|---|
| word-or-element-count | 4 |
| language-identification | 2 |
| scripture-reference-or-quotation | 5 |
| translation-or-edition-identity | 19 |
| headword-or-transliteration | 6 |
| grammar-or-morphology | 1 |
| internal-consistency | 1 |
| cross-record-consistency | 5 |
| comparison-integrity | 6 |
| presentation-affecting-meaning | 39 |
| **Total** | **88** |

## The main pattern

Most of the serious and visible problems in the articles come from the BSB adaptation, not from the author's original prose. Two mechanisms show up repeatedly.

1. **Whole-verse substitution.** The v5 manifest records `fallbackRuleVersion: smallest-supported-whole-verse-v1` with `fallbackCount: 243`. Where a short quoted phrase was replaced by a whole verse, sentences and headings often break.
   - 37 findings show this.
   - In `theos` (AUDIT-001, AUDIT-002, AUDIT-006) it reverses the argument.
   - In `hyios` (AUDIT-007) a New Testament verse is labeled as the Isaiah text it echoes.
2. **Quotations not converted to BSB.** In several articles the same verse appears in two wordings, sometimes both labeled BSB (AUDIT-008 to AUDIT-011). The non-matching wording looks like the NET Bible used by the website articles. That identification is the reviewer's own knowledge, not packet evidence.

The packet cannot show how many more instances exist. Duplicated verses and grammatically broken sentences are detectable; a single, grammatical, unconverted quotation is not.

## Possible pre-v1 corrections (high-confidence S1/S2)

| ID | Record | Sev. | Classification | Issue |
|---|---|---|---|---|
| AUDIT-001 | theos | S1 | confirmed-error | The sentence attributes to the New World Translation a rendering of all of John 1:1 that ends “the Word was fully God.” The paragraph goes on to say the Watch Tower uses the missing article to argue the Word is “not the God but only a god.” The quoted text cannot be the rendering that argument depends on, so the section now misstates the position it refutes.. |
| AUDIT-002 | theos | S1 | confirmed-error | The sentence names three readings, two it allows and one it rules out, but all three quotations are the same whole-verse text. |
| AUDIT-003 | theos | S2 | probable-error | In the BSB-adapted article, John 1:1 is quoted ending “the Word was fully God,” while other articles in the same release quote the verse ending “the Word was God.” At most one of these can be the BSB wording.. |
| AUDIT-004 | arche | S2 | probable-error | John 1:1 is quoted ending “the Word was fully God,” conflicting with the corpus’s other wording of the verse (“the Word was God”).. |
| AUDIT-005 | logos | S2 | probable-error | Within this article John 1:1 appears in two different wordings: line 37 ends “the Word was God,” and this range-of-meaning bullet ends “the Word was fully God.”. |
| AUDIT-006 | theos | S2 | confirmed-error | The parenthesis is meant to show the alternative punctuation, in which the clause becomes a separate doxology to the Father. |
| AUDIT-007 | hyios | S2 | confirmed-error | The sentence lists “three phrases” in the baptismal voice that echo the Old Testament. |
| AUDIT-008 | zoe | S2 | confirmed-error | The article quotes John 10:10 twice, both times labeled BSB, in different wordings (“may have it abundantly” here; “have it in all its fullness” at line 92). |
| AUDIT-009 | sozo | S2 | confirmed-error | Matthew 1:21 is quoted twice in this article, both times labeled BSB, in different wordings (“you will name him Jesus” here; “you are to give Him the name Jesus” at line 59).. |
| AUDIT-010 | charis | S2 | confirmed-error | Romans 11:6 is quoted twice, both times labeled BSB, in different wordings (line 31 lacks “then” and punctuates differently from the blockquote at line 62).. |
| AUDIT-011 | homologeo | S2 | confirmed-error | “before people” is presented as a BSB quotation of Matthew 10:32–33, but the article’s own BSB blockquote of those verses reads “before men.”. |
| AUDIT-012 | teleios | S2 | probable-error | The article’s key verse is labeled BSB and begins “So then.” Line 77 quotes the same wording and then says “The “therefore” connects the teleios command…”, referring to a word the quotation does not contain. |
| AUDIT-013 | pleroma | S2 | probable-error | The article’s opening quotation of its key verse differs from its own BSB blockquote of Colossians 2:9 (“For in Christ all the fullness of the Deity dwells in bodily form”). |
| AUDIT-014 | parousia | S2 | probable-error | The article quotes 1 Corinthians 15:23 in two wordings. |
| AUDIT-015 | kosmos | S2 | probable-error | John 3:16 appears in this article as a BSB-labeled blockquote (line 31, “For God so loved the world that He gave His one and only Son…”) and twice in different wording (line 73 and the verse heading at line 87).. |
| AUDIT-016 | iesous | S2 | probable-error | The article’s BSB blockquote of Matthew 1:21 (line 33) reads “you are to give Him the name Jesus,” but lines 35, 83 and 145 use “you will name him Jesus.” Line 35 comments on that wording in italics.. |
| AUDIT-017 | pistis | S2 | probable-error | Ephesians 2:8 is quoted at line 77 as a BSB blockquote (“For it is by grace you have been saved…”) and at line 103 in different wording.. |
| AUDIT-018 | basileia | S2 | probable-error | Two problems in this heading sentence. |
| AUDIT-019 | charakter | S2 | probable-error | The headword article presents “the representation of his essence” as the BSB wording of Hebrews 1:3 and builds its explanation on “essence.” Two other articles quote Hebrews 1:3 as BSB with “the exact representation of His nature.” The BSB label and the “essence renders hypostasis” explanation are therefore unsupported within the release.. |
| AUDIT-020 | hiereus | S2 | confirmed-error | The stated accented syllable does not match the pronunciation guide given in the same sentence. |
| AUDIT-021 | huiothesia | S2 | confirmed-error | The pronunciation guide has five syllables with the fourth capitalized; the Greek υἱοθεσία is accented on σί, the fourth syllable (υἱ-ο-θε-σί-α). |
| AUDIT-022 | theotes | S2 | confirmed-error | theotēs sōmatikōs is a transliterated Greek phrase (θεότης + σωματικῶς, from Colossians 2:9, which the article quotes in Greek). |

S2 items at medium confidence, to confirm before any correction: AUDIT-024 (aphesis).

**Pre-v1 readiness recommendation (a process step, not a text correction):**
1. Re-validate every quotation labeled or presented as BSB against the pinned source already hashed in the v5 manifest (`bsbSourceSha256 2ac3af1d…`).
2. Review all 243 whole-verse substitutions in context.

This audit found 25 S3 and 6 S4 broken substitutions. By the prompt's rule they are not listed as pre-v1 corrections, but they are visible to readers. The review above would catch them and any this audit could not detect.

## Post-v1 and editorial backlog

- **S3 and S4 findings:** all 65 are listed in FINDINGS.json. Most are whole-verse substitutions with a proposed short phrase.
- **Stale adaptation comment:** all 250 article files contain `<!-- AD FONTES BSB ADAPTATION: pending Larry Herzog Jr. review; the original website edition is unchanged. -->` although front matter says `editorial_review: "approved"`. This is harmless if comments are stripped, but the provenance is stale.
- **Drafting vocabulary:** "hook" / "opening hook" appears 11 times in 10 articles, and "This entry is about that word." appears in 11. These are book-drafting terms visible in app prose.
- **Heading apostrophes:** "Where You’ll Meet It" (236 files) vs "Where You'll Meet It" (13 files).
- **Metadata:** `word-metadata.json` leaves pronunciation empty for 166 of 250 records, and the `karpos` tags differ in form between front matter and metadata ("fruit of the Spirit" vs "fruit-of-the-spirit").
- **Awkward but readable substitutions:** redundant speech introductions and unbalanced nested quotation marks are listed in HUMAN-REVIEW-QUEUE.md (HR-12).

## Six previously corrected articles

The v5 wording of all ten approved replacements in `anomia`, `anthropos`, `kyrios`, `logos`, `pater` and `pistos-ho-logos` reads coherently, and no superseded v4 wording is present. Two findings fall on other lines of `logos` (AUDIT-005 and AUDIT-023). Neither involves the approved correction.

## Limitations

- Full Scripture texts, the BSB source, the analysis archive and concordance data are not in the packet. BSB wording is therefore judged only against other quotations in the packet.
- Occurrence counts and most morphology claims could not be verified.
- Verse numbers were checked only against chapter bounds: 4,528 references, none out of range.
- Articles were not all read end to end. Unconverted quotations that are grammatical and appear only once cannot be detected by internal-consistency methods.
- No external sources were consulted. No live website content was used.
- Approved theological judgments were not reopened.
- Findings are AI review output and are not scholarly certification.

**No source content was edited. Every finding remains a recommendation pending Larry Herzog Jr.'s review and approval.**
