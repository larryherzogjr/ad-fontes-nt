"""Reviewed address relationships, not word-level alignment or textual judgments."""
import copy
from adapters import BASE
REGISTRY=copy.deepcopy(BASE)
for b in REGISTRY:
 if b['code']=='3JN':b['verses'][0]=15
 if b['code']=='ROM':b['verses'][13]=26
 if b['code']=='REV':b['verses'][11]=18
BSB_GAPS='MAT.17.21 MAT.18.11 MAT.23.14 MRK.7.16 MRK.9.44 MRK.9.46 MRK.11.26 MRK.15.28 LUK.17.36 LUK.23.17 JHN.5.4 ACT.8.37 ACT.15.34 ACT.24.7 ACT.28.29 ROM.16.24'.split()
RP_GAPS='LUK.17.36 ACT.8.37 ACT.15.34 ACT.24.7'.split()
GAPS={'BSB':BSB_GAPS,'BLB':BSB_GAPS,'MSB':RP_GAPS,'RP2018':RP_GAPS,'YLT':[],'TR-BOYD':[],'N1904':[a for a in BSB_GAPS if a!='JHN.5.4']}
def anchors_for(edition,source):
 anchors=[source];kind='exact'
 if source=='3JN.1.14' and edition!='N1904':anchors+=['3JN.1.15'];kind='join'
 if source.startswith('ROM.14.') and int(source.split('.')[2])>=24:
  anchors+=[f"ROM.16.{int(source.split('.')[2])+1}"];kind='relocated'
 if source.startswith('ROM.16.') and int(source.split('.')[2])>=25:
  anchors+=[f"ROM.14.{int(source.split('.')[2])-1}"];kind='relocated'
 if source=='REV.13.1' and edition!='N1904':anchors+=['REV.12.18'];kind='join'
 if edition=='N1904':
  if source=='2CO.13.12':anchors=['2CO.13.12','2CO.13.13'];kind='join'
  if source=='2CO.13.13':anchors=['2CO.13.14'];kind='renumbered'
  if source=='ACT.19.40':anchors+=['ACT.19.41'];kind='join'
  if source=='REV.12.18':anchors+=['REV.13.1'];kind='split'
  if source=='REV.13.1':kind='split'
 return anchors,kind
BRACKETED=['JHN.5.4','JHN.7.53']+[f'JHN.8.{v}' for v in range(1,12)]+[f'MRK.16.{v}' for v in range(9,21)]
def apply(edition,chapters,release):
 placements={};notes={}
 for ch in chapters:
  ch['releaseId']=release
  for n in ch['notes']:notes.setdefault(n['anchor'],[]).append(n['id'])
  ss={s['id']:s for s in ch['segments']}
  for s in ss.values():
   s['sourceRef']=s['id'];s['anchors'],s['mappingType']=anchors_for(edition,s['id'])
   for a in s['anchors']:placements.setdefault(a,[]).append({'book':ch['book'],'chapter':ch['chapter'],'segmentId':s['id'],'sourceRef':s['id'],'mappingType':s['mappingType']})
  for block in ch['blocks']:
   for r in block['runs']:
    if r.get('anchor') in ss:r['anchors']=ss[r['anchor']]['anchors'];r['sourceAnchor']=r['anchor'];r['anchor']=ss[r['anchor']]['anchors'][0]
 for ch in chapters:
  old={c['anchor']:c for c in ch['coverage']};ch['coverage']=[]
  meta=next(b for b in REGISTRY if b['code']==ch['book'])
  for v in range(1,meta['verses'][ch['chapter']-1]+1):
   a=f"{ch['book']}.{ch['chapter']}.{v}";ps=placements.get(a,[])
   assert ps or a in GAPS[edition],f'Unexplained missing data: {edition} {a}'
   state='absent' if not ps else 'relocated' if any(p['book']!=ch['book'] or p['chapter']!=ch['chapter'] for p in ps) else 'bracketed' if edition=='N1904' and a in BRACKETED else 'present'
   ids=old.get(a,{}).get('publisherNoteIds',notes.get(a,[]))
   if edition=='MSB' and a in GAPS['MSB']:
    b,c,v=a.split('.');ids=notes.get(f'{b}.{c}.{int(v)-1}',[])
   ch['coverage'].append({'anchor':a,'dataState':'available','textState':state,'publisherNoteIds':ids,'placements':ps,'evidence':'Source inventory and explicit mappings in the release manifest.'})
 return chapters
