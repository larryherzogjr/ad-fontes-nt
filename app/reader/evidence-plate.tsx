'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import visualRelease from '@/lib/domain/visual-release.json';

type PlateImage = {
  asset: string;
  width: number;
  height: number;
  sourceImageId: string;
  sourceImageName: string;
  alt: string;
};
type Plate = {
  title: string;
  passage: string;
  manuscript: {
    name: string;
    gregoryAland: string;
    date: string;
    holdingInstitution: string;
    shelfmark: string;
    locator: string;
    imageType: string;
  };
  images: PlateImage[];
  caption: string;
  demonstrates: string;
  doesNotEstablish: string;
  credit: string;
  reuseStatement: string;
  sourceUrl: string;
  transcriptionUrl?: string;
};
type Registry = {
  schemaVersion: number;
  releaseId: string;
  status: string;
  editorialReview: { status: string; candidateSha256: string };
  plates: Record<string, Plate>;
};

type Selection = { releaseId: string; candidateSha256: string };
const selections: Selection[] = [
  { releaseId: visualRelease.releaseId, candidateSha256: visualRelease.candidateSha256 },
  ...visualRelease.supplements,
];
const plateIds = new Set(Array.from({ length: 39 }, (_, index) => `candidate-${String(index + 1).padStart(2, '0')}`));
let registriesPromise: Promise<Registry[]> | undefined;
function loadRegistries() {
  registriesPromise ??= Promise.all(selections.map(async selection => {
    const response = await fetch(`/visuals/${selection.releaseId}/registry.json`);
    if (!response.ok) throw new Error('Manuscript evidence could not be loaded.');
    const registry = await response.json() as Registry;
    if (registry.schemaVersion !== 1 || registry.releaseId !== selection.releaseId || registry.status !== 'approved' || registry.editorialReview?.status !== 'approved' || registry.editorialReview?.candidateSha256 !== selection.candidateSha256) {
      throw new Error('Manuscript evidence release is invalid.');
    }
    return registry;
  }));
  return registriesPromise;
}

