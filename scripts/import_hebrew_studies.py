"""Reproduce pinned Hebrew studies and the authorized BSB successor offline."""
from pathlib import Path
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parent.parent
RELEASE = 'hebrew-studies-2026-10-09-v2'
PREDECESSOR = 'hebrew-studies-2026-10-09-v1'


def digest(data):
    return hashlib.sha256(data).hexdigest()


def outputs(release=RELEASE):
    source = ROOT / 'sources/om-hebrew' / release
    manifest = json.loads((source / 'manifest.json').read_text())
    if release == RELEASE:
        # Historical author bytes stay reproducible; adaptation does not replace them.
        outputs(PREDECESSOR)
        for path, expected in manifest['evidence'].items():
            if digest((source / path).read_bytes()) != expected:
                raise ValueError('Changed adaptation evidence')
        bsb = (ROOT / manifest['bsbSource']['path']).read_bytes()
        if digest(bsb) != manifest['bsbSource']['sha256']:
            raise ValueError('Changed BSB authority')
        verses = dict(line.split('\t', 1) for line in bsb.decode('utf-8-sig').splitlines() if '\t' in line)
        quotations = json.loads((source / 'quotations.json').read_text())
        for q in quotations:
            scripture = ' '.join(verses[f"{q['book']} {q['chapter']}:{n}"].strip() for n in range(q['start'], q['end'] + 1))
            if q['text'] not in scripture:
                raise ValueError('Quotation differs from pinned BSB')
        changes = json.loads((source / 'changes.json').read_text())
    result = {}
    for a in manifest['articles']:
        raw = (source / manifest.get('contentDirectory', 'raw') / f"{a['slug']}.md").read_bytes()
        if digest(raw) != a['contentSha256']:
            raise ValueError('Changed article; prepare a reviewed successor release')
        if release == RELEASE:
            original = (source.parent / PREDECESSOR / 'raw' / f"{a['slug']}.md").read_bytes()
            if digest(original) != a['sourceSha256']:
                raise ValueError('Changed original article')
            adapted = original.decode()
            for change in changes:
                if change['slug'] == a['slug']:
                    if adapted.count(change['before']) != 1:
                        raise ValueError('Ambiguous adaptation')
                    adapted = adapted.replace(change['before'], change['after'])
            if adapted.encode() != raw or re.search(r'\bNET\b', adapted):
                raise ValueError('Undocumented adaptation or remaining NET reference')
            for q in quotations:
                if q['slug'] == a['slug'] and q['text'] not in adapted:
                    raise ValueError('Recorded quotation absent from article')
        front, body = raw.decode().split('---', 2)[1:]
        if 'draft: false' not in front or f'slug: "{a["slug"]}"' not in front:
            raise ValueError('Article identity/publication mismatch')
        result[f"articles/{a['slug']}.json"] = json.dumps(dict(schemaVersion=2, releaseId=release, article=dict(a, markdown=body.lstrip('\r\n'))), ensure_ascii=False, indent=2) + '\n'
    result['index.json'] = json.dumps(dict(schemaVersion=2, releaseId=release, articles=manifest['articles']), ensure_ascii=False, indent=2) + '\n'
    if {k: digest(v.encode()) for k, v in result.items()} != manifest['outputs']:
        raise ValueError('Changed article output')
    return result


if __name__ == '__main__':
    for path, value in outputs().items():
        target = ROOT / 'app/public/om' / RELEASE / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(value)
    print('Reproduced seven BSB-adapted Hebrew studies; original source pins verified.')
