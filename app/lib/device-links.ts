export type DeviceLink = {
  url: string;
  label: string;
  detail?: string;
  savedAt: number;
};

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
