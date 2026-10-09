"""Reproduce the authorized published Hebrew articles without network or source edits."""
from pathlib import Path
import hashlib,json
ROOT=Path(__file__).resolve().parent.parent
RELEASE='hebrew-studies-2026-10-09-v1'
def outputs():
    source=ROOT/'sources/om-hebrew'/RELEASE
    manifest=json.loads((source/'manifest.json').read_text())
    result={}
    for a in manifest['articles']:
        raw=(source/'raw'/f"{a['slug']}.md").read_bytes()
        if hashlib.sha256(raw).hexdigest()!=a['contentSha256']: raise ValueError('Changed article; prepare a reviewed successor release')
        front,body=raw.decode().split('---',2)[1:]
        if 'draft: false' not in front or f'slug: "{a["slug"]}"' not in front: raise ValueError('Article identity/publication mismatch')
        result[f"articles/{a['slug']}.json"]=json.dumps(dict(schemaVersion=2,releaseId=RELEASE,article=dict(a,markdown=body.lstrip('\r\n'))),ensure_ascii=False,indent=2)+'\n'
    result['index.json']=json.dumps(dict(schemaVersion=2,releaseId=RELEASE,articles=manifest['articles']),ensure_ascii=False,indent=2)+'\n'
    if {k:hashlib.sha256(v.encode()).hexdigest() for k,v in result.items()}!=manifest['outputs']: raise ValueError('Changed article output')
    return result
if __name__=='__main__':
    for path,value in outputs().items():
        target=ROOT/'app/public/om'/RELEASE/path
        target.parent.mkdir(parents=True,exist_ok=True)
        target.write_text(value)
    print('Reproduced seven unchanged published Hebrew studies.')
