"""Edition-specific readers. Source strings are never harmonized across editions."""
import csv, io, json, re, zipfile, html.entities
import xml.etree.ElementTree as ET
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
BASE=json.loads((ROOT/'app/lib/domain/registry.json').read_text())
BYCODE={b['code']:b for b in BASE};BYNAME={b['name']:b['code'] for b in BASE}
def norm(s):return ' '.join(s.split())
def xmlnode(e):return {'marker':e.tag.split('}')[-1],'content':([e.text] if e.text else [])+sum(([xmlnode(c)]+([c.tail] if c.tail else []) for c in e),[])}
class BookBuilder:
 def __init__(self,code):self.code=code;self.chapters={};self.ch=0;self.anchor=None;self.block=None;self.segments={};self.notes=[]
 def chapter(self,c):
  self.ch=int(c);assert self.ch not in self.chapters
  self.chapters[self.ch]={'book':self.code,'chapter':self.ch,'blocks':[],'segments':[],'notes':[],'coverage':[]};self.anchor=None;self.block=None
 def paragraph(self,marker='p',role='scripture',source=''):
  if not self.ch:return
  self.block={'marker':marker,'role':role,'sourceId':source,'runs':[]};self.chapters[self.ch]['blocks'].append(self.block)
  if self.anchor and role=='scripture':self.segments[self.anchor]['text']+='\n'
 def verse(self,v,source):
  assert re.fullmatch(r'\d+',str(v)),v
  a=f'{self.code}.{self.ch}.{v}';assert a not in self.segments,a;self.anchor=a
  self.segments[a]={'id':a,'sourceRef':a,'sourceId':source,'sourceLabel':str(v),'anchors':[a],'mappingType':'exact','text':''}
  self.chapters[self.ch]['segments'].append(self.segments[a])
  if self.block is None:self.paragraph()
  self.block['runs'].append({'verse':str(v),'anchor':a})
 def text(self,t,marks=None):
  if not self.ch or self.block is None or not t:return
  a=self.anchor if self.block['role']=='scripture' else None
  self.block['runs'].append({'text':t,'anchor':a,'marks':marks or []})
  if a:self.segments[a]['text']+=t
 def note(self,body,source,original):
  assert self.anchor
  n={'id':f'{self.anchor}.note.{len(self.notes)+1}','anchor':self.anchor,'type':'publisher-note','sourceId':source,'body':body,'original':original}
  self.notes.append(n);self.chapters[self.ch]['notes'].append(n);self.block['runs'].append({'noteId':n['id'],'anchor':self.anchor})
 def done(self):
  assert len(self.chapters)==len(BYCODE[self.code]['verses']),self.code
  for s in self.segments.values():s['originalText']=s['text'];s['text']=norm(s['text'])
  return list(self.chapters.values())
def blb_plain():
 chapters=[];builders={};lines=(ROOT/'sources/blb/raw/blb.txt').read_text(encoding='utf-8-sig').splitlines()
 for i,line in enumerate(lines,1):
  m=re.match(r'(.+) (\d+):(\d+)\t(.*)$',line)
  if not m or m[1] not in BYNAME:continue
  code=BYNAME[m[1]];b=builders.setdefault(code,BookBuilder(code));c=int(m[2]);v=m[3];t=m[4]
  if c!=b.ch:b.chapter(c)
  if not t.strip():continue
  # Plain-text artifact has no publisher paragraph markers: explicit verse layout.
  b.paragraph('verse');b.verse(v,f'blb.txt#line={i}');b.text(t)
 for code in BYCODE:chapters+=builders[code].done()
 return chapters

def msb_usj():
 z=zipfile.ZipFile(ROOT/'sources/msb/raw/MSB_usj-v5.9.zip');chapters=[]
 for code in BYCODE:
  filename=f'{code}.usj';d=json.loads(z.read(filename));b=BookBuilder(code)
  def visit(x,path):
   if isinstance(x,str):b.text(x);return
   typ=x['type']
   if typ=='verse':b.verse(x['number'],f'{filename}#{path}');return
   if typ=='note':
    def plain(n):return n if isinstance(n,str) else ''.join(plain(c) for c in n.get('content',[]))
    b.note(plain(x),f'{filename}#{path}',x);return
   assert typ in ['char','ref'],x
   for i,c in enumerate(x.get('content',[])):visit(c,f'{path}/content/{i}')
  for i,p in enumerate(d['content']):
   if p['type']=='chapter':b.chapter(p['number']);continue
   if not b.ch:continue
   assert p['type']=='para';marker=p['marker'];role='publisher-heading' if marker in ['s1','s2','r','ms','mr'] else 'scripture';b.paragraph(marker,role,f'{filename}#content/{i}')
   for j,x in enumerate(p.get('content',[])):visit(x,f'content/{i}/content/{j}')
  chapters+=b.done()
 return chapters

