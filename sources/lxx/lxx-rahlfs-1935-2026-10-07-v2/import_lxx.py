"""Offline import of immutable Septuagint word data and independent verse correspondences."""
import collections, gzip, hashlib, html, json, pathlib, re, sys, unicodedata
ROOT = pathlib.Path(__file__).resolve().parents[2]
RELEASE = 'lxx-rahlfs-1935-2026-10-07-v2'
BASE = ROOT / 'sources/lxx' / RELEASE
OUT = ROOT / 'app/public/analysis' / RELEASE
REG = json.loads((ROOT / 'sources/ot/releases/ot-english-2026-10-07-v1/whole-bible-registry.json').read_text())[:39]
CODES = {b['name'].lower().replace(' ', '-'): b['code'] for b in REG}
SELECT = set(CODES) - {'ezra', 'nehemiah', 'esther', 'job', 'psalms', 'jeremiah', 'joshua'} | {'2-esdras', 'esther-greek', 'job-lxx', 'psalms-lxx', 'jeremiah-lxx', 'joshua-vaticanus-b'}
def sha(data): return hashlib.sha256(data).hexdigest()
def raw(name): return gzip.decompress((BASE / 'raw' / (name + '.gz')).read_bytes())
def dump(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n')
def norm(s): return unicodedata.normalize('NFC', s)
def run():
    pins=json.loads((BASE/'source-manifest.json').read_text())
    for name, digest in pins['files'].items():
        if sha((BASE/name).read_bytes()) != digest: raise ValueError('Source checksum mismatch: '+name)
    words={}; gloss={}; strong={}
    for name, dest, col in [('text_accented.csv', words, 2), ('beta.csv', gloss, 1), ('final_Strongs.csv', strong, 1)]:
        for line in raw(name).decode('utf-8-sig').splitlines():
            row=line.split('\t'); dest[int(row[0])]=row[-1] if name=='text_accented.csv' else row[col]
    starts=[line.split('\t') for line in raw('verses.csv').decode('utf-8-sig').splitlines()]
    wong={}
    for i,(ref,start) in enumerate(starts):
        end=int(starts[i+1][1]) if i+1<len(starts) else max(words)+1
        wong[ref]=list(range(int(start),end))
    pairs=[json.loads(x) for x in raw('verse_pairs.jsonl').decode().splitlines()]
    mapping={(p['grk_book'],p['grk_ref']):p for p in pairs if p['grk_book'] in SELECT}
    chapters=collections.defaultdict(list); lemmas={}; unmapped=[]; matched=0; mismatched=0; tokens_count=0
    bycode={b['code']:b for b in REG}
    for slug in sorted(SELECT):
        for verse in json.loads(raw(slug+'.json')):
            label, ref=verse['ref'].rsplit(' ',1)
            c,v=ref.split(':'); wlabel={'1 Sam':'1Sam','2 Sam':'2Sam','1 Kgs':'1Kgs','2 Kgs':'2Kgs','1 Chr':'1Chr','2 Chr':'2Chr','2 Esd':'2Esdr','Add Esth':'Esth'}.get(label,label)
            if slug=='joshua-vaticanus-b': wlabel='JoshB'
            key=f'{wlabel}.{c}.{v}'
            ids=wong.get(key,[])
            ws=verse['words']
            exact=len(ids)==len(ws) and all(norm(words[n])==norm(w['surface']) for n,w in zip(ids,ws))
            matched+=exact; mismatched+=not exact
            pair=mapping.get((slug,ref),{'method':'unpaired'})
            anchors=[]
            code=CODES.get(pair.get('mt_book'))
            for mr in pair.get('mt_refs',[]):
                mc,mv=map(int,mr.split(':'))
                if not code or not (1<=mc<=len(bycode[code]['verses']) and 1<=mv<=bycode[code]['verses'][mc-1]):
                    raise ValueError(f'Invalid canonical target {pair}')
                anchors.append(f'{code}.{mc}.{mv}')
            text=' '.join(w['surface'] for w in ws); pos=0; ts=[]
            for i,w in enumerate(ws):
                lemma=w.get('lemma') or ''; lid='lxx-'+sha(norm(lemma).encode())[:20]
                tid='lxx-'+sha(f'{slug}:{ref}:{i}'.encode())[:20]
                t={'id':tid,'surface':w['surface'],'start':pos,'end':pos+len(w['surface']), 'sourceText':'Rahlfs 1935 · word-token transcription', 'sourceId':f'{RELEASE}/{slug}/{ref}/{i}', 'lemma':lemma, 'lemmaId':lid, 'functional':w.get('pos') or '', 'form':w.get('parsing') or '', 'strongs':strong.get(ids[i],'').removeprefix('G') if exact else '', 'gloss':html.unescape(re.sub('<[^>]+>',' ',gloss.get(ids[i],''))).strip() or None if exact else None, 'glossSourceId':f'Eliran Wong / word {ids[i]}' if exact else None, 'analysisReleaseId':RELEASE, 'confidence':w.get('confidence'), 'analysisSource':w.get('source'), 'sourceAnalysis':w}
                ts.append(t); pos=t['end']+1; tokens_count+=1
                if anchors and lemma:
                    rec=lemmas.setdefault(lid,{'lemma':lemma,'lemmaId':lid,'releaseId':RELEASE,'hits':[]})
                    rec['hits'].append({'tokenId':tid,'sourceRef':f'{slug}/{ref}', 'sourceLabel':f'{label} {ref} (LXX)', 'chapterPath':f'{anchors[0].split(".")[0]}/{anchors[0].split(".")[1]}.json','anchor':anchors[0], 'surface':w['surface'],'text':text,'start':t['start'],'end':t['end']})
            segment={'sourceRef':f'{slug}/{ref}', 'sourceLabel':f'{label} {ref} (LXX)', 'anchors':anchors,'text':text,'status':'available','tokens':ts,'alignment':pair, 'glossAligned':exact}
            if not anchors: unmapped.append(segment)
            for ch in dict.fromkeys('.'.join(a.split('.')[:2]) for a in anchors): chapters[ch].append(segment)
    for b in REG:
        for c in range(1,len(b['verses'])+1):
            segs=chapters.get(f'{b["code"]}.{c}',[])
            dump(OUT/b['code']/f'{c}.json',{'releaseId':RELEASE,'segments':segs})
    for lid,rec in lemmas.items(): dump(OUT/'lemmas'/f'{lid}.json',rec)
    dump(OUT/'unpaired.json',{'releaseId':RELEASE,'segments':unmapped})
    manifest={'releaseId':RELEASE,'name':'Septuagint · Rahlfs 1935','sourceManifest':pins,'selectedBooks':sorted(SELECT),'daniel':'Old Greek (not Theodotion)','display':'Original word surfaces in source order, separated by spaces; punctuation is not supplied by this token source.', 'numbering':'Independent source verse numbers and preserved upstream correspondences to English canonical references; correspondence does not establish identical wording.', 'glosses':'Eliran Wong quick lexical glosses, attached only where every ordered verse token matches in NFC. These are not contextual English translation alignment.', 'morphology':'Seth Kushniryk / Open Scriptorium; upstream parsing, confidence and provenance retained without reinterpretation.', 'counts':{'canonicalBooks':39,'chapters':929,'sourceVerses':matched+mismatched,'exactGlossVerses':matched,'unmatchedGlossVerses':mismatched,'tokens':tokens_count,'lemmas':len(lemmas),'unpairedSourceVerses':len(unmapped)}}
    dump(OUT/'manifest.json',manifest)
    outputs={str(p.relative_to(OUT)):sha(p.read_bytes()) for p in sorted(OUT.rglob('*.json'))}
    if '--prepare' in sys.argv:
        if (BASE/'output-checksums.json').exists(): raise ValueError('Release already pinned')
        dump(BASE/'output-checksums.json',outputs)
        dump(BASE/'implementation.json',{'sha256':sha(pathlib.Path(__file__).read_bytes())})
    else:
        if outputs!=json.loads((BASE/'output-checksums.json').read_text()): raise ValueError('LXX output mismatch')
        if sha(pathlib.Path(__file__).read_bytes())!=json.loads((BASE/'implementation.json').read_text())['sha256']: raise ValueError('LXX implementation mismatch')
    print(json.dumps(manifest['counts']))
if __name__=='__main__': run()
