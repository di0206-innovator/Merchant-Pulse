import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CookieBanner } from '@/components/CookieBanner';
import { ThemeProvider } from '@/components/ThemeProvider';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAF9' },
    { media: '(prefers-color-scheme: dark)', color: '#09090B' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://merchantpulse.in'),
  title: {
    default: 'MerchantPulse · Institutional Revenue Intelligence for Razorpay Merchants',
    template: '%s · MerchantPulse',
  },
  description:
    'Production-grade fintech intelligence for Indian commerce. Deterministic payment analysis, transparent AI strategy, and policy-governed recovery pipelines.',
  keywords: [
    'Razorpay',
    'Payment Intelligence',
    'Fintech India',
    'Revenue Recovery',
    'Deterministic State Machine',
    'Payment Drop-off Prevention',
    'Payment Webhook Spine',
  ],
  authors: [{ name: 'MerchantPulse Technologies Private Limited' }],
  creator: 'MerchantPulse',
  icons: {
    icon: '/icon.svg',
    shortcut: '/favicon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://merchantpulse.in',
    siteName: 'MerchantPulse',
    title: 'MerchantPulse · Institutional Revenue Intelligence for Razorpay Merchants',
    description:
      'Deterministic facts → AI strategy → policy gate → valid payment action → measured outcome. Financial operations platform for Indian merchants.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MerchantPulse · Institutional Revenue Intelligence',
    description:
      'Turn payment failure telemetry into policy-governed revenue recovery workflows.',
    creator: '@merchantpulse',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('merchantpulse_theme_pref');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}else if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.setAttribute('data-theme','dark');}else{document.documentElement.setAttribute('data-theme','light');}}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Tiro+Devanagari+Hindi&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="swiss-ambient-atmosphere" aria-hidden="true">
          <div className="ambient-orb orb-amber" />
          <div className="ambient-orb orb-cyan" />
          <div className="ambient-orb orb-indigo" />
          <div className="ambient-orb orb-emerald" />
          <div className="swiss-grid-pattern" />
        </div>
        <ThemeProvider>
          {children}
          <CookieBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}
