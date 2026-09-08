import type { Metadata } from 'next';
import './globals.css';
import '@/reader/word-studies.css';
export const metadata: Metadata = {
  title: 'Ad Fontes NT',
  description: 'A New Testament study environment from Ordinary Means.',
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
