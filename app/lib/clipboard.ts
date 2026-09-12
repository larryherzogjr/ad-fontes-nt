export async function writeClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Some embedded webviews expose the API but deny it; use the legacy fallback.
    }
  }
  const field = document.createElement('textarea');
  field.value = text;
  field.readOnly = true;
  field.setAttribute('aria-hidden', 'true');
  field.style.position = 'fixed';
  field.style.left = '-9999px';
  document.body.append(field);
  field.select();
  // oxlint-disable-next-line typescript/no-deprecated -- Required for older embedded WebViews without Clipboard API permission.
  const copied = document.execCommand('copy');
  field.remove();
  if (!copied) throw new Error('Clipboard copy was unavailable.');
}
