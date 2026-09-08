'use client';
import { createContext, useContext, type ComponentType } from 'react';
import type { WordLink } from '@/lib/domain/lexical';

export function WebsiteWordStudyLink({ link }: { link: WordLink }) {
  return <p className="word-study-link"><a href={link.url} target="_blank" rel="noopener noreferrer">Read Larry’s word study: {link.title} ↗</a><small>Ordinary Means commentary{link.access !== 'free' ? ' · Website access requirements apply' : ''} · opens in a new tab</small></p>;
}

export const ReaderEnvironment = createContext<{
  WordStudyLink: ComponentType<{ link: WordLink }>;
  wordStudyDescription: string;
  readingStatus: string;
}>({
  WordStudyLink: WebsiteWordStudyLink,
  readingStatus: 'Reading position and text size are saved on this device. The address bar is your passage link.',
  wordStudyDescription: 'Separate Ordinary Means word-study links use the public Greek Word Explorer index from larryherzogjr.com, retrieved September 6, 2026. Links open the original website and preserve its access requirements; article text is not imported.',
});

export const useReaderEnvironment = () => useContext(ReaderEnvironment);
