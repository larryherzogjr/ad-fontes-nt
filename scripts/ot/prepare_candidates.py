"""Prepare/verify isolated OT candidates. No production catalog or public writes.
First preparation requires --prepare; subsequent runs must reproduce pinned metadata.
"""
import argparse, collections, copy, hashlib, json, re, shutil, tempfile
from pathlib import Path
from adapters import build, blb_transforms
from audit_sources import ROOT, norm

def encoded(x): return (json.dumps(x,ensure_ascii=False,indent=2)+'\n').encode()
def sha(data): return hashlib.sha256(data).hexdigest()
def write(p,x): p.parent.mkdir(parents=True,exist_ok=True); p.write_bytes(encoded(x))
def explain(d):
    a,b=d['authoritative'],d['structured']
    if re.sub(r'\s','',a)==re.sub(r'\s','',b): return 'layout-whitespace; TXT governs spaces'
    compact=lambda t: re.sub(r'\s','',t)
    x,y=compact(a),compact(b)
    if y in [x+'[’’]',x+'’’']: return 'extra closing-quote string in USJ; retain TXT'
    if d['ref'].startswith('NUM.26.') and y.replace('...','')==x: return 'USJ enumeration ellipsis absent from TXT; retain TXT'
    if d['ref']=='GEN.35.18' and y.replace('vvv','')==x: return 'stray USJ vvv string absent from TXT; retain TXT'
    if d['ref'] in ['EXO.38.28','JDG.16.14','1CH.1.17','DEU.32.43'] and y.replace('[','').replace(']','')==x: return 'USJ supplied-word brackets absent from TXT; retain TXT'
    raise AssertionError(f'Unexplained difference: {d}')

def pin(path,value,prepare):
    data=encoded(value)
    if path.exists(): assert path.read_bytes()==data, f'Candidate changed; investigate and create successor: {path}'
    else:
        assert prepare, f'Missing reviewed candidate metadata; use explicit --prepare: {path}'
        path.parent.mkdir(parents=True,exist_ok=True); path.write_bytes(data)

