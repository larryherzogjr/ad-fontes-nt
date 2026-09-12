#!/usr/bin/env python3
"""Prepare a review-only BSB adaptation of the pinned Ordinary Means articles.

The output is deliberately written under artifacts/editorial and is not a
publishable OM release.  Promotion still requires an explicit approval record
and a new immutable release created by export_om_studies.py.
"""

from __future__ import annotations

import argparse
import difflib
import hashlib
import html
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
WORD_RE = re.compile(r"[A-Za-z0-9]+(?:['’][A-Za-z0-9]+)?")
ELLIPSIS_RE = re.compile(r"(?:\.\.\.|\u2026)")
BLOCK_RE = re.compile(r'^(?P<prefix>>\s+)[“"](?P<quote>.*)[”"] \((?P<reference>.+), NET\)$')
BSB_LABEL_RE = re.compile(
    r'\((?P<book>(?:[1-3]\s+)?[A-Za-z]+)\s+(?P<address>\d+:[^)]+?), BSB\)'
)
BOOK_ALIASES = {
    'Gen': 'Genesis', 'Exod': 'Exodus', 'Deut': 'Deuteronomy',
    'Josh': 'Joshua', 'Ps': 'Psalm', 'Psalms': 'Psalm',
    'Prov': 'Proverbs', 'Isa': 'Isaiah', 'Jer': 'Jeremiah',
    'Ezek': 'Ezekiel', 'Dan': 'Daniel', 'Hos': 'Hosea',
    'Matt': 'Matthew', 'Mk': 'Mark', 'Lk': 'Luke', 'Jn': 'John',
    'Rom': 'Romans', '1 Cor': '1 Corinthians', '2 Cor': '2 Corinthians',
    'Gal': 'Galatians', 'Eph': 'Ephesians', 'Phil': 'Philippians',
    'Col': 'Colossians', '1 Thess': '1 Thessalonians',
    '2 Thess': '2 Thessalonians', '1 Tim': '1 Timothy',
    '2 Tim': '2 Timothy', 'Tit': 'Titus', 'Phlm': 'Philemon',
    'Heb': 'Hebrews', 'Jas': 'James', '1 Pet': '1 Peter',
    '2 Pet': '2 Peter', '1 Jn': '1 John', '2 Jn': '2 John',
    '3 Jn': '3 John', 'Rev': 'Revelation',
}
STOP_WORDS = {
    'about', 'after', 'again', 'against', 'also', 'among', 'because', 'before',
    'being', 'between', 'could', 'every', 'from', 'have', 'into', 'itself',
    'shall', 'should', 'their', 'there', 'these', 'they', 'those', 'through',
    'under', 'until', 'upon', 'were', 'what', 'when', 'where', 'which', 'while',
    'with', 'would', 'your',
}
NET_SIGNATURES = [
    'I tell you the solemn truth',
    'How blessed is the one',
    'being sure of what we hope for',
    'being convinced of what we do not see',
    'elemental spirits of the world',
    'multiplied all the more',
    'awe and reverence',
    'It is completed',
    'unassuming in the NET',
    'will shelter them',
    'in which righteousness truly resides',
    'at the cost of your own blood',
    'the age when all things are renewed',
    'the Lord values the lives of his faithful followers',
    'the faithfulness of Jesus Christ',
]
NT_BOOKS = {
    'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians',
    '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians',
    '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus',
    'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John',
    '3 John', 'Jude', 'Revelation',
}
PROJECTION_DANGLING_WORDS = {
    'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'from', 'his', 'in',
    'into', 'of', 'on', 'or', 'the', 'their', 'them', 'they', 'to', 'who',
    'with',
}


