"""Bundle pinned upstream notices without altering the immutable Greek data release."""
import hashlib, json, pathlib
ROOT = pathlib.Path(__file__).resolve().parents[2]
RELEASE = 'lxx-source-notices-2026-10-07-v1'
BASE = ROOT/'sources/lxx/lxx-rahlfs-1935-2026-10-07-v3'
META = ROOT/'sources/lxx'/RELEASE
pins = json.loads((BASE/'source-manifest.json').read_text())
notices = {}
for name, digest in pins['files'].items():
    if name.startswith('evidence/'):
        data = (BASE/name).read_bytes()
        if hashlib.sha256(data).hexdigest() != digest: raise ValueError('Notice checksum mismatch: '+name)
        notices[name] = data.decode('utf-8')
content = {'releaseId':RELEASE,'dataRelease':BASE.name,'decision':pins['decision'],'upstreams':[{'name':'Seth Kushniryk / Open Scriptorium','url':'https://git.sr.ht/~sethkush/lxx-morph','commit':'0a23df295de5e5710724c8b6e84edf99e89348aa'},{'name':'Eliran Wong','url':'https://github.com/eliranwong/LXX-Rahlfs-1935','commit':'a1b5ff1c739f93cdd18dbab4c9e3fc6b1043141c'}],'originalNotices':notices}
data=(json.dumps(content,ensure_ascii=False,indent=2)+'\n').encode()
meta={'outputSha256':hashlib.sha256(data).hexdigest(),'implementationSha256':hashlib.sha256(pathlib.Path(__file__).read_bytes()).hexdigest()}
if not META.exists(): raise ValueError('Notice release metadata is required')
if meta != json.loads((META/'checksums.json').read_text()): raise ValueError('Notice release changed')
output=ROOT/'app/public/analysis'/(RELEASE+'.json');output.parent.mkdir(parents=True,exist_ok=True);output.write_bytes(data)
print('Verified and bundled original Septuagint source notices')
