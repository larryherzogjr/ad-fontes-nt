/** Match only explicit canonical identities within the edition the reader chose. */
export function findSyncTarget<T>(items: T[], refs: string[], edition: string | undefined, anchors: (item: T) => string[], source: (item: T) => string | undefined): T | undefined {
  return items.find(item => (edition === undefined || source(item) === edition) && anchors(item).some(ref => refs.includes(ref)));
}

export type VerseSyncPane = 'reader' | 'study';

/**
 * Programmatic scrolling can settle through several asynchronous scroll events
 * on touch browsers. Those follower events must not take leadership away from
 * the pane that received the user's most recent gesture.
 */
export function isSettlingFollowerScroll(
  pane: VerseSyncPane,
  leader: VerseSyncPane | null,
  suppressedUntil: number,
  now: number,
) {
  return pane !== leader && now < suppressedUntil;
}
