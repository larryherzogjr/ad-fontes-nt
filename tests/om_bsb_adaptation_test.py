import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))

from prepare_om_bsb_adaptation import (  # noqa: E402
    expand_reference,
    fallback_requires_hand_adaptation,
    load_bsb,
    nested_quotation,
    normalize_bsb_citation_labels,
    normalized_reference,
    remove_orphan_nested_closings,
    remove_stranded_quote_periods,
    resolve_quote_candidates,
    smallest_verse_fallback,
)


class OmBsbAdaptation(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.verses, cls.bsb_sha = load_bsb(ROOT / 'sources/bsb/raw/bsb.txt')

    def test_reference_normalization_and_discontiguous_expansion(self):
        keys = expand_reference('Matthew 3:8, 10', self.verses)
        self.assertEqual(keys, [('Matthew', 3, 8), ('Matthew', 3, 10)])
        self.assertEqual(normalized_reference(keys), 'Matthew 3:8; Matthew 3:10')

    def test_long_range_fallback_selects_relevant_single_verse(self):
        keys = expand_reference('Romans 5:12-21', self.verses)
        text, selected, _, manual = smallest_verse_fallback(
            'consequently, just as condemnation for all people came through one transgression, '
            'so too through the one righteous act came righteousness leading to life for all people',
            keys,
            self.verses,
        )
        self.assertEqual(selected, [('Romans', 5, 18)])
        self.assertEqual(text, self.verses[('Romans', 5, 18)])
        self.assertFalse(manual)

    def test_contained_evidence_is_suppressed_without_duplicate_replacement(self):
        selected, suppressed = resolve_quote_candidates('example', 10, [
            {'start': 5, 'end': 25, 'old': 'long quotation text', 'reference': 'John 1:1'},
            {'start': 10, 'end': 20, 'old': 'quotation', 'reference': 'John 1:1'},
            {'start': 30, 'end': 35, 'old': 'other', 'reference': 'John 1:2'},
        ])
        self.assertEqual([(row['start'], row['end']) for row in selected], [(5, 25), (30, 35)])
        self.assertEqual(len(suppressed), 1)

    def test_partial_overlap_is_rejected(self):
        with self.assertRaises(ValueError):
            resolve_quote_candidates('example', 10, [
                {'start': 5, 'end': 20, 'old': 'first', 'reference': 'John 1:1'},
                {'start': 15, 'end': 30, 'old': 'second', 'reference': 'John 1:2'},
            ])

    def test_nested_scripture_dialogue_does_not_duplicate_outer_quotes(self):
        rendered = nested_quotation(
            'Jesus said, “I am the resurrection and the life.”',
            '“',
        )
        wrapped = f'“{rendered}”'
        self.assertEqual(wrapped.count('“'), 1)
        self.assertEqual(wrapped.count('”'), 1)
        self.assertIn('‘I am the resurrection and the life.’', wrapped)

    def test_only_bsb_labels_expand_book_abbreviations(self):
        rendered, changes = normalize_bsb_citation_labels(
            'Compare Matt 5:44 with “the truth in love” (Eph 4:15, BSB).'
        )
        self.assertEqual(
            rendered,
            'Compare Matt 5:44 with “the truth in love” (Ephesians 4:15, BSB).',
        )
        self.assertEqual(len(changes), 1)

    def test_stranded_period_is_removed_but_question_mark_is_retained(self):
        rendered, count = remove_stranded_quote_periods(
            'Paul writes “the body.” while Jesus asks “Do you love Me?” twice.'
        )
        self.assertEqual(
            rendered,
            'Paul writes “the body” while Jesus asks “Do you love Me?” twice.',
        )
        self.assertEqual(count, 1)

    def test_orphan_nested_close_is_removed_without_touching_balanced_dialogue(self):
        rendered, count = remove_orphan_nested_closings(
            '“May the LORD give you peace.’” and “Jesus said, ‘Come.’”'
        )
        self.assertEqual(
            rendered,
            '“May the LORD give you peace.” and “Jesus said, ‘Come.’”',
        )
        self.assertEqual(count, 1)

    def test_short_or_embedded_whole_verse_fallback_requires_hand_adaptation(self):
        self.assertTrue(fallback_requires_hand_adaptation(
            'Paul calls this “the truth” in the passage.',
            {'start': 17},
            'the truth',
        ))
        self.assertTrue(fallback_requires_hand_adaptation(
            'Paul writes “This complete sentence has enough words to pass the length test.”',
            {'start': 13},
            'This complete sentence has enough words to pass the length test',
        ))
        self.assertFalse(fallback_requires_hand_adaptation(
            'Paul writes: “This complete sentence has enough words to stand as a block.”',
            {'start': 14},
            'This complete sentence has enough words to stand as a block',
        ))


if __name__ == '__main__':
    unittest.main()
