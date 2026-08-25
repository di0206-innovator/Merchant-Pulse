import type { Metadata } from 'next';
import Script from 'next/script';
import { AuthProvider } from '@/lib/supabase/authContext';
import { ThemeProvider } from '@/lib/themeContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'MerchantPulse | AI-Assisted Revenue Intelligence for Razorpay',
  description: 'Autonomous revenue leak detection, economic expected-value decisioning, policy guardrails, and closed-loop Razorpay recovery.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="retro">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </head>
      <body className="min-h-screen bg-[#8BE8F5] dark:bg-[#070B12] light:bg-[#F8FAFC] text-slate-900 dark:text-slate-100 antialiased flex flex-col font-sans">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
