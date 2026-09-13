import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const releaseId = 'csntm-discovery-2026-09-12-v1';
const root = join('sources', 'visuals', `${releaseId}-candidate`);
const rawRoot = join(root, 'raw', 'search');
const fetchMode = process.argv.includes('--fetch');
const delay = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds));

type Range = { start: string; end: string };
type Unit = { id: string; title: string; ranges: Range[] };
type Manuscript = {
  gaNumber: string;
  classification: string;
  date: string;
  href: string;
  description: string;
  location: string;
  shelfNumber: string;
};

const bookMap: Record<string, string> = {
  MAT: 'Matt', MRK: 'Mark', LUK: 'Luke', JHN: 'John', ACT: 'Acts', ROM: 'Rom',
  '1CO': '1Cor', '2CO': '2Cor', '1TH': '1Thess', '1TI': '1Tim',
  '1JN': '1John', '3JN': '3John', '2PE': '2Pet', JUD: 'Jude', REV: 'Rev',
};

function osis(reference: string) {
  const match = /^([^.]+)\.(\d+)\.(\d+)$/.exec(reference);
  if (!match || !bookMap[match[1]]) throw new Error(`Unsupported canonical reference: ${reference}`);
  return `${bookMap[match[1]]}.${match[2]}.${match[3]}`;
}

function previous(reference: string) {
  const match = /^([^.]+)\.(\d+)\.(\d+)$/.exec(reference);
  if (!match || Number(match[3]) <= 1) return null;
  return `${match[1]}.${match[2]}.${Number(match[3]) - 1}`;
}

function anchors(unit: Unit) {
  const values = new Set<string>();
  for (const range of unit.ranges) {
    values.add(osis(range.start));
    if (range.end !== range.start) values.add(osis(range.end));
  }
  const context = previous(unit.ranges[0].start);
  if (context) values.add(osis(context));
  return [...values];
}

function text(html: string) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;|&#34;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/\s+/g, ' ')
    .trim();
}

function field(html: string, label: string) {
  const match = new RegExp(`<b>\\s*${label}:<\\/b>\\s*([\\s\\S]*?)<\\/p>`, 'i').exec(html);
  return match ? text(match[1]) : '';
}

function parse(html: string): Manuscript[] {
  const manuscripts: Manuscript[] = [];
  const rows = /<tr class="MsHeader">([\s\S]*?)<\/tr>\s*<tr>([\s\S]*?)<\/tr>/gi;
  for (const match of html.matchAll(rows)) {
    const cells = [...match[1].matchAll(/<td(?:\s[^>]*)?>([\s\S]*?)<\/td>/gi)].map(value => text(value[1]));
    const href = /href="([^"]+)"/i.exec(match[1])?.[1] ?? '';
    const paragraphs = [...match[2].matchAll(/<p class="text-muted">([\s\S]*?)<\/p>/gi)].map(value => text(value[1]));
    const gaNumber = cells[0]?.replace(/^GA\s+/, '').trim();
    if (!gaNumber || !href) continue;
    manuscripts.push({
      gaNumber,
      classification: cells[1] ?? '',
      date: cells[2] ?? '',
      href,
      description: paragraphs.find(value => !/^Location:|^Shelf Number:/.test(value)) ?? '',
      location: field(match[2], 'Location'),
      shelfNumber: field(match[2], 'Shelf Number'),
    });
  }
  return manuscripts;
}

function century(date: string) {
  const match = /(\d+)(?:st|nd|rd|th)/i.exec(date);
  return match ? Number(match[1]) : 99;
}

function siglumRank(gaNumber: string) {
  const normalized = gaNumber.replace(/\s+/g, ' ');
  const preferred = ['01', '03', '02', '04', '05', '06'];
  const exact = preferred.indexOf(normalized);
  if (exact >= 0) return exact;
  if (/^P\d+$/i.test(normalized)) return 10 + Number(normalized.slice(1)) / 1000;
  return 100;
}

function rank(manuscript: Manuscript) {
  const classRank: Record<string, number> = { Papyrus: 0, Majuscule: 100, Minuscule: 300, Lectionary: 500 };
  return (classRank[manuscript.classification] ?? 700) + century(manuscript.date) * 10 + siglumRank(manuscript.gaNumber);
}

function safeAnchor(value: string) {
  return value.replace(/[^A-Za-z0-9.-]/g, '_');
}

