import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const control = join(root, 'docs/editorial-review/second-pass-audit-2026-09-12');
const output = join(root, 'docs/editorial-review/Ad-Fontes-NT-Second-Pass-Editorial-Audit-2026-09-12.zip');
const packetId = 'afnt-second-pass-editorial-audit-2026-09-12-v1';
const packetRootName = 'Ad-Fontes-NT-Second-Pass-Editorial-Audit-2026-09-12';
const articleReleaseId = 'om-studies-2026-09-11-v7';
const articleRelease = join(root, 'sources/om-studies', articleReleaseId);
const wordMetadata = join(root, 'sources/word-explorer/words-2026-09-06-250.json');
const publicVariantsPath = join(root, 'app/public/editorial/variants.json');
const temporary = mkdtempSync(join(tmpdir(), 'afnt-second-pass-audit-'));
const packet = join(temporary, packetRootName);

const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const read = (path) => readFileSync(path);
const copy = (source, destination) => {
  mkdirSync(dirname(destination), { recursive: true });
  cpSync(source, destination);
};
const writeJson = (path, value) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
};
const filesUnder = (directory) => readdirSync(directory, { withFileTypes: true })
  .flatMap((entry) => entry.isDirectory()
    ? filesUnder(join(directory, entry.name))
    : [join(directory, entry.name)]);

