"""Offline BSB USJ adapter v1. Never downloads or silently accepts source changes."""
import json, zipfile, hashlib, re, difflib, tempfile, shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
RAW=ROOT/'sources/bsb/raw'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,x):
 p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
books_data=[('MAT','Matthew','Matt',28),('MRK','Mark','Mark',16),('LUK','Luke','Luke',24),('JHN','John','John',21),('ACT','Acts','Acts',28),('ROM','Romans','Rom',16),('1CO','1 Corinthians','1Cor',16),('2CO','2 Corinthians','2Cor',13),('GAL','Galatians','Gal',6),('EPH','Ephesians','Eph',6),('PHP','Philippians','Phil',4),('COL','Colossians','Col',4),('1TH','1 Thessalonians','1Thess',5),('2TH','2 Thessalonians','2Thess',3),('1TI','1 Timothy','1Tim',6),('2TI','2 Timothy','2Tim',4),('TIT','Titus','Titus',3),('PHM','Philemon','Phlm',1),('HEB','Hebrews','Heb',13),('JAS','James','Jas',5),('1PE','1 Peter','1Pet',5),('2PE','2 Peter','2Pet',3),('1JN','1 John','1John',5),('2JN','2 John','2John',1),('3JN','3 John','3John',1),('JUD','Jude','Jude',1),('REV','Revelation','Rev',22)]
manifest_path=ROOT/'sources/bsb/manifest.json'
manifest=json.loads(manifest_path.read_text())
for a in manifest['artifacts']:assert sha(ROOT/a['path'])==a['sha256'],f"Source checksum changed: {a['path']}"
release=manifest['releaseId']; target=ROOT/'app/public/corpus'/release
# Validate in staging; never mutate a published release in-place.
staging=tempfile.TemporaryDirectory(prefix='afnt-import-');out=Path(staging.name)/release;out.mkdir()
z=zipfile.ZipFile(RAW/'bsb_usj.zip')
def plain(x):return x if isinstance(x,str) else ''.join(plain(c) for c in x.get('content',[]))
def norm(s):return ' '.join(s.split())
reference_text={}
for line in (RAW/'bsb.txt').read_text(encoding='utf-8-sig').splitlines():
 if '\t' in line:
  ref,text=line.split('\t',1);reference_text[ref]=text
