import registry from '../../../sources/ot/releases/ot-english-2026-10-07-v1/whole-bible-registry.json' with { type: 'json' };
import bsb from '../../../sources/ot/releases/ot-english-2026-10-07-v1/bsb-manifest.json' with { type: 'json' };
import blb from '../../../sources/ot/releases/ot-english-2026-10-07-v1/blb-manifest.json' with { type: 'json' };
import msb from '../../../sources/ot/releases/ot-english-2026-10-07-v1/msb-manifest.json' with { type: 'json' };
import ylt from '../../../sources/ot/releases/ot-english-2026-10-07-v1/ylt-manifest.json' with { type: 'json' };
export const otEnabled = true;
export const otRegistry = registry;
export const otEditions = [bsb, blb, msb, ylt];
const otCodes = new Set(registry.slice(0, 39).map(b => b.code));
export function isOtBook(code: string) { return otCodes.has(code); }
export function otEdition(edition: string) {
  return otEnabled ? otEditions.find(e => e.editionId === edition) : undefined;
}
