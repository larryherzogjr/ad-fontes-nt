"""Independent raw-source checks, not importer snapshots alone."""
import unittest,json,zipfile,re,hashlib,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
M=json.loads((ROOT/'sources/bsb/manifest.json').read_text());OUT=ROOT/'app/public/corpus'/M['releaseId'];Z=zipfile.ZipFile(ROOT/'sources/bsb/raw/bsb_usj.zip');REG=json.loads((ROOT/'app/lib/domain/registry.json').read_text())
TXT=dict(line.split('\t',1) for line in (ROOT/'sources/bsb/raw/bsb.txt').read_text(encoding='utf-8-sig').splitlines() if '\t' in line)
def at_path(d,path):
 for part in path.split('/'):d=d[int(part)] if isinstance(d,list) else d[part]
 return d
def digest():return {str(p.relative_to(OUT)):hashlib.sha256(p.read_bytes()).hexdigest() for p in OUT.rglob('*.json')}
class Fidelity(unittest.TestCase):
 def test_every_source_segment_and_note_and_structure(self):
  total=0
  for b in REG:
   raw=json.loads(Z.read(f"bsb_usj/{b['code']}.usj"));source_verses=[];source_notes=[];source_paras=[];chapter=0
   def walk(x):
    if isinstance(x,dict):
     if x['type']=='verse':source_verses.append(f"{b['code']}.{chapter}.{x['number']}")
     if x['type']=='note':source_notes.append(x)
     for c in x.get('content',[]):walk(c)
   for x in raw['content']:
    if x['type']=='chapter':chapter=int(x['number'])
    elif chapter:source_paras.append(x['marker']);walk(x)
   actual_verses=[];actual_notes=[];actual_paras=[]
   for c in range(1,len(b['verses'])+1):
    data=json.loads((OUT/b['code']/f'{c}.json').read_text());actual_paras.extend(p['marker'] for p in data['blocks'])
    for s in data['segments']:
     actual_verses.append(s['id']);total+=1
     self.assertEqual(s['text'],TXT[f"{b['name']} {c}:{s['sourceLabel']}"])
     rendered=''.join(r['text'] for p in data['blocks'] if p['role']=='scripture' for r in p['runs'] if r.get('anchor')==s['id'] and 'text' in r)
     self.assertEqual(rendered,s['text'],s['id'])
     source=at_path(raw,s['sourceId'].split('#')[1]);self.assertEqual(source['number'],s['sourceLabel'])
    for n in data['notes']:
     self.assertEqual(n['original'],at_path(raw,n['sourceId'].split('#')[1]));actual_notes.append(n['original'])
    for cov in data['coverage']:
     if cov['textState']=='absent':
      self.assertIn(cov['anchor'],M['verifiedGaps']);v=cov['anchor'].split('.')[-1]
      notes=[n for n in data['notes'] if n['id'] in cov['publisherNoteIds']]
      self.assertTrue(any(re.search(r'\b'+v+r'\D',n['body']) for n in notes),cov['anchor'])
   self.assertEqual(actual_verses,source_verses);self.assertEqual(actual_notes,source_notes);self.assertEqual(actual_paras,source_paras)
  self.assertEqual(total,sum(1 for key,text in TXT.items() if any(key.startswith(b['name']+' ') for b in REG) and text.strip()))
 def test_independently_selected_spot_checks(self):
  cases={'ROM.3.23':'for all have sinned and fall short of the glory of God,','JHN.1.1':'In the beginning was the Word, and the Word was with God, and the Word was God.','PHM.1.4':'I always thank my God, remembering you in my prayers,','PHP.2.6':'Who, existing in the form of God, did not consider equality with God something to be grasped,'}
  for a,text in cases.items():
   b,c,_=a.split('.');d=json.loads((OUT/b/f'{c}.json').read_text());self.assertEqual(next(s['text'] for s in d['segments'] if s['id']==a),text)
  p=json.loads((OUT/'PHP/2.json').read_text());self.assertTrue(any(x['marker']=='q1' for x in p['blocks']))
 def test_offline_reproducibility(self):
  before=digest();subprocess.run(['python3',str(ROOT/'scripts/import_bsb.py')],check=True,capture_output=True);self.assertEqual(before,digest())
if __name__=='__main__':unittest.main()