try {
  mkdirSync(packet, { recursive: true });
  for (const name of ['AUDIT-PROMPT.md', 'README.md', 'FINDING-SCHEMA.json']) {
    copy(join(control, name), join(packet, name));
  }

  const articleSource = join(articleRelease, 'raw');
  const articles = readdirSync(articleSource).filter((name) => name.endsWith('.md')).sort();
  if (articles.length !== 250) throw new Error(`Expected 250 current OM articles; found ${articles.length}`);
  for (const name of articles) copy(join(articleSource, name), join(packet, 'corpora/om-articles', name));

  const editorialSource = JSON.parse(readFileSync(join(root, 'content/editorial/variants.json'), 'utf8'));
  const publishedUnits = editorialSource.filter((unit) => unit.status === 'approved').sort((a, b) => a.id.localeCompare(b.id));
  if (publishedUnits.length !== 30) throw new Error(`Expected 30 approved comparison units; found ${publishedUnits.length}`);
  const publicVariants = JSON.parse(readFileSync(publicVariantsPath, 'utf8'));
  if (JSON.stringify(publicVariants.units) !== JSON.stringify(editorialSource.filter((unit) => unit.status === 'approved'))) {
    throw new Error('Published comparison bundle does not match approved editorial records');
  }
  for (const unit of publishedUnits) writeJson(join(packet, 'corpora/comparison-commentaries', `${unit.id}.json`), unit);

  copy(wordMetadata, join(packet, 'corpora/word-metadata.json'));
  copy(join(articleRelease, 'manifest.json'), join(packet, 'evidence/current-article-release/manifest.json'));
  for (const name of ['APPROVAL.md', 'CORRECTIONS.json', 'CANDIDATE-MANIFEST.json', 'VALIDATION.json', 'REVIEW.md']) {
    copy(join(articleRelease, 'evidence', name), join(packet, 'evidence/current-article-release', name));
  }
  for (const name of ['M2-Source-Decisions.md', 'M3-Source-Decisions.md', 'M3-Acceptance.md']) {
    copy(join(root, 'docs', name), join(packet, 'guidance', name));
  }
  copy(join(root, 'content/editorial/REVIEW.md'), join(packet, 'guidance/EDITORIAL-REVIEW.md'));

  const coverage = [];
  for (const name of articles) {
    const file = `corpora/om-articles/${name}`;
    coverage.push({ corpus: 'om-article', recordId: basename(name, '.md'), file, sha256: sha256(read(join(packet, file))) });
  }
  for (const unit of publishedUnits) {
    const file = `corpora/comparison-commentaries/${unit.id}.json`;
    coverage.push({ corpus: 'comparison-commentary', recordId: unit.id, file, sha256: sha256(read(join(packet, file))) });
  }
  writeJson(join(packet, 'INPUT-COVERAGE.json'), {
    schemaVersion: 2, packetId, articleCount: articles.length,
    comparisonCommentaryCount: publishedUnits.length, records: coverage
  });
  writeJson(join(packet, 'OUTPUT-COVERAGE-TEMPLATE.json'), {
    schemaVersion: 2, packetId,
    records: coverage.map((record) => ({ ...record, reviewed: false, disposition: null, findingIds: [] }))
  });

  const repositoryRevision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  const releaseManifest = read(join(articleRelease, 'manifest.json'));
  const packetManifest = {
    schemaVersion: 2,
    packetId,
    preparedDate: '2026-09-12',
    repositoryRevision,
    scope: {
      omReleaseId: articleReleaseId,
      articleCount: articles.length,
      comparisonCommentaryCount: publishedUnits.length,
      wordMetadataCount: JSON.parse(readFileSync(wordMetadata, 'utf8')).length
    },
    sourceBindings: {
      omReleaseManifestSha256: sha256(releaseManifest),
      publishedVariantsSha256: sha256(read(publicVariantsPath)),
      wordMetadataSha256: sha256(read(wordMetadata))
    },
    exclusions: [
      'Git history and repository configuration',
      'credentials, secrets, private keys and deployment configuration',
      'databases, database dumps and private user notes',
      'the supplied Ad Fontes review-book PDF',
      'full Scripture corpora and full Greek analysis archives',
      'prior external audit returns and superseded article releases',
      'larryherzogjr.com source tree and original website article files',
      'desktop binaries and web build artifacts'
    ],
    instructions: 'Independent report-only second-pass audit. No supplied source may be edited, approved, published, or treated as scholarly certification.'
  };
  writeJson(join(packet, 'PACKET-MANIFEST.json'), packetManifest);
  const packetManifestSha256 = sha256(read(join(packet, 'PACKET-MANIFEST.json')));
  writeFileSync(join(packet, 'PACKET-MANIFEST.sha256'), `${packetManifestSha256}  PACKET-MANIFEST.json\n`);

  const forbidden = [
    '-----BEGIN PRIVATE KEY-----',
    '-----BEGIN OPENSSH PRIVATE KEY-----',
    'AuthKey_',
    '/Users/lherzog',
    '10.20.30.70',
    'sitepull',
    'GOOGLE_CLIENT_SECRET',
    'POSTGRES_PASSWORD',
    'TAURI_SIGNING_PRIVATE_KEY'
  ];
  for (const file of filesUnder(packet)) {
    const body = readFileSync(file, 'utf8');
    for (const marker of forbidden) {
      if (body.includes(marker)) throw new Error(`Sanitization failure: ${marker} found in ${relative(packet, file)}`);
    }
  }

  const fixedTime = new Date('2026-09-12T00:00:00Z');
  for (const file of filesUnder(packet)) utimesSync(file, fixedTime, fixedTime);
  const sums = filesUnder(packet)
    .map((file) => `${sha256(read(file))}  ${relative(packet, file)}`)
    .sort();
  writeFileSync(join(packet, 'SHA256SUMS'), `${sums.join('\n')}\n`);
  utimesSync(join(packet, 'SHA256SUMS'), fixedTime, fixedTime);

  const zipEntries = filesUnder(packet).map((file) => relative(temporary, file)).sort();
  rmSync(output, { force: true });
  rmSync(`${output}.sha256`, { force: true });
  execFileSync('zip', ['-X', '-q', output, '-@'], { cwd: temporary, input: `${zipEntries.join('\n')}\n` });
  const zipHash = sha256(read(output));
  writeFileSync(`${output}.sha256`, `${zipHash}  ${basename(output)}\n`);
  process.stdout.write(`${output}\n${packetManifestSha256}\n${zipHash}\n${statSync(output).size} bytes\n`);
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
