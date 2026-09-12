import type { Metadata } from 'next';
import Library from '@/library/library';

export const metadata: Metadata = {
  title: 'Study Library · Ad Fontes NT',
  description: 'Browse reviewed New Testament textual comparisons, Ordinary Means Greek word studies, and pinned Greek lexicon data.',
};

export default function LibraryPage() {
  return <Library />;
}
