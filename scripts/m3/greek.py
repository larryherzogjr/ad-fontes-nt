"""Exact word-sequence matching; no inferred English alignment or accent repair."""
import json,zipfile,csv,io,re,unicodedata,hashlib,xml.etree.ElementTree as ET
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
RELEASE='nestle-analysis-1.3-m3-v1'
TEXT_RELEASE='n1904-2026-09-05-m2-v1'
BOOKS=json.loads((ROOT/'app/lib/domain/registry.json').read_text());OSIS={b['osis']:b['code'] for b in BOOKS}
def word_spans(text):
 spans=[];start=None
 for i,c in enumerate(text):
  isword=unicodedata.category(c)[0] in 'LM' or (start is not None and c in "’᾽ʼ'")
  if isword and start is None:start=i
  if not isword and start is not None:spans.append((start,i));start=None
 if start is not None:spans.append((start,len(text)))
 return spans
def words(text):return [unicodedata.normalize('NFC',text[a:b]) for a,b in word_spans(text)]
def extract():
 z=zipfile.ZipFile(ROOT/'sources/nestle1904/raw/nestle1904-713f28a.zip');prefix=z.namelist()[0]
 rows=list(csv.DictReader(io.StringIO(z.read(prefix+'morph/Nestle1904.csv').decode('utf-8-sig')),delimiter='\t'));group={}
 for line,r in enumerate(rows,2):
  b,cv=r['BCV'].split();ref=OSIS[b]+'.'+cv.replace(':','.');r['sourceId']=f'morph/Nestle1904.csv#line={line}';group.setdefault(ref,[]).append(r)
 glossgroup={}
 for w in ET.fromstring(z.read(prefix+'glosses/berean-interlinear-glosses.xml')).iter('w'):
  if 'osisId' not in w.attrib:continue # Unaddressed source gloss is not guessed onto a word.
  ref,idx=w.attrib['osisId'].split('!');b,c,v=ref.split('.');a=f'{OSIS[b]}.{c}.{v}';glossgroup.setdefault(a,[]).append({'greek':w.findtext('greek') or '', 'gloss':w.findtext('gloss'), 'sourceId':'glosses/berean-interlinear-glosses.xml#'+w.attrib['osisId']})
 chapters=[];occurrences={};report={'sourceRows':len(rows),'matchedVerses':0,'unavailable':[],'glossMatchedVerses':0,'glossUnavailableVerses':0,'excludedSourceRefs':[]};seen=set()
 for book in BOOKS:
  for chapter in range(1,len(book['verses'])+1):
   ch=json.loads((ROOT/f'app/public/corpus/{TEXT_RELEASE}'/book['code']/f'{chapter}.json').read_text());out={'editionId':'N1904','releaseId':RELEASE,'textReleaseId':TEXT_RELEASE,'book':book['code'],'chapter':chapter,'segments':[]}
   for s in ch['segments']:
    ref=s['sourceRef'];seen.add(ref);source=group.get(ref,[]);surface=s['text'];sw=[r['text'] for r in source]
    valid=len(word_spans(surface))==len(source) and words(surface)==[words(w)[0] for w in sw if len(words(w))==1]
    item={'sourceRef':ref,'anchors':s['anchors'],'text':surface,'status':'available' if valid else 'unavailable','tokens':[]}
    if not valid:
     item['reason']='The analysis transcription differs from this stored reading. No word analysis is attached.';report['unavailable'].append({'sourceRef':ref,'reading':surface,'analysis':' '.join(sw)});out['segments'].append(item);continue
    report['matchedVerses']+=1;gs=glossgroup.get(ref,[])
    glossvalid=len(gs)==len(source) and [words(g['greek']) for g in gs]==[words(w) for w in sw]
    report['glossMatchedVerses' if glossvalid else 'glossUnavailableVerses']+=1
    for index,((start,end),r) in enumerate(zip(word_spans(surface),source),1):
     lemma=unicodedata.normalize('NFC',r['lemma']);lemmaId=hashlib.sha256(lemma.encode()).hexdigest()[:20]
     token={'id':f'{ref}!{index}','surface':surface[start:end],'start':start,'end':end,'sourceText':r['text'],'sourceId':r['sourceId'],'lemma':r['lemma'],'lemmaId':lemmaId,'functional':r['func_morph'],'form':r['form_morph'],'strongs':r['strongs'],'gloss':gs[index-1]['gloss'] if glossvalid else None,'glossSourceId':gs[index-1]['sourceId'] if glossvalid else None}
     item['tokens'].append(token);occurrences.setdefault(lemmaId,{'lemma':r['lemma'],'lemmaId':lemmaId,'releaseId':RELEASE,'hits':[]})['hits'].append({'tokenId':token['id'],'sourceRef':ref,'anchor':s['anchors'][0],'surface':token['surface'],'text':surface})
    out['segments'].append(item)
   chapters.append(out)
 report['excludedSourceRefs']=sorted(set(group)-seen);report['tokens']=sum(len(s['tokens']) for c in chapters for s in c['segments']);report['lemmas']=len(occurrences)
 assert report['excludedSourceRefs']==['MRK.16.99'],'Unknown extra analysis source segment'
 # Source 99 identifies Mark’s appended shorter ending, which is not numbered main text.
 assert {x['sourceRef'] for x in report['unavailable']}=={'2TH.2.13','1TI.1.16'},'Unreviewed analysis mismatch'
 return chapters,occurrences,report

def lexicon():
 z=zipfile.ZipFile(ROOT/'sources/m3/raw/StrongsGreekDictionaryXML_1.4.zip');root=ET.fromstring(z.read('strongsgreek.xml'))
 def text(e):
  if e.tag=='greek':return e.attrib['unicode']
  if e.tag in ['strongsref','see']:return ('See ' if e.tag=='see' else '')+('G' if e.attrib['language']=='GREEK' else 'H')+str(int(e.attrib['strongs']))
  if e.tag=='pronunciation':return e.attrib['strongs']
  return (e.text or '')+''.join(text(c)+(c.tail or '') for c in e)
 return {'G'+str(int(e.attrib['strongs'])):{'id':'G'+str(int(e.attrib['strongs'])),'headword':e.find('greek').attrib['unicode'] if e.find('greek') is not None else '', 'text':' '.join(text(e).split()),'originalXml':ET.tostring(e,encoding='unicode'),'sourceId':'strongsgreek.xml#entry-'+e.attrib['strongs']} for e in root.findall('./entries/entry')},root.findtext('prologue')
