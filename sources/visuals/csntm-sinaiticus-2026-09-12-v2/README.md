# Codex Sinaiticus supplemental visual-source candidate

Date: 2026-09-12  
Backlog: AFNT-111  
Status: candidate; not approved, selected, published, or deployed

This candidate proposes one Codex Sinaiticus evidence plate for each of the 39
approved textual-comparison articles. Thirty-three unique complete-page CSNTM
facsimiles are reused where articles fall on the same page. The plates
supplement, rather than replace, the four plates in the immutable approved
`csntm-2026-09-12-v1` release.

The reading claims were checked against the pinned Codex Sinaiticus Project
electronic transcription, version 1.04. The transcription distinguishes the
main hand and correction layers; the preparation script preserves those
distinctions instead of flattening them. Modern chapter and verse labels are
locators supplied by the transcription, not marks visible in the fourth-century
manuscript.

`sinaiticus-evidence.json` is the reproducible verse, correction, folio,
column, line, and CSNTM-image mapping. `registry.candidate.json` contains the
39 proposed captions, alt texts, evidence limits, credits, and links.
`MANIFEST.json` binds every input, source original, item-detail response, IIIF
record, and candidate output by SHA-256.

No application selection points to this candidate. Exact-hash owner approval
is required before it can become an immutable release or be integrated.

## Reproduction order

1. `python3 scripts/prepare_sinaiticus_visual_candidate.py`
2. `node scripts/fetch_sinaiticus_visual_candidate.mts` (cache verification)
3. `node scripts/build_sinaiticus_visual_registry.mts`
4. `node scripts/verify_sinaiticus_visual_candidate.mts`

Use `--fetch` in step 2 only when intentionally acquiring missing source files.
Normal verification never contacts the network.
