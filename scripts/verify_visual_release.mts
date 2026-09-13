import { createHash } from 'node:crypto';
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';
import { reviewPayload } from '../app/lib/domain/variants.ts';

const root = resolve(import.meta.dirname, '..');
const releaseArgument = process.argv.slice(2).find(arg => !arg.startsWith('--'));
const release = resolve(root, releaseArgument ?? 'sources/visuals/csntm-2026-09-12-v1');
const writeManifest = process.argv.includes('--write-manifest');
const sha256 = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');

async function filesBelow(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesBelow(path));
    else if (!['MANIFEST.json', 'APPROVAL.json'].includes(entry.name)) files.push(path);
  }
  return files;
}

function localPath(value: string, label: string) {
  if (/^[a-z]+:/i.test(value) || value.startsWith('/') || value.split('/').includes('..')) {
    throw new Error(`${label} must be a release-relative local path: ${value}`);
  }
  return resolve(release, value);
}

const registryPath = join(release, 'registry.candidate.json');
const registry = JSON.parse(await readFile(registryPath, 'utf8'));
if (registry.schemaVersion !== 1 || registry.releaseId !== 'csntm-2026-09-12-v1' || registry.status !== 'candidate') {
  throw new Error('Unexpected visual registry identity or status.');
}
if (registry.rightsDecision?.status !== 'accepted-project-owner-report' || registry.editorialReview?.status !== 'pending') {
  throw new Error('The candidate must preserve the accepted owner rights decision and pending caption review state.');
}

const units = JSON.parse(await readFile(join(root, 'content/editorial/variants.json'), 'utf8'));
const known = new Map(units.map((unit: { id: string }) => [unit.id, unit]));
for (const [unitId, plate] of Object.entries(registry.plates) as [string, any][]) {
  const unit: any = known.get(unitId);
  if (!unit || unit.status !== 'approved') throw new Error(`${unitId} is not an approved commentary unit.`);
  const currentHash = sha256(reviewPayload(unit));
  if (plate.commentaryPayloadSha256 !== currentHash) {
    throw new Error(`${unitId} commentary binding is stale: expected ${currentHash}.`);
  }
  for (const image of plate.images ?? []) {
    const path = localPath(image.asset, `${unitId} image`);
    if (!(await stat(path)).isFile()) throw new Error(`${unitId} image is not a file: ${image.asset}`);
    if (!image.alt || !image.width || !image.height) throw new Error(`${unitId} image lacks accessible metadata.`);
  }
  for (const evidence of plate.evidence ?? []) {
    if (!(await stat(localPath(evidence, `${unitId} evidence`))).isFile()) throw new Error(`${unitId} evidence is missing: ${evidence}`);
  }
  for (const field of ['caption', 'demonstrates', 'doesNotEstablish', 'credit', 'reuseStatement', 'sourceUrl']) {
    if (!plate[field]) throw new Error(`${unitId} lacks ${field}.`);
  }
}

const fileEntries = await Promise.all((await filesBelow(release)).map(async path => {
  const name = relative(release, path).split(sep).join('/');
  return [name, sha256(await readFile(path))] as const;
}));
fileEntries.sort(([a], [b]) => a.localeCompare(b));
const files = Object.fromEntries(fileEntries);
const candidatePayload = JSON.stringify({ schemaVersion: 1, releaseId: registry.releaseId, files });
const manifest = { schemaVersion: 1, releaseId: registry.releaseId, candidateSha256: sha256(candidatePayload), files };

if (writeManifest) {
  await writeFile(join(release, 'MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`);
} else {
  const saved = JSON.parse(await readFile(join(release, 'MANIFEST.json'), 'utf8'));
  if (JSON.stringify(saved) !== JSON.stringify(manifest)) throw new Error('Visual release manifest or a bound file checksum is stale.');
}

try {
  const approval = JSON.parse(await readFile(join(release, 'APPROVAL.json'), 'utf8'));
  if (approval.schemaVersion !== 1 || approval.releaseId !== registry.releaseId || approval.candidateSha256 !== manifest.candidateSha256 || approval.approvedBy !== 'Larry Herzog Jr.' || !approval.statement?.includes(manifest.candidateSha256)) {
    throw new Error('Visual release approval does not bind this exact candidate.');
  }
} catch (error: any) {
  if (error?.code !== 'ENOENT') throw error;
}

console.log(`Visual release candidate verified: ${Object.keys(registry.plates).length} plates, ${fileEntries.length} bound files.`);
console.log(`Candidate SHA-256: ${manifest.candidateSha256}`);
