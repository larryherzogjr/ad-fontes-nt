import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const releaseId = 'csntm-discovery-2026-09-12-v1';
const root = join('sources', 'visuals', `${releaseId}-candidate`);
const groupRoot = join(root, 'raw', 'groups');
const locatorRoot = join(root, 'raw', 'locators');
const detailRoot = join(root, 'raw', 'image-details');
const fetchMode = process.argv.includes('--fetch');
const limit = 4;
const delay = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds));

const inventory = JSON.parse(await readFile(join(root, 'inventory.json'), 'utf8'));
const existing = JSON.parse(await readFile('app/public/visuals/csntm-2026-09-12-v1/registry.json', 'utf8'));
await Promise.all([groupRoot, locatorRoot, detailRoot].map(path => mkdir(path, { recursive: true })));

function safe(value: string) {
  return value.replace(/^\/+/, '').replace(/[^A-Za-z0-9.-]/g, '_');
}

function text(html: string) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;|&#34;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function detailField(html: string, label: string) {
  const match = new RegExp(`<b>\\s*${label}<\\/b>\\s*:\\s*([\\s\\S]*?)<\\/p>`, 'i').exec(html);
  return match ? text(match[1]) : '';
}

async function fetchFile(url: string, path: string) {
  try {
    await readFile(path);
    return false;
  } catch {
    if (!fetchMode) throw new Error(`Missing cached discovery response: ${path}`);
  }
  const response = await fetch(url, {
    headers: { 'user-agent': 'Ad-Fontes-NT educational manuscript-evidence inventory (contact: project owner)' },
  });
  if (!response.ok) throw new Error(`CSNTM ${response.status} for ${url}`);
  await writeFile(path, await response.text());
  await delay(600);
  return true;
}

let fetched = 0;
const records = [];
for (const unit of inventory.units) {
  const candidates = [];
  for (const candidate of unit.priorityCandidates.slice(0, limit)) {
    const url = new URL(candidate.sourceUrl);
    const groupPath = url.pathname;
    const groupFile = `${safe(groupPath)}.html`;
    const groupLocal = join(groupRoot, groupFile);
    if (await fetchFile(`https://manuscripts.csntm.org${groupPath}`, groupLocal)) fetched++;
    const groupHtml = await readFile(groupLocal, 'utf8');
    const manuscriptId = /var manuscriptId = "(\d+)"/.exec(groupHtml)?.[1] ?? '';
    const anchors = [];
    for (const anchor of candidate.foundAt) {
      if (!manuscriptId) {
        anchors.push({ anchor, imageIds: [], status: 'group-page-has-no-image-locator' });
        continue;
      }
      const locatorFile = `${unit.unitId}--${safe(candidate.gaNumber)}--${safe(anchor)}.json`;
      const locatorLocal = join(locatorRoot, locatorFile);
      const locatorUrl = `https://manuscripts.csntm.org/manuscript/SearchForImageByOsis?manuscriptId=${manuscriptId}&osis=${encodeURIComponent(anchor)}`;
      if (await fetchFile(locatorUrl, locatorLocal)) fetched++;
      const raw = await readFile(locatorLocal, 'utf8');
      let imageIds: number[] = [];
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) imageIds = parsed.filter(value => Number.isInteger(value));
      } catch {
        throw new Error(`Invalid image locator JSON: ${locatorLocal}`);
      }
      anchors.push({ anchor, imageIds, status: imageIds.length ? 'page-located' : 'no-page-returned' });
    }
    const ids = [...new Set(anchors.flatMap(value => value.imageIds))];
    const images = [];
    for (const imageId of ids) {
      const detailFile = `${imageId}.html`;
      const detailLocal = join(detailRoot, detailFile);
      if (await fetchFile(`https://manuscripts.csntm.org/manuscript/ImageDetails?imageId=${imageId}`, detailLocal)) fetched++;
      const html = await readFile(detailLocal, 'utf8');
      images.push({
        imageId,
        imageName: detailField(html, 'CSNTM Image Name'),
        location: detailField(html, 'Location'),
        indexedText: detailField(html, 'Text'),
        detailsUrl: `https://manuscripts.csntm.org/manuscript/ImageDetails?imageId=${imageId}`,
        raw: join('raw', 'image-details', detailFile),
        readingStatus: 'unverified',
        rightsStatus: 'needs-item-record',
      });
    }
    candidates.push({
      ...candidate,
      manuscriptId: manuscriptId || null,
      groupRaw: join('raw', 'groups', groupFile),
      anchors,
      images,
      suitability: images.length ? 'page-candidate' : 'locator-unresolved',
    });
  }
  const approvedPlate = existing.plates[unit.unitId];
  records.push({
    unitId: unit.unitId,
    title: unit.title,
    discoveredManuscriptCount: unit.discoveredManuscriptCount,
    approvedPlate: approvedPlate ? {
      releaseId: existing.releaseId,
      manuscript: approvedPlate.manuscript,
      images: approvedPlate.images.map((image: { sourceImageId: string; sourceImageName: string }) => ({
        imageId: image.sourceImageId,
        imageName: image.sourceImageName,
      })),
    } : null,
    priorityCandidates: candidates,
  });
}

const output = {
  schemaVersion: 1,
  releaseId,
  status: 'page-discovery-candidate',
  priorityLimitPerUnit: limit,
  statement: 'Page locators are discovery evidence only. Exact readings, omissions, corrections, rights, captions, and textual weight remain unverified unless bound to the separately approved csntm-2026-09-12-v1 plate release.',
  units: records,
};
await writeFile(join(root, 'page-candidates.json'), `${JSON.stringify(output, null, 2)}\n`);

