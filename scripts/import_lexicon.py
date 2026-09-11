"""Reproduce the separately pinned Dodson/Word Explorer lookup bundle offline."""
import hashlib, json, pathlib, unicodedata, xml.etree.ElementTree as ET
ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'sources/dodson'
def digest(data): return hashlib.sha256(data).hexdigest()
def key(s): return unicodedata.normalize('NFC', s).lower()
def build(manifest_name='manifest-v3.json'):
    manifest = json.loads((SOURCE / manifest_name).read_text())
    for path, sha in manifest['artifacts'].items():
        if digest((ROOT / path).read_bytes()) != sha: raise ValueError('Source checksum mismatch: ' + path)
    ns = {'t':'http://www.crosswire.org/2008/TEIOSIS/namespace'}
    entries = {}
    for e in ET.parse(SOURCE / 'raw/dodson.xml').getroot().findall('t:entry', ns):
        head, number = [s.strip() for s in e.attrib['n'].rsplit('|', 1)]
        def value(path): return ' '.join(''.join(e.find(path, ns).itertext()).split())
        item = dict(headword=head, strongs=str(int(number)), orth=value('t:orth'), brief=value('t:def[@role="brief"]'), full=value('t:def[@role="full"]'), sourceId=e.attrib['n'])
        entries.setdefault(key(head), []).append(item)
    links = {}
    for w in json.loads((ROOT / manifest.get('wordExplorerArtifact', 'sources/word-explorer/words.json')).read_text()):
        expected = 'https://larryherzogjr.com/greek/' + w['slug'] + '/'
        if w['url'] != expected or not all(c.isalnum() or c == '-' for c in w['slug']): raise ValueError('Unexpected word URL')
        links.setdefault(key(w['greek']), []).append(dict(headword=w['greek'], url=w['url'], access=w['access'], title=w['translit']))
    data = dict(releaseId=manifest['releaseId'], entries=entries, links=links)
    if manifest.get('wordExplorerAliases'):
        aliases = json.loads((ROOT / manifest['wordExplorerAliases']).read_text())
        if any(key(v) not in links or key(k) in links for k, v in aliases.items()): raise ValueError('Invalid explicit word-link mapping')
        data['aliases'] = {key(k): key(v) for k, v in aliases.items()}
    raw = (json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n').encode()
    if digest(raw) != manifest['outputSha256']: raise ValueError('Lookup output differs from reviewed release')
    return raw
if __name__ == '__main__':
    for name in ['manifest.json', 'manifest-v2.json', 'manifest-v3.json', 'manifest-v4.json']:
        manifest = json.loads((SOURCE / name).read_text())
        output = ROOT / 'app/public/lexical' / manifest['releaseId'] / 'lookup.json'
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_bytes(build(name))
        (output.parent / 'manifest.json').write_bytes((SOURCE / name).read_bytes())
    print('Verified original and updated Dodson / Word Explorer lookup bundles')
