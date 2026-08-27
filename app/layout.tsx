import type { Metadata } from 'next';
import Script from 'next/script';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { AuthProvider } from '@/lib/supabase/authContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { OnboardingProvider } from '@/lib/onboardingContext';
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
  title: 'MerchantPulse | AI Revenue Recovery for Razorpay',
  description: 'Deterministic financial truth. Bounded AI strategy. Closed-loop recovery.',
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
