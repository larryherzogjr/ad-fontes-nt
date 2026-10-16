"""Verify recovered source chains/TOCs independently of supplied article JSON.
No source scripts, browser sessions or network calls are executed.
"""
import bisect
import gzip
import hashlib
import html
import json
import re
import zipfile
from collections import Counter
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = ROOT / 'sources/encyclopedias/extraction'

def sha(data):
    return hashlib.sha256(data).hexdigest()

def plain(value):
    value = re.sub(r'<span\b[^>]*class="offset-marker"[^>]*></span>', '', value)
    value = re.sub(r'<img\b[^>]*>', '', value, flags=re.I)
    value = re.sub(r'</p>', '\n\n', value, flags=re.I)
    value = re.sub(r'<p\b[^>]*>', '', value, flags=re.I)
    value = re.sub(r'<(div|br)\b[^>]*>', '\n', value, flags=re.I)
    value = re.sub(r'<[^>]+>', '', value)
    value = html.unescape(value)
    value = re.sub(r'[ \t]+\n', '\n', value)
    return re.sub(r'\n{3,}', '\n\n', value).strip()

def verify():
    receipt = json.loads((EVIDENCE / 'inputs.json').read_text())
    loaded = {}
    for name, pin in receipt.items():
        compressed = (EVIDENCE / (name + '.gz')).read_bytes()
        assert sha(compressed) == pin['gzipSha256'], name
        raw = gzip.decompress(compressed)
        assert sha(raw) == pin['sha256'] and len(raw) == pin['bytes'], name
        loaded[name] = [json.loads(line) for line in raw.decode().splitlines()]
    report = {'schemaVersion': 1, 'inputs': receipt, 'implementationSha256': sha(Path(__file__).read_bytes()), 'works': {}}
    with zipfile.ZipFile(ROOT / 'sources/encyclopedias/raw/encyclopedias-adfontes-package.zip') as z:
        for work, prefix, stem in [('isbe', 'isbe-1915-logos', 'isbe'), ('lutheran', 'lutheran-cyclopedia', 'lc')]:
            raw_articles = loaded[stem + '-articles.jsonl']
            toc = loaded['toc-' + stem + '.jsonl']
            by_id, duplicates = {}, []
            for a in raw_articles:
                assert not a.get('error'), a['id']
                if a['id'] in by_id:
                    first = by_id[a['id']]
                    assert {k: v for k, v in a.items() if k != 'html'} == {k: v for k, v in first.items() if k != 'html'}
                    dom_ids = r'\bid="(?:marker|hw)\d+"'
                    assert re.sub(dom_ids, 'id="DYNAMIC"', a['html']) == re.sub(dom_ids, 'id="DYNAMIC"', first['html']), 'Resume duplicate differs beyond ephemeral DOM IDs'
                    assert plain(a['html']) == plain(first['html'])
                    duplicates.append({'id': a['id'], 'firstHtmlSha256': sha(first['html'].encode()), 'resumeHtmlSha256': sha(a['html'].encode()), 'difference': 'Ephemeral marker/headword DOM IDs only; prose and offsets identical'})
                    continue
                by_id[a['id']] = a
            articles = sorted(by_id.values(), key=lambda a: a['off'])
            assert articles[0]['id'] == 'TITLE' and not articles[-1].get('next')
            for i, a in enumerate(articles[:-1]):
                assert a['off'] + a['len'] == articles[i + 1]['off'], 'Source chain has a gap or overlap'
                assert a.get('next') == articles[i + 1]['id'], 'Source chain link differs'
            starts = [a['off'] for a in articles]
            level2 = [e for e in toc if e['level'] == 2]
            assert all(e['off'] in starts for e in level2), 'TOC level-2 offset is not an article start'
            def sliced(start, end):
                assert start in starts and (end in starts or end >= articles[-1]['off'] + articles[-1]['len'])
                return '\n\n'.join(t for t in [plain(a['html']) for a in articles[bisect.bisect_left(starts, start):bisect.bisect_left(starts, end)]] if t).strip()
            letters = sorted((e for e in toc if e['level'] == 1 and len(e['title']) == 1 and e['title'].isalpha()), key=lambda e: e['off'])
            back = sorted((e for e in toc if e['level'] == 1 and e['off'] > letters[-1]['off']), key=lambda e: e['off'])
            front = sorted((e for e in toc if e['level'] == 1 and e['off'] < letters[0]['off']), key=lambda e: e['off'])
            records, decorative = [], []
            for li, letter in enumerate(letters):
                end = letters[li + 1]['off'] if li + 1 < len(letters) else back[0]['off'] if back else 10**12
                kids = sorted((e for e in toc if e['level'] == 2 and letter['off'] <= e['off'] < end), key=lambda e: e['off'])
                for ki, k in enumerate(kids):
                    stop = kids[ki + 1]['off'] if ki + 1 < len(kids) else end
                    text = sliced(k['off'], stop)
                    if k['title'].strip() == letter['title'] and len(text) < 100:
                        decorative.append({'title': k['title'], 'offset': k['off'], 'textSha256': sha(text.encode())})
                    else:
                        records.append({'title': k['title'], 'offset': k['off'], 'endOffset': stop, 'textSha256': sha(text.encode())})
            supplied = [json.loads(z.read(n)) for n in z.namelist() if n.startswith(prefix + '/json/') and n.endswith('.json')]
            assert Counter((r['title'], r['textSha256']) for r in records) == Counter((r['title'], sha(r['text'].encode())) for r in supplied), 'Source-derived article text/title inventory differs'
            front_text = sliced(front[0]['off'], letters[0]['off'])
            supplied_index = json.loads(z.read(prefix + '/index.json'))
            supplied_front = z.read(prefix + '/text/front-matter.txt').decode() if work == 'isbe' else z.read(prefix + '/text/lutheran-cyclopedia.txt').decode()[:supplied_index['frontMatterChars']]
            assert front_text == supplied_front
            report['works'][work] = {'resumeDuplicates': duplicates, 'rawChainRecords': len(raw_articles), 'uniqueChainRecords': len(articles), 'tocRecords': len(toc), 'firstOffset': starts[0], 'endOffset': articles[-1]['off'] + articles[-1]['len'], 'gaps': 0, 'overlapsAfterDeduplication': 0, 'alignedLevel2Entries': len(level2), 'alphabetLevel2Entries': len(records) + len(decorative), 'outsideAlphabetLevel2Entries': [e for e in level2 if e['off'] < letters[0]['off'] or (back and e['off'] >= back[0]['off'])], 'preservedArticles': len(records), 'frontMatterSha256': sha(front_text.encode()), 'decorativeEntriesExcluded': decorative, 'entries': records}
    return report

if __name__ == '__main__':
    report = verify()
    assert report == json.loads((EVIDENCE / 'audit.json').read_text()), 'Recovered encyclopedia evidence differs'
    print('Recovered source chains, TOC boundaries, all article titles/texts and front matter match the supplied ZIP exactly.')