def encoded(value: object) -> bytes:
    return (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()


def normalize_words(value: str) -> str:
    return ' '.join(
        match.group().lower().replace('’', "'")
        for match in WORD_RE.finditer(html.unescape(value))
    )


def word_positions(value: str) -> list[tuple[str, int, int]]:
    return [
        (match.group().lower().replace('’', "'"), match.start(), match.end())
        for match in WORD_RE.finditer(html.unescape(value))
    ]


def best_span(segment: str, target_text: str, after_word: int = 0) -> tuple[str, float, int]:
    query = [word for word, _, _ in word_positions(segment)]
    target = word_positions(target_text)
    if not query or not target:
        return target_text.strip(), 0.0, len(target)
    if after_word >= len(target):
        after_word = 0
    remaining = target[after_word:]
    if len(query) >= max(6, round(len(remaining) * 0.62)):
        score = difflib.SequenceMatcher(None, query, [word for word, _, _ in remaining]).ratio()
        return (
            target_text[remaining[0][1]:].strip(' \t\n“”"'),
            score,
            len(target),
        )
    best: tuple[float, int, int] = (-1.0, after_word, len(target))
    minimum = max(1, len(query) - max(2, len(query) // 3))
    maximum = min(len(target), len(query) + max(5, len(query) // 2))
    for start in range(after_word, len(target)):
        for length in range(minimum, maximum + 1):
            end = start + length
            if end > len(target):
                break
            candidate = [word for word, _, _ in target[start:end]]
            ratio = difflib.SequenceMatcher(None, query, candidate).ratio()
            length_penalty = abs(len(candidate) - len(query)) / max(len(query), 1)
            score = ratio - (0.035 * length_penalty)
            if score > best[0]:
                best = (score, start, end)
    score, start, end = best
    segment_end = segment.rstrip()[-1:]
    sentence_like = len(query) >= 8 and segment.lstrip()[:1].isupper()
    if segment_end in '.!?\u2019\u201d"' or sentence_like:
        while end < len(target):
            following = target_text[target[end - 1][2]:target[end][1]]
            if re.search(r'[.!?]', following):
                break
            end += 1
    extension_limit = min(len(target), end + 4)
    while end < extension_limit and target[end - 1][0] in PROJECTION_DANGLING_WORDS:
        end += 1
    char_end = target[end - 1][2]
    if segment_end in '.!?\u2019\u201d"' or sentence_like:
        next_word_start = target[end][1] if end < len(target) else len(target_text)
        punctuation = re.search(r'[.!?][”"’]?', target_text[char_end:next_word_start])
        if punctuation:
            char_end += punctuation.end()
    return target_text[target[start][1]:char_end].strip(' \t\n“”"'), max(0.0, score), end


def suggest_quote(current: str, target_text: str) -> tuple[str, float]:
    segments = [part.strip() for part in ELLIPSIS_RE.split(current) if part.strip()]
    suggestions: list[str] = []
    scores: list[float] = []
    after_word = 0
    for segment in segments:
        suggestion, score, after_word = best_span(segment, target_text, after_word)
        if suggestions and normalize_words(suggestion) in normalize_words(suggestions[-1]):
            scores.append(score)
            continue
        suggestions.append(suggestion)
        scores.append(score)
    joined = ' … '.join(suggestions) if suggestions else target_text.strip()
    if current and current[0].islower() and joined and joined[0].isupper():
        joined = joined[0].lower() + joined[1:]
    leading_ellipsis = current.startswith(('...', '…'))
    trailing_ellipsis = current.endswith(('...', '…'))
    if leading_ellipsis:
        joined = '…' + joined
    if trailing_ellipsis:
        joined = joined.rstrip('.!?') + '…'
    if current and current[-1] not in '.!?' and not trailing_ellipsis and joined.endswith(('.', '!', '?')):
        joined = joined[:-1]
    return joined, (sum(scores) / len(scores) if scores else 0.0)


def load_bsb(path: Path) -> tuple[dict[tuple[str, int, int], str], str]:
    data = path.read_bytes()
    verses: dict[tuple[str, int, int], str] = {}
    for line in data.decode('utf-8-sig').splitlines():
        if '\t' not in line:
            continue
        address, text = line.split('\t', 1)
        match = re.fullmatch(r'(.+?) (\d+):(\d+)', address)
        if match:
            verses[(match.group(1), int(match.group(2)), int(match.group(3)))] = text.strip()
    return verses, hashlib.sha256(data).hexdigest()


def canonical_book(value: str) -> str:
    value = re.sub(r'\s+', ' ', value.strip())
    if value in BOOK_ALIASES:
        return BOOK_ALIASES[value]
    if value == 'Psalm':
        return value
    return value


def normalize_bsb_citation_labels(value: str) -> tuple[str, list[dict[str, str]]]:
    """Expand book abbreviations only inside newly introduced BSB labels."""
    changes: list[dict[str, str]] = []

    def replace(match: re.Match[str]) -> str:
        book = match.group('book')
        canonical = canonical_book(book)
        if canonical == book:
            return match.group(0)
        new = f'({canonical} {match.group("address")}, BSB)'
        changes.append({'old': match.group(0), 'new': new})
        return new

    return BSB_LABEL_RE.sub(replace, value), changes


def remove_stranded_quote_periods(value: str) -> tuple[str, int]:
    """Drop a quoted terminal period when the surrounding sentence continues."""
    return re.subn(r'\.” (?=[a-z])', '” ', value)


def remove_orphan_nested_closings(value: str) -> tuple[str, int]:
    """Remove source-edition inner closers left outside replaced BSB text."""
    count = 0

    def replace(match: re.Match[str]) -> str:
        nonlocal count
        segment = match.group(1)
        if segment.endswith('’') and '‘' not in segment:
            count += 1
            segment = segment[:-1]
        return f'“{segment}”'

    return re.sub(r'“([^“”]*)”', replace, value), count


def expand_reference(reference: str, verses: dict[tuple[str, int, int], str]) -> list[tuple[str, int, int]]:
    results: list[tuple[str, int, int]] = []
    prior_book: str | None = None
    prior_chapter: int | None = None
    normalized = reference.replace('–', '-').replace('—', '-')
    for raw_group in normalized.split(';'):
        group = raw_group.strip()
        match = re.fullmatch(r'((?:[1-3]\s+)?[A-Za-z]+(?:\s+of\s+[A-Za-z]+)?)\s+(\d+):(.+)', group)
        if match:
            book = canonical_book(match.group(1))
            chapter = int(match.group(2))
            specification = match.group(3)
            prior_book, prior_chapter = book, chapter
        elif prior_book and re.fullmatch(r'\d+:.+', group):
            chapter_text, specification = group.split(':', 1)
            book, chapter = prior_book, int(chapter_text)
            prior_chapter = chapter
        else:
            raise ValueError(f'Unsupported reference: {reference!r}')
        current_chapter = chapter
        for raw_part in specification.split(','):
            part = raw_part.strip()
            if not part:
                continue
            if '-' not in part:
                if ':' in part:
                    chapter_text, verse_text = part.split(':', 1)
                    current_chapter = int(chapter_text)
                    verse = int(verse_text)
                else:
                    verse = int(part)
                key = (book, current_chapter, verse)
                if key not in verses:
                    raise KeyError(f'Missing BSB verse for {reference}: {key}')
                results.append(key)
                continue
            left, right = part.split('-', 1)
            if ':' in left:
                start_chapter_text, start_verse_text = left.split(':', 1)
                start_chapter, start_verse = int(start_chapter_text), int(start_verse_text)
            else:
                start_chapter, start_verse = current_chapter, int(left)
            if ':' in right:
                end_chapter_text, end_verse_text = right.split(':', 1)
                end_chapter, end_verse = int(end_chapter_text), int(end_verse_text)
            else:
                end_chapter, end_verse = start_chapter, int(right)
            for candidate_chapter in range(start_chapter, end_chapter + 1):
                chapter_verses = sorted(
                    verse for candidate_book, candidate_ch, verse in verses
                    if candidate_book == book and candidate_ch == candidate_chapter
                )
                if not chapter_verses:
                    raise KeyError(f'Missing BSB chapter for {reference}: {(book, candidate_chapter)}')
                first = start_verse if candidate_chapter == start_chapter else chapter_verses[0]
                last = end_verse if candidate_chapter == end_chapter else chapter_verses[-1]
                for verse in range(first, last + 1):
                    key = (book, candidate_chapter, verse)
                    if key not in verses:
                        raise KeyError(f'Missing BSB verse for {reference}: {key}')
                    results.append(key)
            current_chapter = end_chapter
    return results


def passage(reference: str, verses: dict[tuple[str, int, int], str]) -> tuple[str, list[str]]:
    keys = expand_reference(reference, verses)
    return join_bsb_verses(keys, verses), [f'{book} {chapter}:{verse}' for book, chapter, verse in keys]


def join_bsb_verses(
    keys: list[tuple[str, int, int]],
    verses: dict[tuple[str, int, int], str],
) -> str:
    """Join verse text without adding spaces for intentionally blank verse numbers."""
    return ' '.join(verses[key] for key in keys if verses[key])


def key_label(key: tuple[str, int, int]) -> str:
    return f'{key[0]} {key[1]}:{key[2]}'


def normalized_reference(keys: list[tuple[str, int, int]]) -> str:
    groups: list[list[tuple[str, int, int]]] = []
    for key in keys:
        if groups and key[0] == groups[-1][-1][0] and key[1] == groups[-1][-1][1] and key[2] == groups[-1][-1][2] + 1:
            groups[-1].append(key)
        else:
            groups.append([key])
    labels: list[str] = []
    for group in groups:
        first, last = group[0], group[-1]
        if first == last:
            labels.append(key_label(first))
        else:
            labels.append(f'{first[0]} {first[1]}:{first[2]}–{last[2]}')
    return '; '.join(labels)


def content_word_set(value: str) -> set[str]:
    return {
        word for word, _, _ in word_positions(value)
        if len(word) >= 4 and word not in STOP_WORDS
    }


def smallest_verse_fallback(
    current: str,
    keys: list[tuple[str, int, int]],
    verses: dict[tuple[str, int, int], str],
) -> tuple[str, list[tuple[str, int, int]], float, bool]:
    """Choose the smallest whole-verse set supported by lexical anchors.

    Every fallback remains a human-review item. `manual` identifies cases whose
    anchors are too weak for the automatic verse choice to be trusted.
    """
    target_words = word_positions(join_bsb_verses(keys, verses))
    current_words = word_positions(current)
    if len(keys) == 1:
        selected = keys
        score = difflib.SequenceMatcher(
            None,
            [word for word, _, _ in current_words],
            [word for word, _, _ in word_positions(verses[keys[0]])],
        ).ratio()
        return verses[keys[0]], selected, score, False
    if len(current_words) >= max(12, round(len(target_words) * 0.65)):
        return join_bsb_verses(keys, verses), keys, 1.0, False
    selected_indexes: set[int] = set()
    best_score = 0.0
    for segment in [part.strip() for part in ELLIPSIS_RE.split(current) if part.strip()] or [current]:
        segment_words = [word for word, _, _ in word_positions(segment)]
        segment_content = content_word_set(segment)
        scored: list[tuple[float, int, int]] = []
        for index, key in enumerate(keys):
            verse_words = [word for word, _, _ in word_positions(verses[key])]
            shared = len(segment_content & content_word_set(verses[key]))
            anchor = shared / max(1, min(len(segment_content), len(content_word_set(verses[key]))))
            sequence = difflib.SequenceMatcher(None, segment_words, verse_words).ratio()
            scored.append(((anchor * 0.72) + (sequence * 0.28), shared, index))
        score, shared, index = max(scored)
        best_score = max(best_score, score)
        selected_indexes.add(index)
        for candidate_score, candidate_shared, candidate_index in scored:
            if candidate_shared >= 2 and candidate_score >= max(0.28, score * 0.72):
                selected_indexes.add(candidate_index)
    if len(selected_indexes) > 1:
        first, last = min(selected_indexes), max(selected_indexes)
        between = keys[first:last + 1]
        if all(key[0] == between[0][0] for key in between):
            selected_indexes.update(range(first, last + 1))
    selected = [key for index, key in enumerate(keys) if index in selected_indexes]
    return (
        join_bsb_verses(selected, verses),
        selected,
        best_score,
        best_score < 0.24,
    )


def quote_candidates(line: str, rows: list[dict[str, object]]) -> list[dict[str, object]]:
    candidates: list[dict[str, object]] = []
    seen: set[tuple[int, int, str, str]] = set()
    for row in rows:
        if row.get('labeled_block'):
            continue
        old = str(row['quote'])
        reference = str(row['reference'])
        for opening, closing in [('“', '”'), ('"', '"'), ('‘', '’')]:
            needle = f'{opening}{old}{closing}'
            start = 0
            while True:
                outer_start = line.find(needle, start)
                if outer_start < 0:
                    break
                inner_start = outer_start + len(opening)
                inner_end = inner_start + len(old)
                key = (inner_start, inner_end, old, reference)
                if key not in seen:
                    candidates.append({
                        'start': inner_start,
                        'end': inner_end,
                        'old': old,
                        'reference': reference,
                        'evidence': row.get('evidence'),
                        'outerQuote': opening,
                    })
                    seen.add(key)
                start = outer_start + 1
    return candidates


def nested_quotation(value: str, outer_quote: str) -> str:
    if outer_quote not in {'“', '"'}:
        return value
    opening_count = value.count('“')
    closing_count = value.count('”')
    nested = value.replace('“', '‘').replace('”', '’')
    if opening_count > closing_count:
        nested += '’' * (opening_count - closing_count)
    elif closing_count > opening_count:
        nested = ('‘' * (closing_count - opening_count)) + nested
    return nested


def resolve_quote_candidates(
    slug: str,
    line_number: int,
    candidates: list[dict[str, object]],
) -> tuple[list[dict[str, object]], list[dict[str, object]]]:
    selected: list[dict[str, object]] = []
    suppressed: list[dict[str, object]] = []
    for candidate in sorted(candidates, key=lambda row: (-(int(row['end']) - int(row['start'])), int(row['start']))):
        overlaps = [
            current for current in selected
            if int(candidate['start']) < int(current['end']) and int(current['start']) < int(candidate['end'])
        ]
        if not overlaps:
            selected.append(candidate)
            continue
        if all(
            int(current['start']) <= int(candidate['start']) and int(candidate['end']) <= int(current['end'])
            for current in overlaps
        ):
            suppressed.append({
                'slug': slug,
                'line': line_number,
                'old': candidate['old'],
                'reference': candidate['reference'],
                'reason': 'contained-by-longer-evidence-excerpt',
                'selectedOld': overlaps[0]['old'],
                'selectedReference': overlaps[0]['reference'],
            })
            continue
        raise ValueError(f'Partially overlapping quote evidence at {slug}:{line_number}')
    return sorted(selected, key=lambda row: int(row['start'])), suppressed


def deterministic_sample(records: list[dict[str, object]], seed: str) -> list[dict[str, object]]:
    strata: dict[tuple[str, str, str], list[dict[str, object]]] = {}
    for record in records:
        if record['kind'] != 'inline' or bool(record.get('wholeVerseFallback')):
            continue
        score = float(record['score'])
        band = '0.55-0.69' if score < 0.70 else ('0.70-0.84' if score < 0.85 else '0.85-1.00')
        first_book = str(record['bsbVerses'][0]).rsplit(' ', 1)[0]
        testament = 'NT' if first_book in NT_BOOKS else 'OT'
        shape = 'range' if len(record['bsbVerses']) > 1 else 'single-verse'
        strata.setdefault((band, testament, shape), []).append(record)
    sampled: list[dict[str, object]] = []
    for stratum, members in sorted(strata.items()):
        ordered = sorted(
            members,
            key=lambda record: hashlib.sha256(
                f'{seed}|{record["slug"]}|{record["line"]}|{record["reference"]}|{record["old"]}'.encode()
            ).hexdigest(),
        )
        take = max(1, (len(ordered) + 9) // 10)
        for record in ordered[:take]:
            sampled.append({
                'stratum': {'scoreBand': stratum[0], 'testament': stratum[1], 'shape': stratum[2]},
                'slug': record['slug'],
                'line': record['line'],
                'reference': record['normalizedReference'],
                'score': record['score'],
                'old': record['old'],
                'new': record['new'],
                'sourceSpan': record.get('sourceSpan'),
            })
    return sampled


def load_quote_rows(author_root: Path) -> list[dict[str, object]]:
    ledger_path = author_root / 'output/editorial/greek-net-final-verification.json'
    ledger = json.loads(ledger_path.read_text())
    rows = [dict(row, evidence=str(ledger_path)) for row in ledger['quotations']]
    for verification_path in sorted((author_root / 'output/editorial').glob('greek-batch-*/verification.json')):
        verification = json.loads(verification_path.read_text())
        for slug, entry in verification.get('entries', {}).items():
            for quotation in entry.get('quotations', []):
                rows.append({**quotation, 'slug': slug, 'evidence': str(verification_path)})
    unique: dict[tuple[str, str, str], dict[str, object]] = {}
    for row in rows:
        unique[(str(row['slug']), str(row['quote']), str(row['reference']))] = row
    return list(unique.values())


def replace_quoted(source: str, old: str, new: str) -> tuple[str, int]:
    count = 0
    for opening, closing in [('“', '”'), ('"', '"'), ('‘', '’')]:
        needle = f'{opening}{old}{closing}'
        hits = source.count(needle)
        if hits:
            source = source.replace(needle, f'{opening}{new}{closing}')
            count += hits
    return source, count


def fallback_requires_hand_adaptation(line: str, candidate: dict[str, object], old: str) -> bool:
    """Refuse automatic whole-verse prose substitutions in phrase-sized slots.

    A low-similarity quotation that contains fewer than eight words, or that is
    embedded in a running sentence, cannot safely be expanded to a whole verse.
    The generated candidate still records the proposed fallback for review, but
    ``needsManualSelection`` makes validation fail until an explicit prose
    override supplies a grammatical BSB adaptation.
    """
    word_count = len(re.findall(r"[A-Za-z0-9]+(?:['’][A-Za-z0-9]+)?", old))
    prefix = line[:int(candidate['start'])].rstrip().rstrip('“"\'').rstrip()
    introduced_as_block = not prefix or prefix.endswith((':', '—', '-'))
    return word_count < 8 or not introduced_as_block


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--source-release', default='om-studies-2026-09-09-v3')
    parser.add_argument('--author-root', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument(
        '--prose-overrides',
        type=Path,
        default=ROOT / 'scripts/om_bsb_prose_overrides.json',
    )
    args = parser.parse_args()
    source = ROOT / 'sources/om-studies' / args.source_release
    manifest = json.loads((source / 'manifest.json').read_text())
    if args.output.exists():
        raise SystemExit('Output already exists; preserve the candidate and choose a new path.')
    bsb_path = ROOT / 'sources/bsb/raw/bsb.txt'
    verses, bsb_sha = load_bsb(bsb_path)
    quote_rows = load_quote_rows(args.author_root)
    prose_overrides = json.loads(args.prose_overrides.read_text())
    overrides_by_slug: dict[str, list[dict[str, str]]] = {}
    for override in prose_overrides:
        overrides_by_slug.setdefault(override['slug'], []).append(override)
    used_overrides: list[dict[str, object]] = []
    by_slug: dict[str, list[dict[str, object]]] = {}
    for row in quote_rows:
        by_slug.setdefault(str(row['slug']), []).append(row)
    records: list[dict[str, object]] = []
    translation_lines: list[dict[str, object]] = []
    unmatched: list[dict[str, object]] = []
    suppressed_overlaps: list[dict[str, object]] = []
    citation_normalizations: list[dict[str, object]] = []
    punctuation_adjustments: list[dict[str, object]] = []
    orphan_quote_adjustments: list[dict[str, object]] = []
    output_raw = args.output / 'raw'
    output_raw.mkdir(parents=True)
    for source_path in sorted((source / 'raw').glob('*.md')):
        slug = source_path.stem
        original = source_path.read_text()
        lines = original.splitlines()
        adapted_lines: list[str] = []
        for line_number, line in enumerate(lines, 1):
            matches = [
                override for override in overrides_by_slug.get(slug, [])
                if override['contains'] in line
            ]
            if len(matches) > 1:
                raise ValueError(f'Multiple prose overrides match {slug}:{line_number}')
            if matches:
                override = matches[0]
                adapted_lines.append(override['replacement'])
                used_overrides.append({
                    'slug': slug,
                    'line': line_number,
                    'contains': override['contains'],
                    'old': line,
                    'new': override['replacement'],
                })
                continue
            block = BLOCK_RE.match(line)
            if block:
                reference = block.group('reference')
                bsb_text, verse_keys = passage(reference, verses)
                adapted_lines.append(f'{block.group("prefix")}“{nested_quotation(bsb_text, "“")}” ({reference}, BSB)')
                records.append({
                    'slug': slug, 'line': line_number, 'kind': 'labeled-block',
                    'reference': reference, 'old': block.group('quote'), 'new': bsb_text,
                    'score': 1.0, 'bsbVerses': verse_keys,
                    'normalizedReference': normalized_reference(expand_reference(reference, verses)),
                })
                continue
            if '<!--' in line and re.search(r'\bNET\b|NET Bible|New English Translation', line, re.I):
                continue
            if re.search(r'\bNET\b|NET Bible|New English Translation', line):
                translation_lines.append({'slug': slug, 'line': line_number, 'old': line})
            candidates, suppressed = resolve_quote_candidates(
                slug,
                line_number,
                quote_candidates(line, by_slug.get(slug, [])),
            )
            suppressed_overlaps.extend(suppressed)
            replacements: list[tuple[int, int, str]] = []
            for candidate in candidates:
                old = str(candidate['old'])
                reference = str(candidate['reference'])
                try:
                    keys = expand_reference(reference, verses)
                except (KeyError, ValueError) as error:
                    unmatched.append({**candidate, 'slug': slug, 'line': line_number, 'reason': str(error)})
                    continue
                bsb_text = join_bsb_verses(keys, verses)
                new, score = suggest_quote(old, bsb_text)
                whole_verse_fallback = score < 0.55
                selected_keys = keys
                fallback_score = score
                needs_manual = False
                if whole_verse_fallback:
                    new, selected_keys, fallback_score, needs_manual = smallest_verse_fallback(old, keys, verses)
                    needs_manual = needs_manual or fallback_requires_hand_adaptation(
                        line,
                        candidate,
                        old,
                    )
                rendered_new = nested_quotation(new, str(candidate['outerQuote']))
                replacements.append((int(candidate['start']), int(candidate['end']), rendered_new))
                records.append({
                    'slug': slug, 'line': line_number, 'kind': 'inline', 'reference': reference,
                    'normalizedReference': normalized_reference(keys),
                    'old': old, 'new': new, 'score': round(score, 4),
                    'renderedNew': rendered_new,
                    'wholeVerseFallback': whole_verse_fallback,
                    'fallbackSelectionScore': round(fallback_score, 4),
                    'needsManualSelection': needs_manual,
                    'occurrences': 1, 'sourceLines': [line_number],
                    'sourceSpan': [int(candidate['start']), int(candidate['end'])],
                    'bsbVerses': [key_label(key) for key in keys],
                    'selectedBsbVerses': [key_label(key) for key in selected_keys],
                })
            adapted_line = line
            for start, end, replacement in sorted(replacements, reverse=True):
                adapted_line = adapted_line[:start] + replacement + adapted_line[end:]
            adapted_lines.append(adapted_line)
        adapted = '\n'.join(adapted_lines) + ('\n' if original.endswith('\n') else '')
        adapted = re.sub(r',\s*NET\)', ', BSB)', adapted)
        adapted = re.sub(r'\bNET Bible\b', 'Berean Standard Bible', adapted)
        adapted = re.sub(r'\bNET\b', 'BSB', adapted)
        normalized_lines: list[str] = []
        for candidate_line_number, candidate_line in enumerate(adapted.splitlines(), 1):
            normalized_line, label_changes = normalize_bsb_citation_labels(candidate_line)
            for change in label_changes:
                citation_normalizations.append({
                    'slug': slug,
                    'line': candidate_line_number,
                    **change,
                })
            normalized_line, orphan_count = remove_orphan_nested_closings(normalized_line)
            if orphan_count:
                orphan_quote_adjustments.append({
                    'slug': slug,
                    'line': candidate_line_number,
                    'count': orphan_count,
                })
            normalized_line, period_count = remove_stranded_quote_periods(normalized_line)
            if period_count:
                punctuation_adjustments.append({
                    'slug': slug,
                    'line': candidate_line_number,
                    'count': period_count,
                })
            normalized_lines.append(normalized_line)
        adapted = '\n'.join(normalized_lines) + ('\n' if adapted.endswith('\n') else '')
        adapted = adapted.replace(
            '---\n\n',
            '---\n\n<!-- AD FONTES BSB ADAPTATION: pending Larry Herzog Jr. review; the original website edition is unchanged. -->\n\n',
            1,
        )
        (output_raw / source_path.name).write_text(adapted)
    remaining = []
    net_ism_hits = []
    for path in sorted(output_raw.glob('*.md')):
        for line_number, line in enumerate(path.read_text().splitlines(), 1):
            if re.search(r'\bNET\b|NET Bible|New English Translation', line):
                remaining.append({'slug': path.stem, 'line': line_number, 'text': line})
            for signature in NET_SIGNATURES:
                if signature.casefold() in line.casefold():
                    net_ism_hits.append({
                        'slug': path.stem,
                        'line': line_number,
                        'signature': signature,
                        'text': line,
                    })
    expected_overrides = sum(len(overrides) for overrides in overrides_by_slug.values())
    if len(used_overrides) != expected_overrides:
        used_keys = {(row['slug'], row['contains']) for row in used_overrides}
        missing = [
            (override['slug'], override['contains']) for override in prose_overrides
            if (override['slug'], override['contains']) not in used_keys
        ]
        raise ValueError(f'Unused prose overrides: {missing}')
    candidate_files = [
        {
            'slug': path.stem,
            'file': f'raw/{path.name}',
            'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
        }
        for path in sorted(output_raw.glob('*.md'))
    ]
    candidate_manifest = {
        'status': 'pending-review',
        'sourceRelease': args.source_release,
        'articleCount': len(candidate_files),
        'files': candidate_files,
    }
    candidate_manifest_bytes = encoded(candidate_manifest)
    (args.output / 'candidate-manifest.json').write_bytes(candidate_manifest_bytes)
    candidate_manifest_sha = hashlib.sha256(candidate_manifest_bytes).hexdigest()
    low_confidence = [record for record in records if record['kind'] == 'inline' and bool(record.get('wholeVerseFallback'))]
    manual_selections = [record for record in low_confidence if bool(record.get('needsManualSelection'))]
    inline_keys = [
        (record['slug'], record['line'], tuple(record.get('sourceSpan', [])))
        for record in records if record['kind'] == 'inline'
    ]
    if len(inline_keys) != len(set(inline_keys)):
        raise ValueError('Duplicate inline replacement source spans survived collision resolution.')
    inline_sample = deterministic_sample(records, candidate_manifest_sha)
    summary = {
        'status': 'pending-review',
        'sourceRelease': args.source_release,
        'sourceManifestSha256': hashlib.sha256((source / 'manifest.json').read_bytes()).hexdigest(),
        'bsbSource': str(bsb_path.relative_to(ROOT)),
        'bsbSourceSha256': bsb_sha,
        'candidateManifestSha256': candidate_manifest_sha,
        'bsbRights': 'Public-domain dedication effective April 30, 2023; see sources/bsb/m2-manifest.json.',
        'bsbSourceUrl': 'https://bereanbible.com/bsb.txt',
        'bsbRightsUrl': 'https://berean.bible/terms.htm',
        'articleCount': len(list(output_raw.glob('*.md'))),
        'replacementCount': len(records),
        'blockReplacementCount': sum(record['kind'] == 'labeled-block' for record in records),
        'inlineReplacementCount': sum(record['kind'] == 'inline' for record in records),
        'translationSpecificSourceLines': translation_lines,
        'curatedProseOverrides': used_overrides,
        'bsbCitationLabelNormalizations': citation_normalizations,
        'strandedQuotePeriodAdjustments': punctuation_adjustments,
        'orphanNestedQuoteAdjustments': orphan_quote_adjustments,
        'lowConfidence': low_confidence,
        'manualSelections': manual_selections,
        'suppressedContainedEvidence': suppressed_overlaps,
        'inlineReplacementKeysUnique': True,
        'inlineReviewSampleSeed': candidate_manifest_sha,
        'inlineReviewSampleRate': '10% rounded up within score/testament/range strata',
        'inlineReviewSample': inline_sample,
        'unmatched': unmatched,
        'remainingNetLines': remaining,
        'netIsmSignatures': NET_SIGNATURES,
        'netIsmHits': net_ism_hits,
        'records': records,
    }
    (args.output / 'verification.json').write_bytes(encoded(summary))
    (args.output / 'README.md').write_text(
        '# Ad Fontes BSB article adaptation candidate\n\n'
        'Status: **pending Larry Herzog Jr. review; not publishable**.\n\n'
        f'This candidate adapts {summary["articleCount"]} articles from `{args.source_release}`. '
        'The author website and every immutable OM release remain unchanged. Scripture text comes from '
        f'`{summary["bsbSource"]}` at SHA-256 `{bsb_sha}`.\n\n'
        f'Candidate manifest SHA-256: `{summary["candidateManifestSha256"]}`.\n\n'
        f'- Labeled block replacements: {summary["blockReplacementCount"]}\n'
        f'- Inline replacements found from retained author evidence: {summary["inlineReplacementCount"]}\n'
        f'- Translation-specific source lines requiring editorial inspection: {len(translation_lines)}\n'
        f'- Curated translation-specific prose rewrites: {len(used_overrides)}\n'
        f'- BSB citation labels normalized to full book names: {len(citation_normalizations)}\n'
        f'- Stranded quoted periods removed before lowercase continuations: {sum(row["count"] for row in punctuation_adjustments)}\n'
        f'- Orphan nested closing quotes removed: {sum(row["count"] for row in orphan_quote_adjustments)}\n'
        f'- Smallest-whole-verse fallbacks requiring editorial inspection: {len(low_confidence)}\n'
        f'- Fallback selections requiring manual correction: {len(manual_selections)}\n'
        f'- Contained evidence excerpts safely suppressed: {len(suppressed_overlaps)}\n'
        f'- Deterministic stratified inline-review sample: {len(inline_sample)}\n'
        f'- Unmatched evidence rows: {len(unmatched)}\n'
        f'- Remaining NET-bearing candidate lines: {len(remaining)}\n'
        f'- NET-distinctive lint hits: {len(net_ism_hits)}\n\n'
        'Promotion requires completing the editorial inspection, recording an explicit approval against '
        'the final hashes, creating a new immutable release, selecting it for both builds, and running the '
        'full web/desktop verification workflow.\n'
    )
    review_lines = [
        '# BSB adaptation review index',
        '',
        f'Approve only against candidate manifest SHA-256 `{summary["candidateManifestSha256"]}`.',
        '',
        'Review protocol: every stratified-sample item with score below 0.65 is presumed to need editing until a human reviewer explicitly clears it in context.',
        '',
        '## Curated translation-specific prose',
        '',
    ]
    for row in used_overrides:
        review_lines.append(
            f'- [{row["slug"]}](raw/{row["slug"]}.md) — source line {row["line"]}'
        )
    review_lines.extend(['', '## Other source lines that contained an explicit NET attribution', ''])
    for row in translation_lines:
        review_lines.append(
            f'- [{row["slug"]}](raw/{row["slug"]}.md) — source line {row["line"]}'
        )
    review_lines.extend(['', '## Smallest-whole-verse fallbacks to inspect', ''])
    fallback_groups: dict[tuple[object, ...], list[dict[str, object]]] = {}
    for row in low_confidence:
        fallback_groups.setdefault(
            (row['slug'], row['line'], row['reference'], row['old']), []
        ).append(row)
    for group in fallback_groups.values():
        group.sort(key=lambda row: tuple(row.get('sourceSpan', [])))
    for row in low_confidence:
        source_label = ', '.join(str(value) for value in row.get('sourceLines', [])) or 'unknown'
        excerpt = re.sub(r'\s+', ' ', str(row['old'])).replace('`', '\\`')
        if len(excerpt) > 120:
            excerpt = excerpt[:117].rstrip() + '...'
        group = fallback_groups[(row['slug'], row['line'], row['reference'], row['old'])]
        occurrence = group.index(row) + 1
        occurrence_label = f'; occurrence {occurrence}/{len(group)}' if len(group) > 1 else ''
        span = row.get('sourceSpan', [])
        span_label = f'; source span {span[0]}–{span[1]}' if len(span) == 2 else ''
        review_lines.append(
            f'- [{row["slug"]}](raw/{row["slug"]}.md) — {row["reference"]}; '
            f'source line(s) {source_label}{span_label}{occurrence_label}; original excerpt: “{excerpt}”'
        )
    review_lines.extend(['', '## Deterministic stratified sample of other inline replacements', ''])
    for row in inline_sample:
        excerpt = re.sub(r'\s+', ' ', str(row['old'])).replace('`', '\\`')
        if len(excerpt) > 120:
            excerpt = excerpt[:117].rstrip() + '...'
        span = row.get('sourceSpan') or []
        span_label = f'; source span {span[0]}–{span[1]}' if len(span) == 2 else ''
        review_lines.append(
            f'- [{row["slug"]}](raw/{row["slug"]}.md) — {row["reference"]}; '
            f'source line {row["line"]}{span_label}; score {row["score"]}; original excerpt: “{excerpt}”'
        )
    (args.output / 'REVIEW.md').write_text('\n'.join(review_lines) + '\n')
    print(json.dumps({key: summary[key] for key in [
        'articleCount', 'replacementCount', 'blockReplacementCount',
        'inlineReplacementCount', 'remainingNetLines',
    ]}, ensure_ascii=False, indent=2))
    print(f'Low-confidence projections: {len(low_confidence)}; unmatched evidence rows: {len(unmatched)}')


if __name__ == '__main__':
    main()
