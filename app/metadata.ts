import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://dhisai-smoky.vercel.app/';

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: 'Dharsi AI Assistant - Simplify Health Data Analysis',
      template: '%s | Dharsi AI Assistant',
    },
    description:
      'I am Dharsi, how can I help you? The Dharsi AI Assistant simplifies the process of querying and analyzing health data using artificial intelligence. Leverage natural language to interact with your DHIS2 instance and make data-driven decisions.',
    keywords: [
      'DHIS2',
      'health data',
      'AI assistant',
      'data analysis',
      'health insights',
      'public health',
      'data visualization',
      'artificial intelligence',
      'Dharsi',
    ],
    authors: [{ name: 'Dharsi AI Team' }],
    creator: 'Dharsi AI Team',
    publisher: 'Dharsi AI Inc.',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: siteUrl,
      siteName: 'Dharsi AI Assistant',
      title: 'Dharsi AI Assistant - Simplify Health Data Analysis',
      description:
        'I am Dharsi, how can I help you? The Dharsi AI Assistant simplifies the process of querying and analyzing health data using artificial intelligence. Leverage natural language to interact with your DHIS2 instance and make data-driven decisions.',
      images: [
        {
          url: `${siteUrl}/images/site-main.png`,
          width: 1200,
          height: 630,
          alt: 'Dharsi AI Assistant - Simplify Health Data Analysis',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Dharsi AI Assistant - Simplify Health Data Analysis',
      description:
        'I am Dharsi, how can I help you? The Dharsi AI Assistant simplifies the process of querying and analyzing health data using artificial intelligence. Leverage natural language to interact with your DHIS2 instance and make data-driven decisions.',
      images: [`${siteUrl}/images/site-main.png`],
      creator: '@DharsiAI',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: [
        {
          url: '/images/favicons/favicon-32x32.png',
          sizes: '32x32',
          type: 'image/png',
        },
        {
          url: '/images/favicons/favicon-16x16.png',
          sizes: '16x16',
          type: 'image/png',
        },
      ],
      apple: [
        {
          url: '/images/favicons/apple-touch-icon.png',
          sizes: '180x180',
          type: 'image/png',
        },
      ],
      other: [
        {
          rel: 'mask-icon',
          url: '/images/favicons/safari-pinned-tab.svg',
          color: '#5bbad5',
        },
      ],
    },
    manifest: '/images/favicons/site.webmanifest',
  };
}
