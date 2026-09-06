import type { Metadata } from 'next';
import Reader from './reader';
export const metadata: Metadata = {
  openGraph: {
    type: 'website',
    url: 'https://ad-fontes.app/',
    siteName: 'Ad Fontes NT',
    title: 'Ad Fontes NT',
    description: 'A New Testament study environment from Ordinary Means.',
    images: [{
      url: 'https://ad-fontes.app/og.png',
      width: 1731,
      height: 909,
      type: 'image/png',
      alt: 'Ad Fontes NT — A New Testament study environment from Ordinary Means. An open-book illustration on warm ivory paper.',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ad Fontes NT',
    description: 'A New Testament study environment from Ordinary Means.',
    images: ['https://ad-fontes.app/og.png'],
  },
};
export default function Home() {
  return <Reader />;
}
