/** Stage only released public assets; never copy the repository or account runtime. */
import { cp, mkdir, readFile, rm, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const source = join(root, 'app/public');
const destination = join(root, 'app/desktop/public');
const editions = JSON.parse(await readFile(join(root, 'app/lib/domain/editions.json'), 'utf8'));
const otEditions = ['bsb','blb','msb','ylt'].map(ed => ({ editionId: ed.toUpperCase(), releaseId: `${ed}-ot-2026-10-07-v1` }));
const analysis = JSON.parse(await readFile(join(root, 'app/lib/domain/analysis-release.json'), 'utf8'));
const om = JSON.parse(await readFile(join(root, 'app/lib/domain/om-release.json'), 'utf8'));
const visuals = JSON.parse(await readFile(join(root, 'app/lib/domain/visual-release.json'), 'utf8'));
const visualSelections = [
  { releaseId: visuals.releaseId, candidateSha256: visuals.candidateSha256 },
  ...(visuals.supplements ?? []),
];
const allowed = [
  'om/hebrew-studies-2026-10-09-v2',
  'corpus/lxx2012-2026-10-09-v2',
  'corpus/original-languages-2026-10-09-v1',
  ...otEditions.map(edition => `corpus/${edition.releaseId}`),
  ...editions.map((edition: { releaseId: string }) => `corpus/${edition.releaseId}`),
  `analysis/${analysis.releaseId}`,
  'analysis/lxx-rahlfs-1935-2026-10-07-v3',
  'analysis/lxx-source-notices-2026-10-07-v1.json',
  'analysis/greek-lemma-links-2026-10-07-v1.json',
  'analysis/lxx-research-2026-10-07-v1',
  'editorial/variants.json',
  'lexical/dodson-2010-v5',
  `om/${om.releaseId}`,
  'library',
  'commentaries/lenski-2026-10-08-v1',
  'commentaries/kd-2026-10-08-v1',
  'connections/bsb-testament-connections-2026-10-07-v1',
  'connections/msb-testament-connections-2026-10-07-v1',
  'connections/publisher-heading-connections-2026-10-07-v2',
  'connections/reviewed-labels-2026-10-07-v1',
  'connections/reviewed-connections-2026-10-07-v2',
  ...visualSelections.map((visual: { releaseId: string }) => `visuals/${visual.releaseId}`),
];
// Keep predecessor releases reproducible in the web project, but bundle only active ones.
await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
for (const path of allowed) await cp(join(source, path), join(destination, path), { recursive: true, errorOnExist: true });
const files: Record<string, string> = {};
async function inventory(directory: string, prefix = '') {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const path = prefix + item.name;
    if (item.isSymbolicLink()) throw Error(`Symlink is not a distributable asset: ${path}`);
    if (item.isDirectory()) await inventory(join(directory, item.name), path + '/');
    else files[path] = createHash('sha256').update(await readFile(join(directory, item.name))).digest('hex');
  }
}
await inventory(destination);
await writeFile(join(destination, 'desktop-content.json'), JSON.stringify({
  schemaVersion: 1,
  editions: editions.map(({ editionId, releaseId }: { editionId: string; releaseId: string }) => ({ editionId, releaseId })),
  otEditions,
  sourceEditions: [{editionId:'LXX2012',releaseId:'lxx2012-2026-10-09-v2'}, ...['WLC','CVUL'].map(editionId=>({editionId,releaseId:'original-languages-2026-10-09-v1'}))],
  analysis: analysis.releaseId,
  lexical: 'dodson-2010-v5',
  visuals: visualSelections,
  files,
}, null, 2) + '\n');
console.log(`Staged ${Object.keys(files).length} released files for offline desktop use.`);
