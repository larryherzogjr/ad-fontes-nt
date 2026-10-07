> **This repository has moved to GitHub.**
>
> lxx-morph is now developed at
> **https://github.com/OpenScriptorium/lxx-morph**.
>
> This SourceHut copy is kept as a read-only mirror and may fall behind.
> Please file new issues and pull requests on GitHub.

---

# lxx-morph

Word-level morphological data for the Rahlfs Septuagint (1935), covering 59
books: Pentateuch, historical books, prophets, wisdom, deuterocanon, and
Psalms of Solomon.

Each token carries: `surface`, `lemma`, `parsing`, `pos`, plus provenance
fields (`source`, `confidence`, `reasoning`) recording how it was derived.

## Layout

```
db/seeds/lxx_morph/
  <book>.json                       : final per-token dataset
  <book>.worklist.jsonl             : pipeline intermediate (Morpheus output)
  <book>.resolved.jsonl             : pipeline intermediate
  <book>.batch_out/                 : pipeline intermediate
  <book>.review_out/                : per-token correction batches

app/services/lxx_morph/
  lexical_corrections.rb            : verse-level rule chain
  elision_normalizer.rb             : β-code elision handling
  morpheus_client.rb                : Perseus Morpheus client

lib/tasks/lxx_morph_*.rake          : pipeline driver tasks
scripts/lxx_morph/                  : batch processing helpers
```

## MT ↔ LXX verse pairing

`db/seeds/mt_alignment/verse_pairs.jsonl` pairs every verse of the
Hebrew-canon books with its Masoretic Text counterpart, resolving the
versification differences between the traditions (Jeremiah reordering,
Psalms offset, 2 Esdras, the tabernacle account, ...). See
`db/seeds/mt_alignment/README.md` for format, method, validation, and
attribution. It is the verse-level foundation for a word-level MT↔LXX
alignment dataset in progress.

## Pipeline

1. **Worklist.** Run Perseus Morpheus over each verse; ambiguous tokens
   (multiple parses) and unknowns go to a worklist.
2. **Batch disambiguation.** Resolve ambiguous tokens and supply
   dictionary lemmas where Morpheus fails.
3. **Finalize.** Assemble the per-token output with source/confidence/
   reasoning provenance.
4. **Apply review.** Per-token corrections, then re-run
   `LexicalCorrections` to fixed point.

## Project conventions

These are codified in `app/services/lxx_morph/lexical_corrections.rb` and
enforced across the corpus:

- Suppletive lemmas: `εἶπεν → λέγω`, `εἶδον → ὁράω`, `γινώσκω` (not γιγνώσκω),
  `σῴζω`, `δέομαι ≠ δέω`, `πρότερος ≠ πρῶτος`, `δεῖ ≠ δέω`
- `βδελύσσομαι` is the canonical deponent middle headword
- Anaphoric `αὐτός` carries no gender; personal pronoun lemmas are
  nominative
- Hebrew indeclinables: `lemma = surface`, `parsing = ""`
- Substantival adjectives take `pos = noun`
- `εἰμί` has no middle voice
- Compound verbs keep their compound lemma (e.g., `διασῴζω`, not `σῴζω`)
- 2-termination adjective oblique masc/neut syncretic slash-sets are
  acceptable
- Improper preposition + genitive ⇒ `pos = preposition`
- LSJ headwords are canonical

## License

- **Code** (app/, lib/, scripts/): [ISC](LICENSE)
- **Data** (db/seeds/lxx_morph/): [CC BY 4.0](LICENSE-DATA)

The Rahlfs LXX (1935) is in the public domain.

## Source text

Diplomatic Greek transcription derived from the Eliran Wong public-domain
digital edition of Rahlfs (1935).
