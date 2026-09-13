# Codex Sinaiticus evidence candidate for the 65-unit expansion

Date: 2026-09-13  
Backlog: AFNT-113  
Status: candidate; not approved, selected, published, or deployed

This candidate proposes one Codex Sinaiticus evidence plate for each of the 65
textual-comparison additions numbered `candidate-40` through `candidate-104`.
Sixty unique complete-page CSNTM facsimiles are reused where articles share a
page. They supplement the immutable evidence releases already used by the 39
approved comparisons.

The reading claims were checked against the pinned Codex Sinaiticus Project
electronic transcription, version 1.04. The transcription distinguishes the
main hand and correction layers; the preparation script preserves those
distinctions instead of flattening them. Modern chapter and verse labels are
transcription locators, not marks visible in the fourth-century manuscript.

`sinaiticus-evidence.json` contains the reproducible verse, correction, folio,
column, line, and CSNTM-image mapping. `registry.candidate.json` contains the
proposed captions, alt text, evidence limits, credits, and links.
`MANIFEST.json` binds every input, source original, item-detail response, IIIF
record, and candidate output by SHA-256.

No application selection points to this candidate. The 65 editorial records
and this separate visual release both require exact-hash owner approval before
promotion or integration.

## Reproduction order

1. `node scripts/build_variant_expansion_candidate.mts`
2. `python3 scripts/prepare_variant_expansion_sinaiticus_candidate.py`
3. `node scripts/fetch_sinaiticus_visual_candidate.mts --root=sources/visuals/csntm-sinaiticus-expansion-2026-09-13-v2-candidate`
4. `node scripts/build_sinaiticus_visual_registry.mts --root=sources/visuals/csntm-sinaiticus-expansion-2026-09-13-v2-candidate --variants=artifacts/editorial/variant-expansion-2026-09-13-candidate-v2/NEW-UNITS.json --allow-in-review`

Use `--fetch` in step 3 only when intentionally acquiring missing source files.
Normal verification never contacts the network.
