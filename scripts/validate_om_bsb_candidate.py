#!/usr/bin/env python3
"""Validate a review-only OM BSB adaptation candidate."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

from prepare_om_bsb_adaptation import ELLIPSIS_RE, ROOT, expand_reference, join_bsb_verses, load_bsb


DANGLING_END_WORDS = {
    'a', 'an', 'and', 'as', 'at', 'because', 'but', 'by', 'for', 'from', 'in',
    'into', 'of', 'or', 'that', 'the', 'to', 'who', 'with',
}
WORD_RE = re.compile(r"[A-Za-z0-9]+(?:['’][A-Za-z0-9]+)?")


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def words(value: str) -> list[str]:
    return [match.group().casefold() for match in WORD_RE.finditer(value)]


def repeated_ngrams(value: str, size: int = 10) -> list[str]:
    tokens = words(value)
    found: dict[tuple[str, ...], int] = {}
    for index in range(0, max(0, len(tokens) - size + 1)):
        gram = tuple(tokens[index:index + size])
        found[gram] = found.get(gram, 0) + 1
    return [' '.join(gram) for gram, count in found.items() if count > 1]


def orphan_nested_closing_quote(value: str) -> bool:
    """Find an inner curly close immediately before an outer curly close.

    Generated Scripture dialogue uses curly single quotes inside outer curly
    doubles. A segment ending in an inner close must contain its matching open.
    This deliberately avoids treating ordinary apostrophes as quotation marks.
    """
    for segment in re.findall(r'“([^“”]*)”', value):
        if segment.endswith('’') and '‘' not in segment:
            return True
    return False


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('candidate', type=Path)
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    candidate = args.candidate
    verification = json.loads((candidate / 'verification.json').read_text())
    manifest_path = candidate / 'candidate-manifest.json'
    manifest = json.loads(manifest_path.read_text())
    verses, bsb_sha = load_bsb(ROOT / verification['bsbSource'])
    errors: list[dict[str, object]] = []
    warnings: list[dict[str, object]] = []

    def require(condition: bool, code: str, detail: object) -> None:
        if not condition:
            errors.append({'code': code, 'detail': detail})

    require(sha(manifest_path) == verification['candidateManifestSha256'], 'manifest-hash', sha(manifest_path))
    require(bsb_sha == verification['bsbSourceSha256'], 'bsb-hash', bsb_sha)
    require(manifest['articleCount'] == 250, 'article-count', manifest['articleCount'])
    require(len(manifest['files']) == 250, 'manifest-file-count', len(manifest['files']))
    for entry in manifest['files']:
        path = candidate / entry['file']
        require(path.is_file() and sha(path) == entry['sha256'], 'article-hash', entry)
        if path.is_file():
            for line_number, line in enumerate(path.read_text().splitlines(), 1):
                require(
                    line.count('“') == line.count('”'),
                    'unbalanced-double-quotes',
                    {'slug': entry['slug'], 'line': line_number, 'text': line},
                )
                require(
                    not orphan_nested_closing_quote(line),
                    'orphan-nested-closing-quote',
                    {'slug': entry['slug'], 'line': line_number, 'text': line},
                )
    for field in ['remainingNetLines', 'netIsmHits', 'unmatched', 'manualSelections']:
        require(not verification[field], field, verification[field])
    require(bool(verification['inlineReplacementKeysUnique']), 'inline-key-uniqueness', False)

    seen_spans: set[tuple[object, ...]] = set()
    for record in verification['records']:
        keys = expand_reference(record['reference'], verses)
        full = join_bsb_verses(keys, verses)
        if record['kind'] == 'labeled-block':
            require(record['new'] == full, 'block-not-exact-bsb', record)
            continue
        span_key = (record['slug'], record['line'], *record['sourceSpan'])
        require(span_key not in seen_spans, 'duplicate-source-span', span_key)
        seen_spans.add(span_key)
        if record.get('wholeVerseFallback'):
            selected = set(record['selectedBsbVerses'])
            selected_text = join_bsb_verses(
                [key for key in keys if f'{key[0]} {key[1]}:{key[2]}' in selected],
                verses,
            )
            require(record['new'] == selected_text, 'fallback-not-exact-bsb', record)
        else:
            for segment in [part.strip() for part in ELLIPSIS_RE.split(record['new']) if part.strip()]:
                normalized_segment = segment.strip(' \t\n“”"‘’….!?').casefold()
                require(normalized_segment in full.casefold(), 'projection-not-from-bsb', record)
            tokens = words(record['new'])
            if tokens and tokens[-1] in DANGLING_END_WORDS and record['new'].rstrip()[-1:] not in '.!?':
                warnings.append({'code': 'possible-dangling-projection', 'record': record})
            full_duplicates = set(repeated_ngrams(full))
            duplicates = [gram for gram in repeated_ngrams(record['new']) if gram not in full_duplicates]
            if duplicates:
                warnings.append({'code': 'repeated-projection-phrase', 'ngrams': duplicates[:3], 'record': record})

    high_confidence = [
        record for record in verification['records']
        if record['kind'] == 'inline' and not record.get('wholeVerseFallback')
    ]
    require(
        len(verification['inlineReviewSample']) >= (len(high_confidence) + 9) // 10,
        'inline-sample-too-small',
        {'sample': len(verification['inlineReviewSample']), 'eligible': len(high_confidence)},
    )
    require(not warnings, 'projection-warnings', warnings)
    result = {
        'status': 'pass' if not errors else 'fail',
        'candidateManifestSha256': verification['candidateManifestSha256'],
        'articleCount': manifest['articleCount'],
        'recordCount': len(verification['records']),
        'inlineReviewSampleCount': len(verification['inlineReviewSample']),
        'suppressedContainedEvidenceCount': len(verification['suppressedContainedEvidence']),
        'wholeVerseFallbackCount': len(verification['lowConfidence']),
        'maximumFallbackWordCount': max((len(words(record['new'])) for record in verification['lowConfidence']), default=0),
        'netIsmSignatureCount': len(verification['netIsmSignatures']),
        'netIsmHitCount': len(verification['netIsmHits']),
        'unbalancedDoubleQuoteLineCount': sum(error['code'] == 'unbalanced-double-quotes' for error in errors),
        'orphanNestedClosingQuoteLineCount': sum(error['code'] == 'orphan-nested-closing-quote' for error in errors),
        'bsbSourceSha256': verification['bsbSourceSha256'],
        'errors': errors,
    }
    rendered = json.dumps(result, ensure_ascii=False, indent=2) + '\n'
    if args.output:
        args.output.write_text(rendered)
    print(rendered, end='')
    if errors:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
