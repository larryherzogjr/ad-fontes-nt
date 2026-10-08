export type DeviceLink = {
  url: string;
  label: string;
  detail?: string;
  savedAt: number;
};

/** Present old and new history consistently without rewriting saved device data. */
export function presentRecentLinks(links: DeviceLink[], kind: 'passage' | 'study'): DeviceLink[] {
  const seen = new Set<string>();
  return links.flatMap(link => {
    let url: URL;
    try { url = new URL(link.url, 'https://local.invalid'); } catch { return []; }
    const params = url.searchParams;
    if (kind === 'passage') {
      for (const key of [...params.keys()]) {
        if (key !== 'translation' && key !== 'passage') params.delete(key);
      }
    } else {
      // A resolved study title and passage identify the same commentary even
      // when one historical URL omits its explicit unit parameter.
      params.delete('unit');
      params.delete('comparisonLayout');
      if (params.get('panel') === 'connections' && !params.has('connectionView')) params.set('connectionView', 'both');
    }
    params.sort();
    const identity = `${url.pathname}?${params}|${kind === 'study' ? link.label : ''}`;
    if (seen.has(identity)) return [];
    seen.add(identity);
    const view = params.get('connectionView');
    const context = params.get('panel') === 'connections'
      ? `Connections · ${view === 'greek' ? 'Greek' : view === 'english' ? 'English' : 'English and Greek'}`
      : params.get('panel') === 'greek' ? 'Greek exploration'
        : params.get('panel') === 'compare' ? `Edition comparison · ${params.get('compareEditions')?.split(',').join(' / ') || 'All editions'}`
          : params.get('panel') === 'notes' ? 'Publisher-note study' : '';
    return [{ ...link, ...(kind === 'passage' ? { url: url.pathname + url.search } : {}), detail: [context, link.detail].filter(Boolean).join(' · ') }];
  });
}

export function readDeviceLinks(key: string): DeviceLink[] {
  if (typeof window === 'undefined') return [];
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value)
      ? value.filter(item => item && typeof item.url === 'string' && typeof item.label === 'string')
      : [];
  } catch {
    return [];
  }
}

export function rememberDeviceLink(key: string, link: Omit<DeviceLink, 'savedAt'>, limit = 8) {
  const next = [
    { ...link, savedAt: Date.now() },
    ...readDeviceLinks(key).filter(item => item.url !== link.url),
  ].slice(0, limit);
  try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* Optional device history. */ }
  return next;
}

export function writeDeviceLinks(key: string, links: DeviceLink[]) {
  try { localStorage.setItem(key, JSON.stringify(links)); } catch { /* Optional device history. */ }
  return links;
}
