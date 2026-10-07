"""Read-only source comparison: documents gaps without inventing token alignment."""
import gzip,json,pathlib,unicodedata,collections
ROOT=pathlib.Path(__file__).resolve().parents[2];BASE=ROOT/'sources/lxx/lxx-rahlfs-1935-2026-10-07-v3/raw';RESEARCH=ROOT/'sources/lxx/lxx-research-2026-10-07-v1/raw'
words={int(r[0]):r[-1] for r in (l.split('\t') for l in gzip.decompress((BASE/'text_accented.csv.gz').read_bytes()).decode('utf-8-sig').splitlines())}
rows=[l.split('\t') for l in gzip.decompress((BASE/'verses.csv.gz').read_bytes()).decode().splitlines()];spans={r:[words[n] for n in range(int(start),int(rows[i+1][1]) if i+1<len(rows) else max(words)+1)] for i,(r,start) in enumerate(rows)}
aliases={'1 Sam':'1Sam','2 Sam':'2Sam','1 Kgs':'1Kgs','2 Kgs':'2Kgs','1 Chr':'1Chr','2 Chr':'2Chr','2 Esd':'2Esdr','1 Esd':'1Esdr','Add Esth':'Esth','1 Macc':'1Macc','2 Macc':'2Macc','3 Macc':'3Macc','4 Macc':'4Macc','Ep Jer':'EpJer','Pss. Sol.':'PsSol','Dan':'DanOG','Judg':'JudgA','Tob':'TobBA','Sus':'SusOG','Bel':'BelOG'}
variants={'joshua-vaticanus-b':'JoshB','joshua':'JoshA','judges-vaticanus-b':'JudgB','daniel-theodotion':'DanTh','tobit-sinaiticus':'TobS','susanna-theodotion':'SusTh','bel-and-the-dragon-theodotion':'BelTh'}
manifest=json.loads((ROOT/'app/public/analysis/lxx-research-2026-10-07-v1/manifest.json').read_text());sources={};audit=[]
for mismatch in manifest['mismatchedGlossVerses']:
 slug,ref=mismatch['sourceRef'].split('/')
 if slug not in sources:sources[slug]={r['ref'].rsplit(' ',1)[1]:r for r in json.loads(gzip.decompress((RESEARCH/(slug+'.json.gz')).read_bytes()))}
 row=sources[slug][ref];label=row['ref'].rsplit(' ',1)[0];gref=variants.get(slug,aliases.get(label,label))+'.'+ref.replace(':','.');a=[w['surface'] for w in row['words']];b=spans.get(gref,[]);first=next((i for i,(x,y) in enumerate(zip(a,b)) if unicodedata.normalize('NFC',x)!=unicodedata.normalize('NFC',y)),min(len(a),len(b)))
 audit.append({'sourceRef':mismatch['sourceRef'],'glossSourceRef':gref,'reason':'no source reference' if not b else 'word-count difference' if len(a)!=len(b) else 'word-surface difference','morphologyWordCount':len(a),'glossWordCount':len(b),'firstDifferenceTokenIndex':first,'morphologySurfaces':a,'glossSurfaces':b,'action':'Retain morphology and source text; omit unverified gloss/Strong’s alignment.'})
(ROOT/'docs/LXX-Gloss-Differences-2026-10-07.json').write_text(json.dumps({'records':audit,'summary':dict(collections.Counter(a['reason'] for a in audit))},ensure_ascii=False,indent=2)+'\n');print(dict(collections.Counter(a['reason'] for a in audit)))
