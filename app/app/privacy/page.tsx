import type { Metadata } from 'next';
import PublicPage from '../public-page';
export const metadata: Metadata = { title: 'Privacy · Ad Fontes' };
export default function PrivacyPage() {
  return <PublicPage eyebrow="Public policy" title="Privacy">
    <p>Effective date: October 7, 2026.</p>
    <p>Ad Fontes is operated by Larry Herzog Jr., publishing as Ordinary Means, in North Dakota, United States. Privacy questions may be sent to <a href="mailto:larry@larryherzogjr.com">larry@larryherzogjr.com</a>.</p>
    <h2>Reading and study</h2>
    <p>Reading and study tools require no account. Personal notes and Google sign-in have been retired. This version does not collect Google account information or accept new personal notes. Ad Fontes does not use advertising trackers, behavioral analytics or desktop telemetry.</p>
    <h2>Device preferences</h2>
    <p>Reading position, text size, bookmarks and recent passages are stored on your device. They are not account-synchronized. You can remove them by clearing this site's browser storage.</p>
    <h2>Operational information</h2>
    <p>The hosting system may record ordinary security and reliability information, such as requested path, request time, network address, browser identifier, response status and errors. No sign-in cookies are created by this version.</p>
    <h2>Legacy data and privacy requests</h2>
    <p>Retiring the feature does not itself delete previously stored account or note data, or backups. Contact the operator by email for requests concerning any retained legacy data. Retained data is not exposed by the public reader.</p>
    <h2>Changes</h2>
    <p>Material changes will be posted here with a new effective date.</p>
  </PublicPage>;
}
