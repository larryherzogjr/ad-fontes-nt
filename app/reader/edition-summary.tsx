import type { Variant } from '@/lib/domain/variants';
import {
  editionSummaryNeedsWordingPrompt,
  summarizeEditionReadings,
} from '@/lib/domain/variant-summary';

export default function EditionSummary({ unit }: { unit: Variant }) {
  const items = summarizeEditionReadings(unit);

  return (
    <section
      className="edition-summary"
      aria-labelledby={`${unit.id}-edition-summary-title`}
    >
      <h5 id={`${unit.id}-edition-summary-title`}>Edition summary</h5>
      <ul>
        {items.map((item) => (
          <li key={item.editionId} data-state={item.state}>
            <abbr title={item.editionName}>{item.editionId}</abbr>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
      {editionSummaryNeedsWordingPrompt(items) && (
        <p>All seven print a reading here; compare their exact words below.</p>
      )}
      {unit.presentation === 'publisher-note' && (
        <p>
          The publisher note reports an alternative; it is not another displayed
          edition reading.
        </p>
      )}
      <p className="edition-summary-limit">
        Seven frozen editions only. Edition agreement is not manuscript
        evidence.
      </p>
    </section>
  );
}
