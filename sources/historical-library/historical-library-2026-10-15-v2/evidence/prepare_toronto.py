"""One-time source derivative preparation; normal builds use the frozen page images.
Requires the recorded pypdfium2 and Pillow versions. Does not acquire network inputs.
Run only to review a new derivative, never to repair a mismatched release pin.
"""
import json,hashlib,re,xml.etree.ElementTree as ET
from pathlib import Path
import pypdfium2 as pdfium
from concurrent.futures import ProcessPoolExecutor
ROOT=Path(__file__).resolve().parents[1]
DEST=ROOT/'sources/historical-library/historical-library-2026-10-15-v2'
RAW=DEST/'raw'
OLD=RAW
def sha(b):return hashlib.sha256(b).hexdigest()
def enc(v):return (json.dumps(v,ensure_ascii=False,indent=2)+'\n').encode()
def render(args):
 vol,number=args
 doc=pdfium.PdfDocument(str(RAW/f'volume-{vol}.pdf'));page=doc[number-1]
 bitmap=page.render(scale=2200/max(page.get_size()))
 im=bitmap.to_pil().convert('L');path=DEST/f'scans/v{vol}/{number:04}.webp';path.parent.mkdir(parents=True,exist_ok=True)
 im.save(path,'WEBP',quality=75,method=4)
 return f'v{vol}-p{number:04}',dict(id=f'v{vol}-p{number:04}',volume=vol,page=number,path=f'scans/v{vol}/{number:04}.webp',sha256=sha(path.read_bytes()),width=im.width,height=im.height)
if __name__=='__main__':
 DEST.mkdir(parents=True,exist_ok=True)
 ledger=json.loads((DEST/'boundaries.json').read_text());(DEST/'boundaries.json').write_bytes(enc(ledger))
 sourcepages={};needed=set()
 for vol in (1,2):
  meta=json.loads((OLD/f'volume-{vol}-metadata.json').read_text());identifier=meta['metadata']['identifier']
  for suffix,local in [('.pdf',f'volume-{vol}.pdf'),('_djvu.xml',f'volume-{vol}-djvu.xml')]:
   b=(RAW/local).read_bytes();entry=next(f for f in meta['files'] if f['name']==identifier+suffix)
   assert hashlib.md5(b).hexdigest()==entry['md5'],local
  lines=(OLD/f'volume-{vol}.txt').read_text().splitlines();nonempty=[(i+1,' '.join(s.split())) for i,s in enumerate(lines) if s.strip()]
  xml=ET.parse(RAW/f'volume-{vol}-djvu.xml');cursor=0;pagebyline={}
  for number,obj in enumerate(xml.findall('.//OBJECT'),1):
   for line in obj.findall('.//LINE'):
    value=' '.join(' '.join((w.text or '') for w in line.findall('WORD')).split())
    if not value:continue
    assert value==nonempty[cursor][1],(vol,number,cursor)
    pagebyline[nonempty[cursor][0]]=number;cursor+=1
  assert cursor==len(nonempty)
  for unit in ledger['units']:
   if unit['volume']!=vol:continue
   unit['pageText']=[]
   for lineno in range(unit['startLine'],unit['endLine']+1):
    if lineno not in pagebyline:continue
    number=pagebyline[lineno];pid=f'v{vol}-p{number:04}';needed.add((vol,number))
    if not unit['pageText'] or unit['pageText'][-1]['pageId']!=pid:unit['pageText'].append(dict(pageId=pid,lines=[]))
    unit['pageText'][-1]['lines'].append(lines[lineno-1])
  print('Aligned volume',vol,len(nonempty),'OCR lines',flush=True)
 with ProcessPoolExecutor(max_workers=4) as pool:
  for i,(pid,data) in enumerate(pool.map(render,sorted(needed))):
   sourcepages[pid]=data
   if i%100==0:print('Rendered',i+1,'/',len(needed),flush=True)
 (DEST/'toronto.json').write_bytes(enc(dict(ledger=ledger,pages=sourcepages,render=dict(height=2200,color='grayscale',format='WebP',quality=75,method=4,pypdfium2=__import__('importlib.metadata',fromlist=['version']).version('pypdfium2')))))
 print('Complete',len(sourcepages),sum((DEST/p['path']).stat().st_size for p in sourcepages.values()),flush=True)
