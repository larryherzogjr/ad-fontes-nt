"""Offline projection of Larry's supplied evaluation archive. Never execute bundled scripts."""
import hashlib, json, re, sys, zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
RELEASE='evaluation-resources-2026-10-16-v1'
ARCHIVE=ROOT/'adfontes-confessional-package.zip'
DEST=ROOT/'private/evaluation/content'/RELEASE
PIN=ROOT/'content/evaluation'/RELEASE/'manifest.json'
def sha(b):return hashlib.sha256(b).hexdigest()
def encode(d):return (json.dumps(d,ensure_ascii=False,separators=(',',':'))+'\n').encode()
def build():
 files={};inputs={};works=[];anomalies=[]
 def output(path,data):
  b=encode(data);files[path]=sha(b);p=DEST/path;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(b)
 with zipfile.ZipFile(ARCHIVE) as z:
  names=z.namelist()
  if len(names)!=len(set(names)):raise ValueError('Duplicate ZIP paths')
  if any(n.startswith('/') or '..' in n.split('/') for n in names):raise ValueError('Unsafe ZIP path')
  prefix='adfontes-confessional-package/'
  def read(path):
   b=z.read(prefix+path);inputs[path]=sha(b);return json.loads(b)
  for name in sorted(names):
   if not name.endswith('/index.json'):continue
   path=name[len(prefix):];d=read(path)
   if not isinstance(d.get('sections'),list):continue
   parent=path.rsplit('/',1)[0];parts=parent.split('/');wid=parts[-1]
   category='concordia' if parts[0]=='concordia-commentary' else 'luther' if parts[0]=='luthers-works' else 'boc'
   wid=('lw-'+wid if category=='luther' else wid)
   work={'id':wid,'title':d['resourceTitle'],'category':category,'resourceId':d.get('resourceId'),'resourceVersion':d.get('resourceVersion'),'source':d.get('provenance',''),'sections':[],'extraction':{k:d[k] for k in ['sourceChars','chars','coveragePct','residueFlags','misalignedBoundaries'] if k in d}}
   if category=='boc':work['title']+=' · '+('Tappert (1959)' if 'tappert' in wid else 'Kolb/Wengert (2000)')
   for meta in d['sections']:
    filename=meta['file']
    if not re.fullmatch(r'[a-zA-Z0-9_-]+\.json',filename):raise ValueError('Unsafe section filename')
    data=read(parent+'/json/'+filename)
    if not isinstance(data.get('text'),str) or data.get('title')!=meta['title'] or data.get('part')!=meta.get('part'):raise ValueError('Section metadata mismatch '+filename)
    if len(data['text'])!=meta['chars']:raise ValueError('Section character mismatch '+filename)
    sid=filename[:-5];target=f'sections/{wid}/{sid}.json'
    output(target,{'schemaVersion':1,'releaseId':RELEASE,'work':wid,'id':sid,**data})
    work['sections'].append({'id':sid,'title':data['title'],'part':data.get('part'),'chars':len(data['text']),'path':target,'sha256':files[target]})
   if len(work['sections'])!=d.get('totalSections',len(work['sections'])):raise ValueError('Inventory mismatch')
   if d.get('residueFlags') or d.get('misalignedBoundaries'):anomalies.append({'work':wid,**work['extraction']})
   works.append(work)
  # The package root index lists only the BoCs. Inventory the actual per-volume indexes.
  counts={c:sum(len(w['sections']) for w in works if w['category']==c) for c in ['boc','concordia','luther']}
  if counts!={'boc':27,'concordia':1647,'luther':1042} or len(works)!=85:raise ValueError('Unexpected supplied inventory')
  catalog={'schemaVersion':1,'releaseId':RELEASE,'notice':'Restricted internal evaluation. Access granted only after manual confirmation of an active Logos subscription covering these resources. Supplied AI extraction; not independently proofread against publisher originals. Source headings and prose retained; print-page and paragraph correspondences are not established.','works':works,'counts':counts,'anomalies':anomalies}
  output('catalog.json',catalog)
 manifest={'schemaVersion':1,'releaseId':RELEASE,'archiveSha256':sha(ARCHIVE.read_bytes()),'inputs':inputs,'files':files,'counts':counts,'works':len(works)}
 if PIN.exists():
  if json.loads(PIN.read_text())!=manifest:raise ValueError('Evaluation source differs from immutable release pin; prepare a reviewed successor')
 elif '--prepare' in sys.argv:
  PIN.parent.mkdir(parents=True,exist_ok=True);PIN.write_bytes(encode(manifest))
 else:raise ValueError('Missing reviewed evaluation release pin')
 print(json.dumps({'release':RELEASE,'works':len(works),'counts':counts,'anomalies':len(anomalies),'archiveSha256':manifest['archiveSha256']}))
if __name__=='__main__':build()
