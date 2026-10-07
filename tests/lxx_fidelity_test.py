import gzip, hashlib, json, pathlib, unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
BASE=ROOT/'sources/lxx/lxx-rahlfs-1935-2026-10-07-v3'
OUT=ROOT/'app/public/analysis'/BASE.name
class LxxFidelity(unittest.TestCase):
    def test_every_released_byte_and_source_pin(self):
        implementation=json.loads((BASE/'implementation.json').read_text())['sha256']
        self.assertEqual(hashlib.sha256((ROOT/'scripts/lxx/import_lxx.py').read_bytes()).hexdigest(),implementation)
        self.assertEqual(hashlib.sha256((BASE/'import_lxx.py').read_bytes()).hexdigest(),implementation)
        pins=json.loads((BASE/'source-manifest.json').read_text())
        for name,digest in pins['files'].items(): self.assertEqual(hashlib.sha256((BASE/name).read_bytes()).hexdigest(),digest,name)
        outputs=json.loads((BASE/'output-checksums.json').read_text())
        self.assertEqual(set(outputs),{str(p.relative_to(OUT)) for p in OUT.rglob('*.json')})
        for name,digest in outputs.items(): self.assertEqual(hashlib.sha256((OUT/name).read_bytes()).hexdigest(),digest,name)
    def test_all_word_surfaces_and_original_analysis_survive_independently_of_mapping(self):
        manifest=json.loads((OUT/'manifest.json').read_text())
        unpaired=json.loads((OUT/'unpaired.json').read_text())['segments']
        coverage=json.loads((ROOT/'app/lib/domain/lxx-coverage.json').read_text())
        registry=json.loads((ROOT/'sources/ot/releases/ot-english-2026-10-07-v1/whole-bible-registry.json').read_text())[:39]
        codes={b['name'].lower().replace(' ','-'):b['code'] for b in registry}
        count=0
        for slug in manifest['selectedBooks']:
            segments={s['sourceRef']:s for s in unpaired if s['sourceRef'].startswith(slug+'/')}
            canonical={'joshua-vaticanus-b':'joshua','esther-greek':'esther','job-lxx':'job','psalms-lxx':'psalms','jeremiah-lxx':'jeremiah'}.get(slug,slug)
            selected=['EZR','NEH'] if slug=='2-esdras' else [codes[canonical]]
            for name,n in coverage.items():
                if name.split('/')[0] not in selected: continue
                d=json.loads((OUT/name).read_text());self.assertEqual(len(d['segments']),n)
                for s in d['segments']:
                    if s['sourceRef'].startswith(slug+'/'): segments[s['sourceRef']]=s
            source=json.loads(gzip.decompress((BASE/'raw'/(slug+'.json.gz')).read_bytes()))
            self.assertEqual(len(source),len(segments),slug)
            for v in source:
                ref=v['ref'].rsplit(' ',1)[1];s=segments[slug+'/'+ref]
                self.assertEqual(s['text'],' '.join(w['surface'] for w in v['words']))
                self.assertEqual(len(s['tokens']),len(v['words']))
                for t,w in zip(s['tokens'],v['words']):
                    self.assertEqual(t['sourceAnalysis'],w)
                    self.assertEqual(s['text'][t['start']:t['end']],w['surface'])
                    if not s['glossAligned']: self.assertIsNone(t['gloss']);self.assertEqual(t['strongs'],'')
                    count+=1
        self.assertEqual(count,manifest['counts']['tokens'])
if __name__=='__main__': unittest.main()
