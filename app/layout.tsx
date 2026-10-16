import type { Metadata } from 'next';
import Script from 'next/script';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { AuthProvider } from '@/lib/supabase/authContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { OnboardingProvider } from '@/lib/onboardingContext';
import { GlobalGtmWidgets } from '@/components/GlobalGtmWidgets';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://merchantpulse.io'),
  title: {
    default: 'MerchantPulse | Autonomous AI Revenue Recovery for Razorpay',
    template: '%s | MerchantPulse',
  },
  description:
    'Deterministic paise-precision EV calculus, bounded Gemini 2.5 Flash AI strategy, multi-tier policy guardrails, and cryptographic webhook reconciliation for Razorpay merchants.',
  keywords: [
    'Razorpay payment recovery',
    'UPI failure recovery',
    'AI revenue recovery agent',
    'fintech payment orchestration',
    'MerchantPulse',
  ],
  authors: [{ name: 'MerchantPulse Technologies Pvt. Ltd.' }],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: ['/favicon.svg'],
    apple: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
  openGraph: {
    title: 'MerchantPulse | Autonomous AI Revenue Recovery for Razorpay',
    description:
      'Recover up to 34% of failed UPI, Card, and NetBanking checkouts with deterministic EV math, bounded AI strategy, and cryptographic webhook verification.',
    url: 'https://merchantpulse.io',
    siteName: 'MerchantPulse',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'MerchantPulse Autonomous AI Payment Recovery Console Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MerchantPulse | AI Payment Recovery for Razorpay',
    description:
      'Deterministic financial truth. Bounded AI strategy. Closed-loop payment recovery.',
    images: ['/og-image.svg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-nb-bg text-nb-white antialiased flex flex-col font-sans transition-colors duration-200">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <OnboardingProvider>
            <AuthProvider>
              {children}
              <GlobalGtmWidgets />
            </AuthProvider>
          </OnboardingProvider>
        </ThemeProvider>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
