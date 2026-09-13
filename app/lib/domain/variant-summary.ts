import editionCatalog from './editions.json' with { type: 'json' };
import type { Variant } from './variants.ts';

export type EditionSummaryState = Variant['readings'][number]['state'];

export type EditionSummaryItem = {
  editionId: string;
  editionName: string;
  state: EditionSummaryState;
  label: string;
};

const stateLabels: Record<EditionSummaryState, string> = {
  present: 'Prints reading',
  absent: 'Omits reading',
  bracketed: 'Brackets reading',
  relocated: 'Relocates reading',
  mixed: 'Mixed across range',
};

/**
 * Summarize only the frozen edition account already attached to a reviewed unit.
 * A reviewed exact-text focus takes precedence over whole-range coverage.
 */
export function summarizeEditionReadings(unit: Variant): EditionSummaryItem[] {
  const readingByEdition = new Map(
    unit.readings.map((reading) => [reading.editionId, reading]),
  );

  return editionCatalog.map((edition) => {
    const reading = readingByEdition.get(edition.editionId);
    if (!reading)
      throw new Error(`Missing ${edition.editionId} reading for ${unit.id}`);
    const state = reading.focus?.state ?? reading.state;
    return {
      editionId: edition.editionId,
      editionName: edition.name,
      state,
      label: stateLabels[state],
    };
  });
}

export function editionSummaryNeedsWordingPrompt(items: EditionSummaryItem[]) {
  return items.every((item) => item.state === 'present');
}
