import type { Metadata } from 'next';
import PublicPage from '../public-page';

export const metadata: Metadata = { title: 'Terms · Ad Fontes NT' };

export default function TermsPage() {
  return (
    <PublicPage eyebrow="Public policy" title="Terms of Use">
      <p>Effective date: to be set when v1.0 is published.</p>
      <p>
        These terms govern use of Ad Fontes NT, provided by Larry Herzog Jr.,
        publishing as Ordinary Means. By using the service or desktop application,
        you agree to these terms.
      </p>

      <h2>Purpose and access</h2>
      <p>
        Ad Fontes NT is a free New Testament reading and study environment. It is
        provided for informational, educational, personal, church, and ministry
        use. It is not professional legal, medical, financial, or pastoral care
        and is not a substitute for primary sources or qualified counsel.
      </p>

      <h2>Accounts and private notes</h2>
      <p>
        Reading does not require an account. Private-note accounts are initially
        available by invitation and require Google identity. You are responsible
        for access to your Google account and for exporting notes you need to
        preserve independently. You retain ownership of note text you create and
        grant Ad Fontes NT only the permission needed to store, process, back up,
        and return it to you.
      </p>
      <p>
        Do not misuse the service, attempt unauthorized access, interfere with
        its operation, or use it to violate another person’s rights. Access may
        be limited when reasonably necessary to protect the service or others.
      </p>

      <h2>Application and source materials</h2>
      <p>
        The Ad Fontes NT application is free-to-use, all-rights-reserved software.
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
        supported systems, or account availability may change. Desktop updates
        require user approval and an internet connection; offline reading does
        not depend on the update service.
      </p>

      <h2>Liability</h2>
      <p>
        To the fullest extent permitted by law, Larry Herzog Jr. and Ordinary
        Means are not liable for indirect, incidental, special, consequential, or
        punitive damages arising from use of or inability to use Ad Fontes NT.
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
