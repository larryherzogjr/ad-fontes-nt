"""Project the pinned supplied encyclopedia records without re-extraction or prose edits."""
import hashlib
import json
import re
import unicodedata
import zipfile
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RELEASE = 'encyclopedias-2026-10-16-v1'
BASE = ROOT / 'app/public/library/encyclopedias' / RELEASE
WORKS = [
    ('isbe', 'isbe-1915-logos', 'International Standard Bible Encyclopaedia', '1915', 'James Orr, general editor', 9347),
    ('lutheran', 'lutheran-cyclopedia', 'The Lutheran Cyclopedia', '1899', 'Henry Eyster Jacobs and John A. W. Haas, editors', 2121),
]

def sha(data):
    return hashlib.sha256(data).hexdigest()

def encoded(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()

def key(text):
    return ''.join(c for c in unicodedata.normalize('NFD', text).lower() if c.isalnum())

def build():
    source = json.loads((ROOT / 'sources/encyclopedias/source.json').read_text())
    raw = ROOT / 'sources/encyclopedias' / source['file']
    assert sha(raw.read_bytes()) == source['sha256'], 'Encyclopedia source ZIP changed'
    files, inputs, works, audit = {}, {}, [], {}
    with zipfile.ZipFile(raw) as z:
        assert z.testzip() is None
        def read(path):
            data = z.read(path)
            inputs[path] = sha(data)
            return data.decode('utf-8')
        for wid, prefix, title, year, editors, expected in WORKS:
            supplied_index = json.loads(read(f'{prefix}/index.json'))
            records = []
            for path in sorted(n for n in z.namelist() if n.startswith(prefix + '/json/') and n.endswith('.json')):
                d = json.loads(read(path))
                assert set(d) == {'title', 'source', 'text', 'volume' if wid == 'isbe' else 'section'}
                assert d['title'].strip() and d['text'].strip()
                assert ('1915' if wid == 'isbe' else '1899') in d['source']
                assert 'LLS:14.0.24' not in d['source']
                records.append({'id': Path(path).stem, **d})
            assert len(records) == expected == supplied_index['totalArticles']
            # Verify combined text exports against every article, in their original export order.
            # They are evidence only; duplicate full-text exports are never shipped.
            exports = [read(f'{prefix}/text/volume-{v}.txt') for v in range(1, 6)] if wid == 'isbe' else [read(f'{prefix}/text/lutheran-cyclopedia.txt')]
            for r in records:
                export = exports[r['volume'] - 1] if wid == 'isbe' else exports[0]
                assert f"{r['title']}\n{'=' * len(r['title'])}\n\n{r['text']}" in export, r['id']
            front = read(f'{prefix}/text/front-matter.txt') if wid == 'isbe' else exports[0][:supplied_index['frontMatterChars']]
            assert len(front) == supplied_index['frontMatterChars']
            assert year in front and title.lower() in re.sub(r'\s+', ' ', front).lower()
            duplicate_counts = Counter(r['title'] for r in records)
            ordinals = Counter()
            by_title = defaultdict(list)
            for r in records:
                by_title[key(r['title'])].append(r['id'])
            # Stable identifiers use the supplied filename, not regenerated slugs or print volumes.
            for r in records:
                ordinals[r['title']] += 1
                count = duplicate_counts[r['title']]
                r['label'] = r['title'] + (f" · source entry {ordinals[r['title']]} of {count}" if count > 1 else '')
            # Full-entry redirects only. Ambiguous and missing targets stay explicitly unresolved.
            redirects = {}
            for r in records:
                m = re.fullmatch(re.escape(r['title']) + r'\.\s+See\s+(.+?)\.', r['text'].strip(), re.I)
                if m:
                    candidates = [i for i in by_title[key(m[1])] if i != r['id']]
                    redirects[r['id']] = {'label': m[1], 'targets': candidates, 'status': 'resolved' if len(candidates) == 1 else 'ambiguous' if candidates else 'unresolved'}
            duplicate_groups = {t: [r['id'] for r in records if r['title'] == t] for t, n in duplicate_counts.items() if n > 1}
            audit[wid] = {'articles': expected, 'textChars': sum(len(r['text']) for r in records), 'duplicateTitles': duplicate_groups, 'redirects': redirects, 'suppliedVolumeIsCitation': False, 'proseTransformations': 'None. Exact supplied text retained; paragraphs split only on double newlines.'}
            records.append({'id': 'front-matter', 'title': 'Front matter and abbreviations', 'label': 'Front matter and abbreviations', 'text': front, 'source': supplied_index['provenance']})
            entries = []
            for r in records:
                article = {'schemaVersion': 1, 'releaseId': RELEASE, 'work': wid, 'id': r['id'], 'title': r['title'], 'label': r['label'], 'textSha256': sha(r['text'].encode()), 'source': r['source'], 'paragraphs': r['text'].split('\n\n'), 'redirect': redirects.get(r['id']), 'suppliedVolume': r.get('volume'), 'suppliedSection': r.get('section')}
                path = f"articles/{wid}/{r['id']}.json"
                files[path] = encoded(article)
                entries.append({'id': r['id'], 'title': r['title'], 'label': r['label'], 'letter': next((c.upper() for c in r['title'] if c.isascii() and c.isalpha()), '#'), 'preview': r['text'][:220], 'kind': 'front-matter' if r['id'] == 'front-matter' else 'article', 'sha256': sha(files[path])})
            entries.sort(key=lambda e: (key(e['title']), e['id']))
            works.append({'id': wid, 'title': title, 'year': year, 'editors': editors, 'articleCount': expected, 'entries': entries})
    files['index.json'] = encoded({'schemaVersion': 1, 'releaseId': RELEASE, 'works': works})
    manifest = {'schemaVersion': 1, 'releaseId': RELEASE, 'source': source, 'inputs': inputs, 'implementationSha256': sha(Path(__file__).read_bytes()), 'files': {p: sha(b) for p, b in sorted(files.items())}, 'audit': audit}
    return files, manifest

if __name__ == '__main__':
    files, manifest = build()
    pin = json.loads((ROOT / 'content/encyclopedias' / RELEASE / 'manifest.json').read_text())
    assert manifest == pin, 'Encyclopedia projection differs from its reviewed pin; investigate before preparing a successor'
    for path, data in {**files, 'manifest.json': encoded(manifest)}.items():
        dest = BASE / path
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(data)
    print('Encyclopedias: 9,347 ISBE articles + 2,121 Lutheran articles; 2 front-matter readings; exact supplied prose retained.')
