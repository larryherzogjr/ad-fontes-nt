"""Create a new, immutable snapshot from explicitly approved author-site articles."""
import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path

import yaml

parser = argparse.ArgumentParser()
parser.add_argument('--source', type=Path, required=True)
parser.add_argument('--release', required=True)
parser.add_argument('--snapshot-date', required=True)
parser.add_argument('--approval-record', type=Path, required=True)
parser.add_argument('--predecessor', default='om-studies-2026-09-08-prototype-v1')
args = parser.parse_args()
if not re.fullmatch(r'[a-z0-9-]+', args.release):
    raise SystemExit('Invalid release name')
root = Path(__file__).resolve().parent.parent
if not re.fullmatch(r'[a-z0-9-]+', args.predecessor) or not (root / 'sources/om-studies' / args.predecessor / 'manifest.json').is_file():
    raise SystemExit('Predecessor must name an existing immutable OM release.')
destination = root / 'sources/om-studies' / args.release
if destination.exists():
    raise SystemExit('Release already exists; preserve it and choose a new release name.')
sha = lambda data: hashlib.sha256(data).hexdigest()
encoded = lambda data: (json.dumps(data, ensure_ascii=False, indent=2) + '\n').encode()
files, articles, bodies, raw = {}, [], {}, {}
for path in sorted((args.source / 'content/greek').glob('*.md')):
    if path.stem == '_index':
        continue
    data = path.read_bytes()
    match = re.match(r'^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$', data.decode())
    if not match:
        raise SystemExit(f'Invalid front matter: {path}')
    meta = yaml.safe_load(match[1])
    if meta.get('draft') is not False or meta.get('editorial_review') != 'approved' or not re.fullmatch(r'\d{4}-\d{2}-\d{2}', str(meta.get('editorial_approval_date', ''))):
        raise SystemExit(f'Missing current approval: {path}')
    if meta['slug'] != path.stem:
        raise SystemExit(f'Slug mismatch: {path}')
    source_path = f'raw/{path.name}'
    raw[source_path] = data
    files[source_path] = sha(data)
    articles.append(dict(slug=meta['slug'], title=meta['title'], headword=meta['greek'],
                         subtitle=meta.get('subhead', ''), author='Larry Herzog Jr.',
                         url=f'https://larryherzogjr.com/greek/{meta["slug"]}/',
                         sourcePath=source_path, approvalDate=str(meta['editorial_approval_date']),
                         contentSha256=sha(data)))
    bodies[meta['slug']] = match[2]
review = (args.source / 'COPY-REVIEW.md').read_bytes()
raw['evidence/COPY-REVIEW.md'] = review
files['evidence/COPY-REVIEW.md'] = sha(review)
decision = args.approval_record.read_bytes()
if not decision.strip():
    raise SystemExit('An explicit approval record is required.')
raw['evidence/APPROVAL.md'] = decision
files['evidence/APPROVAL.md'] = sha(decision)
manifest = dict(schemaVersion=2, releaseId=args.release, snapshotDate=args.snapshot_date,
                predecessor=args.predecessor,
                sourceRepositoryRevision=subprocess.check_output(['git', '-C', str(args.source), 'rev-parse', 'HEAD'], text=True).strip(),
                sourceWorkingTree='Exact source files and the supplied approval record are preserved and hashed in this snapshot.',
                scope=f'{len(articles)} approved Greek articles for the Ad Fontes NT website and desktop app; originals remain on larryherzogjr.com.',
                approvalEvidence='evidence/APPROVAL.md', files=files, articles=articles)
summaries = [{**article, 'snapshotDate': manifest['snapshotDate']} for article in articles]
outputs = {'index.json': encoded(dict(schemaVersion=2, releaseId=args.release, articles=summaries))}
for article in articles:
    outputs[f'articles/{article["slug"]}.json'] = encoded(dict(schemaVersion=2, releaseId=args.release,
        article={**article, 'markdown': bodies[article['slug']], 'snapshotDate': manifest['snapshotDate']}))
manifest['outputChecksums'] = {path: sha(data) for path, data in outputs.items()}
for path, data in raw.items():
    target = destination / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(data)
(destination / 'manifest.json').write_bytes(encoded(manifest))
print(f'Saved {len(articles)} approved articles to {destination}; outputs will be independently reproduced by the importer.')
