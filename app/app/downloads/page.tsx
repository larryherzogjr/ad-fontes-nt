import type { Metadata } from 'next';
import PublicPage from '../public-page';

const socialImageUrl = 'https://ad-fontes.app/og-downloads.png?v=20261008';

export const metadata: Metadata = {
  title: 'Desktop downloads · Ad Fontes',
  description: 'Download Ad Fontes 3.6.0 for macOS Apple Silicon or Windows 11 x64.',
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

const macDownload = 'https://ad-fontes.app/beta-downloads/3.6.0/Ad-Fontes-macOS-Apple-Silicon-3.6.0.dmg';
const windowsDownload = 'https://ad-fontes.app/beta-downloads/3.6.0/Ad-Fontes-Windows-x64-3.6.0.exe';

export default function DownloadsPage() {
  return (
    <PublicPage eyebrow="Desktop release" title="Download Ad Fontes">
      <p>
        Version 3.6.0 includes whole-Bible English reading and comparison,
        reciprocal NT/OT connections, and Septuagint reading, interlinear
        glosses, morphology, search and cross-testament lemma exploration
        on your desktop. It also includes all 104 reviewed textual comparisons,
        their manuscript evidence, 250 Greek word studies and the 5,400-entry Greek
        lexicon, plus Lenski and Keil &amp; Delitzsch historical commentaries.
        Reading and these study resources work offline.
        Choose the package for your computer.
        Freely available. Public reading and study tools require no account.
      </p>

      <div className="download-options">
        <section className="download-option" aria-labelledby="download-macos">
          <p className="eyebrow">Apple Silicon</p>
          <h2 id="download-macos">macOS</h2>
          <p>For macOS Sonoma 14 or newer on a Mac with an Apple chip.</p>
          <a className="download-button" href={macDownload}>
            Download for macOS (.dmg)
          </a>
          <p className="download-detail">Developer ID signed and Apple notarized · 312 MB</p>
        </section>

        <section className="download-option" aria-labelledby="download-windows">
          <p className="eyebrow">x64</p>
          <h2 id="download-windows">Windows 11</h2>
          <p>For Windows 11 on a computer with an x64 processor.</p>
          <a className="download-button" href={windowsDownload}>
            Download for Windows (.exe)
          </a>
          <p className="download-detail">Public Trust signed by Larry Herzog Jr. · 525 MB</p>
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
      <p>Version 3.6.0 brings consistent Greek, Hebrew and English comparison panes, automatic Hebrew chapter selection, and optional synchronization by verse number where recorded passage mappings are unavailable. Approximate number matching is clearly distinguished from mapped verse synchronization.</p>
      <p>
        Version 3.6.0 includes the full LXX2012 English Septuagint, including the
        Apocrypha, the Westminster Leningrad Codex Hebrew/Aramaic text, and the
        Clementine Latin Vulgate. Explore Hebrew word analysis, lemma occurrences,
        and seven offline Hebrew word studies. Open Hebrew beside Greek in the
        Old Testament study pane, with supported passage mapping and verse sync.
        Shared reading controls, simpler commentary chapter dropdowns, and
        consistent Connections tabs improve navigation throughout the study library.
        It includes the Ink &amp; Brass Study Desk design and all existing
        offline study resources.
        The app checks for stable updates and
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
