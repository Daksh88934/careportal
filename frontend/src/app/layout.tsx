import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Care Portal - Quality Healthcare at Your Fingertips',
    template: '%s | Care Portal',
  },
  description:
    'Connect with certified doctors, book video consultations, get e-prescriptions, and order medicines online. Advanced telemedicine platform with AI health assistance for modern healthcare.',
  keywords: [
    'telemedicine',
    'online doctor consultation',
    'video call doctor',
    'e-prescription',
    'online medicine',
    'healthcare',
    'medical consultation',
    'digital health',
    'AI health assistant',
    'Care Portal',
  ],
  authors: [{ name: 'Care Portal Team' }],
  creator: 'Care Portal',
  publisher: 'Care Portal',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  ),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Care Portal - Quality Healthcare at Your Fingertips',
    description:
      'Connect with certified doctors, book video consultations, get e-prescriptions, and order medicines online with AI health assistance.',
    siteName: 'Care Portal',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Care Portal - Advanced Telemedicine Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Care Portal - Quality Healthcare at Your Fingertips',
    description:
      'Connect with certified doctors, book video consultations, get e-prescriptions, and order medicines online with AI health assistance.',
    images: ['/og-image.jpg'],
    creator: '@careportal',
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
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel='icon' href='/favicon.ico' />
        <link
          rel='apple-touch-icon'
          sizes='180x180'
          href='/apple-touch-icon.png'
        />
        <link
          rel='icon'
          type='image/png'
          sizes='32x32'
          href='/favicon-32x32.png'
        />
        <link
          rel='icon'
          type='image/png'
          sizes='16x16'
          href='/favicon-16x16.png'
        />
        <link rel='manifest' href='/site.webmanifest' />
        <meta name='theme-color' content='#0F62FE' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='default' />
        <meta name='apple-mobile-web-app-title' content='Care Portal' />
        <meta name='mobile-web-app-capable' content='yes' />
        <meta name='msapplication-TileColor' content='#0F62FE' />
        <meta name='msapplication-config' content='/browserconfig.xml' />
      </head>
      <body className='min-h-screen bg-background font-sans antialiased'>
        <Providers>
          <div className='relative flex min-h-screen flex-col'>
            <main className='flex-1'>{children}</main>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