registry=[];search=[];report={'releaseId':release,'books':[],'gaps':[],'differences':[],'duplicate':[],'unmapped':[]};allnotes=[]
for order,(code,name,osis,expected_chapters) in enumerate(books_data):
 d=json.loads(z.read(f'bsb_usj/{code}.usj'));chapters={};segments={};notes=[];chapter=0;anchor=None
 for pi,p in enumerate(d['content']):
  if p['type']=='chapter':
   chapter=int(p['number']);chapters[chapter]={'book':code,'chapter':chapter,'releaseId':release,'blocks':[],'segments':[],'notes':[],'coverage':[]};anchor=None;continue
  if not chapter:continue
  assert p['type']=='para',p
  marker=p['marker'];runs=[];heading=marker in ['s1','s2','r','ms','mr']
  def visit(x,path,marks=[]):
   global anchor
   if isinstance(x,str):
    runs.append({'text':x,'anchor':None if heading else anchor,'marks':marks})
    if not heading and anchor:segments[anchor]['text']+=x
   elif x['type']=='verse':
    anchor=f"{code}.{chapter}.{x['number']}";assert anchor not in segments,anchor
    segments[anchor]={'id':anchor,'sourceId':f'bsb_usj/{code}.usj#{path}','sourceLabel':x['number'],'anchors':[anchor],'mappingType':'exact','text':''}
    runs.append({'verse':x['number'],'anchor':anchor})
   elif x['type']=='note':
    nid=f'{code}.{chapter}.note.{len(notes)+1}'
    note={'id':nid,'anchor':anchor,'sourceId':f'bsb_usj/{code}.usj#{path}','type':'publisher-note','marker':x['marker'],'body':plain(x),'original':x}
    notes.append(note);chapters[chapter]['notes'].append(note);runs.append({'noteId':nid,'anchor':anchor})
   elif x['type'] in ['char','ref']:
    for i,c in enumerate(x.get('content',[])):visit(c,f'{path}/content/{i}',marks+[x.get('marker',x['type'])])
   else:raise ValueError(x)
  if anchor and not heading:segments[anchor]['text']+='\n'
  for i,x in enumerate(p.get('content',[])):visit(x,f'content/{pi}/content/{i}')
  chapters[chapter]['blocks'].append({'marker':marker,'role':'publisher-heading' if heading else 'scripture','sourceId':f'bsb_usj/{code}.usj#content/{pi}','runs':runs})
 assert len(chapters)==expected_chapters
 maxima=[]
 for ch,data in chapters.items():
  seg=[s for s in segments.values() if s['id'].startswith(f'{code}.{ch}.')];maximum=max(int(s['sourceLabel']) for s in seg);maxima.append(maximum)
  data['segments']=seg
  for v in range(1,maximum+1):
   a=f'{code}.{ch}.{v}';present=a in segments
   # Absences require an explicit reviewed gap entry, never inferred from parser output.
   gap=manifest['verifiedGaps'].get(a)
   assert present or gap,f'Unexplained source gap: {a}'
   ids=[n['id'] for n in data['notes'] if n['anchor']==a or (gap and n['anchor']==gap['noteAnchor'])]
   data['coverage'].append({'anchor':a,'dataState':'available','textState':'present' if present else 'absent','publisherNoteIds':ids})
   if not present:report['gaps'].append(a)
  for s in seg:
   key=f"{name} {ch}:{s['sourceLabel']}"; t=reference_text.get(key)
   if t is None or norm(s['text'])!=norm(t):report['differences'].append({'anchor':s['id'],'usj':norm(s['text']),'text':t})
   # Bind authoritative text to existing paragraph/poetry positions, retaining raw runs.
   assert t is not None
   runs=[r for b in data['blocks'] if b['role']=='scripture' for r in b['runs'] if r.get('anchor')==s['id'] and 'text' in r]
   original=''.join(r['text'] for r in runs); owners=[i for i,r in enumerate(runs) for _ in r['text']]; aligned=['']*len(runs)
   for tag,a,b,c,d in difflib.SequenceMatcher(None,original,t,autojunk=False).get_opcodes():
    if tag=='equal':
     for offset,char in enumerate(t[c:d]):aligned[owners[a+offset]]+=char
    elif tag in ['insert','replace']:
     aligned[owners[min(a,len(owners)-1)]]+=t[c:d]
   for run,text in zip(runs,aligned):run['originalText']=run['text'];run['text']=text
   assert ''.join(r['text'] for r in runs)==t
   s['originalStructuredText']=s['text'];s['text']=t
   search.append({'anchor':s['id'],'book':code,'text':t})
  write(out/code/f'{ch}.json',data)
 registry.append({'code':code,'name':name,'order':order,'usfm':code,'osis':osis,'aliases':[code,name,osis,name[:3] if not name[0].isdigit() else name[:5]],'verses':maxima})
 report['books'].append({'code':code,'chapters':len(chapters),'segments':len(segments),'notes':len(notes)})
 allnotes+=notes
report['segments']=len(search);report['notes']=len(allnotes)
# Source-inventory reconciliation in both directions.
nt_names={b[1] for b in books_data}
nt_rows=[r for r in reference_text if re.sub(r' \d+:\d+$','',r) in nt_names and reference_text[r].strip()]
report['plainTextNonemptyNTRows']=len(nt_rows)
write(ROOT/'sources/bsb/reconciliation.json',report)
assert report['differences']==json.loads((ROOT/'sources/bsb/reviewed-differences.json').read_text()),'Unreviewed source differences'
assert len(nt_rows)==len(search),(len(nt_rows),len(search))
write(out/'search.json',search);write(out/'manifest.json',manifest)
regpath=ROOT/'app/lib/domain/registry.json'
if regpath.exists():assert json.loads(regpath.read_text())==registry,'Registry change requires independent review'
else:write(regpath,registry)
if target.exists():
 expected={str(p.relative_to(out)):p.read_bytes() for p in out.rglob('*') if p.is_file()}
 actual={str(p.relative_to(target)):p.read_bytes() for p in target.rglob('*') if p.is_file()}
 assert expected==actual,'Existing immutable bundle differs; use a new release ID for importer/source changes'
else:
 target.parent.mkdir(parents=True,exist_ok=True);shutil.copytree(out,target)
staging.cleanup()
print(json.dumps({'books':len(registry),'chapters':sum(len(b['verses']) for b in registry),'segments':len(search),'notes':len(allnotes),'gaps':report['gaps']}))
