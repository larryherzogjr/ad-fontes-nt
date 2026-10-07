"""Offline full-source LXX search/concordance derivative; preserves predecessor bytes."""
import json,gzip,hashlib,pathlib,collections,unicodedata,re,html,sys
ROOT=pathlib.Path(__file__).resolve().parents[2]; RELEASE='lxx-research-2026-10-07-v1'; BASE=ROOT/'sources/lxx'/RELEASE; OUT=ROOT/'app/public/analysis'/RELEASE
PARENT='lxx-rahlfs-1935-2026-10-07-v3'; PB=ROOT/'app/public/analysis'/PARENT
norm=lambda s:unicodedata.normalize('NFC',s)
sha=lambda b:hashlib.sha256(b).hexdigest()
def dump(p,d):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,separators=(',',':'))+'\n')
def run():
 pins=json.loads((BASE/'source-manifest.json').read_text()); inputs={}; outputs={}; placements={}
 for p in sorted(PB.glob('*/*.json')):
  if p.parent.name in ['lemmas','lexicon']:continue
  raw=p.read_bytes();inputs[str(p.relative_to(ROOT))]=sha(raw)
  for s in json.loads(raw)['segments']:placements.setdefault(s['sourceRef'],{'anchors':s['anchors'],'chapterPath':str(p.relative_to(PB))})
 raw=(PB/'unpaired.json').read_bytes();inputs[str((PB/'unpaired.json').relative_to(ROOT))]=sha(raw)
 for s in json.loads(raw)['segments']:placements.setdefault(s['sourceRef'],{'anchors':[],'chapterPath':'unpaired.json'})
 # Shared gloss artifacts are already pinned under the predecessor; no source downloads.
 wb=ROOT/'sources/lxx'/PARENT/'raw'; words={}; gloss={}; strong={}
 for name,dest in [('text_accented.csv',words),('beta.csv',gloss),('final_Strongs.csv',strong)]:
  raw=(wb/(name+'.gz')).read_bytes();inputs[str((wb/(name+'.gz')).relative_to(ROOT))]=sha(raw)
  for line in gzip.decompress(raw).decode('utf-8-sig').splitlines():
   row=line.split('\t');dest[int(row[0])]=row[-1] if name=='text_accented.csv' else row[1]
 raw=(wb/'verses.csv.gz').read_bytes();inputs[str((wb/'verses.csv.gz').relative_to(ROOT))]=sha(raw); starts=[x.split('\t') for x in gzip.decompress(raw).decode().splitlines()]; spans={}
 for i,(ref,start) in enumerate(starts):spans[ref]=list(range(int(start),int(starts[i+1][1]) if i+1<len(starts) else max(words)+1))
 aliases={'1 Sam':'1Sam','2 Sam':'2Sam','1 Kgs':'1Kgs','2 Kgs':'2Kgs','1 Chr':'1Chr','2 Chr':'2Chr','2 Esd':'2Esdr','1 Esd':'1Esdr','Add Esth':'Esth','1 Macc':'1Macc','2 Macc':'2Macc','3 Macc':'3Macc','4 Macc':'4Macc','Ep Jer':'EpJer','Pss. Sol.':'PsSol','Dan':'DanOG','Judg':'JudgA','Tob':'TobBA','Sus':'SusOG','Bel':'BelOG'}
 variants={'joshua-vaticanus-b':'JoshB','joshua':'JoshA','judges-vaticanus-b':'JudgB','daniel-theodotion':'DanTh','tobit-sinaiticus':'TobS','susanna-theodotion':'SusTh','bel-and-the-dragon-theodotion':'BelTh'}
 books=[]; lemmas={}; totals=collections.Counter(); mismatches=[]
 for slug,pin in pins['sourceFiles'].items():
  raw=(BASE/'raw'/(slug+'.json.gz')).read_bytes();original=gzip.decompress(raw)
  if sha(raw)!=pin['compressedSha256'] or sha(original)!=pin['sha256']:raise ValueError('Changed research source '+slug)
  inputs[str((BASE/'raw'/(slug+'.json.gz')).relative_to(ROOT))]=sha(raw); rows=json.loads(original); search=[]; extras=[]; posset=set(); forms=set(); glossed=0; chapters=set()
  for ordinal,row in enumerate(rows):
   label,ref=row['ref'].rsplit(' ',1);chapter=ref.split(':')[0];chapters.add(chapter);sref=slug+'/'+ref; placement=placements.get(sref);ids=spans.get(variants.get(slug,aliases.get(label,label))+'.'+ref.replace(':','.'),[]);ws=row['words'];exact=len(ids)==len(ws) and all(norm(words[n])==norm(w['surface']) for n,w in zip(ids,ws));glossed+=exact
   text=' '.join(w['surface'] for w in ws);tokens=[];compact=[];offset=0
   for i,w in enumerate(ws):
    lemma=w.get('lemma') or '';lid='lxx-'+sha(norm(lemma).encode())[:20];tid='lxx-'+sha(f'{slug}:{ref}:{i}'.encode())[:20];surface=w['surface'];end=offset+len(surface);pos=w.get('pos') or '';form=w.get('parsing') or '';posset.add(pos);forms.add(form)
    compact.append([surface,lemma,pos,form,offset,end,tid]);totals['tokens']+=1
    if lemma:
     rec=lemmas.setdefault(norm(lemma),{'lemma':norm(lemma),'id':lid,'count':0,'mapped':0,'sourceOnly':0,'books':{}});rec['count']+=1;rec['mapped' if placement and placement['anchors'] else 'sourceOnly']+=1;rec['books'][slug]=rec['books'].get(slug,0)+1
    if not placement:
     tokens.append({'id':tid,'surface':surface,'start':offset,'end':end,'lemma':lemma,'lemmaId':lid,'functional':pos,'form':form,'strongs':strong.get(ids[i],'').removeprefix('G') if exact else '', 'gloss':html.unescape(re.sub('<[^>]+>',' ',gloss.get(ids[i],''))).strip() or None if exact else None,'glossSourceId':f'Eliran Wong / word {ids[i]}' if exact else None,'sourceText':'Rahlfs 1935 · additional source transcription','sourceId':f'{RELEASE}/{slug}/{ref}/{i}','analysisReleaseId':RELEASE,'confidence':w.get('confidence'),'analysisSource':w.get('source')})
    offset=end+1
   if not exact:mismatches.append({'sourceRef':sref,'reason':'Ordered NFC word surfaces do not exactly match the gloss source; no gloss/Strong’s alignment attached.'})
   s={'sourceRef':sref,'sourceLabel':row['ref']+' (LXX)','sourceBook':slug,'anchors':placement['anchors'] if placement else [],'text':text,'chapterPath':placement['chapterPath'] if placement else None,'tokens':compact,'ordinal':ordinal};search.append(s)
   if not placement:extras.append({**s,'tokens':tokens,'status':'available','glossAligned':exact})
   totals['verses']+=1;totals['mappedVerses' if s['anchors'] else 'sourceOnlyVerses']+=1
  name=slug.replace('-',' ').title(); name += ' · partial source (96 verses)' if slug=='joshua' else ''
  books.append({'id':slug,'name':name,'sourceLabel':rows[0]['ref'].rsplit(' ',1)[0],'verses':len(rows),'tokens':sum(len(s['tokens']) for s in search),'chapters':sorted(chapters,key=lambda x:int(x)),'positions':sorted(posset),'forms':sorted(forms),'exactGlossVerses':glossed,'additional':bool(extras),'partial':slug=='joshua'})
  dump(OUT/'books'/(slug+'.json'),{'releaseId':RELEASE,'sourceRelease':PARENT,'book':slug,'verses':search})
  if extras:dump(OUT/'extra'/(slug+'.json'),{'releaseId':RELEASE,'segments':extras})
 predecessor=json.loads((ROOT/'app/public/analysis/greek-lemma-links-2026-10-07-v1.json').read_text());inputs['app/public/analysis/greek-lemma-links-2026-10-07-v1.json']=sha((ROOT/'app/public/analysis/greek-lemma-links-2026-10-07-v1.json').read_bytes())
 nt={e['lemma']:e['nt'] for e in predecessor['entries'] if e['nt']};union=sorted(set(nt)|set(lemmas))
 dump(OUT/'lemmas.json',{'releaseId':RELEASE,'entries':[{'lemma':k,'nt':nt.get(k,[]),'lxx':lemmas.get(k)} for k in union]})
 dump(OUT/'manifest.json',{'releaseId':RELEASE,'parentRelease':PARENT,'books':books,'counts':dict(totals),'matching':'Exact NFC lemma identity; source-only verses and alternative texts counted separately by source book. No canonical mapping inferred for additional source files.','mismatchedGlossVerses':mismatches,'noticesRelease':'lxx-source-notices-2026-10-07-v1','sourceCommit':pins['commit']})
 for p in sorted(OUT.rglob('*.json')):outputs[str(p.relative_to(OUT))]=sha(p.read_bytes())
 snapshot={'implementationSha256':sha(pathlib.Path(__file__).read_bytes()),'inputs':inputs,'outputs':outputs}
 if '--prepare' in sys.argv:
  if (BASE/'checksums.json').exists():raise ValueError('Research release already pinned')
  dump(BASE/'checksums.json',snapshot)
 elif json.loads((BASE/'checksums.json').read_text())!=snapshot:raise ValueError('Research derivative differs from its pinned release; prepare a reviewed successor')
 print(json.dumps({'books':len(books),**dict(totals),'lemmas':len(lemmas),'sharedLemmas':len(set(nt)&set(lemmas))}))
if __name__=='__main__':run()
