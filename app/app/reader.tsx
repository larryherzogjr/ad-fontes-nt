'use client';
import SharedReader from '@/reader/reader';
import { WordStudies } from '@/reader/word-studies';
import PersonalNotes from './personal-notes';

/** Web entry point: accounts and notes remain specific to the hosted app. */
export default function WebReader() {
  return <WordStudies><SharedReader Notes={PersonalNotes} /></WordStudies>;
}
