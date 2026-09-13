import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

const rootArgument = process.argv.find(argument => argument.startsWith('--root='));
const root = rootArgument?.slice('--root='.length) || join('sources', 'visuals', 'csntm-sinaiticus-2026-09-12-v2-candidate');
const priorRoot = join('sources', 'visuals', 'csntm-2026-09-12-v1', 'originals');
const fetchMode = process.argv.includes('--fetch');
const delay = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds));
const evidence = JSON.parse(await readFile(join(root, 'sinaiticus-evidence.json'), 'utf8'));

function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, stable(item)]));
  }
  return value;
}

await Promise.all([
  mkdir(join(root, 'originals'), { recursive: true }),
  mkdir(join(root, 'evidence', 'image-details'), { recursive: true }),
  mkdir(join(root, 'evidence', 'iiif-info'), { recursive: true }),
]);

const images = new Map<number, { sourceImageId: number; sourceImageName: string; sourceDetailsUrl: string }>();
for (const unit of evidence.units) {
  for (const image of unit.pages) images.set(image.sourceImageId, image);
}

async function exists(path: string) {
  try { await readFile(path); return true; } catch { return false; }
}

async function obtain(url: string, path: string) {
  if (await exists(path)) return 'cached';
  if (!fetchMode) throw new Error(`Missing candidate source file: ${path}`);
  const response = await fetch(url, {
    headers: { 'user-agent': 'Ad-Fontes-NT free educational manuscript evidence (project-owner-authorized)' },
  });
  if (!response.ok) throw new Error(`CSNTM ${response.status}: ${url}`);
  await writeFile(path, Buffer.from(await response.arrayBuffer()));
  await delay(500);
  return 'fetched';
}

let fetched = 0;
for (const image of [...images.values()].sort((a, b) => a.sourceImageId - b.sourceImageId)) {
  const details = join(root, 'evidence', 'image-details', `${image.sourceImageId}.html`);
  if (await obtain(image.sourceDetailsUrl, details) === 'fetched') fetched++;
  const iiifBase = `https://images.csntm.org/IIIFServer.ashx/GA_01/${image.sourceImageName}`;
  const info = join(root, 'evidence', 'iiif-info', `${image.sourceImageName}.json`);
  if (await obtain(`${iiifBase}/info.json`, info) === 'fetched') fetched++;
  const original = join(root, 'originals', image.sourceImageName);
  if (!(await exists(original))) {
    const prior = join(priorRoot, image.sourceImageName);
    if (await exists(prior)) await copyFile(prior, original);
    else if (await obtain(`${iiifBase}/full/full/0/native.jpg`, original) === 'fetched') fetched++;
  }
}

const sourceFiles: Record<string, string> = {};
for (const image of [...images.values()].sort((a, b) => a.sourceImageId - b.sourceImageId)) {
  for (const relative of [
    join('originals', image.sourceImageName),
    join('evidence', 'image-details', `${image.sourceImageId}.html`),
    join('evidence', 'iiif-info', `${image.sourceImageName}.json`),
  ]) {
    sourceFiles[relative] = createHash('sha256').update(await readFile(join(root, relative))).digest('hex');
  }
}
const manifestPath = join(root, 'MANIFEST.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
manifest.sourceFiles = sourceFiles;
const candidateCore = { ...manifest };
delete candidateCore.candidateSha256;
manifest.candidateSha256 = createHash('sha256')
  .update(JSON.stringify(stable(candidateCore)))
  .digest('hex');
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

process.stdout.write(`Verified ${images.size} unique Sinaiticus pages; fetched ${fetched} new file(s).\n`);
process.stdout.write(`Candidate SHA-256: ${manifest.candidateSha256}\n`);
