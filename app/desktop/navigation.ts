/** WKWebView may start at tauri://localhost (empty pathname), unlike HTTP roots. */
export function desktopStartPath(href: string): string | null {
  const url = new URL(href);
  return url.pathname === '' || url.pathname === '/index.html'
    ? '/' + url.search + url.hash
    : null;
}
