"""Offline audit of pinned primary HTML. No network and no archive instructions."""
from html.parser import HTMLParser
from pathlib import Path
import json,re,unicodedata,hashlib,sys
base=Path('sources/confessions/triglotta-1921-2026-10-14-v4')
class Node:
 def __init__(self,tag='',attrs=None,parent=None):self.tag=tag;self.attrs=dict(attrs or []);self.children=[];self.parent=parent
class DOM(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.root=Node();self.stack=[self.root]
 def handle_starttag(self,tag,attrs):
  n=Node(tag,attrs,self.stack[-1]);self.stack[-1].children.append(n)
  if tag not in ['meta','link','img','br','hr','input','source','wbr']:self.stack.append(n)
 def handle_startendtag(self,tag,attrs):self.handle_starttag(tag,attrs);self.handle_endtag(tag)
 def handle_endtag(self,tag):
  for i in range(len(self.stack)-1,0,-1):
   if self.stack[i].tag==tag:self.stack=self.stack[:i];break
 def handle_data(self,text):self.stack[-1].children.append(text)
def nodes(n):
 for child in n.children:
  if isinstance(child,Node):yield child;yield from nodes(child)
def text(n):return ''.join(c if isinstance(c,str) else text(c) for c in n.children)
def tokens(n):
 if n.tag in ['script','style','button','nav','aside']:return []
 if 'bocanchor-content' in n.attrs.get('class','').split():return [('number',text(n).strip())]
 return [(kind,t) for c in n.children for kind,t in ([('text',c)] if isinstance(c,str) else tokens(c))]
def norm(s):
 s=re.sub(r'^\d+[a-z]?\s+','',s.strip());return ''.join(c.lower() for c in unicodedata.normalize('NFKC',s) if c.isalnum())
def extract(html):
 dom=DOM();dom.feed(html);main=next((n for n in nodes(dom.root) if n.tag=='main'),None)
 if main is None:raise ValueError('No primary main element')
 blocks=[]
 for n in nodes(main):
  if n.tag not in ['p','h2','h3','h4','h5','h6','li']:continue
  parent=n.parent;skip=False
  while parent is not main:
   if parent is None or parent.tag in ['p','h2','h3','h4','h5','h6','li','nav','aside'] or 'next-previous-box' in parent.attrs.get('class',''):skip=True;break
   parent=parent.parent
  if skip:continue
  current='';number=None
  def add():
   body=re.sub(r'\s+',' ',current).strip()
   if body:blocks.append({'kind':'heading' if n.tag.startswith('h') else 'paragraph','text':body,'number':number,'tag':n.tag,'htmlId':n.attrs.get('id')})
  for kind,t in tokens(n):
   if kind=='number':
    if number is not None:add();current=''
    number=t or None
   else:current+=t
  add()
 return blocks
acq=json.loads((base/'acquisition.json').read_text());pages=[]
for p in acq['pages']:
 data=(base/p['file']).read_bytes()
 if hashlib.sha256(data).hexdigest()!=p['sha256']:raise ValueError('Primary snapshot changed')
 pages.append({**p,'blocks':extract(data.decode())})
roots={'creeds':'ecumenical-creeds','ac':'augsburg-confession','apology':'defense','sa':'smalcald-articles','pp':'power-and-primacy','sc':'small-catechism','lc':'large-catechism','epitome':'epitome','fc-sd':'solid-declaration'}
result=[];report=[]
for code,root in roots.items():
 original=json.loads(Path(f'sources/confessions/triglotta-1921-2026-10-14-v1/raw/json/{code}.json').read_text())
 candidates=[p for p in pages if p['url'].startswith('https://bookofconcord.org/'+root+'/')]
 for section in original['sections']:
  old=section['paragraphs'];expected=[norm(p['en']) for p in old]
  def score(page):
   actual={norm(b['text']) for b in page['blocks'] if b['kind']=='paragraph'}
   return sum(s in actual for s in expected),-abs(len(actual)-len(expected))
  candidate=max(candidates,key=score);matched=score(candidate)[0]
  report.append({'work':code,'section':section['key'],'url':candidate['url'],'oldParagraphs':len(old),'matched':matched,'primaryBlocks':len(candidate['blocks']),'missingSamples':[p['en'][:160] for p in old if norm(p['en']) not in {norm(b['text']) for b in candidate['blocks'] if b['kind']=='paragraph'}][:3]})
  used=set();blocks=[]
  for i,b in enumerate(candidate['blocks']):
   match=next((j for j,p in enumerate(old) if j not in used and b['kind']=='paragraph' and norm(p['en'])==norm(b['text'])),None)
   if match is not None:used.add(match)
   blocks.append({**b,'id':f"{code}:{section['key']}:{match+1}" if match is not None else f"{code}:{section['key']}:source-{i+1}",'sourceBlock':i+1,'suppliedParagraph':match+1 if match is not None else None})
  result.append({'work':code,'section':section['key'],'sourceUrl':candidate['url'],'sourceFile':candidate['file'],'blocks':blocks})
encoded=json.dumps(result,ensure_ascii=False,indent=2)+'\n'
target=base/'section-blocks.json'
if target.exists():
 if target.read_text()!=encoded:raise ValueError('Primary confessional extraction changed; prepare a reviewed successor.')
elif '--prepare' in sys.argv:target.write_text(encoded)
else:raise ValueError('Primary confessional extraction is not pinned')
(base/'comparison-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print('Mapped',len(result),'sections; complete paragraph matches',sum(p['matched']==p['oldParagraphs'] for p in report))
for p in report:
 if p['matched']!=p['oldParagraphs']:print(p['work'],p['section'],p['matched'],p['oldParagraphs'],p['url'],p['missingSamples'][:1])
