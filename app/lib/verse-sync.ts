/** Match only explicit canonical identities within the edition the reader chose. */
export function findSyncTarget<T>(items: T[], refs: string[], edition: string | undefined, anchors: (item: T) => string[], source: (item: T) => string | undefined): T | undefined {
  return items.find(item => (edition === undefined || source(item) === edition) && anchors(item).some(ref => refs.includes(ref)));
}

export type VerseSyncPane = 'reader' | 'study';

/** A follower cannot become the leader until it receives a real input gesture. */
export function isFollowerScroll(pane: VerseSyncPane, leader: VerseSyncPane | null) {
  return leader !== null && pane !== leader;
}
