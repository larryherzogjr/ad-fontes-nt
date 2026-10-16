/** WKWebView may start at tauri://localhost (empty pathname), unlike HTTP roots. */
export function desktopStartPath(href: string): string | null {
  const url = new URL(href);
  return url.pathname === '' || url.pathname === '/index.html'
    ? '/' + url.search + url.hash
    : null;
}

/** These pages are served by the website, not the offline reader. */
export function desktopWebsiteUrl(href: string, appHref: string): string | null {
  const app = new URL(appHref);
  const url = new URL(href, app);
  const local = url.protocol === app.protocol && url.host === app.host;
  if (!local || !['/downloads', '/privacy', '/terms', '/support'].includes(url.pathname.replace(/\/+$/, ''))) return null;
  return new URL(url.pathname + url.search + url.hash, 'https://ad-fontes.app').href;
}
