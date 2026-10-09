"""Preserve supplied K&D chapter groups; index explicit cross-group chapter headings.
No guessed English verse alignment is derived from Hebrew verse labels.
"""
import hashlib
import json
import re
import zipfile
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
RELEASE = 'kd-2026-10-08-v1'
def sha(b): return hashlib.sha256(b).hexdigest()
def encoded(v): return (json.dumps(v, ensure_ascii=False, indent=2)+'\n').encode()
LABELS = dict(zip('GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO ECC SNG ISA JER LAM EZK DAN HOS JOL AMO OBA JON MIC NAM HAB ZEP HAG ZEC MAL'.split(), ['Gen.','Ex.','Lev.','Num.','Deut.','Josh.','Judg.','Ruth','1 Sam.','2 Sam.','1 Kings','2 Kings','1 Chron.','2 Chron.','Ezra','Neh.','Esth.','Job','Ps.','Prov.','Eccles.','Song','Isa.','Jer.','Lam.','Ezek.','Dan.','Hos.','Joel','Amos','Ob.','Jonah','Mic.','Nah.','Hab.','Zeph.','Hag.','Zech.','Mal.']))
def build():
    source=json.loads((ROOT/'sources/kd/source.json').read_text())
    raw=ROOT/'sources/kd'/source['file']; assert sha(raw.read_bytes())==source['sha256']
    registry=json.loads((ROOT/'sources/ot/releases/ot-english-2026-10-07-v1/whole-bible-registry.json').read_text())[:39]
    files={};catalog=[];audit={};count=0;chars=0
    with zipfile.ZipFile(raw) as z:
        supplied=json.loads(z.read('kd-json/manifest.json'))
        for book in registry:
            code=book['code'];data=json.loads(z.read(f'kd-json/{code}.json'))
            assert data['book']==code and len(data['chapters'])==len(book['verses'])
            assert set(data['chapters'])=={str(i+1) for i in range(len(book['verses']))}
            assert sum(map(len,data['chapters'].values()))==supplied[code]['textChars']
            related={i+1:[] for i in range(len(book['verses']))}; chapters={};rows=[]
            # Index only explicit own-book paragraph headings, never incidental inline citations.
            pattern=re.compile(r'^'+re.escape(LABELS[code])+r'\s+(\d+)(?::(\d+))?(?:[–-](\d+)(?::(\d+))?)?(?:,\s*(\d+))?\.(?:\s|$)')
            for ch,text in data['chapters'].items():
                paragraphs=text.split('\n\n');chapter=int(ch);chars+=len(text);count+=1
                for i,p in enumerate(paragraphs):
                    m=pattern.match(p.strip())
                    if m:
                        first=int(m[1]);last=first
                        if m[4]:last=int(m[3])  # chapter:verse–chapter:verse
                        elif not m[2] and m[3]:last=int(m[3])
                        elif not m[2] and m[5]:last=int(m[5])
                        if 1<=first<=last<=len(book['verses']):
                            for target in range(first,last+1):
                                if target!=chapter:
                                    link={'chapter':chapter,'paragraph':i,'label':m[0].strip(),'excerpt':p.strip()[:160]}
                                    # Identical group copies need only one target per exact paragraph.
                                    if not any(x['excerpt']==link['excerpt'] for x in related[target]):related[target].append(link)
                    rows.append({'chapter':chapter,'paragraph':i,'verse':None,'intro':False,'text':p})
                chapters[chapter]={'schemaVersion':1,'releaseId':RELEASE,'book':code,'chapter':chapter,'name':book['name'],'sourceSha256':sha(text.encode()),'introEnd':0,'paragraphs':paragraphs,'sections':[],'unmappedVerses':list(range(1,book['verses'][chapter-1]+1)),'mappingMode':'chapter-context'}
            for chapter,payload in chapters.items():
                own_paragraphs={p.strip() for p in payload['paragraphs']}
                related[chapter]=[link for link in related[chapter] if chapters[link['chapter']]['paragraphs'][link['paragraph']].strip() not in own_paragraphs]
                payload['relatedSections']=related[chapter]
                files[f'chapters/{code}/{chapter}.json']=encoded(payload)
            files[f'search/{code}.json']=encoded({'releaseId':RELEASE,'book':code,'rows':rows})
            audit[code]={'chapterCount':len(chapters),'relatedSections':related,'verseAlignment':'Not established; preserve source numbering.'}
            catalog.append({'book':code,'name':book['name'],'chapters':list(chapters)})
    files['catalog.json']=encoded({'schemaVersion':1,'releaseId':RELEASE,'title':source['title'],'author':source['author'],'books':catalog})
    files['mapping-audit.json']=encoded(audit)
    manifest={'schemaVersion':1,'releaseId':RELEASE,'source':source,'implementationSha256':sha(Path(__file__).read_bytes()),'files':{k:sha(v) for k,v in sorted(files.items())},'chapterCount':count,'textChars':chars,'mappingMode':'chapter-context'}
    return files,manifest
if __name__=='__main__':
    files,manifest=build()
    assert json.loads((ROOT/'content/kd/release.json').read_text())==manifest, 'K&D output differs from candidate pins'
    for key,value in {**files,'manifest.json':encoded(manifest)}.items():
        path=ROOT/'app/public/commentaries'/RELEASE/key;path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(value)
    print(f'K&D: {manifest["chapterCount"]} preserved chapter groups; source numbering retained; no guessed verse alignment.')
