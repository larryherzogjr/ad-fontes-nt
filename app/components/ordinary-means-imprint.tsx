const base = '/branding/ordinary-means-imprint-v1';

export function OrdinaryMeansImprint() {
  return <div className="publisher-imprint">
    <img src={`${base}/ordinary-means-imprint.png`} alt="Ordinary Means" width={3600} height={1040} loading="lazy" decoding="async" />
    <span>Larry Herzog Jr., publishing as Ordinary Means</span>
  </div>;
}

export function OrdinaryMeansPublisher() {
  return <section className="publisher-panel" aria-label="Publisher">
    <img src={`${base}/ordinary-means-imprint-tagline.png`} alt="Ordinary Means — Faith · Grace · Vocation" width={3600} height={1240} loading="lazy" decoding="async" />
    <p>Larry Herzog Jr., publishing as Ordinary Means</p>
  </section>;
}