def usfx(edition,stem):
 z=zipfile.ZipFile(ROOT/f'sources/{edition}/raw/{stem}_usfx.zip');filename=f'{stem}_usfx.xml';root=ET.fromstring(z.read(filename));chapters=[]
 for book in root.findall('book'):
  code=book.attrib['id']
  if code not in BYCODE:continue
  b=BookBuilder(code)
  def visit(e,path):
   tag=e.tag
   if tag=='c':b.chapter(e.attrib['id']);return
   if not b.ch:return
   if tag=='v':b.verse(e.attrib['id'],f'{filename}#{path}');return
   if tag=='ve':return
   if tag=='f':
    b.note(norm(''.join(e.itertext())),f'{filename}#{path}',xmlnode(e));b.chapters[b.ch]['notes'][-1]['originalXml']=ET.tostring(e,encoding='unicode');return
   if tag in ['p','q','b','d']:
    marker=e.attrib.get('style',tag+e.attrib.get('level',''));role='publisher-heading' if tag=='d' else 'scripture';b.paragraph(marker,role,f'{filename}#{path}')
   else:assert tag in ['w','sup'],(code,tag)
   b.text(e.text)
   for i,c in enumerate(e):visit(c,f'{path}/{c.tag}[{i}]');b.text(c.tail)
  for i,e in enumerate(book):visit(e,f'book[@id="{code}"]/{e.tag}[{i}]')
  chapters+=b.done()
 return chapters

def ylt_usfx():return usfx('ylt','engylt')
def boyd_usfx():return usfx('boyd','grctr')
RP_IDS={'MRK':'MAR','JHN':'JOH','1JN':'1JO','2JN':'2JO','3JN':'3JO','JUD':'JUD','PHP':'PHP','PHM':'PHM','JAS':'JAM'}
def rp_csv():
 z=zipfile.ZipFile(ROOT/'sources/rp2018/raw/rp-v3.3.2.zip');prefix=z.namelist()[0];chapters=[]
 for code in BYCODE:
  external=RP_IDS.get(code,code);fn=f'csv-unicode/ccat/no-variants/{external}.csv';b=BookBuilder(code)
  for i,r in enumerate(csv.DictReader(io.StringIO(z.read(prefix+fn).decode())),2):
   c=int(r['chapter']);t=r['text']
   if c!=b.ch:b.chapter(c)
   if not t.strip():continue
   if t.startswith('¶') or b.block is None:b.paragraph('p',source=f'{fn}#row={i}')
   b.verse(r['verse'],f'{fn}#row={i}');b.text(t.removeprefix('¶'));b.segments[b.anchor]['sourceText']=t
   # CSV ¶ is a paragraph sign, not a Greek textual character.
   b.text(' ')
  chapters+=b.done()
 return chapters

def parse_xhtml(data):
 s=data.decode('utf-8-sig')
 s=re.sub(r'&([A-Za-z][A-Za-z0-9]+);',lambda m:chr(html.entities.name2codepoint[m[1]]) if m[1] not in ['amp','lt','gt','quot','apos'] and m[1] in html.entities.name2codepoint else m[0],s)
 return ET.fromstring(s)
