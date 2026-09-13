import { createHash } from 'node:crypto';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

const root = join('sources', 'visuals', 'csntm-discovery-2026-09-12-v1-candidate');
const sha256 = (bytes: Buffer | string) => createHash('sha256').update(bytes).digest('hex');
const readJson = async (path: string) => JSON.parse(await readFile(path, 'utf8'));

const [inventory, searchManifest, pages, pageManifest] = await Promise.all([
  readJson(join(root, 'inventory.json')),
  readJson(join(root, 'MANIFEST.json')),
  readJson(join(root, 'page-candidates.json')),
  readJson(join(root, 'PAGE-MANIFEST.json')),
]);

if (inventory.units.length !== 39 || pages.units.length !== 39) throw new Error('Discovery must cover all 39 units.');
if (Object.keys(searchManifest.rawFiles).length !== 86) throw new Error('Expected 86 preserved passage-search responses.');
if (inventory.units.reduce((sum: number, unit: { discoveredManuscriptCount: number }) => sum + unit.discoveredManuscriptCount, 0) !== 2345) {
  throw new Error('Unit/manuscript discovery total changed.');
}
if (sha256(await readFile(join(root, 'inventory.json'))) !== searchManifest.inventorySha256) throw new Error('Inventory checksum mismatch.');
if (sha256(await readFile(join(root, 'page-candidates.json'))) !== pageManifest.pageCandidatesSha256) throw new Error('Page-candidate checksum mismatch.');

for (const [relative, expected] of Object.entries(searchManifest.rawFiles) as Array<[string, string]>) {
  if (sha256(await readFile(join(root, relative))) !== expected) throw new Error(`Search response checksum mismatch: ${relative}`);
}
for (const [relative, expected] of Object.entries(pageManifest.rawFiles) as Array<[string, string]>) {
  if (sha256(await readFile(join(root, relative))) !== expected) throw new Error(`Page response checksum mismatch: ${relative}`);
}

const { candidateSha256, ...manifestCore } = pageManifest;
if (sha256(JSON.stringify(manifestCore)) !== candidateSha256) throw new Error('Discovery candidate hash mismatch.');
if (candidateSha256 !== 'a5e405061ded406fe8a2ba6d1bcee2c03253b490c84dc9779fd8e082deae4cf0') {
  throw new Error(`Unexpected discovery candidate hash: ${candidateSha256}`);
}

const priority = pages.units.flatMap((unit: { priorityCandidates: unknown[] }) => unit.priorityCandidates);
const imageRecords = priority.flatMap((candidate: { images: unknown[] }) => candidate.images);
if (priority.length !== 147 || imageRecords.length !== 200) throw new Error('Priority/page-image totals changed.');
for (const image of imageRecords as Array<{ readingStatus: string; rightsStatus: string }>) {
  if (image.readingStatus !== 'unverified' || image.rightsStatus !== 'needs-item-record') {
    throw new Error('Discovery record was promoted without a reviewed release.');
  }
}

async function rejectImageFiles(directory: string) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await rejectImageFiles(path);
    else if (/\.(?:jpe?g|png|webp|avif|tiff?)$/i.test(entry.name)) throw new Error(`Discovery candidate contains an image asset: ${path}`);
  }
}
await rejectImageFiles(root);
await stat(join(root, 'REPORT.md'));

process.stdout.write(`CSNTM discovery verified: 39 units, 86 searches, 2,345 matches, 147 priority candidates, 200 image records.\n`);
process.stdout.write(`Candidate SHA-256: ${candidateSha256}\n`);