async function fetchSearch(anchor: string, path: string) {
  const body = new URLSearchParams({ dateStart: '', dateEnd: '', q: anchor, osis: anchor });
  const response = await fetch('https://manuscripts.csntm.org/manuscript/searchmanuscripts', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'user-agent': 'Ad-Fontes-NT educational manuscript-evidence inventory (contact: project owner)',
    },
    body,
  });
  if (!response.ok) throw new Error(`CSNTM ${response.status} for ${anchor}`);
  const html = await response.text();
  if (!/results found|No matching|No manuscripts found/i.test(html)) throw new Error(`Unexpected CSNTM response for ${anchor}`);
  await writeFile(path, html);
}

const units = JSON.parse(await readFile('content/editorial/variants.json', 'utf8')) as Unit[];
if (units.length !== 39) throw new Error(`Expected 39 approved commentary units; found ${units.length}`);
await mkdir(rawRoot, { recursive: true });

if (fetchMode) {
  let fetched = 0;
  for (const unit of units) {
    for (const anchor of anchors(unit)) {
      const path = join(rawRoot, `${unit.id}--${safeAnchor(anchor)}.html`);
      try {
        await readFile(path);
      } catch {
        await fetchSearch(anchor, path);
        fetched++;
        process.stdout.write(`Fetched ${unit.id} ${anchor}\n`);
        await delay(750);
      }
    }
  }
  process.stdout.write(`Fetched ${fetched} new CSNTM passage-search response(s).\n`);
}

const records = [];
const allFiles: Record<string, string> = {};
for (const unit of units) {
  const searches = [];
  const union = new Map<string, Manuscript & { foundAt: string[] }>();
  for (const anchor of anchors(unit)) {
    const filename = `${unit.id}--${safeAnchor(anchor)}.html`;
    const relative = join('raw', 'search', filename);
    const bytes = await readFile(join(root, relative));
    allFiles[relative] = createHash('sha256').update(bytes).digest('hex');
    const matches = parse(bytes.toString('utf8'));
    searches.push({ anchor, resultCount: matches.length, raw: relative });
    for (const manuscript of matches) {
      const key = `${manuscript.gaNumber}\u0000${manuscript.href.split('?')[0]}`;
      const existing = union.get(key);
      if (existing) existing.foundAt.push(anchor);
      else union.set(key, { ...manuscript, foundAt: [anchor] });
    }
  }
  const manuscripts = [...union.values()].sort((a, b) => rank(a) - rank(b) || a.gaNumber.localeCompare(b.gaNumber));
  records.push({
    unitId: unit.id,
    title: unit.title,
    ranges: unit.ranges,
    searches,
    discoveredManuscriptCount: manuscripts.length,
    priorityCandidates: manuscripts.slice(0, 8).map(manuscript => ({
      ...manuscript,
      sourceUrl: `https://manuscripts.csntm.org${manuscript.href}`,
      pageLocatorStatus: 'unresolved',
      readingStatus: 'unverified',
      rightsStatus: 'needs-item-record',
    })),
    allDiscoveredManuscripts: manuscripts.map(manuscript => ({
      ...manuscript,
      sourceUrl: `https://manuscripts.csntm.org${manuscript.href}`,
    })),
  });
}

const inventory = {
  schemaVersion: 1,
  releaseId,
  status: 'discovery-candidate',
  retrievedDate: '2026-09-12',
  scope: 'CSNTM passage-search discovery for all 39 approved textual-comparison/commentary units.',
  limitations: [
    'A passage-search match establishes only that CSNTM indexes the manuscript for the queried passage or context anchor.',
    'No manuscript reading, omission, correction, date judgment, or textual weight is inferred from a search match.',
    'Priority ordering is a discovery aid based on classification, displayed date, and a small named-witness preference; it is not an evaluation of textual weight.',
    'Every displayed image still requires exact page, reading, institution, credit, rights, checksum, caption, and editorial verification.',
  ],
  units: records,
};
await writeFile(join(root, 'inventory.json'), `${JSON.stringify(inventory, null, 2)}\n`);

const manifest = {
  schemaVersion: 1,
  releaseId,
  status: 'candidate',
  generatedDate: '2026-09-12',
  inputs: {
    variants: createHash('sha256').update(await readFile('content/editorial/variants.json')).digest('hex'),
  },
  rawFiles: Object.fromEntries(Object.entries(allFiles).sort(([a], [b]) => a.localeCompare(b))),
  inventorySha256: createHash('sha256').update(await readFile(join(root, 'inventory.json'))).digest('hex'),
};
await writeFile(join(root, 'MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`);

const total = records.reduce((sum, record) => sum + record.discoveredManuscriptCount, 0);
process.stdout.write(`Built ${releaseId}: ${records.length} units, ${Object.keys(allFiles).length} searches, ${total} unit/manuscript matches.\n`);
