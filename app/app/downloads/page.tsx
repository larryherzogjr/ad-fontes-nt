import type { Metadata } from 'next';
import PublicPage from '../public-page';

const socialImageUrl = 'https://ad-fontes.app/og-downloads.png?v=20260911';

export const metadata: Metadata = {
  title: 'Desktop downloads · Ad Fontes NT',
  description: 'Download the Ad Fontes NT desktop release candidate for macOS Apple Silicon or Windows 11 x64.',
  openGraph: {
    type: 'website',
    url: 'https://ad-fontes.app/downloads',
    siteName: 'Ad Fontes NT',
    title: 'Desktop Downloads · Ad Fontes NT',
    description: 'Download Ad Fontes NT for macOS Apple Silicon or Windows 11 x64.',
    images: [{
      url: socialImageUrl,
      width: 1730,
      height: 909,
      type: 'image/png',
      alt: 'Ad Fontes NT Desktop Downloads for macOS Apple Silicon and Windows 11 x64, with an open book on deep navy.',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Desktop Downloads · Ad Fontes NT',
    description: 'Download Ad Fontes NT for macOS Apple Silicon or Windows 11 x64.',
    images: [socialImageUrl],
  },
};

const macDownload = 'https://ad-fontes.app/beta-downloads/1.0.0-rc.3/Ad-Fontes-NT-macOS-Apple-Silicon-1.0.0-rc.3.dmg';
const windowsDownload = 'https://ad-fontes.app/beta-downloads/1.0.0-rc.3/Ad-Fontes-NT-Windows-x64-1.0.0-rc.3.exe';

export default function DownloadsPage() {
  return (
    <PublicPage eyebrow="Desktop release candidate" title="Download Ad Fontes NT">
      <p>
        Version 1.0.0-rc.3 brings the Ad Fontes NT reader and study tools to
        your desktop for offline reading. Choose the package for your computer.
        Public reading does not require an account; private account-backed notes
        remain available in the web app.
      </p>

      <div className="download-options">
        <section className="download-option" aria-labelledby="download-macos">
          <p className="eyebrow">Apple Silicon</p>
          <h2 id="download-macos">macOS</h2>
          <p>For macOS Sonoma 14 or newer on a Mac with an Apple chip.</p>
          <a className="download-button" href={macDownload}>
            Download for macOS (.dmg)
          </a>
          <p className="download-detail">37.1 MB · Developer ID signed and Apple notarized</p>
        </section>

        <section className="download-option" aria-labelledby="download-windows">
          <p className="eyebrow">x64</p>
          <h2 id="download-windows">Windows 11</h2>
          <p>For Windows 11 on a computer with an x64 processor.</p>
          <a className="download-button" href={windowsDownload}>
            Download for Windows (.exe)
          </a>
          <p className="download-detail">248.6 MB · Signed by Larry Herzog Jr.</p>
        </section>
      </div>

      <h2>Installing</h2>
      <p>
        On macOS, open the disk image and drag Ad Fontes NT into Applications.
        On Windows, open the downloaded installer and follow its prompts.
      </p>

      <h2>Release-candidate notice</h2>
      <p>
        This is the tested cross-platform candidate for the public v1.0 release.
        The application checks for future stable updates and asks before downloading
        or installing them.
      </p>

      <p>
        Need help? Visit <a href="/support">Support</a> or email{' '}
        <a href="mailto:larry@larryherzogjr.com">larry@larryherzogjr.com</a>.
      </p>
    </PublicPage>
  );
}
