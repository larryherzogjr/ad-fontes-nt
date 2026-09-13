# CSNTM visual discovery candidate

This candidate is a preserved discovery inventory for all 39 approved Ad Fontes
NT textual-comparison/commentary units. It is not an image release and contains
no manuscript image binaries.

`inventory.json` derives from 86 raw passage-search responses.
`page-candidates.json` resolves up to four discovery-ranked manuscripts per unit
to exact CSNTM image-detail records where available. `REPORT.md` is the readable
coverage summary. The two manifests bind the raw responses and derived outputs.

All newly discovered pages remain reading-unverified and require item-level
rights, credit, locator, caption, alt-text and editorial review. The ranking is
only a workload aid and must never be represented as textual weight or witness
counting.

Rebuild from preserved responses without network access:

```sh
node scripts/discover_csntm_visuals.mts
node scripts/resolve_csntm_visual_candidates.mts
node scripts/verify_csntm_discovery.mts
```

The `--fetch` option on the first two commands is for a deliberate new source
acquisition only. Never use it to overwrite or silently refresh an approved
release.
