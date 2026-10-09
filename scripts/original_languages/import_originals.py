"""Offline WLC/OSHB and Clementine adapters. No canonical registry mutation."""
from pathlib import Path
import collections, hashlib, html, io, json, re, sqlite3, tempfile, zipfile
import xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'sources/original-languages'
RAW=BASE/'raw'
RELEASE='original-languages-2026-10-09-v1'
PIN=BASE/'releases'/RELEASE
NS={'o':'http://www.bibletechnologies.net/2003/OSIS/namespace'}
OSIS='Gen Exod Lev Num Deut Josh Judg Ruth 1Sam 2Sam 1Kgs 2Kgs 1Chr 2Chr Ezra Neh Esth Job Ps Prov Eccl Song Isa Jer Lam Ezek Dan Hos Joel Amos Obad Jonah Mic Nah Hab Zeph Hag Zech Mal'.split()
CODES='GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO ECC SNG ISA JER LAM EZK DAN HOS JOL AMO OBA JON MIC NAM HAB ZEP HAG ZEC MAL'.split()
NT='MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV'.split()
OC=dict(zip(OSIS,CODES))
def tag(e):return e.tag.split('}')[-1]
def enc(o):return (json.dumps(o,ensure_ascii=False,separators=(',',':'))+'\n').encode()
def sha(b):return hashlib.sha256(b).hexdigest()
def clean(s):return re.sub(r'\s+',' ',s).strip()
def source_ref(s):
 b,c,v=s.split('.');return f'{OC[b]}.{c}.{v}'
def lemma_keys(raw,language):
 # Keep OSHB homograph suffixes. Prefix/suffix codes are not lexical headwords.
 return list(dict.fromkeys(language+part.strip().replace(' ','') for part in raw.split('/') if re.fullmatch(r'\d+(?:\s*[a-z])?',part.strip())))
def patched_html(name):
 s=(RAW/(name+'.html')).read_text(); chunks=re.split(r'<h2 id="Caput_(\d+)">',s); out={}
 for i in range(1,len(chunks),2):
  pars=re.findall(r'<p>(.*?)</p>',chunks[i+1],re.S); bits=re.split(r'<sup>(\d+)</sup>',' '.join(pars)); vs={}
  for j in range(1,len(bits),2):
   assert bits[j] not in vs
   vs[bits[j]]=clean(html.unescape(re.sub('<[^>]+>','',bits[j+1])))
  out[chunks[i]]=vs
 return out

