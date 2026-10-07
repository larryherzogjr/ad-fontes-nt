'use client';
import SharedReader from '@/reader/reader';
import { WordStudies } from '@/reader/word-studies';
export default function WebReader() {
  return <WordStudies><SharedReader /></WordStudies>;
}
