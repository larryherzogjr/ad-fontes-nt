"""One-time primary-source audit acquisition. Never invoked by builds."""
import concurrent.futures, hashlib, json, urllib.request
from pathlib import Path
base=Path('sources/confessions/triglotta-1921-2026-10-14-v4')
out=base/'raw-pages';out.mkdir(parents=True,exist_ok=True)
tree=json.loads(Path('sources/confessions/triglotta-1921-2026-10-14-v1/raw/sources/bookofconcord-org-tree.json').read_text())
urls=[u for u,t in tree]+['/power-and-primacy/','/sitepages/','/about-the-translation/']
def get(path):
 name=path.strip('/').replace('/','--')+'.html';dest=out/name
 if dest.exists():data=dest.read_bytes()
 else:
  request=urllib.request.Request('https://bookofconcord.org'+path,headers={'User-Agent':'Mozilla/5.0'})
  data=urllib.request.urlopen(request,timeout=30).read();dest.write_bytes(data)
 return {'url':'https://bookofconcord.org'+path,'file':'raw-pages/'+name,'sha256':hashlib.sha256(data).hexdigest()}
results=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 for result in pool.map(get,urls):
  results.append(result)
  if len(results)%20==0:print('Saved',len(results),'primary pages',flush=True)
(base/'acquisition.json').write_text(json.dumps({'retrievedAt':'2026-10-14','pages':results},indent=2)+'\n')
print('Pinned',len(results),'primary pages')
