/** Package the non-public six-article review dossier and its Sinaiticus evidence. */
import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { editions } from '../app/lib/domain/corpus.ts';
import { reviewPayload } from '../app/lib/domain/variants.ts';

const root = resolve(import.meta.dirname, '..');
const editorialRoot = 'artifacts/editorial/variant-additions-2026-10-11-candidate-v2';
const visualRoot = 'sources/visuals/csntm-sinaiticus-additions-2026-10-11-v2-candidate';
const packetRoot = 'artifacts/editorial/variant-additions-2026-10-11-review-v2';
const sourceRoot = 'docs/editorial-review/variant-additions-2026-10-11';
const sha = (data: string | Buffer) => createHash('sha256').update(data).digest('hex');
const encoded = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;
const json = async (path: string) => JSON.parse(await readFile(resolve(root, path), 'utf8'));
function stable(value: any): any {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') return Object.fromEntries(
    Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, stable(v)]));
  return value;
}
const units = await json(`${editorialRoot}/NEW-UNITS.json`);
const slate = await json(`${sourceRoot}/SLATE.json`);
const evidence = await json(`${visualRoot}/sinaiticus-evidence.json`);
const manifest = await json(`${visualRoot}/MANIFEST.json`);
const books: Record<string, [string, string, number]> = {
  MAT: ['Matthew', 'Matt', 33], LUK: ['Luke', 'Luke', 35], JHN: ['John', 'John', 36],
  COL: ['Colossians', 'Col', 43], HEB: ['Hebrews', 'Heb', 46], REV: ['Revelation', 'Rev', 59],
};
const plates: Record<string, any> = {};
for (const row of evidence.units) {
  const unit = units.find((u: any) => u.id === row.unitId);
  if (!unit || unit.status !== 'in-review') throw Error('Expected an in-review article.');
  const [book, chapter, verse] = unit.ranges[0].start.split('.');
  const passage = `${books[book][0]} ${chapter}:${verse}`;
  const target = row.targetVerses[0];
  const locator = `local folio ${row.pages[0].localFolio}; ${passage} col. ${target.start.column.n}, line ${target.start.line.n}`;
  const images = [];
  for (const page of row.pages) {
    const info = await json(`${visualRoot}/evidence/iiif-info/${page.sourceImageName}.json`);
    images.push({ asset: `originals/${page.sourceImageName}`, width: info.width, height: info.height,
      sourceImageId: String(page.sourceImageId), sourceImageName: page.sourceImageName,
      alt: `Complete facsimile page of Codex Sinaiticus, local folio ${page.localFolio}, containing ${passage}.` });
  }
  plates[unit.id] = {
    commentaryPayloadSha256: sha(reviewPayload(unit)), title: `Codex Sinaiticus at ${passage}`, passage,
    manuscript: { name: 'Codex Sinaiticus', gregoryAland: 'GA 01/א', date: '4th century',
      holdingInstitution: 'British Library', shelfmark: 'Add MS 43725', locator,
      imageType: 'CSNTM digital facsimile' }, images,
    caption: `Codex Sinaiticus (GA 01/א), British Library Add MS 43725, ${locator}. ${row.proposedCaptionClaim}`,
    demonstrates: row.demonstrates, doesNotEstablish: row.doesNotEstablish,
    credit: 'Image via CSNTM from the J. T. and Zelma Luther Archives, A. Webb Roberts Library, Southwestern Baptist Theological Seminary; manuscript held by the British Library, Add MS 43725. Transcription verification: Codex Sinaiticus Project.',
    reuseStatement: 'Prepared under the project owner’s recorded September 12, 2026 authorization for free educational Ad Fontes web and offline desktop distribution. This candidate has no publication approval and grants no broader image reuse.',
    sourceUrl: `https://manuscripts.csntm.org/manuscript/Group/GA_01?OSIS=${books[book][1]}.${chapter}.${verse}`,
    transcriptionUrl: `https://codexsinaiticus.org/en/manuscript.aspx?book=${books[book][2]}&chapter=${chapter}&lid=en&side=r&verse=${verse}&zoomSlider=0`,
    evidence: ['sinaiticus-evidence.json', ...row.pages.flatMap((p: any) =>
      [`evidence/image-details/${p.sourceImageId}.html`, `evidence/iiif-info/${p.sourceImageName}.json`])],
  };
}
const registry = { schemaVersion: 1, releaseId: evidence.releaseId, status: 'candidate',
  relationship: { type: 'supplement', preservesRelease: 'csntm-sinaiticus-expansion-2026-09-13-v2',
    statement: 'These six proposed plates supplement the preserved evidence for the 104 approved comparisons.' },
  sourceScope: 'Six source-specific Sinaiticus readings; not a complete apparatus or an originality judgment.',
  editorialReview: { status: 'pending', candidateSha256: '' }, plates };
