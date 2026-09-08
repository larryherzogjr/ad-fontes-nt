import type { Metadata } from 'next';
import './globals.css';
import '@/reader/word-studies.css';
export const metadata: Metadata = {
  title: 'Ad Fontes NT',
  description: 'A New Testament study environment from Ordinary Means.',
  icons: { icon: { url: '/favicon.ico?v=af-20260908', type: 'image/x-icon' } },
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
