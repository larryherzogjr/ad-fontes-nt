import type { Metadata } from 'next';
import PublicPage from '../public-page';

export const metadata: Metadata = { title: 'Privacy · Ad Fontes NT' };

export default function PrivacyPage() {
  return (
    <PublicPage eyebrow="Public policy" title="Privacy">
      <p>Effective date: to be set when v1.0 is published.</p>
      <p>
        Ad Fontes NT is operated by Larry Herzog Jr., publishing as Ordinary
        Means, in North Dakota, United States. Questions and privacy requests
        may be sent to <a href="mailto:larry@larryherzogjr.com">larry@larryherzogjr.com</a>.
      </p>

      <h2>Reading without an account</h2>
      <p>
        You may read Scripture and use the public study tools without creating
        an account. Ad Fontes NT does not use advertising trackers, behavioral
        analytics, or desktop telemetry.
      </p>

      <h2>Account and note information</h2>
      <p>
        If you choose to use private notes, Google supplies your account
        identifier, name, and verified email address so Ad Fontes NT can identify
        you. Ad Fontes NT does not request access to your Google mail, files, or
        contacts and does not retain Google access or refresh tokens.
      </p>
      <p>
        Ad Fontes NT stores the private notes you explicitly save, their Scripture
        references, optional Scripture quotations, timestamps, and technical
        versions used to prevent conflicting edits. Notes are not published or
        included in shared passage links.
      </p>

      <h2>Cookies and operational records</h2>
      <p>
        Essential, secure cookies maintain sign-in state and protect account
        changes. No marketing or analytics cookies are used. The hosting system
        may temporarily record ordinary security and reliability information,
        such as request time, requested path, network address, browser identifier,
        response status, and error details. Private note bodies are not
        intentionally written to operational logs.
      </p>

      <h2>How information is used and shared</h2>
      <p>
        Account information is used only to authenticate you, provide private
        notes, protect the service, respond to support requests, and maintain
        reliability. It is not sold or used for advertising. Information is
        disclosed only to service providers needed to operate authentication,
        hosting, email, and backups, or when legally required.
      </p>

      <h2>Deletion, retention, and backups</h2>
      <p>
        You may delete your account and all private notes from My account, or
        request help by email. Deletion removes the live account and notes
        immediately. Encrypted backups are retained on a rolling schedule and
        age out within 30 days after deletion. Limited security records may be
        retained for up to 30 days unless a longer period is required to
        investigate abuse or comply with law.
      </p>

      <h2>Security and children</h2>
      <p>
        Reasonable technical and operational safeguards protect account data,
        but no online service can guarantee absolute security. Public reading is
        available to everyone. Account holders must be at least 13 years old or
        have permission from a parent or guardian.
      </p>

      <h2>Changes</h2>
      <p>
        Material changes will be posted here with a new effective date. Continued
        account use after a change means the revised policy applies going forward.
      </p>
    </PublicPage>
  );
}