def outputs():
 out={}; report={}; occurrences=collections.defaultdict(list); morphology={}; names={}
 def put(path,obj):out[path]=enc({'releaseId':RELEASE,**obj})
 with zipfile.ZipFile(RAW/'morphhb.zip') as z,zipfile.ZipFile(RAW/'wlc-hebrew-handoff.zip') as hand:
  manifest=json.loads(hand.read('wlc-hebrew/manifest.json'))
  names={b['code']:b['name'] for b in manifest['books']}
  maps=collections.defaultdict(list)
  for e in ET.fromstring(z.read('morphhb-master/wlc/VerseMap.xml')).iter():
   if tag(e)=='verse':maps[source_ref(e.get('wlc'))].append({'reference':source_ref(e.get('kjv')),'type':e.get('type')})
  for e in ET.fromstring(z.read('morphhb-master/parsing/Oshm.xml')).iter():
   if tag(e)=='entryFree':morphology[e.get('n')]=clean(''.join(e.itertext()))
  books=[]; searches=[]; ids=set(); notes_count=0; wordcount=0; changed=0
  for osis,code in zip(OSIS,CODES):
   root=ET.fromstring(z.read(f'morphhb-master/wlc/{osis}.xml'));chapters=[]
   supplied=json.loads(hand.read(f'wlc-hebrew/json/{code}.json'))['chapters']
   for ch in root.findall('.//o:chapter',NS):
    cn=int(ch.get('osisID').split('.')[1]); verses=[]; analysis=[]
    for verse in ch.findall('o:verse',NS):
     ref=source_ref(verse.get('osisID')); vn=int(ref.split('.')[2]);parts=[];tokens=[];notes=[]
     for e in verse:
      kind=tag(e)
      if kind=='w':
       raw=''.join(e.itertext()); surface=raw.replace('/',''); tid=e.get('id') or ref+'-'+str(len(tokens)+1)
       assert tid not in ids,tid
       ids.add(tid); morph=e.get('morph','');language=morph[:1] if morph[:1] in ['H','A'] else 'H';keys=lemma_keys(e.get('lemma',''),language)
       token={'id':tid,'surface':surface,'sourceSurface':raw,'lemma':e.get('lemma',''),'morph':morph,'language':'Aramaic' if language=='A' else 'Hebrew','keys':keys,'type':e.get('type','')}
       tokens.append(token);parts.append({'kind':'word','text':surface,'token':tid})
       for key in keys:occurrences[key].append({'reference':ref,'token':tid,'surface':surface,'morph':morph})
      elif kind=='note':
       notes.append({'kind':e.get('type','source'),'text':clean(''.join(e.itertext())),'readings':[{'type':r.get('type',''),'text':''.join(r.itertext()).replace('/','')} for r in e.findall('o:rdg',NS)],'sourceXml':ET.tostring(e,encoding='unicode')})
      elif kind=='seg':parts.append({'kind':e.get('type','seg'),'text':''.join(e.itertext())})
      else:raise ValueError((ref,kind))
     # Space between words, retaining separate punctuation and paragraph signs.
     text=''
     for part in parts:
      prefix='' if not text or part['kind'] in ['x-maqqef','x-sof-pasuq'] or text.endswith('־') else ' '
      part['prefix']=prefix;text+=prefix+part['text']
     mapping=maps.get(ref,[{'reference':ref,'type':'same-number'}])
     # The upstream catalogue folds unnumbered English Psalm titles into verse 1.
     # Keep that evidence, but do not present title-only Hebrew verses as English verse 1.
     source_mapping=mapping
     if code=='PSA':
      first_body=max([int(r.split('.')[2]) for r,ms in maps.items() if r.startswith(f'PSA.{cn}.') and any(m['reference']==f'PSA.{cn}.1' for m in ms)]+[1])
      if vn<first_body:mapping=[]
     verses.append({'verse':vn,'text':text,'parts':parts,'notes':notes,'englishReferences':mapping,'sourceEnglishReferences':source_mapping})
     analysis.append({'verse':vn,'tokens':tokens});notes_count+=len(notes);wordcount+=len(tokens)
     if text!=supplied[str(cn)][str(vn)]:changed+=1
    chapters.append({'chapter':cn,'verses':verses})
    put(f'analysis/{code}/{cn}.json',{'code':code,'chapter':cn,'verses':analysis})
   books.append({'code':code,'name':names[code],'chapters':[c['chapter'] for c in chapters],'verses':sum(len(c['verses']) for c in chapters)})
   put(f'WLC/books/{code}.json',{'code':code,'name':names[code],'chapters':chapters})
   searches.extend({'book':code,'chapter':c['chapter'],'verse':v['verse'],'text':v['text']} for c in chapters for v in c['verses'])
  assert len(searches)==23213
  put('WLC/manifest.json',{'editionId':'WLC','name':'Westminster Leningrad Codex · Hebrew / Aramaic','language':'he','direction':'rtl','books':books,'verseCount':len(searches)})
  put('WLC/search.json',{'verses':searches})
  put('morphology.json',{'codes':morphology})
  put('notice.json',{'text':'WLC Scripture: public domain. Original work of the Open Scriptures Hebrew Bible available at https://github.com/openscriptures/morphhb. Lemmas, morphology and source annotations: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Ad Fontes derives structured reading and occurrence files; source word-part slashes are hidden in reading, preserved in analysis. No endorsement is implied. Latin: Clementine Vulgate, supplied CVUL module with Judith, Esther and Wisdom verified against pinned Clementine Text Project transcriptions on Latin Wikisource. Historical Scripture text is public domain. Noto Serif Hebrew: SIL Open Font License 1.1; bundled license retained.'})
  report['WLC']={'books':39,'verses':len(searches),'tokens':wordcount,'sourceNotes':notes_count,'versesDifferentFromSimplifiedHandoff':changed,'difference':'Re-derived from XML: retain punctuation, paragraph signs, written main text and separately labeled reading variants; hide only word-part slashes in display. No NFC normalization.','numbering':'Pinned OSHB WLC-to-KJV map, including partial relationships. Same-number fallback follows this difference catalogue, not textual equivalence or English word alignment.'}
 # Latin rebuilt from original SQLite and the three independently verified HTML snapshots.
 with zipfile.ZipFile(RAW/'vulgate-clementine-handoff.zip') as hand, zipfile.ZipFile(RAW/'CVUL.zip') as z:
  manifest=json.loads(hand.read('vulgate-clementine/manifest.json'))
  temp=tempfile.TemporaryDirectory();dbpath=Path(temp.name)/'CVUL.sqlite';dbpath.write_bytes(z.read('CVUL.SQLite3'));db=sqlite3.connect('file:'+str(dbpath)+'?mode=ro',uri=True)
  num=dict(zip([10,20,30,40,50,60,70,80,90,100,110,120,130,140,150,160,190,220,230,240,250,260,290,300,310,330,340,350,360,370,380,390,400,410,420,430,440,450,460],CODES))
  num.update(dict(zip(range(470,731,10),NT)));num.update({170:'TOB',280:'SIR',320:'BAR',462:'1MA',464:'2MA'})
  parsed=collections.defaultdict(lambda:collections.defaultdict(dict))
  for bn,c,v,t in db.execute('select book_number,chapter,verse,text from verses order by book_number,chapter,verse'):
   assert str(v) not in parsed[num[bn]][str(c)]
   parsed[num[bn]][str(c)][str(v)]=t
  db.close();temp.cleanup()
  for code,name in [('JDT','Liber_Judith'),('EST','Liber_Esther'),('WIS','Liber_Sapientiae')]:parsed[code]=patched_html(name)
  books=[];search=[]
  for b in manifest['books']:
   code=b['code']; supplied=json.loads(hand.read(f'vulgate-clementine/json/{code}.json'))['chapters'];assert parsed[code]==supplied,code
   chapters=[{'chapter':int(c),'verses':[{'verse':int(v),'text':t,'parts':[{'kind':'text','text':t,'prefix':''}],'notes':[],'englishReferences':[]} for v,t in vs.items()]} for c,vs in parsed[code].items()]
   books.append({'code':code,'name':b['book'],'chapters':[c['chapter'] for c in chapters],'verses':b['verses']})
   put(f'CVUL/books/{code}.json',{'code':code,'name':b['book'],'chapters':chapters})
   search.extend({'book':code,'chapter':c['chapter'],'verse':v['verse'],'text':v['text']} for c in chapters for v in c['verses'])
  assert len(search)==35810
  put('CVUL/manifest.json',{'editionId':'CVUL','name':'Clementine Vulgate · Latin','language':'la','direction':'ltr','books':books,'verseCount':len(search)})
  put('CVUL/search.json',{'verses':search})
  report['CVUL']={'books':73,'verses':len(search),'handoffDifferences':0,'authority':'CVUL SQLite plus pinned HTML for Judith, Esther, Wisdom; every verse compared to supplied JSON. Appendix books not present. No universal verse equivalence asserted.'}
 # Published author articles are linked, not republished or silently adapted from NET quotations.
 articles=json.loads((RAW/'articles.json').read_text())
 index=[]
 for key,rows in sorted(occurrences.items()):
  put(f'lemmas/{key}.json',{'key':key,'occurrences':rows})
  index.append({'key':key,'form':rows[0]['surface'],'count':len(rows),'articles':[a['slug'] for a in articles if key in a['keys']]})
 put('hebrew-index.json',{'lemmas':index,'articles':articles,'tokenCount':wordcount})
 report['analysis']={'keys':len(index),'articles':len(articles),'scope':'Main written-text tokens only. Qere/alternative notes preserved separately, not conflated in occurrence counts. Keys retain source homograph suffixes and Hebrew/Aramaic identity. First occurrence is a representative form, not a dictionary headword.'}
 put('reviewed-differences.json',report)
 out['fonts/noto-serif-hebrew.woff2']=(RAW/'noto-serif-hebrew.woff2').read_bytes()
 out['fonts/OFL-noto-serif-hebrew.txt']=(RAW/'OFL-noto-serif-hebrew.txt').read_bytes()
 return out

