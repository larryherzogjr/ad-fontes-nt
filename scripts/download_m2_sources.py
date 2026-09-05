"""Recover missing pinned M2 raw artifacts. Never accepts changed upstream bytes."""
import json,hashlib,urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
for manifest in sorted((ROOT/'sources').glob('*/m2-manifest.json')):
 if manifest.parent.name=='bsb':continue
 for a in json.loads(manifest.read_text())['artifacts']:
  p=ROOT/a['path']
  data=p.read_bytes() if p.exists() else urllib.request.urlopen(a['url'],timeout=90).read()
  assert hashlib.sha256(data).hexdigest()==a['sha256'],f"Upstream changed; refusing {a['path']}"
  if not p.exists():p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data)
  print(a['path']+' verified')