def nestle_xhtml():
 z=zipfile.ZipFile(ROOT/'sources/nestle1904/raw/nestle1904-713f28a.zip');prefix=z.namelist()[0];chapters=[]
 for code,meta in BYCODE.items():
  appendix=False
  filename='xhtml/'+meta['name'].replace(' ','-')+'-ap.xhtml';root=parse_xhtml(z.read(prefix+filename));body=next(e for e in root.iter() if e.tag.endswith('}body'));b=BookBuilder(code)
  def text(t,path):
   if not t:return
   # Six verse numbers in this transcription are plain text, without a span.
   parts=re.split(r'(?<!\w)(\d{1,3})(?!\w)',t)
   for i,part in enumerate(parts):
    if i%2:b.verse(part,f'{filename}#{path}/text-number/{i}')
    else:b.text(part)
  def visit(e,path):
   tag=e.tag.split('}')[-1];t=''.join(e.itertext()).strip()
   if tag=='span' and t=='1913':
    assert code=='MRK' and b.anchor=='MRK.1.1'
    b.note(t,f'{filename}#{path}',xmlnode(e));return
   if tag=='span' and re.fullmatch(r'\d+',t):b.verse(t,f'{filename}#{path}');return
   assert tag in ['span','a','br','p','i','b','em','strong','sup'],(code,tag,t[:50])
   text(e.text,path)
   for i,c in enumerate(e):visit(c,f'{path}/{i}');text(c.tail,f'{path}/{i}/tail')
  for i,p in enumerate(body):
   tag=p.tag.split('}')[-1];t=norm(''.join(p.itertext()))
   if tag=='h2':
    if not t.isdigit():
     assert code=='MRK' and t=='ΑΛΛΩΣ',(code,t);appendix=True;b.paragraph('s1','publisher-alternative',f'{filename}#body/{i}');b.text(t);continue
    b.chapter(t);continue
   if not b.ch or not t:continue
   assert tag=='p',(code,tag,t[:100]);b.paragraph('p','publisher-alternative' if appendix else 'scripture',source=f'{filename}#body/{i}');visit(p,f'body/{i}')
  chapters+=b.done()
 return chapters
ADAPTERS={'BLB':blb_plain,'MSB':msb_usj,'YLT':ylt_usfx,'RP2018':rp_csv,'TR-BOYD':boyd_usfx,'N1904':nestle_xhtml}

def msb_authoritative():
 """TXT governs wording; USJ governs paragraph/poetry/heading and note roles."""
 import difflib
 cs=msb_usj();authority={};report=[]
 for i,line in enumerate((ROOT/'sources/msb/raw/msb.txt').read_text(encoding='cp1252').splitlines(),1):
  m=re.match(r'(.+) (\d+):(\d+)\t(.*)$',line)
  if m and m[1] in BYNAME:authority[f'{BYNAME[m[1]]}.{m[2]}.{m[3]}']=(m[4],i)
 for ch in cs:
  for s in ch['segments']:
   t,line=authority.get(s['id'],('',None));assert line is not None or not s['text'],s['id']
   if s['text']!=t:report.append({'sourceRef':s['id'],'usj':s['text'],'txt':t,'kind':'spacing' if re.sub(r'\s','',s['text'])==re.sub(r'\s','',t) else 'converter-artifact'})
   runs=[r for b in ch['blocks'] if b['role']=='scripture' for r in b['runs'] if r.get('anchor')==s['id'] and 'text' in r]
   original=''.join(r['text'] for r in runs);owners=[i for i,r in enumerate(runs) for _ in r['text']];aligned=['']*len(runs)
   for tag,a,b,c,d in difflib.SequenceMatcher(None,original,t,autojunk=False).get_opcodes():
    if tag=='equal':
     for offset,char in enumerate(t[c:d]):aligned[owners[a+offset]]+=char
    elif tag in ['insert','replace']:aligned[owners[min(a,len(owners)-1)]]+=t[c:d]
   for r,text in zip(runs,aligned):r['originalText']=r['text'];r['text']=text
   assert ''.join(r['text'] for r in runs)==t
   s['originalStructuredText']=s['originalText'];s['originalText']=t;s['text']=t;s['textSourceId']=f'msb.txt#line={line}'
  # Empty source markers are retained in blocks and notes, never counted as Scripture.
  ch['segments']=[s for s in ch['segments'] if s['text'].strip()]
 assert {s['id'] for c in cs for s in c['segments']}=={a for a,(t,_) in authority.items() if t.strip()}
 return cs,report

def rp_alternatives(chapters):
 z=zipfile.ZipFile(ROOT/'sources/rp2018/raw/rp-v3.3.2.zip');prefix=z.namelist()[0]
 for external,book,label in [('PA','JHN','Byzantine alternative: John 7:53–8:11'),('ACT24','ACT','Byzantine alternative: Acts 24:6–8')]:
  fn=f'csv-unicode/ccat/no-variants/{external}.csv'
  for i,r in enumerate(csv.DictReader(io.StringIO(z.read(prefix+fn).decode())),2):
   ch=next(c for c in chapters if c['book']==book and c['chapter']==int(r['chapter']))
   ch.setdefault('alternatives',[]).append({'label':label,'sourceId':f'{fn}#row={i}','sourceRef':f"{book}.{r['chapter']}.{r['verse']}",'text':r['text'],'originalText':r['text']})
 return chapters
ADAPTERS['MSB']=lambda:msb_authoritative()[0]
ADAPTERS['RP2018']=lambda:rp_alternatives(rp_csv())
