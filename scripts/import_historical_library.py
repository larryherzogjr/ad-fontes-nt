"""Reproduce the historical reading collection from immutable reviewed inputs, offline."""
import hashlib
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RELEASE = 'historical-library-2026-10-15-v2'
SOURCE = ROOT / 'sources/historical-library' / RELEASE
PIN = ROOT / 'content/historical-library' / RELEASE / 'manifest.json'


def sha(data):
    return hashlib.sha256(data).hexdigest()


def encoded(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()


def xml_text(element):
    """Retain text and notes in source order; discard only nontext page/style markup."""
    parts = []
    def visit(el):
        tag = el.tag.split('.')[-1]
        if tag in ('pb', 'style'):
            return
        if tag == 'note':
            parts.append(' [Source note: ')
        if tag in ('p', 'h1', 'h2', 'h3', 'h4', 'div2', 'div3', 'div4', 'li', 'l', 'tr'):
            parts.append('\n\n')
        if el.text:
            parts.append(re.sub(r'\s+', ' ', el.text))
        for child in el:
            visit(child)
            if child.tail:
                parts.append(re.sub(r'\s+', ' ', child.tail))
        if tag == 'note':
            parts.append('] ')
        if tag in ('p', 'h1', 'h2', 'h3', 'h4', 'li', 'l', 'tr'):
            parts.append('\n\n')
    visit(element)
    return re.sub(r'\n{3,}', '\n\n', re.sub(r' *\n *', '\n', ''.join(parts))).strip()


def toronto_sections():
    source = json.loads((SOURCE / 'toronto.json').read_bytes())
    links = json.loads((SOURCE / 'legacy-links.json').read_bytes())
    units = []
    for unit in source['ledger']['units']:
        chunks = unit['pageText']
        assert chunks, unit['key']
        paragraphs = ['\n'.join(c['lines']) for c in chunks]
        pages = [source['pages'][c['pageId']] for c in chunks]
        units.append(dict(id=links.get(unit['key'], unit['key']), label=unit['label'], group=unit['group'],
                          text='\n\n'.join(paragraphs), pages=pages,
                          paragraphPageIds=[c['pageId'] for c in chunks]))
    assert len(units) == 141 and len({u['id'] for u in units}) == 141
    return units


def walther_sections(path):
    text = path.read_text()
    heads = list(re.finditer(r'(?m)^([A-Z]+(?:-\s*[A-Z]+)?) EVENING LECTURE\.\s*\n\s*\([A-Za-z]+ \d{1,2}\s*[,.]\s*18[8S][45]\.\)', text))
    assert len(heads) == 39, 'Walther date-anchored lecture inventory changed'
    end = re.search(r'(?m)^INDEXES\.?\s*$', text).start()
    def clean(value):
        return re.sub(r'\n{3,}', '\n\n', re.sub(r'(?m)^\s*(?:[A-Z]+(?:-\s*[A-Z]+)? EVENING LECTURE\.?|\d{1,4})\s*$', '', value)).strip()
    units = [dict(label='Front matter and introduction', group='Front matter', text=clean(text[:heads[0].start()]))]
    for i, head in enumerate(heads):
        hi = heads[i+1].start() if i < 38 else end
        units.append(dict(label=head.group(1).replace('- ', '-').title() + ' Evening Lecture', group='Lectures', text=clean(text[head.start():hi])))
    assert ''.join(text[m.start():heads[i+1].start() if i<38 else end] for i,m in enumerate(heads)) == text[heads[0].start():end]
    return units


def josephus_sections(path, source_id):
    """Losslessly partition the distributor body; never infer Bible anchors."""
    text = path.read_bytes().decode('utf-8').replace('\r\n', '\n')
    start = re.search(r'^\*\*\* START OF[^\n]+\*\*\*', text, re.M)
    end = re.search(r'^\*\*\* END OF[^\n]+\*\*\*', text, re.M)
    assert start and end
    body = text[start.end():end.start()]
    def divide(value, pattern, kind, prefix):
        marks = list(re.finditer(pattern, value, re.M))
        if not marks:
            return [dict(kind=prefix, label=prefix, text=value)] if value else []
        units = [dict(kind=prefix, label=prefix, text=value[:marks[0].start()])] if marks[0].start() else []
        for i, mark in enumerate(marks):
            units.append(dict(kind=kind, label=mark.group(0).splitlines()[0].strip(), text=value[mark.start():marks[i+1].start() if i+1<len(marks) else len(value)]))
        return units
    output = []
    if source_id == 2846:
        foot = re.search(r'^Footnotes\s*$', body, re.M).start()
        first = re.search(r'^1\. ', body, re.M).start()
        output.append(dict(label='Title and credits', group='Front matter', text=body[:first]))
        for section in divide(body[first:foot], r'^\d+\. ', 'section', 'Opening material'):
            output.append(dict(label=f'Section {section["label"]}', group='Life', text=section['text']))
        output.append(dict(label='Translator footnotes', group='Source notes', text=body[foot:]))
    else:
        pattern = r'^PREFACE\.' if source_id == 2848 else r'^PREFACE\s*$' if source_id == 2850 else r'^BOOK 1\.'
        first = re.search(pattern, body, re.M).start()
        output.append(dict(label='Title and contents', group='Front matter', text=body[:first]))
        for book in divide(body[first:], r'^BOOK (?:[IVXLC]+|\d+)\.', 'book', 'Preface'):
            value = book['text']
            group = book['label'].split('.')[0].title() if book['kind'] == 'book' else 'Preface'
            note_pattern = r'^FOOTNOTES:?\s*$' if source_id == 2848 else r'^WAR (?:PREFACE|BOOK \d+) FOOTNOTES[^\n]*' if source_id == 2850 else r'^APION BOOK \d+ FOOTNOTES[^\n]*'
            notes = list(re.finditer(note_pattern, value, re.M))
            assert len(notes) <= 1
            main = value[:notes[0].start()] if notes else value
            if book['kind'] == 'book' and not re.search(r'^1\. ', main, re.M):
                output.append(dict(label='Repeated source contents', group=group, text=main))
            elif book['kind'] == 'book':
                chpat = r'^\d+\. ' if source_id == 2849 else r'^CHAPTER (?:\d+|[IVXLC]+)\.'
                for chapter in divide(main, chpat, 'section', 'Book opening'):
                    label = chapter['label']
                    if source_id == 2849 and chapter['kind'] == 'section':
                        label = 'Section ' + label
                    output.append(dict(label=label, group=group, text=chapter['text']))
            else:
                output.append(dict(label='Preface', group=group, text=main))
            if notes:
                output.append(dict(label='Translator footnotes', group=group, text=value[notes[0].start():]))
    assert ''.join(u['text'] for u in output) == body, 'Josephus body partition lost source characters'
    return output


def build():
    provenance = json.loads((SOURCE / 'source.json').read_bytes())
    for path, digest in provenance['files'].items():
        assert sha((SOURCE / path).read_bytes()) == digest, f'Historical source changed: {path}'
    metadata = json.loads((SOURCE / 'decisions.json').read_bytes())
    files, works = {}, []
    for spec in metadata['works']:
        work = {k: v for k, v in spec.items() if k not in ('inputs',)}
        work['sections'] = []
        units = toronto_sections() if spec['id'] == 'edersheim' else []
        for item in spec['inputs']:
            if item.get('mode') == 'walther':
                units.extend(walther_sections(SOURCE / item['path']))
                continue
            if item.get('mode') == 'josephus':
                units.extend(josephus_sections(SOURCE / item['path'], item['gutenbergId']))
                continue
            doc = json.loads((SOURCE / item['path']).read_bytes())
            if item.get('mode') == 'krauth':
                suffix = '\n\nVI.\n\nTHE CONFESSIONS OF THE CONSERVATIVE\nREFORMATION.'
                assert doc['sections'][4]['text'].endswith(suffix), 'Krauth VI heading evidence changed'
                doc['sections'][4]['text'] = doc['sections'][4]['text'][:-len(suffix)]
                doc['sections'][5]['text'] = suffix.lstrip() + '\n\n' + doc['sections'][5]['text']
            if item.get('mode') == 'prepared':
                units.extend(doc['sections'])
                continue
            group = item.get('group', '')
            if doc.get('front_matter'):
                units.append(dict(label='Front matter and introduction', group=group, text=doc['front_matter']))
            for section in doc['sections']:
                units.append(dict(label=section['heading'] or 'Opening material', group=group, text=section['text']))
        for i, unit in enumerate(units):
            assert isinstance(unit['text'], str) and unit['text'].strip(), (spec['id'], i)
            section_id = unit.get('id', f's{i + 1:04d}')
            path = f'sections/{spec["id"]}/{section_id}.json'
            # Preserve exact paragraph strings and all whitespace: this roundtrip is intentional.
            paragraphs = unit['text'].split('\n\n')
            assert '\n\n'.join(paragraphs) == unit['text']
            payload = dict(schemaVersion=1, releaseId=RELEASE, work=spec['id'], id=section_id,
                           label=unit['label'], group=unit.get('group', ''), paragraphs=paragraphs,
                           textSha256=sha(unit['text'].encode()))
            if 'pages' in unit:
                payload.update(pages=unit['pages'], paragraphPageIds=unit['paragraphPageIds'])
            files[path] = encoded(payload)
            work['sections'].append(dict(id=section_id, label=payload['label'], group=payload['group'],
                                         path=path, sha256=sha(files[path]), paragraphs=len(paragraphs)))
        assert len(work['sections']) == spec['expectedSections'], f'Unexpected inventory: {spec["id"]}'
        works.append(work)
    for path in json.loads((SOURCE / 'toronto.json').read_bytes())['pages'].values():
        files[path['path']] = (SOURCE / path['path']).read_bytes()
    files['catalog.json'] = encoded(dict(schemaVersion=1, releaseId=RELEASE, works=works))
    # Distributor notices travel with both the web and offline projections.
    for notice in metadata.get('notices', []):
        files[notice['output']] = (SOURCE / notice['input']).read_bytes()
    implementation = {'scripts/import_historical_library.py': sha(Path(__file__).read_bytes())}
    manifest = dict(schemaVersion=1, releaseId=RELEASE, source=provenance,
                    decisionsSha256=sha((SOURCE / 'decisions.json').read_bytes()), implementation=implementation,
                    files={k: sha(v) for k, v in sorted(files.items())},
                    workCount=len(works), sectionCount=sum(len(w['sections']) for w in works))
    return files, manifest


def publish():
    files, manifest = build()
    assert PIN.exists() and json.loads(PIN.read_bytes()) == manifest, 'Historical Library differs from reviewed release pins'
    # Remove the superseded CCEL projection from the active web assets as well as desktop staging.
    import shutil
    shutil.rmtree(ROOT / 'app/public/library/historical/historical-library-2026-10-15-v1', ignore_errors=True)
    destination = ROOT / 'app/public/library/historical' / RELEASE
    for path, data in {**files, 'manifest.json': encoded(manifest)}.items():
        output = destination / path
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_bytes(data)
    print(f'Historical Library: {manifest["workCount"]} works; {manifest["sectionCount"]} source reading units.')


if __name__ == '__main__':
    publish()
