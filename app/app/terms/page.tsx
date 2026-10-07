import type { Metadata } from 'next';
import PublicPage from '../public-page';

export const metadata: Metadata = { title: 'Terms · Ad Fontes' };

export default function TermsPage() {
  return (
    <PublicPage eyebrow="Public policy" title="Terms of Use">
      <p>Effective date: October 7, 2026.</p>
      <p>
        These terms govern use of Ad Fontes, provided by Larry Herzog Jr.,
        publishing as Ordinary Means. By using the service or desktop application,
        you agree to these terms.
      </p>

      <h2>Purpose and access</h2>
      <p>
        Ad Fontes is a free biblical reading and study environment. It is
        provided for informational, educational, personal, church, and ministry
        use. It is not professional legal, medical, financial, or pastoral care
        and is not a substitute for primary sources or qualified counsel.
      </p>

      <h2>Application and source materials</h2>
      <p>
        The Ad Fontes application is free-to-use, all-rights-reserved software.
        Permission to use the application does not grant permission to copy,
        modify, redistribute, reverse engineer, or commercially exploit the
        application except where applicable law expressly permits it.
      </p>
      <p>
        Scripture editions, Greek texts, dictionaries, and other source materials
        retain their own public-domain statements, licenses, and attribution.
        Ordinary Means commentary and application presentation are distinct from
        those source materials. The Sources &amp; Editions page identifies the
        principal sources included in the release.
      </p>

      <h2>Availability, updates, and warranties</h2>
      <p>
        The service and applications are provided “as is” and “as available,”
        without warranties to the extent permitted by law. Features, content,
        supported systems, or availability may change. Desktop updates
        require user approval and an internet connection; offline reading does
        not depend on the update service.
      </p>

      <h2>Liability</h2>
      <p>
        To the fullest extent permitted by law, Larry Herzog Jr. and Ordinary
        Means are not liable for indirect, incidental, special, consequential, or
        punitive damages arising from use of or inability to use Ad Fontes.
        Some jurisdictions do not allow every limitation, so applicable law may
        provide additional rights.
      </p>

      <h2>Governing law and contact</h2>
      <p>
        These terms are governed by the laws of North Dakota and applicable
        United States federal law, without regard to conflict-of-law principles.
        Questions may be sent to <a href="mailto:larry@larryherzogjr.com">larry@larryherzogjr.com</a>.
      </p>
    </PublicPage>
  );
}
