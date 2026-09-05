"""Offline M2 imports. --freeze creates a new pinned local release after source review.
Normal builds verify hashes, inventory, reviewed differences and immutable outputs.
"""
import sys,json,hashlib,zipfile,copy,tempfile,shutil
from pathlib import Path
sys.path.insert(0,str(Path(__file__).parent/'m2'))
from adapters import ROOT,ADAPTERS,msb_authoritative
from mappings import REGISTRY,GAPS,apply
from catalog import SOURCES
FREEZE='--freeze' in sys.argv
OLD='bsb-2026-09-05-53acad65d590'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def encoded(x):return (json.dumps(x,ensure_ascii=False,indent=2)+'\n').encode()
def write(p,x):p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(encoded(x))
def check(p,x):
 if FREEZE and not p.exists():write(p,x)
 else:assert json.loads(p.read_text())==x,f'Unreviewed change: {p}'
def inventory(cs):
 return {'books':[{'book':b['code'],'chapters':len([c for c in cs if c['book']==b['code']]),'sourceRefs':[s['sourceRef'] for c in cs if c['book']==b['code'] for s in c['segments']]} for b in REGISTRY], 'chapters':len(cs),'segments':sum(len(c['segments']) for c in cs),'notes':sum(len(c['notes']) for c in cs),'alternatives':sum(len(c.get('alternatives',[]))+len([b for b in c['blocks'] if b['role']=='publisher-alternative']) for c in cs)}
# Copies of embedded evidence remain outside the public app.
if FREEZE:
 for folder,filename,names in [('rp2018','rp-v3.3.2.zip',['README.md','source/README.md','csv-unicode/README.md']),('nestle1904','nestle1904-713f28a.zip',['README.md','xhtml/README.md','morph/README.md','xml/README.md'])]:
  z=zipfile.ZipFile(ROOT/f'sources/{folder}/raw/{filename}');prefix=z.namelist()[0]
  for name in names:
   p=ROOT/f'sources/{folder}/evidence'/name.replace('/','-')
   if not p.exists():p.write_bytes(z.read(prefix+name))
check(ROOT/'app/lib/domain/canonical-registry.json',REGISTRY)
catalog=[]
for edition in ['BSB']+list(SOURCES):
 folder='bsb' if edition=='BSB' else SOURCES[edition]['folder'];release=edition.lower()+'-2026-09-05-m2-'+('v2' if edition=='MSB' else 'v1');base=ROOT/f'sources/{folder}'
 mp=base/'m2-manifest.json'
 if FREEZE and not mp.exists():
  if edition=='BSB':
   old=json.loads((base/'manifest.json').read_text());m={'editionId':edition,'name':'Berean Standard Bible','language':'en','group':'Critical/Eclectic','description':'Readable contemporary English; the foundational reading edition.','editionLabel':old['editionLabel'],'authority':old['textAuthority'],'url':'https://berean.bible/','rightsUrl':'https://berean.bible/terms.htm','rights':old['rights'],'attribution':old.get('attribution',''),'included':['NT Scripture','source paragraphs and headings','publisher notes'],'excluded':['OT','word alignment'],'artifacts':old['artifacts'],'predecessorRelease':OLD}
  else:
   m=copy.deepcopy(SOURCES[edition]);m.pop('folder');artifacts=m.pop('artifacts');m['artifacts']=[{'path':f'sources/{folder}/{p}','url':u,'sha256':sha(base/p),'bytes':(base/p).stat().st_size} for p,u in artifacts.items()]
  m.update(editionId=edition,releaseId=release,retrievedAt='2026-09-05',scope='All 27 New Testament books',status='verified-local-M2; qualified textual/editorial review remains a public-release gate',verifiedGaps=GAPS[edition],mappingRules='scripts/m2/mappings.py; structural address relationships only, no word alignment',evidence=[{'path':str(p.relative_to(ROOT)),'sha256':sha(p)} for p in sorted((base/'evidence').rglob('*')) if p.is_file()])
  write(mp,m)
 m=json.loads(mp.read_text());assert m['releaseId']==release
 for a in m['artifacts']+m['evidence']:assert sha(ROOT/a['path'])==a['sha256'],f"Source changed: {a['path']}"
 if edition=='BSB':cs=[json.loads(p.read_text()) for b in REGISTRY for p in sorted((ROOT/'app/public/corpus'/OLD/b['code']).glob('*.json'),key=lambda p:int(p.stem))]
 elif edition=='MSB':
  cs,diffs=msb_authoritative();check(base/'m2-reviewed-differences.json',diffs)
 else:cs=ADAPTERS[edition]()
 cs=apply(edition,cs,release);assert len(cs)==260 and len({s['sourceRef'] for c in cs for s in c['segments']})==sum(len(c['segments']) for c in cs)
 report=inventory(cs);report['gaps']=GAPS[edition];check(base/'m2-inventory.json',report)
 m['inventory']={k:v for k,v in report.items() if k!='books'}
 tmp=tempfile.TemporaryDirectory(prefix='afnt-m2-');out=Path(tmp.name)/release;out.mkdir()
 for ch in cs:write(out/ch['book']/f"{ch['chapter']}.json",ch)
 if m['language']=='en':write(out/'search.json',[{'anchor':s['anchors'][0],'book':c['book'],'text':s['text']} for c in cs for s in c['segments']])
 write(out/'manifest.json',m)
 digests={str(p.relative_to(out)):sha(p) for p in sorted(out.rglob('*.json'))};check(base/'m2-output-checksums.json',digests)
 target=ROOT/'app/public/corpus'/release
 if target.exists():assert digests=={str(p.relative_to(target)):sha(p) for p in sorted(target.rglob('*.json'))},f'Immutable release changed: {release}'
 else:shutil.copytree(out,target)
 tmp.cleanup();catalog.append({k:m[k] for k in ['editionId','releaseId','name','language','group','description','editionLabel','authority','url','rightsUrl','rights','included','excluded','inventory']})
 print(edition,{k:report[k] for k in ['chapters','segments','notes','alternatives']},flush=True)
write(ROOT/'app/lib/domain/editions.json',catalog)