const readme = '# Six Sinaiticus evidence plates — October 11, 2026\n\nAFNT-113 follow-on. Unpublished candidate for comparison units 105–110. The pinned transcription supplies first-hand readings, corrections and page/column/line locators. The six complete-page facsimiles retain source credits and are bound to the exact draft article payloads. Hebrews supports grace only; the John correction spelling remains exact; the Luke ascension clause is a later addition in this witness. No approved predecessor is replaced. Exact editorial and visual approval is required before promotion.\n';
const permission = '# Permission basis — October 11, 2026\n\nThis private six-page review candidate uses the owner-reported project decision preserved in sources/visuals/csntm-sinaiticus-expansion-2026-09-13-v2/PERMISSION-BASIS.md and the original September 12 rights record. The selected applicable CSNTM images are intended only for the free educational Ad Fontes website and offline desktop distribution, with full institutional/source credits. No general commercial licence, sublicence, new correspondence or independently inspected private permission is claimed. The specific captions, readings and assets are still candidates awaiting owner review.\n';
const visualReview = '# Sinaiticus visual review — October 11, 2026\n\nAFNT-113 follow-on. Six proposed plates; no publication approval.\n\n' +
  Object.entries(plates).map(([id, p]) => `## ${id}: ${p.passage}\n\n${p.caption}\n\n${p.doesNotEstablish}\n\n${p.credit}\n\n[Transcription](${p.transcriptionUrl}) · [CSNTM](${p.sourceUrl})\n`).join('\n');
for (const [file, data] of Object.entries({ 'registry.candidate.json': encoded(registry), 'README.md': readme,
  'PERMISSION-BASIS.md': permission, 'REVIEW.md': visualReview })) {
  await writeFile(resolve(root, visualRoot, file), data);
  manifest.outputs[file] = sha(data);
}
for (const file of ['scripts/build_variant_additions_review.mts',
  'sources/visuals/csntm-sinaiticus-expansion-2026-09-13-v2/PERMISSION-BASIS.md'])
  manifest.inputs[file] = sha(await readFile(resolve(root, file)));
const core = { ...manifest }; delete core.candidateSha256;
manifest.candidateSha256 = sha(JSON.stringify(stable(core)));
await writeFile(resolve(root, visualRoot, 'MANIFEST.json'), encoded(manifest));

await mkdir(resolve(root, packetRoot), { recursive: false });
const packetFiles: Record<string, string> = {};
async function copy(from: string, to: string) {
  const target = resolve(root, packetRoot, to);
  await mkdir(join(target, '..'), { recursive: true });
  await copyFile(resolve(root, from), target);
  packetFiles[to] = sha(await readFile(target));
}
const editorialManifest = await json(`${editorialRoot}/CANDIDATE-MANIFEST.json`);
for (const file of ['CANDIDATE-MANIFEST.json', ...Object.keys(editorialManifest.outputs)])
  await copy(`${editorialRoot}/${file}`, `editorial/${file}`);
