"""Promote the approved v3 candidate deterministically, preserving predecessors."""
import hashlib,json,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/'sources/ot/releases/ot-english-2026-10-07-candidate-v3'
RELEASE=ROOT/'sources/ot/releases/ot-english-2026-10-07-v1'
def sha(data): return hashlib.sha256(data).hexdigest()
def encoded(value): return (json.dumps(value,ensure_ascii=False,indent=2)+'\n').encode()
def pin(path,data):
    if path.exists(): assert path.read_bytes()==data,f'Release changed: {path}'
    else:
        assert '--prepare' in sys.argv,f'Missing release pin: {path}'
        path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(data)
subprocess.run([sys.executable,str(ROOT/'scripts/ot/prepare_candidates.py')],check=True)
approval=json.loads((RELEASE/'approval.json').read_text())
assert approval['decision']=='approved' and approval['reviewer']=='Larry Herzog Jr.'
for name,digest in approval['candidateMetadata'].items(): assert sha((BASE/name).read_bytes())==digest,name
pin(RELEASE/'publisher-sha256.txt',(sha(Path(__file__).read_bytes())+'\n').encode())
originals=json.loads((BASE/'output-checksums.json').read_text());outputs={};manifests=[]
for ed in ['bsb','blb','msb','ylt']:
    before=f'{ed}-ot-2026-10-07-candidate-v3';after=f'{ed}-ot-2026-10-07-v1'
    for name,digest in originals.items():
        if not name.startswith(before+'/'):continue
        raw=(ROOT/'artifacts/ot/ot-english-2026-10-07-candidate-v3'/name).read_bytes();assert sha(raw)==digest
        value=json.loads(raw)
        if name.endswith('/manifest.json'):
            value['releaseId']=after;value['inventory']['releaseId']=after
            value['status']='approved English OT source/display release'
            value['approvedCandidate']=before;value['approvalDate']='2026-10-07'
            manifests.append((ed,value))
        elif not name.endswith('/search.json'):value['releaseId']=after
        data=encoded(value);path=name.replace(before,after,1);outputs[path]=sha(data)
        dest=ROOT/'app/public/corpus'/path;dest.parent.mkdir(parents=True,exist_ok=True)
        if dest.exists():assert dest.read_bytes()==data,f'Published output changed: {path}'
        else:dest.write_bytes(data)
pin(RELEASE/'output-checksums.json',encoded(outputs))
for ed,value in manifests:pin(RELEASE/f'{ed}-manifest.json',encoded(value))
pin(RELEASE/'whole-bible-registry.json',(BASE/'whole-bible-registry.json').read_bytes())
print(f'Published/verified {len(outputs)} approved OT files')
