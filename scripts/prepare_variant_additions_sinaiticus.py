#!/usr/bin/env python3
"""Map the six new review candidates using the pinned transcription. No network."""
import json
from pathlib import Path
import prepare_sinaiticus_visual_candidate as base

ROOT = Path(__file__).resolve().parents[1]
SLATE = ROOT / 'docs/editorial-review/variant-additions-2026-10-11/SLATE.json'
base.OUTPUT = ROOT / 'sources/visuals/csntm-sinaiticus-additions-2026-10-11-v2-candidate'
base.VARIANTS = ROOT / 'artifacts/editorial/variant-additions-2026-10-11-candidate-v2/NEW-UNITS.json'
base.RELEASE_ID = 'csntm-sinaiticus-additions-2026-10-11-v2'
base.BOOKS.update({'COL': ('43', 'COL'), 'HEB': ('46', 'HEB')})
slate = json.loads(SLATE.read_text())
if [u['id'] for u in slate['units']] != [f'candidate-{i}' for i in range(105, 111)]:
    raise ValueError('Expected candidates 105 through 110')
base.READING_CLAIMS = {u['id']: u['sinaiticusClaim'] for u in slate['units']}
if base.OUTPUT.exists():
    raise ValueError('Refusing to overwrite an existing visual candidate')
base.main()
manifest_path = base.OUTPUT / 'MANIFEST.json'
manifest = json.loads(manifest_path.read_text())
for path in [SLATE, Path(__file__).resolve(), ROOT / 'scripts/prepare_sinaiticus_visual_candidate.py']:
    manifest['inputs'][str(path.relative_to(ROOT))] = base.sha256(path)
core = {k: v for k, v in manifest.items() if k != 'candidateSha256'}
manifest['candidateSha256'] = base.hashlib.sha256(json.dumps(core, separators=(',', ':'), sort_keys=True).encode()).hexdigest()
manifest_path.write_text(json.dumps(manifest, indent=2) + '\n')
