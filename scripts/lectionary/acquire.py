"""One-time acquisition of official calendars. Never called by builds."""
import urllib.request, pathlib, hashlib, json, concurrent.futures
root=pathlib.Path('sources/lectionary/lcms-calendars-2026-10-14-v1')
slugs=['2025-26-three-year-series-a-calendar-word','2025-26-one-year-series-calendar-word','2026-27-three-year-series-b-calendar-word','2026-27-one-year-series-calendar-word','2024-25-three-year-series-c-calendar-word','2024-25-one-year-series-calendar-word']
def get(s):
 u='https://files.lcms.org/dl/f/'+s
 p=root/'raw'/f'{s}.docx'
 b=p.read_bytes() if p.exists() else urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=60).read()
 assert b[:2]==b'PK', (s,b[:80])
 p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(b)
 return {'file':p.name,'url':u,'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b),'acquired':'2026-10-14'}
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as ex: records=list(ex.map(get,slugs))
(root/'acquisition.json').write_text(json.dumps(records,indent=2)+'\n')
print('Preserved',len(records),'official calendars')