for (const file of ['MANIFEST.json', ...Object.keys(manifest.outputs), ...Object.keys(manifest.sourceFiles)])
  await copy(`${visualRoot}/${file}`, `visual/${file}`);
await copy(`${sourceRoot}/external/origen-john-i.html`, 'external/origen-john-i.html');
await copy(`${sourceRoot}/external/SOURCE.json`, 'external/SOURCE.json');
const esc = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const paragraphs = (value: string) => value.split('\n\n').map(p => `<p>${esc(p)}</p>`).join('');
const articles = units.map((u: any) => {
  const spec = slate.units.find((s: any) => s.id === u.id);
  const plate = plates[u.id];
  const row = evidence.units.find((r: any) => r.unitId === u.id);
  return `<article id="${u.id}"><p class="eyebrow">${esc(u.id)} · ${esc(spec.reference)} · Unapproved draft</p><h2>${esc(u.title)}</h2>
    ${u.comparisonNotice ? `<aside>${esc(u.comparisonNotice)}</aside>` : ''}
    <h3>Source observation</h3>${paragraphs(u.significance.sourceObservation)}
    <h3>Interpretation</h3>${paragraphs(u.significance.interpretation)}
    <details><summary>Seven exact edition readings</summary>${u.readings.map((r: any) => `<section class="reading"><h4>${esc(editions.find(e => e.editionId === r.editionId)!.name)}</h4><p class="meta">${esc(r.releaseId)} · whole-verse state: ${esc(r.state)}</p><blockquote>${r.spans.map((s: any) => esc(s.text)).join(' ')}</blockquote></section>`).join('')}</details>
    <details><summary>Pinned publisher notes</summary>${u.publisherNotes?.length ? u.publisherNotes.map((n: any) => `<p><strong>${esc(n.editionId)} · ${esc(n.noteId)}</strong><br>${esc(n.body)}</p>`).join('') : '<p>No publisher note at this anchor in the frozen releases.</p>'}</details>
    <details><summary>Sinaiticus evidence plate and correction records</summary><p>${esc(plate.caption)}</p><p>${esc(plate.doesNotEstablish)}</p>
    ${plate.images.map((i: any) => `<a href="visual/${esc(i.asset)}" target="_blank" rel="noopener"><img loading="lazy" src="visual/${esc(i.asset)}" alt="${esc(i.alt)}" width="${i.width}" height="${i.height}"></a>`).join('')}
    <p class="meta">${esc(plate.credit)}</p><p class="meta">${esc(plate.reuseStatement)}</p>
    <p><a href="${esc(plate.transcriptionUrl)}">Official transcription</a> · <a href="${esc(plate.sourceUrl)}">CSNTM source</a></p>
    <pre>${esc(JSON.stringify(row.targetVerses, null, 2))}</pre></details>
    <details><summary>Sources, attribution and exact review hash</summary><p>${esc(u.provenance)}</p><ul>${u.explanationSources.map((s: any) => `<li><strong>${esc(s.id)}: ${esc(s.label)}</strong> — ${esc(s.locator)}${s.url ? ` <a href="${esc(s.url)}">Source</a>` : ''}</li>`).join('')}</ul><p class="hash">${sha(reviewPayload(u))}</p></details>
    <p><a href="#top">Back to contents</a></p></article>`;
}).join('');
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Ad Fontes — Six comparison drafts for review</title><style>
  :root{color-scheme:light}*{box-sizing:border-box}body{margin:0;background:#f3f0e8;color:#252f29;font:18px/1.65 Georgia,serif}main{max-width:940px;margin:auto;padding:36px 24px}h1,h2,h3,h4,summary,.eyebrow,.meta,nav{font-family:system-ui,sans-serif}h1{font-size:36px;line-height:1.2}h2{font-size:27px;line-height:1.3}h3{font-size:20px;margin-top:28px}h4{font-size:17px;margin-bottom:4px}a{color:#225b4a}a:focus-visible,summary:focus-visible{outline:3px solid #946925;outline-offset:4px}article{border-top:2px solid #c2c9bd;margin-top:42px;padding-top:24px}aside{background:#e7ddbd;padding:16px;border-left:4px solid #946925}.eyebrow,.meta{font-size:14px}.eyebrow{letter-spacing:.04em}details{background:#fffcf5;border:1px solid #cbcbbc;border-radius:6px;padding:14px 18px;margin:14px 0}summary{cursor:pointer;font-weight:600;min-height:32px}blockquote{margin:12px 0;padding:10px 16px;border-left:3px solid #b9c4b5;white-space:pre-wrap}.reading{border-bottom:1px solid #deded1;padding-bottom:12px}img{display:block;max-width:100%;height:auto;margin:18px auto}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:13px/1.5 monospace;background:#ecece4;padding:12px}.hash{overflow-wrap:anywhere;font:13px monospace}nav li{margin:8px 0}@media(max-width:500px){main{padding:24px 16px}h1{font-size:29px}h2{font-size:23px}details{padding:12px}}@media print{body{background:white;font-size:11pt}main{max-width:none;padding:0}details{display:block}details>*{display:block!important}summary{margin-bottom:12px}article{break-before:page}img{max-height:650px;width:auto}nav{display:none}}
  </style></head><body><main id="top"><p class="eyebrow">Ordinary Means · Editorial review · October 11, 2026</p><h1>Ad Fontes<br>Six textual-comparison additions</h1><p>A biblical study environment from Ordinary Means.</p><aside><strong>Unpublished drafts for Larry Herzog Jr.’s review.</strong> Prepared by OpenAI Codex; the proposed Ordinary Means author/byline requires explicit adoption. All 104 approved articles remain unchanged. Approval of these six would bring the collection to 110.</aside>
  <p>Five studies show a wording or editorial-marker difference in the seven displayed editions. Hebrews 2:9 uses a separately identified historical source; all seven edition rows agree on grace. Each draft includes exact readings, retained publisher notes, a source-specific Sinaiticus plate, correction records and citations.</p>
  <nav aria-label="Review contents"><ol>${units.map((u: any) => `<li><a href="#${u.id}">${esc(u.title)}</a></li>`).join('')}</ol></nav><p><a href="editorial/REVIEW.md">Complete Markdown review</a> · <a href="editorial/CANDIDATE-MANIFEST.json">Editorial manifest</a> · <a href="visual/MANIFEST.json">Visual manifest</a></p>
  <p class="meta">Historical ten-item reserve: ${esc(slate.reserveDisposition)}</p>${articles}</main></body></html>\n`;
await writeFile(resolve(root, packetRoot, 'index.html'), html);
packetFiles['index.html'] = sha(html);
const packetManifest = { schemaVersion: 1, packetId: 'variant-additions-2026-10-11-review-v2', status: 'unpublished-awaiting-owner-review',
  editorialCandidateSha256: sha(await readFile(resolve(root, editorialRoot, 'CANDIDATE-MANIFEST.json'))),
  visualCandidateSha256: manifest.candidateSha256, fileSha256: packetFiles };
await writeFile(resolve(root, packetRoot, 'PACKET-MANIFEST.json'), encoded(packetManifest));
// Preserve compact review evidence in the repository; full images remain in the visual candidate.
await mkdir(resolve(root, sourceRoot, 'evidence'), { recursive: true });
for (const file of ['CANDIDATE-MANIFEST.json', 'NEW-UNITS.json', 'PUBLISHER-NOTES.json', 'VALIDATION.json', 'REVIEW.md'])
  await copyFile(resolve(root, editorialRoot, file), resolve(root, sourceRoot, 'evidence', file));
console.log(encoded({ packetRoot, editorialCandidateSha256: packetManifest.editorialCandidateSha256,
  visualCandidateSha256: manifest.candidateSha256, packetManifestSha256: sha(encoded(packetManifest)) }));
