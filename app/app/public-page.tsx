import type { ReactNode } from 'react';
import Link from 'next/link';

export default function PublicPage({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <>
      <header className="masthead public-masthead">
        <Link className="brand" href="/">
          Ad Fontes NT
          <span>A New Testament study environment from Ordinary Means.</span>
        </Link>
        <nav aria-label="Primary">
          <Link href="/">Read</Link>
          <Link href="/about/sources">Sources &amp; Editions</Link>
          <Link href="/account">My account</Link>
        </nav>
      </header>
      <main className="public-page">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="policy-draft" role="note">
          Draft for owner review. This text is not yet the published v1.0 policy.
        </p>
        {children}
      </main>
      <footer className="public-footer">
        <span>Larry Herzog Jr., publishing as Ordinary Means</span>
        <nav aria-label="Policies and support">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/support">Support</Link>
        </nav>
      </footer>
    </>
  );
}
