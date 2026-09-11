/** Stage only released public assets; never copy the repository or account runtime. */
import { cp, mkdir, readFile, rm, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const source = join(root, 'app/public');
const destination = join(root, 'app/desktop/public');
const editions = JSON.parse(await readFile(join(root, 'app/lib/domain/editions.json'), 'utf8'));
const analysis = JSON.parse(await readFile(join(root, 'app/lib/domain/analysis-release.json'), 'utf8'));
const om = JSON.parse(await readFile(join(root, 'app/lib/domain/om-release.json'), 'utf8'));
const allowed = [
  ...editions.map((edition: { releaseId: string }) => `corpus/${edition.releaseId}`),
  `analysis/${analysis.releaseId}`,
  'editorial/variants.json',
  'lexical/dodson-2010-v4',
  `om/${om.releaseId}`,
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
  analysis: analysis.releaseId,
  lexical: 'dodson-2010-v4',
  files,
}, null, 2) + '\n');
console.log(`Staged ${Object.keys(files).length} released files for offline desktop use.`);
