# CSNTM evidence-plate visual source candidate

Release candidate: `csntm-2026-09-12-v1`  
Status: caption/editorial review pending; not selected for application publication

This candidate is separate from the approved commentary payloads. The registry
records each current commentary review hash only to prove that no commentary
bytes were changed while the visual layer was prepared.

`originals/` contains the exact image bytes received from CSNTM's IIIF service.
For the two Codex Bezae pages, the service did not return a full-image response;
the complete 500-pixel IIIF tile set is therefore preserved. The lossless PNG
assemblies in `derivatives/` were produced with:

```text
python3 scripts/stitch_iiif_tiles.py <info.json> <tile-directory> <output.png>
```

`evidence/` preserves CSNTM image-detail records, IIIF metadata, manuscript
records, the current CSNTM terms page, the Cambridge manifest used for the Bezae
folio sequence, and the Codex Sinaiticus Project pages/transcription archive
used to check the two Sinaiticus readings.

Run `node scripts/verify_visual_release.mts` to validate local paths, commentary
bindings, file checksums, and the exact candidate hash. No build or importer may
publish this directory until that hash is approved and an approval record is
added.
