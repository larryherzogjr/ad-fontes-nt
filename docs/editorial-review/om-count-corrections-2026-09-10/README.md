# OM article word-count corrections — review packet

Date: September 10, 2026  
Status: candidate preparation; not yet an immutable release or public deployment.

Larry identified the `Anthropos` error and authorized preparation of the six-article correction set on September 10, 2026. The accompanying exact-replacement specification corrects ten statements in six articles. It does not change Scripture, BSB quotations, corpus mappings, commentary conclusions, or `larryherzogjr.com`.

The mechanically checked scope is:

- `Anthropos`: two Latin words in *Ecce homo*.
- `Anomia`: five Greek words in *Hē hamartia estin hē anomia*.
- `Logos`: five Greek words in *En archē ēn ho logos*.
- `Pistos ho logos`: retain the correct eight-word Greek count while no longer applying it to the nine-word English rendering.
- `Pater`: describe the three discussed units as elements, since one is a phrase.
- `Kyrios`: consistently distinguish the two-word Greek confession *Kyrios Iēsous* from the three-word English rendering “Jesus is Lord,” and do not identify “Lord, have mercy” as the same phrase.

The targeted audit searched all 250 v4 article files for explicit number-plus-language/word statements and manually checked the plausible matches. It establishes this narrow correction set; it is not a fresh scholarly certification of every lexical, historical, or theological assertion in the collection.

Run the deterministic candidate preparation command from the Ad Fontes NT repository root:

```sh
python3 scripts/prepare_om_editorial_correction.py \
  --predecessor om-studies-2026-09-09-v4 \
  --spec docs/editorial-review/om-count-corrections-2026-09-10/CORRECTIONS.json \
  --output artifacts/editorial/om-count-corrections-2026-09-10-v2
```

Promotion requires Larry’s explicit approval against the resulting `CANDIDATE-MANIFEST.json` SHA-256. Preserve v4 unchanged. The approved successor will be `om-studies-2026-09-10-v5`, selected once for both the website and desktop builds.
