/** Read-only review aid; never creates an approval or changes the queue. */
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { reviewPayload, type Variant } from '../app/lib/domain/variants.ts';
const units: Variant[] = JSON.parse(await readFile(new URL('../content/editorial/variants.json', import.meta.url), 'utf8'));
const unit = units.find((v) => v.id === process.argv[2]);
if (!unit) throw Error('Supply an existing candidate ID, for example candidate-01.');
console.log(JSON.stringify({ unit, contentHash: createHash('sha256').update(reviewPayload(unit)).digest('hex') }, null, 2));