function uniquePlates(plates: Plate[]) {
  const seen = new Set<string>();
  return plates.filter(plate => {
    const key = `${plate.manuscript.gregoryAland}|${plate.images.map(image => image.sourceImageId).sort().join(',')}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function PlateView({ unitId, plate, index, total }: { unitId: string; plate: Plate; index: number; total: number }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const lightboxRef = useRef<HTMLDialogElement | null>(null);
  const lightboxTriggerRef = useRef<HTMLButtonElement | null>(null);
  const restoreLightboxFocusRef = useRef(false);
  const lightboxTitleId = useId();
  const lightboxDescriptionId = useId();
  const titleId = `${unitId}-evidence-title-${index}`;

  useEffect(() => {
    if (selectedImageIndex === null || !lightboxRef.current || lightboxRef.current.open) return;
    lightboxRef.current.showModal();
  }, [selectedImageIndex]);

  useEffect(() => {
    if (selectedImageIndex !== null || !restoreLightboxFocusRef.current) return;
    restoreLightboxFocusRef.current = false;
    requestAnimationFrame(() => lightboxTriggerRef.current?.focus({ preventScroll: true }));
  }, [selectedImageIndex]);

  const closeLightbox = () => {
    if (lightboxRef.current?.open) lightboxRef.current.close();
  };
  const selectedImage = selectedImageIndex === null ? null : plate.images[selectedImageIndex];

  return (
    <section className="evidence-plate" aria-labelledby={titleId}>
      <div className="evidence-plate-heading">
        <h5 id={titleId}>Manuscript evidence plate</h5>
        <span>{total === 1 ? 'One witness' : `Witness ${index + 1} of ${total}`}</span>
      </div>
      <p className="evidence-plate-identity">
        <strong>{plate.manuscript.name} ({plate.manuscript.gregoryAland})</strong>
        {' · '}{plate.manuscript.date}{' · '}{plate.manuscript.shelfmark}{' · '}{plate.manuscript.locator}
      </p>
      <div className="evidence-plate-gallery">
        {plate.images.map((image, imageIndex) => (
          <figure key={image.sourceImageId}>
            <button
              className="evidence-image-button"
              aria-label={`Enlarge ${plate.title}, image ${imageIndex + 1} of ${plate.images.length}`}
              onClick={event => {
                lightboxTriggerRef.current = event.currentTarget;
                setSelectedImageIndex(imageIndex);
              }}
            >
              <img src={image.asset} width={image.width} height={image.height} alt={image.alt} loading="lazy" />
              <span aria-hidden="true">Enlarge</span>
            </button>
            <figcaption>{image.sourceImageName} · CSNTM image {image.sourceImageId}</figcaption>
          </figure>
        ))}
      </div>
      <p className="evidence-caption">{plate.caption}</p>
      <dl className="evidence-claims">
        <div><dt>What this demonstrates</dt><dd>{plate.demonstrates}</dd></div>
        <div><dt>What it cannot establish</dt><dd>{plate.doesNotEstablish}</dd></div>
      </dl>
      <p className="evidence-credit">{plate.credit}</p>
      <p className="evidence-reuse">{plate.reuseStatement}</p>
      <p className="evidence-links">
        <a href={plate.sourceUrl}>CSNTM manuscript source</a>
        {plate.transcriptionUrl && <><span aria-hidden="true"> · </span><a href={plate.transcriptionUrl}>Primary transcription</a></>}
      </p>
      {selectedImage && createPortal(
        <dialog
          ref={lightboxRef}
          className="manuscript-lightbox"
          aria-labelledby={lightboxTitleId}
          aria-describedby={lightboxDescriptionId}
          onKeyDown={event => {
            if (event.key === 'Escape') event.stopPropagation();
          }}
          onCancel={event => {
            event.preventDefault();
            event.stopPropagation();
            closeLightbox();
          }}
          onClose={() => {
            restoreLightboxFocusRef.current = true;
            setSelectedImageIndex(null);
          }}
        >
          <header className="manuscript-lightbox-header">
            <h2 id={lightboxTitleId}>{plate.title}</h2>
            <p id={lightboxDescriptionId}>{plate.manuscript.name} · {plate.manuscript.locator} · complete artifact view</p>
          </header>
          <Button
            type="button"
            variant="ghost"
            className="manuscript-lightbox-close"
            size="icon-sm"
            aria-label="Close enlarged manuscript"
            onClick={closeLightbox}
          >
            <XIcon />
          </Button>
          <div className="manuscript-lightbox-image">
            <img src={selectedImage.asset} width={selectedImage.width} height={selectedImage.height} alt={selectedImage.alt} />
          </div>
          <p>Use browser or system zoom for closer inspection. The full page remains visible rather than being replaced by a decorative crop.</p>
        </dialog>,
        document.body,
      )}
    </section>
  );
}

export default function EvidencePlate({ unitId }: { unitId: string }) {
  const eligible = plateIds.has(unitId);
  const [plates, setPlates] = useState<Plate[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!eligible) return;
    let active = true;
    loadRegistries()
      .then(registries => { if (active) setPlates(uniquePlates(registries.flatMap(registry => registry.plates[unitId] ? [registry.plates[unitId]] : []))); })
      .catch(reason => { if (active) setError(reason instanceof Error ? reason.message : 'Manuscript evidence could not be loaded.'); });
    return () => { active = false; };
  }, [eligible, unitId]);
  if (!eligible) return null;
  if (error) return <p className="evidence-plate-error" role="status">{error} The reviewed explanation remains available.</p>;
  if (!plates.length) return <p className="evidence-plate-loading" role="status">Loading local manuscript evidence…</p>;
  return (
    <>{plates.map((plate, index) => <PlateView key={`${plate.manuscript.gregoryAland}-${plate.images.map(image => image.sourceImageId).join('-')}-${index}`} unitId={unitId} plate={plate} index={index} total={plates.length} />)}</>
  );
}
