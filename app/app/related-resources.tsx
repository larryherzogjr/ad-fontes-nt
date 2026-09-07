import { relatedResources } from '@/lib/domain/resources';
import type { PassageRange } from '@/lib/domain/references';

export default function RelatedResources({ ranges }: { ranges: PassageRange[] }) {
  const matches = relatedResources(ranges);
  if (!matches.length) return null;
  return (
    <details id="related-resources" className="related-resources">
      <summary>Related Ordinary Means resources <span>({matches.length})</span></summary>
      <p>By Larry Herzog Jr. Links open in a new tab.</p>
      <ul>
        {matches.map(resource => (
          <li key={resource.id}>
            <a href={resource.url} target="_blank" rel="noopener noreferrer">
              {resource.title}<span className="sr-only"> (opens in a new tab)</span>
            </a>
            <span className="resource-kind">{resource.kind}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}
