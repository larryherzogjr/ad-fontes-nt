/** Styling only: original paragraph strings remain untouched, including sense markers. */
export function dictionaryParagraphClass(paragraph: string): string | undefined {
  if (/^[1-9]\d?\.(?:\s|$)/u.test(paragraph)) return 'dictionary-sense';
  if (/^\([a-z]\)(?:\s|$)/u.test(paragraph)) return 'dictionary-subpoint';
  return undefined;
}
