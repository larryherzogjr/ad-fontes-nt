"""Reproduce the pinned Lenski release; no network or source rewriting."""
import hashlib
import json
import re
import zipfile
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
RELEASE = 'lenski-2026-10-08-v1'
def sha(b): return hashlib.sha256(b).hexdigest()
def encoded(v): return (json.dumps(v, ensure_ascii=False, indent=2)+'\n').encode()
def build():
    source=json.loads((ROOT/'sources/lenski/source.json').read_text())
    raw=(ROOT/'sources/lenski'/source['file']).read_bytes()
    assert sha(raw)==source['sha256'], 'Supplied archive changed'
    registry=json.loads((ROOT/'app/lib/domain/canonical-registry.json').read_text())
    decisions=json.loads((ROOT/'content/lenski/mapping-decisions.json').read_text())
    files={}; catalog=[]; audit={}; total=0
    with zipfile.ZipFile(ROOT/'sources/lenski'/source['file']) as z:
        for book in registry:
            code=book['code']; data=json.loads(z.read(f'lenski-json/{code}.json'))
            assert data['book']==code and set(data['chapters'])=={str(i+1) for i in range(len(book['verses']))}
            chapter_index=[]
            for ch,text in data['chapters'].items():
                key=f'{code}.{ch}'; paragraphs=text.split('\n\n'); markers=[]; maximum=book['verses'][int(ch)-1]
                for i,p in enumerate(paragraphs):
                    m=re.match(r'^(\d{1,3}(?:\s*[,–—-]\s*\d{1,3})*)\)\s',p)
                    if not m or i in decisions['exclude'].get(key,[]): continue
                    ns=list(map(int,re.findall(r'\d+',m[1])))
                    if max(ns)>maximum: continue  # e.g. broken Robertson page citations
                    markers.append(dict(paragraph=i,start=min(ns),end=max(ns)))
                for item in decisions['include'].get(key,[]):
                    assert paragraphs[item['paragraph']].startswith(item['prefix'])
                    markers.append({k:item[k] for k in ('paragraph','start','end')})
                for override in decisions.get('canonicalOverrides',{}).get(key,[]):
                    marker=next(m for m in markers if m['paragraph']==override['paragraph'])
                    marker.update(override)
                markers.sort(key=lambda x:x['paragraph'])
                assert all(a['start']<b['start'] for a,b in zip(markers,markers[1:])), key
                assert len({m['paragraph'] for m in markers})==len(markers)
                # Preserve every source paragraph. Introductions have their own Library view.
                intro_end=0
                if ch=='1' and markers:
                    heads=[i for i,p in enumerate(paragraphs[:markers[0]['paragraph']+1]) if p=='CHAPTER 1' or p=='THE LETTER']
                    intro_end=heads[-1] if heads else markers[0]['paragraph']
                sections=[]; covered=set()
                for i,m in enumerate(markers):
                    end=markers[i+1]['paragraph'] if i+1<len(markers) else len(paragraphs)
                    sections.append({**m,'toParagraph':end,'id':f'{key}.{m["start"]}'})
                    covered.update(range(m['start'],m['end']+1))
                gaps=sorted(set(range(1,maximum+1))-covered)
                payload={'schemaVersion':1,'releaseId':RELEASE,'book':code,'chapter':int(ch),'name':book['name'],'sourceSha256':sha(text.encode()),'introEnd':intro_end,'paragraphs':paragraphs,'sections':sections,'unmappedVerses':gaps}
                assert '\n\n'.join(payload['paragraphs'])==text
                files[f'chapters/{code}/{ch}.json']=encoded(payload)
                chapter_index.append({'chapter':int(ch),'sectionCount':len(sections),'intro':intro_end>0})
                audit[key]={'mappedVerses':len(covered),'unmappedVerses':gaps,'sections':len(sections)};total+=len(sections)
            catalog.append({'book':code,'name':book['name'],'chapters':chapter_index})
        # Small book search shards: paragraphs stay associated with explicit source labels only.
        for book in catalog:
            rows=[]
            for ch in book['chapters']:
                payload=json.loads(files[f'chapters/{book["book"]}/{ch["chapter"]}.json'])
                for i,p in enumerate(payload['paragraphs']):
                    s=next((s for s in payload['sections'] if s['paragraph']<=i<s['toParagraph']),None)
                    rows.append({'chapter':ch['chapter'],'paragraph':i,'verse':s['start'] if s else None,'intro':i<payload['introEnd'],'text':p})
            files[f'search/{book["book"]}.json']=encoded({'releaseId':RELEASE,'book':book['book'],'rows':rows})
    files['catalog.json']=encoded({'schemaVersion':1,'releaseId':RELEASE,'title':source['title'],'author':source['author'],'edition':source['edition'],'books':catalog})
    files['mapping-audit.json']=encoded(audit)
    manifest={'schemaVersion':1,'releaseId':RELEASE,'source':source,'implementationSha256':sha(Path(__file__).read_bytes()),'mappingSha256':sha((ROOT/'content/lenski/mapping-decisions.json').read_bytes()),'files':{k:sha(v) for k,v in sorted(files.items())},'chapterCount':len(audit),'sectionCount':total,'mappedVerseCount':sum(x['mappedVerses'] for x in audit.values()),'unmappedVerseCount':sum(len(x['unmappedVerses']) for x in audit.values())}
    return files,manifest
if __name__=='__main__':
    files,manifest=build()
    pin=ROOT/'content/lenski/release.json'
    assert pin.exists() and json.loads(pin.read_text())==manifest, 'Lenski release differs from reviewed output pins'
    out=ROOT/'app/public/commentaries'/RELEASE
    for k,v in {**files,'manifest.json':encoded(manifest)}.items():
        p=out/k;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(v)
    print(f'Lenski: {manifest["chapterCount"]} chapters, {manifest["sectionCount"]} explicit sections; {manifest["unmappedVerseCount"]} verse addresses use chapter context.')