const rawFiles: Record<string, string> = {};
for (const directory of ['groups', 'locators', 'image-details']) {
  for (const filename of (await readdir(join(root, 'raw', directory))).sort()) {
    const relative = join('raw', directory, filename);
    rawFiles[relative] = createHash('sha256').update(await readFile(join(root, relative))).digest('hex');
  }
}
const pageCandidates = await readFile(join(root, 'page-candidates.json'));
const manifestCore = {
  schemaVersion: 1,
  releaseId,
  status: 'candidate',
  generatedDate: '2026-09-12',
  inputInventorySha256: createHash('sha256').update(await readFile(join(root, 'inventory.json'))).digest('hex'),
  pageCandidatesSha256: createHash('sha256').update(pageCandidates).digest('hex'),
  rawFiles,
};
const manifest = {
  ...manifestCore,
  candidateSha256: createHash('sha256').update(JSON.stringify(manifestCore)).digest('hex'),
};
await writeFile(join(root, 'PAGE-MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`);

const located = records.reduce((sum, unit) => sum + unit.priorityCandidates.filter((value: { images: unknown[] }) => value.images.length).length, 0);
const images = records.reduce((sum, unit) => sum + unit.priorityCandidates.reduce((inner: number, value: { images: unknown[] }) => inner + value.images.length, 0), 0);
const priorityCandidates = records.reduce((sum, unit) => sum + unit.priorityCandidates.length, 0);
const rows = records.map(unit => {
  const locatedCandidates = unit.priorityCandidates
    .filter((value: { images: unknown[] }) => value.images.length)
    .map((value: { gaNumber: string; images: Array<{ imageId: number }> }) => `${value.gaNumber} (${value.images.map(image => image.imageId).join(', ')})`)
    .join('; ') || 'None returned';
  return `| ${unit.unitId} | ${unit.discoveredManuscriptCount} | ${unit.approvedPlate ? 'Integrated' : 'Not yet'} | ${locatedCandidates.replace(/\|/g, '\\|')} |`;
});
const report = `# CSNTM discovery inventory for the 39 approved comparisons

Date: 2026-09-12

Backlog: AFNT-111

Status: discovery candidate; no new image, reading, caption, or application integration approved

## Outcome

- Queried ${Object.keys(JSON.parse(await readFile(join(root, 'MANIFEST.json'), 'utf8')).rawFiles).length} exact disputed/context anchors across all 39 approved commentary units.
- Preserved ${inventory.units.reduce((sum: number, unit: { discoveredManuscriptCount: number }) => sum + unit.discoveredManuscriptCount, 0)} unit/manuscript matches from the CSNTM passage index.
- Resolved the first ${limit} ranked discovery candidates per unit where available: ${located} of ${priorityCandidates} candidates map to ${images} exact CSNTM image-detail records.
- The four already approved plates remain bound to the separate immutable \`csntm-2026-09-12-v1\` release. No byte in that release changed.

## Evidence boundary

A search match or page locator establishes only CSNTM's catalog association between a manuscript image and a passage. It does **not** establish which variant the page reads, that the catalog tag is exact, or how much textual weight the witness should receive. Every proposed plate still requires direct page inspection, an exact line/folio locator, reading verification (preferably against a primary transcription), item-level institution/credit review, an evidence-limited caption, alt text, checksums, and Larry's exact-hash editorial approval.

The ranking is only a workload aid: papyri and earlier majuscules are surfaced first, with a small preference for well-known complete codices. It is not a textual judgment and does not count witnesses as votes. Minuscule or lectionary evidence may be more suitable for the other side of a particular reading and can be promoted during verification.

## Coverage

| Unit | Discovered manuscripts | Existing approved plate | Located priority candidates and CSNTM image IDs |
|---|---:|---|---|
${rows.join('\n')}

## Known catalog limitations

- The global search returned no result for 1 Timothy 3:15–16 even though the already verified GA 01 page and image 142025 exist. That approved plate is retained; global zero results are not treated as absence.
- John 7:53 returned no direct global match, while the neighboring John 7:52 and John 8:11 searches returned candidates. This confirms why context anchors are required for omission/relocation questions.
- Duplicate Gregory–Aland labels can represent separate CSNTM group records or holding fragments. They remain separate until identity and page coverage are reconciled.
- Some group records expose no passage-to-image locator or return no page for an indexed global match. Those remain unresolved rather than being silently dropped.

## Next editorial/source gate

For each of the 35 units without an approved plate, inspect the located pages and choose a restrained set that actually demonstrates contrasting readings or physical context. Record rejected candidates and reasons. Do not download or bundle an image merely because it is indexed to the passage. A later immutable visual release should preserve approved originals and permissions, distribute size-controlled derivatives, bind current commentary hashes, and receive exact caption/alt/evidence approval before the guarded publisher can select it.

Candidate manifest SHA-256: \`${manifest.candidateSha256}\`
`;
await writeFile(join(root, 'REPORT.md'), report);
process.stdout.write(`Resolved ${located}/${priorityCandidates} priority manuscript candidates to ${images} image records; fetched ${fetched} new response(s).\n`);
process.stdout.write(`Discovery candidate SHA-256: ${manifest.candidateSha256}\n`);
