"""Approval-bound promotion preserves exact reviewed content and predecessors."""
import hashlib,json,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/'sources/ot/releases/ot-english-2026-10-07-candidate-v3'
RELEASE=ROOT/'sources/ot/releases/ot-english-2026-10-07-v1'
def sha(data):return hashlib.sha256(data).hexdigest()
class Promotion(unittest.TestCase):
 def test_approval_and_every_promoted_file(self):
  approval=json.loads((RELEASE/'approval.json').read_text());self.assertEqual(approval['decision'],'approved');self.assertEqual(approval['reviewer'],'Larry Herzog Jr.')
  for name,digest in approval['candidateMetadata'].items():self.assertEqual(sha((BASE/name).read_bytes()),digest,name)
  checks=json.loads((RELEASE/'output-checksums.json').read_text());self.assertEqual(len(checks),3724)
  for path,digest in checks.items():
   raw=(ROOT/'app/public/corpus'/path).read_bytes();self.assertEqual(sha(raw),digest,path)
   candidatePath=path.replace('-2026-10-07-v1/','-2026-10-07-candidate-v3/')
   previous=json.loads((ROOT/'artifacts/ot/ot-english-2026-10-07-candidate-v3'/candidatePath).read_text());current=json.loads(raw)
   if path.endswith('/manifest.json'):
    self.assertEqual(current['status'],'approved English OT source/display release')
    self.assertEqual(current['approvedCandidate'],previous['releaseId'])
    current.pop('approvedCandidate');current.pop('approvalDate');current['status']=previous['status'];current['inventory']['releaseId']=previous['inventory']['releaseId']
   if not path.endswith('/search.json'):current['releaseId']=previous['releaseId']
   self.assertEqual(current,previous,path)
 def test_registry_preserves_nt_predecessor_and_native_identity(self):
  union=json.loads((RELEASE/'whole-bible-registry.json').read_text());nt=json.loads((ROOT/'app/lib/domain/canonical-registry.json').read_text())
  self.assertEqual([{**b,'order':b['order']-39} for b in union[39:]],nt)
  config=json.loads((ROOT/'app/desktop/src-tauri/tauri.conf.json').read_text())
  self.assertEqual(config['productName'],'Ad Fontes');self.assertEqual(config['identifier'],'app.ad-fontes.desktop')
  self.assertEqual(config['plugins']['updater']['endpoints'],['https://ad-fontes.app/desktop-updates/stable/latest.json'])
if __name__=='__main__':unittest.main()
