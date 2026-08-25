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
    <html lang="en" className="dark">
      <head>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </head>
      <body className="min-h-screen bg-[#070B12] dark:bg-[#070B12] light:bg-[#F8FAFC] text-slate-100 dark:text-slate-100 light:text-slate-900 antialiased flex flex-col font-sans">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
