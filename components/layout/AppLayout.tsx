'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  Clock,
  FileCheck2,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Settings,
  X,
  Moon,
  Sun,
  Database,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/lib/supabase/authContext';
import { useOnboarding } from '@/lib/onboardingContext';
import { SettingsDrawer } from '@/components/dashboard/SettingsDrawer';

const NAV = [
  { label: 'Overview',  href: '/overview',  icon: LayoutDashboard },
  { label: 'Reviewer',  href: '/reviewer',   icon: ShieldCheck     },
  { label: 'Strategy',  href: '/strategy',   icon: BarChart3       },
  { label: 'Audit',     href: '/audit',      icon: FileCheck2      },
  { label: 'History',   href: '/history',    icon: Clock           },
  { label: 'Knowledge', href: '/knowledge',  icon: Database        },
];

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  base: { label: 'Base', color: '#888888' },
  pro:  { label: 'Pro',  color: '#FFE500'  },
  max:  { label: 'Max',  color: '#00FF94'  },
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const { planSelected } = useOnboarding();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const plan = PLAN_LABELS[planSelected] ?? PLAN_LABELS.base;

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] flex flex-col">
      {/* Skip to Main Content Link (a11y) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#FFE500] focus:text-black focus:font-mono focus:font-bold focus:border-2 focus:border-black"
      >
        Skip to main content
      </a>

      {/* ── Top bar ──────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b-2 border-nb-stroke/10 bg-nb-bg" role="banner">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 py-3">

          {/* Logo */}
          <Link href="/overview" className="flex items-center gap-3 group shrink-0" aria-label="MerchantPulse Home">
            <div className="w-9 h-9 border-2 border-nb-stroke bg-nb-yellow flex items-center justify-center font-mono text-xs font-black text-black shadow-brutal transition-all group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-brutal-lg">
              MP
            </div>
            <div className="hidden sm:block">
              <div className="font-black uppercase text-xs tracking-tight text-nb-white">MerchantPulse</div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-nb-muted">AI Recovery Intelligence</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
            {NAV.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || (href !== '/overview' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-2 border-2 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-widest transition-all duration-100 ${
                    active
                      ? 'border-nb-yellow bg-nb-yellow text-black shadow-brutal-y'
                      : 'border-nb-stroke/20 text-nb-muted hover:border-nb-stroke hover:text-nb-white hover:shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Plan badge */}
            <span
              className="hidden sm:inline-flex border-2 px-2.5 py-1 font-mono text-[9px] font-black uppercase tracking-widest"
              style={{ borderColor: plan.color, color: plan.color }}
              aria-label={`Plan: ${plan.label}`}
            >
              {plan.label}
            </span>

            {/* User avatar */}
            <div
              className="w-8 h-8 border-2 border-nb-stroke bg-nb-surface flex items-center justify-center font-mono text-xs font-black text-nb-yellow"
              aria-label={`Logged in as ${profile.name || 'User'}`}
            >
              {(profile.name?.[0] ?? 'U').toUpperCase()}
            </div>

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="border-2 border-nb-stroke/20 p-2 text-nb-muted hover:border-nb-stroke hover:text-nb-white transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-sm"
                title="Toggle theme"
                aria-label="Toggle light/dark theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
              </button>
            )}

            {/* Settings */}
            <button
              onClick={() => setSettingsOpen(true)}
              className="border-2 border-nb-stroke/20 p-2 text-nb-muted hover:border-nb-stroke hover:text-nb-white transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-sm"
              title="Settings"
              aria-label="Open Settings"
            >
              <Settings className="w-4 h-4" aria-hidden="true" />
            </button>

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              className="border-2 border-nb-stroke/20 p-2 text-nb-muted hover:border-nb-red hover:text-nb-red transition-all duration-100"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              aria-label={mobileOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              className="md:hidden border-2 border-nb-stroke/20 p-2 text-nb-muted hover:border-nb-stroke hover:text-nb-white transition-all"
            >
              {mobileOpen ? <X className="w-4 h-4" aria-hidden="true" /> : <Menu className="w-4 h-4" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <nav
            id="mobile-nav"
            className="md:hidden border-t-2 border-nb-stroke/10 bg-nb-surface px-4 py-4 grid grid-cols-2 gap-2"
            aria-label="Mobile Navigation"
          >
            {NAV.map(({ label, href, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-2 border-2 px-3 py-3 font-mono text-[10px] font-bold uppercase tracking-widest transition-all duration-100 ${
                    active
                      ? 'border-nb-yellow bg-nb-yellow text-black'
                      : 'border-nb-stroke/20 text-nb-muted hover:border-nb-stroke hover:text-nb-white'
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {label}
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      <main id="main-content" className="flex-1 pb-12" role="main">
        {children}
      </main>

      <SettingsDrawer
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        currentUser={profile}
      />
    </div>
  );
}
