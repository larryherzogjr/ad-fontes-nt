import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { reviewPayload } from '../app/lib/domain/variants.ts';

const rootArgument = process.argv.find(argument => argument.startsWith('--root='));
const variantsArgument = process.argv.find(argument => argument.startsWith('--variants='));
const allowInReview = process.argv.includes('--allow-in-review');
const root = rootArgument?.slice('--root='.length) || join('sources', 'visuals', 'csntm-sinaiticus-2026-09-12-v2-candidate');
const evidence = JSON.parse(await readFile(join(root, 'sinaiticus-evidence.json'), 'utf8'));
const variantsPath = variantsArgument?.slice('--variants='.length) || 'content/editorial/variants.json';
const variants = JSON.parse(await readFile(variantsPath, 'utf8'));
const byId = new Map(variants.map((unit: { id: string }) => [unit.id, unit]));
const sha256 = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');

const names: Record<string, string> = {
  MAT: 'Matthew', MRK: 'Mark', LUK: 'Luke', JHN: 'John', ACT: 'Acts', ROM: 'Romans',
  '1CO': '1 Corinthians', '2CO': '2 Corinthians', '1TH': '1 Thessalonians', '1TI': '1 Timothy',
  GAL: 'Galatians', EPH: 'Ephesians', PHP: 'Philippians', COL: 'Colossians', '2TH': '2 Thessalonians',
  HEB: 'Hebrews', '2TI': '2 Timothy', TIT: 'Titus', PHM: 'Philemon', JAS: 'James', '1PE': '1 Peter',
  '1JN': '1 John', '2JN': '2 John', '3JN': '3 John', JUD: 'Jude', '2PE': '2 Peter', REV: 'Revelation',
};
const csntmBooks: Record<string, string> = {
  MAT: 'Matt', MRK: 'Mark', LUK: 'Luke', JHN: 'John', ACT: 'Acts', ROM: 'Rom',
  '1CO': '1Cor', '2CO': '2Cor', '1TH': '1Thess', '1TI': '1Tim', '1JN': '1John',
  GAL: 'Gal', EPH: 'Eph', PHP: 'Phil', COL: 'Col', '2TH': '2Thess', HEB: 'Heb', '2TI': '2Tim',
  TIT: 'Titus', PHM: 'Phlm', JAS: 'Jas', '1PE': '1Pet', '2JN': '2John',
  '3JN': '3John', JUD: 'Jude', '2PE': '2Pet', REV: 'Rev',
};
const transcriptionBooks: Record<string, number> = {
  MAT: 33, MRK: 34, LUK: 35, JHN: 36, ROM: 37, '1CO': 38, '2CO': 39,
  GAL: 40, EPH: 41, PHP: 42, COL: 43, '1TH': 44, '2TH': 45, HEB: 46, '1TI': 47, '2TI': 48,
  TIT: 49, PHM: 50, ACT: 51, JAS: 52, '1PE': 53, '2PE': 54, '1JN': 55, '2JN': 56,
  '3JN': 57, JUD: 58, REV: 59,
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
  if (!commentary || (commentary.status !== 'approved' && !(allowInReview && commentary.status === 'in-review')))
    throw new Error(`${unit.unitId} commentary is not in the permitted review state.`);
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
    statement: `These ${evidence.units.length} Sinaiticus plates supplement rather than replace the approved evidence releases for candidates 1–39.`,
  },
  sourceScope: 'One consistent, primary-transcription-backed witness baseline for the proposed expansion. It is not a manuscript apparatus or a witness vote.',
  editorialReview: { status: 'pending', candidateSha256: '' },
  plates,
};
const registryPath = join(root, 'registry.candidate.json');
await writeFile(registryPath, `${JSON.stringify(registry, null, 2)}\n`);

const report = `# Sinaiticus evidence-plate editorial review\n\n` +
  `Date: 2026-09-13  \nBacklog: AFNT-113  \nStatus: candidate; exact-hash owner approval required\n\n` +
  `## Scope and evidence boundary\n\n` +
  `This supplement supplies a consistent, primary-transcription-backed witness baseline for ${evidence.units.length} proposed comparisons. It uses ${new Set(evidence.units.flatMap((unit: any) => unit.pages.map((page: any) => page.sourceImageId))).size} unique complete-page CSNTM facsimiles. A Sinaiticus plate is not an apparatus and edition agreement is not manuscript evidence. Each claim below describes this witness only.\n\n` +
  `Page locators come from the official transcription's folio markers and the cached complete GA 01 image inventory. No search result was converted into textual absence. Correction-only material is labeled separately from the first hand.\n\n` +
  `| Unit | Passage | CSNTM page | Proposed witness claim |\n|---|---|---|---|\n` +
  evidence.units.map((unit: any) => `| ${unit.unitId} | ${humanRange(unit.ranges)} | ${unit.pages.map((page: any) => `${page.sourceImageName} / ${page.sourceImageId}`).join('; ')} | ${unit.proposedCaptionClaim.replaceAll('|', '\\|')} |`).join('\n') +
  `\n\n## Integration decision\n\nNo application files point to this candidate. Editorial prose and these evidence records require approval together before promotion. Publish only local assets and rerun the complete web and desktop verification after approval.\n`;
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
