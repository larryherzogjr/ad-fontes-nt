/** October 16 owner decision: remove all former web projections, including stale releases. */
import { rm } from 'node:fs/promises';
await rm(new URL('../app/public/confessions/', import.meta.url), { recursive: true, force: true });
console.log('Retired Confessional Connections: no Book of Concord public assets.');
