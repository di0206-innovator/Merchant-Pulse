import type { Metadata } from 'next';
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
      <body className="min-h-screen bg-[#0A0E17] text-slate-100 antialiased flex flex-col font-sans">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
