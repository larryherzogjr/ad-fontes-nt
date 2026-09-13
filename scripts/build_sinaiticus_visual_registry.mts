import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { reviewPayload } from '../app/lib/domain/variants.ts';

const root = join('sources', 'visuals', 'csntm-sinaiticus-2026-09-12-v2-candidate');
const evidence = JSON.parse(await readFile(join(root, 'sinaiticus-evidence.json'), 'utf8'));
const variants = JSON.parse(await readFile('content/editorial/variants.json', 'utf8'));
const byId = new Map(variants.map((unit: { id: string }) => [unit.id, unit]));
const sha256 = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');

const names: Record<string, string> = {
  MAT: 'Matthew', MRK: 'Mark', LUK: 'Luke', JHN: 'John', ACT: 'Acts', ROM: 'Romans',
  '1CO': '1 Corinthians', '2CO': '2 Corinthians', '1TH': '1 Thessalonians', '1TI': '1 Timothy',
  '1JN': '1 John', '3JN': '3 John', JUD: 'Jude', '2PE': '2 Peter', REV: 'Revelation',
};
const csntmBooks: Record<string, string> = {
  MAT: 'Matt', MRK: 'Mark', LUK: 'Luke', JHN: 'John', ACT: 'Acts', ROM: 'Rom',
  '1CO': '1Cor', '2CO': '2Cor', '1TH': '1Thess', '1TI': '1Tim', '1JN': '1John',
  '3JN': '3John', JUD: 'Jude', '2PE': '2Pet', REV: 'Rev',
};
const transcriptionBooks: Record<string, number> = {
  MAT: 33, MRK: 34, LUK: 35, JHN: 36, ROM: 37, '1CO': 38, '2CO': 39,
  '1TH': 44, '1TI': 47, ACT: 51, '2PE': 54, '1JN': 55, '3JN': 57, JUD: 58, REV: 59,
};

function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, stable(item)]));
  }
  return value;
}

function parse(osis: string) {
  const [book, chapter, verse] = osis.split('.');
  return { book, chapter, verse };
}

function humanRange(ranges: Array<{ start: string; end: string }>) {
  return ranges.map(range => {
    const start = parse(range.start);
    const end = parse(range.end);
    if (range.start === range.end) return `${names[start.book]} ${start.chapter}:${start.verse}`;
    if (start.book === end.book && start.chapter === end.chapter) return `${names[start.book]} ${start.chapter}:${start.verse}–${end.verse}`;
    return `${names[start.book]} ${start.chapter}:${start.verse}–${end.chapter}:${end.verse}`;
  }).join(', ');
}

function humanAnchor(osis: string) {
  const value = parse(osis);
  return `${names[value.book]} ${value.chapter}:${value.verse}`;
}

function locator(unit: any) {
  const records = unit.targetVerses.filter((record: any) => record.status !== 'absent');
  const located = records.length ? records : unit.contextVerses;
  const starts = located.map((record: any) => `${humanAnchor(record.osis)} col. ${record.start.column.n}, line ${record.start.line.n}`);
  return `local folio ${unit.pages[0].localFolio}; ${starts.join('; ')}`;
}

