import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://jobfit.today';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'JobFit — Tailor Your Resume to Any Job in 30 Seconds | AI Cover Letter & Fit Score',
    template: '%s | JobFit',
  },
  description:
    'Paste any job description and get an instant fit score, an AI-tailored resume, and a cover letter — built for new grads and career switchers. Free to try, $9.99/quarter for unlimited.',
  applicationName: 'JobFit',
  keywords: [
    'AI resume builder',
    'tailor resume to job description',
    'AI cover letter generator',
    'resume fit score',
    'job application tool',
    'ATS resume',
    'resume tailoring AI',
    'cover letter AI',
    'job description analyzer',
    'free resume tool',
  ],
  authors: [{ name: 'JobFit' }],
  creator: 'JobFit',
  publisher: 'JobFit',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: 'JobFit',
    title: 'JobFit — Tailor Your Resume to Any Job in 30 Seconds',
    description:
      'Paste a job description. Get a fit score, tailored resume, and cover letter in under 30 seconds. Free to try.',
    url: SITE_URL,
    locale: 'en_US',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'JobFit — AI-tailored resume and cover letter in 30 seconds',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JobFit — Tailor Your Resume to Any Job in 30 Seconds',
    description:
      'Paste a JD. Get a fit score, tailored resume, and cover letter in under 30 seconds. Free to try.',
    images: ['/og.png'],
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
  category: 'productivity',
  // Add Search Console / Bing verification strings here once you have them.
  // verification: { google: 'xxxx', other: { 'msvalidate.01': 'xxxx' } },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 min-h-screen">
        {children}
        <Analytics />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-X5XBCMDQJL" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-X5XBCMDQJL');
        `}</Script>
        <Script id="tiktok-pixel" strategy="afterInteractive">{`
          !function (w, d, t) {
            w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
            ttq.load('D7C4H7RC77U3K3SH6I30');
            ttq.page();
          }(window, document, 'ttq');
        `}</Script>
      </body>
    </html>
  );
}
