/** Display-only romanization, based on the ALA-LC Greek letter table (2010).
 * Render only marked breathings; do not infer missing accents or pronunciation.
 * https://www.loc.gov/catdir/cpso/romanization/greek.pdf
 */
const letters: Record<string, string> = {
  α: 'a',
  β: 'b',
  γ: 'g',
  δ: 'd',
  ε: 'e',
  ζ: 'z',
  η: 'ē',
  θ: 'th',
  ι: 'i',
  κ: 'k',
  λ: 'l',
  μ: 'm',
  ν: 'n',
  ξ: 'x',
  ο: 'o',
  π: 'p',
  ρ: 'r',
  σ: 's',
  ς: 's',
  ϲ: 's',
  τ: 't',
  υ: 'y',
  φ: 'ph',
  χ: 'ch',
  ψ: 'ps',
  ω: 'ō',
};
export function transliterateGreek(text: string): string {
  const clusters = text.normalize('NFD').match(/\P{M}\p{M}*/gu) || [];
  const bases = clusters.map((c) => c[0].toLowerCase());
  return clusters
    .map((c, i) => {
      const b = bases[i],
        next = bases[i + 1],
        previous = bases[i - 1];
      if (!letters[b]) return c;
      let value = letters[b];
      if (b === 'γ' && ['γ', 'ξ', 'χ'].includes(next)) value = 'n';
      if (b === 'γ' && next === 'κ' && i > 0 && i + 2 < clusters.length)
        value = 'n';
      if (
        b === 'υ' &&
        !c.includes('\u0308') &&
        (['α', 'ε', 'η', 'ο', 'ω'].includes(previous) ||
          (next === 'ι' && !clusters[i + 1].includes('\u0308')))
      )
        value = 'u';
      const rough = c.includes('\u0314');
      const diphthong =
        i + 1 < clusters.length &&
        ['αι', 'ει', 'οι', 'υι', 'αυ', 'ευ', 'ηυ', 'ου', 'ωυ'].includes(
          b + next,
        ) &&
        !clusters[i + 1].includes('\u0308');
      if (b === 'ρ' && rough) value += 'h';
      else if (
        rough &&
        !(
          i > 0 &&
          ['αι', 'ει', 'οι', 'υι', 'αυ', 'ευ', 'ηυ', 'ου', 'ωυ'].includes(
            previous + b,
          ) &&
          !c.includes('\u0308')
        )
      )
        value = 'h' + value;
      if (diphthong && clusters[i + 1].includes('\u0314')) value = 'h' + value;
      if (c[0] !== c[0].toLowerCase())
        value = value[0].toUpperCase() + value.slice(1);
      return value;
    })
    .join('');
}
function decodeXml(value: string) {
  return value.replace(
    /&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt);/gi,
    (entity, code: string) => {
      if (code[0] === '#')
        return String.fromCodePoint(
          parseInt(
            code.slice(code[1] === 'x' ? 2 : 1),
            code[1] === 'x' ? 16 : 10,
          ),
        );
      return (
        (
          { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' } as Record<
            string,
            string
          >
        )[code] || entity
      );
    },
  );
}
/** Extract only the two attributes in the archived dictionary, never rendered HTML. */
export function dictionaryReading(originalXml: string) {
  const attribute = (tag: string, name: string) => {
    const value = new RegExp(`<${tag}\\b[^>]*\\b${name}="([^"]*)"`).exec(
      originalXml,
    )?.[1];
    return value ? decodeXml(value) : null;
  };
  return {
    transliteration: attribute('greek', 'translit'),
    pronunciation: attribute('pronunciation', 'strongs'),
  };
}
