"""Reproduce all pinned projections from the supplied ZIP, without account/network access."""
import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from scripts.import_encyclopedias import build, ROOT, RELEASE
import json

class EncyclopediaSourceTest(unittest.TestCase):
    def test_exact_source_projection(self):
        files, manifest = build()
        self.assertEqual(manifest, json.loads((ROOT / 'content/encyclopedias' / RELEASE / 'manifest.json').read_text()))
        self.assertEqual(len(files), 11471)
        self.assertEqual(manifest['audit']['isbe']['textChars'], 22288529)
        self.assertEqual(manifest['audit']['lutheran']['textChars'], 3424217)

if __name__ == '__main__':
    unittest.main()
