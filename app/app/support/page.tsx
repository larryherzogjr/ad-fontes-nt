import type { Metadata } from 'next';
import PublicPage from '../public-page';

export const metadata: Metadata = { title: 'Support · Ad Fontes NT' };

export default function SupportPage() {
  return (
    <PublicPage eyebrow="Help and contact" title="Support">
      <p>
        For help, corrections, privacy requests, account deletion, or responsible
        security reports, email <a href="mailto:larry@larryherzogjr.com">larry@larryherzogjr.com</a>.
      </p>

      <h2>When reporting a problem</h2>
      <p>
        Include the passage, edition, operating system or browser, and what you
        expected to happen. Do not send passwords, authentication cookies,
        private keys, or private note text unless it is essential to your request.
      </p>

      <h2>Supported desktop systems</h2>
      <ul>
        <li>macOS Sonoma 14 or newer on Apple Silicon.</li>
        <li>Windows 11 on x64 computers.</li>
      </ul>
      <p>
        Intel Mac, Windows ARM, Linux, and older operating systems are not
        supported in v1.0. They may run the software, but they are not certified.
      </p>

      <h2>Updates and offline reading</h2>
      <p>
        The desktop app checks quietly for stable updates at most once every 24
        hours and also provides a manual check. It asks before downloading or
        installing an update. Reading continues to work without internet access.
      </p>

      <h2>Accounts</h2>
      <p>
        Public reading does not require an account. Private-note accounts are
        initially invitation-only. Use My account to sign out or permanently
        delete your account and notes.
      </p>
    </PublicPage>
  );
}
