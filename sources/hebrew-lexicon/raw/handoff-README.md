# Deep Greek & Hebrew Lexicon layer — resource bundle for Ad Fontes

The deeper layer behind the Strong's gloss bundles: full lexica keyed so
every tagged word in the Greek NT and the WLC Hebrew resolves to a real
dictionary article. Everything is public domain except the OSHB packaging
(CC BY 4.0, attribution included).

## Greek

| file | content | source / license |
|------|---------|------------------|
| `dictionary/strongs-greek.json` | 5,624 Strong's Greek entries (lemma, translit., pronunciation, derivation, definition, KJV renderings) | Strong's 1890, PD; openscriptures/strongs XML |
| `dictionary/abbott-smith.json` | **6,143 full lexicon articles** — Abbott-Smith, *A Manual Greek Lexicon of the NT* (1922). 5,431 keyed by Strong's number (`G3056`); 712 extra words not in Strong's keyed `w:<headword>`. Fields: `g`, `headword`, `occurrences_nt`, `entry` (full article text with `[I.]`/`[1]` sense markers, Hebrew/LXX cross-refs inline) | PD; translatable-exegetical-tools TEI |
| `nt-json/<book>.json` | **Tischendorf 8th-edition Greek NT**, 27 books, 7,939 verses, 137,711 word tokens. Each verse: `text` plus `words: [{t, g, l, m}]` = token, Strong's number, lemma, Robinson morphology | PD (Yale text, Robinson parsing, Sandborg-Petersen ed.) |
| `nt-text/<book>.txt` | plain-text mirrors, one verse per line | — |
| `index/forms.json` | 19,090 inflected forms → Strong's number(s) + NT frequency, ordered by likelihood | derived from Tischendorf tags |

**Lookup chain:** NT token `g` (or an inflected form via `index/forms.json`)
→ `abbott-smith.json[G<n>]` for the full article, or
`strongs-greek.json[G<n>]` for the one-line gloss.

## Hebrew

| file | content | source / license |
|------|---------|------------------|
| `dictionary/lexical-index.json` | `by_strongs`: every Strong's H number (8,681) → OSHB lexicon record(s) `{headword, xlit, pos, gloss, bdb, twot}`; `by_id`: reverse. All 8,681 Strong's keys link to a BDB article | OSHB HebrewLexicon, CC BY 4.0 |
| `dictionary/bdb.json` | **11,845 Brown-Driver-Briggs articles** (1906), keyed by OSHB id (`a.ae.ab`). Fields: `headwords`, `type` (`root` for root entries), `text` (full BDB article with `[1]`/`[a]` sense markers) | BDB text PD; OSHB XML CC BY |

**Lookup chain (extends the wlc-glosses bundle):** WLC token →
`wlc-glosses/index/forms.json` → Strong's H# →
`lexical-index.json by_strongs` (brief gloss + BDB id) →
`bdb.json[<id>]` for the full article.

## Licensing

- Strong's dictionaries, Abbott-Smith (1922), BDB (1906), Tischendorf text
  and analysis: **public domain**.
- OSHB HebrewLexicon (lexical index + BDB XML markup): **CC BY 4.0** —
  attribution required: *"Open Scriptures Hebrew Bible, CC BY 4.0,
  openscriptures.org"*.
- TWOT numbers are cross-references only; the Theological Wordbook of the
  OT is **not** included (copyrighted).

## Quality notes

- Abbott-Smith is, per biblicalhumanities.org, "probably the best quality
  lexicon in the public domain"; its entries cite the LXX (Hebrew
  equivalents marked `n="H…"` in the source, preserved inline in entry
  text where they appear as foreign text).
- BDB is a 1906 lexicon: superb for historical/etymological depth, dated
  in places; article text keeps BDB's abbreviations (marked as printed).
- Tischendorf is an 1869–72 critical edition (Alexandrian text-type); its
  verse count (7,939) and text differ slightly from modern Nestle-Aland —
  it is a public-domain critical text, not the NA28. For a Byzantine text
  alternative, Robinson-Pierpont is also PD if ever wanted.
- Greek `forms.json` keys are stripped of sentence punctuation; tokens
  like `Ἀβραάμ.` resolve under `Ἀβραάμ`.
- The 712 `w:`-keyed Abbott-Smith entries cover words Strong's missed
  (e.g. `w:Ἀβειληνή`); consider them when the forms index misses.
