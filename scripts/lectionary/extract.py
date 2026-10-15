"""Offline extraction of factual calendar rows from preserved official DOCX files."""
import pathlib, zipfile, xml.etree.ElementTree as E, json, hashlib, re, datetime
root=pathlib.Path('sources/lectionary/lcms-calendars-2026-10-14-v1')
ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
months={'Jan':1,'Feb':2,'March':3,'April':4,'May':5,'June':6,'July':7,'Aug':8,'Sept':9,'Oct':10,'Nov':11,'Dec':12}
records=[]
for source in json.loads((root/'acquisition.json').read_text()):
 raw=(root/'raw'/source['file']).read_bytes()
 assert hashlib.sha256(raw).hexdigest()==source['sha256'], source['file']
 doc=E.fromstring(zipfile.ZipFile(__import__('io').BytesIO(raw)).read('word/document.xml'))
 year=int(source['file'][:4]);last_month=11;date=None;season='';series='one-year' if 'one-year' in source['file'] else 'three-year';cycle={'2024':'C','2025':'A','2026':'B'}[str(year)] if series=='three-year' else None
 for row_index,row in enumerate(doc.findall('.//w:tr',ns)):
  cells=['\n'.join(''.join(t.text or '' for t in p.findall('.//w:t',ns)) for p in c.findall('w:p',ns)).strip() for c in row.findall('w:tc',ns)]
  if any('New Church Year Starts Here' in c for c in cells):break
  if row_index==0:assert cells==['Season','Date','Festival','First Reading','Psalm','Epistle','Gospel'];continue
  assert len(cells)==7, cells
  heading=re.sub(r'\s+',' ',cells[0]).strip()
  if heading and not heading.startswith('A.D.'):season=re.sub(r'\s+20\d\d$','',heading)
  m=re.search(r'(Jan|Feb|March|April|May|June|July|Aug|Sept|Oct|Nov|Dec)\.?\s+(\d+)',cells[1])
  if m:
   month=months[m[1]]
   if month<last_month:year+=1
   last_month=month;date=datetime.date(year,month,int(m[2])).isoformat()
  else:assert not cells[1].strip() or cells[1].strip().startswith('or'),cells
  assert date and season
  records.append({'id':f"{source['file'][:-5]}:{row_index}",'date':date,'series':series,'cycle':cycle,'churchYear':source['file'][:7],'season':season,'title':re.sub(r'\s+',' ',cells[2]).strip(),'dateLabel':cells[1],'alternative':cells[1].strip().startswith('or'),'sourceUrl':source['url'].replace('/dl/f/','/file/preview/'),'sourceFile':source['file'],'sourceRow':row_index,'readings':[{'role':role,'text':re.sub(r'\s+',' ',value).strip()} for role,value in zip(['First Reading','Psalm','Epistle','Gospel'],cells[3:])]})
out=root/'rows.json';candidate=json.dumps(records,ensure_ascii=False,indent=2)+'\n'
if out.exists():assert out.read_text()==candidate,'Calendar extraction changed; prepare a reviewed successor.'
else:out.write_text(candidate)
print('Verified',len(records),'calendar observances')
