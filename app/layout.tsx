import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CookieBanner } from '@/components/CookieBanner';

export const viewport: Viewport = {
  themeColor: '#08212D',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://merchantpulse.in'),
  title: {
    default: 'MerchantPulse · AI Revenue Intelligence for Razorpay Merchants',
    template: '%s · MerchantPulse',
  },
  description:
    'Autonomous, policy-governed revenue intelligence for modern Indian commerce. Deterministic payment analysis meets transparent AI strategy and Razorpay execution guardrails.',
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
    title: 'MerchantPulse · AI Revenue Intelligence for Razorpay Merchants',
    description:
      'Deterministic facts → AI strategy → policy gate → valid payment action → measured outcome. Recover revenue lost to payment gateway timeouts and authentication failures.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MerchantPulse · AI Revenue Intelligence for Razorpay Merchants',
    description:
      'Recover revenue lost to payment timeouts with deterministic policy gates and Razorpay integration.',
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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Tiro+Devanagari+Hindi&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
