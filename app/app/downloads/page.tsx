import type { Metadata } from 'next';
import PublicPage from '../public-page';

const socialImageUrl = 'https://ad-fontes.app/og-downloads.png?v=20261008';

export const metadata: Metadata = {
  title: 'Desktop downloads · Ad Fontes',
  description: 'Download Ad Fontes 3.1.0 for macOS Apple Silicon or Windows 11 x64.',
  openGraph: {
    type: 'website',
    url: 'https://ad-fontes.app/downloads',
    siteName: 'Ad Fontes',
    title: 'Desktop Downloads · Ad Fontes',
    description: 'Download Ad Fontes for macOS Apple Silicon or Windows 11 x64.',
    images: [{
      url: socialImageUrl,
      width: 1730,
      height: 909,
      type: 'image/png',
      alt: 'Ad Fontes Desktop Downloads for macOS Apple Silicon and Windows 11 x64, with an open book on deep navy.',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Desktop Downloads · Ad Fontes',
    description: 'Download Ad Fontes for macOS Apple Silicon or Windows 11 x64.',
    images: [socialImageUrl],
  },
};

const macDownload = 'https://ad-fontes.app/beta-downloads/3.1.0/Ad-Fontes-macOS-Apple-Silicon-3.1.0.dmg';
const windowsDownload = 'https://ad-fontes.app/beta-downloads/3.1.0/Ad-Fontes-Windows-x64-3.1.0.exe';

export default function DownloadsPage() {
  return (
    <PublicPage eyebrow="Desktop release" title="Download Ad Fontes">
      <p>
        Version 3.1.0 includes whole-Bible English reading and comparison,
        reciprocal NT/OT connections, and Septuagint reading, interlinear
        glosses, morphology, search and cross-testament lemma exploration
        on your desktop. It also includes all 104 reviewed textual comparisons,
        their manuscript evidence, 250 Greek word studies and the 5,400-entry Greek
        lexicon, plus Lenski and Keil &amp; Delitzsch historical commentaries.
        Reading and these study resources work offline.
        Choose the package for your computer.
        Public reading and study tools require no account.
      </p>

      <div className="download-options">
        <section className="download-option" aria-labelledby="download-macos">
          <p className="eyebrow">Apple Silicon</p>
          <h2 id="download-macos">macOS</h2>
          <p>For macOS Sonoma 14 or newer on a Mac with an Apple chip.</p>
          <a className="download-button" href={macDownload}>
            Download for macOS (.dmg)
          </a>
          <p className="download-detail">Developer ID signed and Apple notarized · 288 MB</p>
        </section>

        <section className="download-option" aria-labelledby="download-windows">
          <p className="eyebrow">x64</p>
          <h2 id="download-windows">Windows 11</h2>
          <p>For Windows 11 on a computer with an x64 processor.</p>
          <a className="download-button" href={windowsDownload}>
            Download for Windows (.exe)
          </a>
          <p className="download-detail">Public Trust signed by Larry Herzog Jr. · 503 MB</p>
        </section>
      </div>

      <h2>Installing</h2>
      <p>
        On macOS, open the disk image and drag Ad Fontes into Applications.
        On Windows, open the downloaded installer and follow its prompts.
      </p>

      <p>
        Already have Ad Fontes NT? Use its built-in updater to keep your existing
        installation and saved preferences. On macOS, this also avoids adding a
        second copy when the app’s name changes.
      </p>

      <h2>Release notes</h2>
      <p>
        Version 3.1.0 introduces the Ink &amp; Brass Study Desk: an ivory
        reading surface, navy masthead, brass accents, Georgia Scripture
        typography, clearer active study tabs and selected verses, and more
        deliberate spacing on desktop and phone. The existing whole-Bible
        reading and study resources remain available offline. The app checks for stable updates and
        asks before downloading or installing them. Personal notes and Google
        sign-in remain retired.
      </p>

      <p>
        Need help? Visit <a href="/support">Support</a> or email{' '}
        <a href="mailto:larry@larryherzogjr.com">larry@larryherzogjr.com</a>.
      </p>
    </PublicPage>
  );
}