const plates: Record<string, unknown> = {};
for (const unit of evidence.units) {
  const commentary: any = byId.get(unit.unitId);
  if (!commentary || commentary.status !== 'approved') throw new Error(`${unit.unitId} commentary is not approved.`);
  const passage = humanRange(unit.ranges);
  const anchor = unit.targetVerses.find((record: any) => record.status !== 'absent') ?? unit.contextVerses[0];
  const parsed = parse(anchor.osis);
  const pages = [];
  for (const page of unit.pages) {
    const info = JSON.parse(await readFile(join(root, 'evidence', 'iiif-info', `${page.sourceImageName}.json`), 'utf8'));
    pages.push({
      asset: `originals/${page.sourceImageName}`,
      width: Number(info.width),
      height: Number(info.height),
      sourceImageId: String(page.sourceImageId),
      sourceImageName: page.sourceImageName,
      alt: `Complete four-column facsimile page of Codex Sinaiticus, local folio ${page.localFolio}, containing ${passage} or its immediately surrounding text.`,
    });
  }
  plates[unit.unitId] = {
    commentaryPayloadSha256: sha256(reviewPayload(commentary)),
    title: `Codex Sinaiticus at ${passage}`,
    passage,
    manuscript: {
      name: 'Codex Sinaiticus', gregoryAland: 'GA 01/א', date: '4th century',
      holdingInstitution: 'British Library', shelfmark: 'Add MS 43725', locator: locator(unit),
      imageType: 'CSNTM digital facsimile',
    },
    images: pages,
    caption: `Codex Sinaiticus (GA 01/א), British Library Add MS 43725, ${locator(unit)}. ${unit.proposedCaptionClaim}`,
    demonstrates: unit.demonstrates,
    doesNotEstablish: unit.doesNotEstablish,
    credit: 'Image via CSNTM from the J. T. and Zelma Luther Archives, A. Webb Roberts Library, Southwestern Baptist Theological Seminary; manuscript held by the British Library, Add MS 43725. Transcription verification: Codex Sinaiticus Project.',
    reuseStatement: 'Used in Ad Fontes NT under the project owner’s recorded 2026-09-12 authorization for this free educational web and offline desktop distribution; no broader reuse is granted by Ad Fontes NT.',
    sourceUrl: `https://manuscripts.csntm.org/manuscript/Group/GA_01?OSIS=${csntmBooks[parsed.book]}.${parsed.chapter}.${parsed.verse}`,
    transcriptionUrl: `https://codexsinaiticus.org/en/manuscript.aspx?book=${transcriptionBooks[parsed.book]}&chapter=${parsed.chapter}&lid=en&side=r&verse=${parsed.verse}&zoomSlider=0`,
    evidence: [
      ...pages.flatMap(page => [`evidence/image-details/${page.sourceImageId}.html`, `evidence/iiif-info/${page.sourceImageName}.json`]),
      'sinaiticus-evidence.json',
    ],
  };
}

const registry = {
  schemaVersion: 1,
  releaseId: evidence.releaseId,
  status: 'candidate',
  relationship: {
    type: 'supplement',
    preservesRelease: 'csntm-2026-09-12-v1',
    statement: 'These 39 Sinaiticus plates supplement rather than replace the four plates in the approved v1 release.',
  },
  sourceScope: 'One consistent witness baseline. The broader AFNT-111 discovery inventory remains available for later contrasting-witness selection.',
  editorialReview: { status: 'pending', candidateSha256: '' },
  plates,
};
const registryPath = join(root, 'registry.candidate.json');
await writeFile(registryPath, `${JSON.stringify(registry, null, 2)}\n`);

const report = `# Sinaiticus evidence-plate editorial review\n\n` +
  `Date: 2026-09-12  \nBacklog: AFNT-111  \nStatus: candidate; exact-hash owner approval required\n\n` +
  `## Scope and evidence boundary\n\n` +
  `This supplement supplies a consistent, primary-transcription-backed witness baseline for all 39 approved comparisons. It uses 33 unique complete-page CSNTM facsimiles and retains the broader 147-candidate AFNT-111 discovery pool for later contrasting-witness work. A Sinaiticus plate is not an apparatus and edition agreement is not manuscript evidence. Each claim below describes this witness only.\n\n` +
  `The five passage-index failures noted during discovery were resolved from the official transcription's folio markers and the cached complete GA 01 image inventory. No zero search result was treated as textual absence. Correction-only material is labeled separately from the first hand. Modern verse divisions are attributed to the transcription where they are the issue.\n\n` +
  `| Unit | Passage | CSNTM page | Proposed witness claim |\n|---|---|---|---|\n` +
  evidence.units.map((unit: any) => `| ${unit.unitId} | ${humanRange(unit.ranges)} | ${unit.pages.map((page: any) => `${page.sourceImageName} / ${page.sourceImageId}`).join('; ')} | ${unit.proposedCaptionClaim.replaceAll('|', '\\|')} |`).join('\n') +
  `\n\n## Integration decision\n\nNo application files point to this candidate. Following exact-hash approval, promote it without changing bytes, extend the reader to combine this supplement with the approved v1 plates, preserve multiple plates on candidates 11, 17, 26, and 27, publish only local assets, and rerun the complete web and desktop verification.\n`;
const reportPath = join(root, 'REVIEW.md');
await writeFile(reportPath, report);

const manifestPath = join(root, 'MANIFEST.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
for (const relative of ['sinaiticus-evidence.json', 'registry.candidate.json', 'README.md', 'PERMISSION-BASIS.md', 'REVIEW.md']) {
  manifest.outputs[relative] = sha256(await readFile(join(root, relative)));
}
const candidateCore = { ...manifest };
delete candidateCore.candidateSha256;
manifest.candidateSha256 = sha256(JSON.stringify(stable(candidateCore)));
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Prepared ${Object.keys(plates).length} supplemental plate records.`);
console.log(`Candidate SHA-256: ${manifest.candidateSha256}`);
