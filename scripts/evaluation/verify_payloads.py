"""Host-side verification using Ubuntu's Python, without installing Node or the source ZIP."""
import hashlib
import json
from pathlib import Path
import sys

release = 'evaluation-resources-2026-10-16-v1'
directory = Path(sys.argv[1] if len(sys.argv) > 1 else f'private/evaluation/content/{release}').resolve()
pins = Path('content/evaluation') / release
resource = json.loads((pins / 'manifest.json').read_text())
search = json.loads((pins / 'search-manifest.json').read_text())
files = {**resource['files'], **{f'search/{name}': digest for name, digest in search['files'].items()}}
for name, expected in files.items():
    path = (directory / name).resolve()
    if not path.is_relative_to(directory) or not path.is_file():
        raise SystemExit(f'Missing/unsafe evaluation file: {name}')
    if hashlib.sha256(path.read_bytes()).hexdigest() != expected:
        raise SystemExit(f'Evaluation content checksum mismatch: {name}')
if json.loads((directory / 'search/manifest.json').read_text()) != search:
    raise SystemExit('Evaluation search manifest mismatch')
print(f'Verified {len(files)} pinned evaluation files and search manifest.')
