"""Independent source reconciliation: different formats and traversal from the importers."""
import unittest,json,zipfile,re,csv,io,unicodedata,xml.etree.ElementTree as ET,html,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
CAT=json.loads((ROOT/'app/lib/domain/editions.json').read_text())
BASE=json.loads((ROOT/'app/lib/domain/registry.json').read_text())
VPL={'MAR':'MRK','JOH':'JHN','PHI':'PHP','JAM':'JAS','1JO':'1JN','2JO':'2JN','3JO':'3JN'}
def norm(s):return ' '.join(s.split())
def chapters(id):
 release=next(e['releaseId'] for e in CAT if e['editionId']==id)
 return [json.loads(p.read_text()) for b in BASE for p in sorted((ROOT/'app/public/corpus'/release/b['code']).glob('*.json'),key=lambda p:int(p.stem))]
def segments(id):return {s['sourceRef']:s for c in chapters(id) for s in c['segments']}
def letters(s):return ''.join(c for c in unicodedata.normalize('NFD',s) if c.isalpha()).upper()
class Fidelity(unittest.TestCase):
 def test_all_english_authority_rows(self):
  for id,folder,enc in [('BLB','blb','utf-8-sig'),('MSB','msb','cp1252')]:
   names={b['name']:b['code'] for b in BASE};original={}
   for l in (ROOT/f'sources/{folder}/raw/{folder}.txt').read_text(encoding=enc).splitlines():
    m=re.fullmatch(r'(.+) (\d+):(\d+)\t(.*)',l)
    if m and m[1] in names and m[4].strip():original[f'{names[m[1]]}.{m[2]}.{m[3]}']=m[4]
   self.assertEqual(original,{a:s['text'] for a,s in segments(id).items()},id)
 def test_usfx_against_independent_vpl_exports(self):
  for id,folder,stem in [('YLT','ylt','engylt'),('TR-BOYD','boyd','grctr')]:
   z=zipfile.ZipFile(ROOT/f'sources/{folder}/raw/{stem}_vpl.zip');original={};codes={b['code'] for b in BASE}
   for l in z.read(f'{stem}_vpl.txt').decode('utf-8-sig').splitlines():
    m=re.fullmatch(r'(\w+) (\d+):(\d+) (.*)',l)
    if m:
     code=VPL.get(m[1],m[1])
     if code in codes:original[f'{code}.{m[2]}.{m[3]}']=norm(m[4])
   actual={a:s['text'] for a,s in segments(id).items()}
   # VPL folds 14 Boyd subscriptions into the final verse. USFX explicitly separates d blocks.
   subscription_count=0
   for c in chapters(id):
    subs=[norm(''.join(r.get('text','') for r in b['runs'])) for b in c['blocks'] if b['marker']=='d']
    if subs:
     subscription_count+=len(subs);a=c['segments'][-1]['sourceRef'];actual[a]+=' '+' '.join(subs)
   self.assertEqual(original,actual,id);self.assertEqual(subscription_count,14 if id=='TR-BOYD' else 0)
 def test_greek_unicode_source_roundtrip(self):
  # Independent flattening of XHTML preserves every non-layout character, including alternatives/brackets.
  z=zipfile.ZipFile(ROOT/'sources/nestle1904/raw/nestle1904-713f28a.zip');prefix=z.namelist()[0];cs=chapters('N1904')
  strip=lambda s:re.sub(r'[\s\d]','',s)
  for b in BASE:
   s=z.read(prefix+'xhtml/'+b['name'].replace(' ','-')+'-ap.xhtml').decode('utf-8-sig')
   s=re.sub(r'&([A-Za-z][A-Za-z0-9]+);',lambda m:html.unescape(m[0]) if m[1] not in ['amp','lt','gt','quot','apos'] else m[0],s)
   root=ET.fromstring(s);body=next(e for e in root.iter() if e.tag.endswith('}body'));active=False;raw=[]
   for e in body:
    t=''.join(e.itertext())
    if e.tag.endswith('}h2') and t.strip().isdigit():active=True;continue
    if active:raw.append(t)
   rendered=''.join(r.get('text','') for c in cs if c['book']==b['code'] for block in c['blocks'] for r in block['runs'])
   self.assertEqual(strip(''.join(raw)),strip(rendered),b['code'])
  ss=segments('N1904');self.assertTrue(ss['MRK.16.9']['text'].startswith('[['));self.assertTrue(ss['MRK.16.20']['text'].endswith(']]'));self.assertTrue(ss['JHN.7.53']['text'].startswith('<'));self.assertTrue(ss['JHN.8.11']['text'].endswith('>'));self.assertNotIn('1913',ss['MRK.1.1']['text'])
 def test_rp_original_ccat_letters_and_inventory(self):
  z=zipfile.ZipFile(ROOT/'sources/rp2018/raw/rp-v3.3.2.zip');prefix=z.namelist()[0];actual=segments('RP2018');mapped={}
  greek='ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ';beta='ABGDEZHQIKLMNCOPRSTUFXYW';translate=str.maketrans(greek,beta)
  for b in BASE:
   fn=next(n for n in z.namelist() if re.search(r'/source/CCAT/'+f"{b['order']+1:02d}"+r'_[A-Z0-9]+\.TXT$',n))
   rows={}
   for l in z.read(fn).decode().splitlines():
    m=re.match(r'(\d+):(\d+)\s+(.*)',l)
    if m and m[3].strip():rows[f"{b['code']}.{int(m[1])}.{int(m[2])}"]=m[3]
   self.assertEqual(set(rows),{a for a in actual if a.startswith(b['code']+'.')},b['code'])
   for a,t in rows.items():
    t=re.sub(r'\{[^}]*\}','',t);raw=re.sub('[^A-Z]','',t.upper());converted=letters(actual[a]['text']).translate(translate)
    self.assertEqual(raw,converted,a)
 def test_original_publisher_note_objects_and_rp_unicode(self):
  z=zipfile.ZipFile(ROOT/'sources/msb/raw/MSB_usj-v5.9.zip');notes=[]
  def walk(x):
   if isinstance(x,dict):
    if x.get('type')=='note':notes.append(x)
    else:
     for c in x.get('content',[]):walk(c)
  for b in BASE:walk(json.loads(z.read(b['code']+'.usj')))
  self.assertEqual(notes,[n['original'] for c in chapters('MSB') for n in c['notes']])
  z=zipfile.ZipFile(ROOT/'sources/boyd/raw/grctr_usfx.zip');root=ET.fromstring(z.read('grctr_usfx.xml'));codes={b['code'] for b in BASE}
  raw=[ET.tostring(n,encoding='unicode') for b in root.findall('book') if b.attrib['id'] in codes for n in b.iter('f')]
  self.assertEqual(raw,[n['originalXml'] for c in chapters('TR-BOYD') for n in c['notes']])
  z=zipfile.ZipFile(ROOT/'sources/rp2018/raw/rp-v3.3.2.zip');prefix=z.namelist()[0];ss=segments('RP2018')
  external={'MRK':'MAR','JHN':'JOH','JAS':'JAM','1JN':'1JO','2JN':'2JO','3JN':'3JO'}
  for b in BASE:
   fn=prefix+'csv-unicode/ccat/no-variants/'+external.get(b['code'],b['code'])+'.csv'
   for r in csv.DictReader(io.StringIO(z.read(fn).decode())):
    if r['text'].strip():self.assertEqual(ss[f"{b['code']}.{r['chapter']}.{r['verse']}"]['text'],norm(r['text'].removeprefix('¶')))
 def test_nestle_independent_transcription_spots(self):
  z=zipfile.ZipFile(ROOT/'sources/nestle1904/raw/nestle1904-713f28a.zip');prefix=z.namelist()[0];rows=csv.DictReader(io.StringIO(z.read(prefix+'morph/Nestle1904.csv').decode('utf-8-sig')),delimiter='\t');group={}
  for r in rows:group.setdefault(r['BCV'],[]).append(r['text'])
  ss=segments('N1904')
  for a,ref in [('JHN.1.1','John 1:1'),('ROM.3.23','Rom 3:23'),('PHP.2.6','Phil 2:6'),('PHM.1.4','Phlm 1:4'),('3JN.1.15','3John 1:15')]:
   self.assertEqual(letters(ss[a]['text']),letters(' '.join(group[ref])),a)
if __name__=='__main__':unittest.main()
