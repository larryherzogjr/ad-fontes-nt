"""Explicit network recovery of pinned artifacts. Existing files are never overwritten."""
from pathlib import Path
import json,hashlib,urllib.request,os
ROOT=Path(__file__).resolve().parents[1]
m=json.loads((ROOT/'sources/bsb/manifest.json').read_text())
for a in m['artifacts']:
 p=ROOT/a['path']
 if p.exists():
  assert hashlib.sha256(p.read_bytes()).hexdigest()==a['sha256'],f'Existing file differs: {p}'
  print('Verified',a['path']);continue
 data=urllib.request.urlopen(a['url'],timeout=60).read()
 assert hashlib.sha256(data).hexdigest()==a['sha256'],f"Upstream artifact changed: {a['url']}; keep archived snapshot, review a new release"
 p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('xb') as f:f.write(data)
 print('Recovered',a['path'])