def main():
    parser=argparse.ArgumentParser(); parser.add_argument('--prepare',action='store_true'); args=parser.parse_args()
    audit=json.loads((ROOT/'docs/OT-Reference-Reconciliation-2026-10-07.json').read_text())
    # Validate all original artifacts/evidence before any output.
    for a in audit['artifacts']: assert sha((ROOT/a['path']).read_bytes())==a['sha256'],a['path']
    base=ROOT/'sources/ot/releases/ot-english-2026-10-07-candidate-v3'
    output=ROOT/'artifacts/ot/ot-english-2026-10-07-candidate-v3'
    implementation={str(p.relative_to(ROOT)):sha(p.read_bytes()) for p in [ROOT/'scripts/ot/adapters.py',ROOT/'scripts/ot/audit_sources.py',Path(__file__).resolve()]}
    pin(base/'implementation-checksums.json',implementation,args.prepare)
    registry=[]
    osis='Gen Exod Lev Num Deut Josh Judg Ruth 1Sam 2Sam 1Kgs 2Kgs 1Chr 2Chr Ezra Neh Esth Job Ps Prov Eccl Song Isa Jer Lam Ezek Dan Hos Joel Amos Obad Jonah Mic Nah Hab Zeph Hag Zech Mal'.split()
    for i,(b,o) in enumerate(zip(audit['editions']['BSB']['inventory'],osis)):
        registry.append({**b,'order':i,'usfm':b['code'],'osis':o,'aliases':list(dict.fromkeys([b['code'],b['name'],o]+(['Psalm'] if b['code']=='PSA' else [])))})
    nt=json.loads((ROOT/'app/lib/domain/canonical-registry.json').read_text())
    union=copy.deepcopy(registry)+[{**b,'order':b['order']+39} for b in nt]
    assert len(union)==66 and len({b['code'] for b in union})==66
    with tempfile.TemporaryDirectory(prefix='afot-candidate-') as temp:
        stage=Path(temp); reviews={}; summary={}
        write(stage/'ot-registry.json',registry); write(stage/'whole-bible-registry.json',union)
        for ed in ['bsb','blb','msb','ylt']:
            release=f'{ed}-ot-2026-10-07-candidate-v3'; cs,ds,roles=build(ed)
            review=[{**d,'engineeringDecision':explain(d)} for d in ds if norm(d['structured'])!=norm(d['authoritative'])]
            # All pairs, including invisible layout differences, must be explained.
            for d in ds: explain(d)
            notes=sum(len(c['notes']) for c in cs)
            summary[ed.upper()]={'releaseId':release,'books':39,'chapters':len(cs),'segments':sum(len(c['segments']) for c in cs),'notes':notes,'normalizedDifferences':len(review),'differenceKinds':dict(collections.Counter(d['engineeringDecision'] for d in review)),'structureRoles':dict(collections.Counter(r['role'] for r in roles))}
            assert summary[ed.upper()]['segments']==23145 and len(cs)==929
            original=json.loads((ROOT/f'sources/{ed}/m2-manifest.json').read_text())
            manifest={'editionId':ed.upper(),'releaseId':release,'status':'engineering-verified candidate; source/display acceptance pending; not public','scope':'39-book English Old Testament','predecessorNtRelease':original['releaseId'],'editionLabel':original['editionLabel'],'authority':original['authority'],'rights':original['rights'],'rightsUrl':original['rightsUrl'],'artifacts':original['artifacts'],'evidence':original.get('evidence',[]),'inventory':summary[ed.upper()],'included':['OT Scripture','source-supplied structure and notes where available'],'excluded':['Hebrew/Aramaic analysis','Septuagint','word alignment','Ordinary Means commentary'],'ntGroupNotApplicableToOt':True}
            if ed=='msb':manifest['otDisclosure']='OT Scripture wording is identical to the pinned BSB OT; structured source remains MSB.'
            if ed=='blb':manifest['draftDisclosure']='Publisher early draft; supplied-word brackets retained.'
            for ch in cs:
                ch['releaseId']=release; write(stage/release/ch['book']/f"{ch['chapter']}.json",ch)
            write(stage/release/'search.json',[{'anchor':s['id'],'book':c['book'],'text':s['text']} for c in cs for s in c['segments']])
            write(stage/release/'manifest.json',manifest)
            reviews[ed.upper()]={'reviewType':'engineering TXT-authority reconciliation; no textual commentary or human sign-off inferred','differences':review,'specialBlockDecisions':roles}
            print(ed.upper(),summary[ed.upper()],flush=True)
        digests={str(p.relative_to(stage)):sha(p.read_bytes()) for p in sorted(stage.rglob('*.json'))}
        review={'sourcesSha256':sha(encoded(audit['artifacts'])),'editions':reviews}
        # Pins are never replaced, including with --prepare.
        pin(base/'blb-source-transforms.json',blb_transforms(),args.prepare)
        pin(base/'reviewed-engineering-differences.json',review,args.prepare)
        pin(base/'candidate-inventory.json',summary,args.prepare)
        pin(base/'output-checksums.json',digests,args.prepare)
        pin(base/'ot-registry.json',registry,args.prepare)
        pin(base/'whole-bible-registry.json',union,args.prepare)
        for ed in ['bsb','blb','msb','ylt']:
            release=f'{ed}-ot-2026-10-07-candidate-v3'; pin(base/f'{ed}-manifest.json',json.loads((stage/release/'manifest.json').read_text()),args.prepare)
        if output.exists(): assert digests=={str(p.relative_to(output)):sha(p.read_bytes()) for p in sorted(output.rglob('*.json'))},'Existing candidate output differs'
        else: output.parent.mkdir(parents=True,exist_ok=True); shutil.copytree(stage,output)
        print('Verified isolated candidate files:',len(digests))
if __name__=='__main__': main()
