import type { Metadata } from 'next';
import Reader from './reader';

const socialImageUrl = 'https://ad-fontes.app/og.png?v=20260907';

export const metadata: Metadata = {
  openGraph: {
    type: 'website',
    url: 'https://ad-fontes.app/',
    siteName: 'Ad Fontes NT',
    title: 'Ad Fontes NT',
    description: 'A New Testament study environment from Ordinary Means.',
    images: [{
      url: socialImageUrl,
      width: 1730,
      height: 909,
      type: 'image/png',
      alt: 'Ad Fontes NT — A New Testament study environment from Ordinary Means. Ivory lettering and an open book on deep navy.',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ad Fontes NT',
    description: 'A New Testament study environment from Ordinary Means.',
    images: [socialImageUrl],
  },
};
export default function Home() {
  return <Reader />;
}
