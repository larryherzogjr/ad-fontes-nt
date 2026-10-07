"""Exact NFC lemma concordance derived offline from the two pinned analysis releases."""
import json, hashlib, pathlib, unicodedata
ROOT=pathlib.Path(__file__).resolve().parents[2]
RELEASE='greek-lemma-links-2026-10-07-v1'
SOURCES={'nt':'nestle-analysis-1.3-m3-v1','lxx':'lxx-rahlfs-1935-2026-10-07-v3'}
entries={}; inputs={}
for side,release in SOURCES.items():
 for p in sorted((ROOT/'app/public/analysis'/release/'lemmas').glob('*.json')):
  raw=p.read_bytes(); d=json.loads(raw)
  if d['releaseId']!=release or p.stem!=d['lemmaId']: raise ValueError('Wrong analysis identity')
  lemma=unicodedata.normalize('NFC',d['lemma'])
  record=entries.setdefault(lemma,{'lemma':lemma,'nt':[],'lxx':[]})
  record[side].append({'id':d['lemmaId'],'count':len(d['hits'])})
  inputs[f'{release}/lemmas/{p.name}']=hashlib.sha256(raw).hexdigest()
payload={'schemaVersion':1,'releaseId':RELEASE,'sources':SOURCES,'matching':'Exact NFC lemma; no accent folding, synonym expansion or Strong’s equivalence. Source counts remain distinct.','entries':sorted(entries.values(),key=lambda x:x['lemma'])}
raw=(json.dumps(payload,ensure_ascii=False,separators=(',',':'))+'\n').encode()
pin=ROOT/'sources/greek'/RELEASE; pin.mkdir(parents=True,exist_ok=True)
snapshot={'inputs':inputs,'outputSha256':hashlib.sha256(raw).hexdigest(),'implementationSha256':hashlib.sha256(pathlib.Path(__file__).read_bytes()).hexdigest()}
f=pin/'checksums.json'
if f.exists():
 if json.loads(f.read_text())!=snapshot: raise ValueError('Pinned lemma derivative changed; prepare a reviewed successor release')
else: f.write_text(json.dumps(snapshot,indent=2)+'\n')
out=ROOT/'app/public/analysis'/f'{RELEASE}.json';out.write_bytes(raw)
print(f'{RELEASE}: {len(entries)} exact lemmas, {sum(bool(e["nt"] and e["lxx"]) for e in entries.values())} shared')