def main():
 import argparse
 p=argparse.ArgumentParser();p.add_argument('--freeze-new',action='store_true');a=p.parse_args()
 raw={str(f.relative_to(RAW)):sha(f.read_bytes()) for f in sorted(RAW.rglob('*')) if f.is_file()}
 sources={'files':raw,'importer':sha(Path(__file__).read_bytes())}
 if not a.freeze_new:assert json.loads((PIN/'inputs.json').read_text())==sources,'Changed source/importer requires reviewed successor release'
 result=outputs();checks={n:sha(b) for n,b in sorted(result.items())}
 if a.freeze_new:
  assert not PIN.exists(),'Never replace existing release pins'
  PIN.mkdir(parents=True);(PIN/'inputs.json').write_bytes(enc(sources));(PIN/'outputs.json').write_bytes(enc(checks));(PIN/'reviewed-differences.json').write_bytes(result['reviewed-differences.json'])
 else:assert json.loads((PIN/'outputs.json').read_text())==checks,'Output drift'
 dest=ROOT/'app/public/corpus'/RELEASE
 for name,data in result.items():
  file=dest/name;file.parent.mkdir(parents=True,exist_ok=True);file.write_bytes(data)
 print('Verified original-language release:',len(result),'files')
if __name__=='__main__':main()
