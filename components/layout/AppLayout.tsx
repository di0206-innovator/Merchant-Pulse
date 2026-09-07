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
    <div className="min-h-screen bg-nb-bg text-nb-white flex flex-col transition-colors duration-200">
      {/* Skip to Main Content Link (a11y) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#F59E0B] focus:text-slate-950 focus:font-mono focus:font-bold focus:rounded-xl focus:shadow-skeuo-button"
      >
        Skip to main content
      </a>

      {/* ── Top bar ──────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 border-b border-nb-stroke/60 backdrop-blur-md"
        style={{
          background: 'linear-gradient(180deg, color-mix(in srgb, var(--nb-surface) 95%, white) 0%, var(--nb-surface) 100%)',
          boxShadow: 'inset 0 1px 0 var(--nb-bevel), inset 0 -1px 0 var(--nb-rim-shade), 0 4px 14px rgba(0, 0, 0, 0.35)',
        }}
        role="banner"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 py-2.5">

          {/* Logo */}
          <Link href="/overview" className="flex items-center gap-3 group shrink-0" aria-label="MerchantPulse Home">
            <div
              className="w-9 h-9 rounded-xl border border-amber-300/60 flex items-center justify-center font-mono text-xs font-black text-slate-950 shadow-skeuo-gold transition-all duration-150 group-hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(180deg, #FDE68A 0%, #F59E0B 50%, #D97706 100%)',
              }}
            >
              MP
            </div>
            <div className="hidden sm:block">
              <div className="font-black uppercase text-xs tracking-tight text-nb-white drop-shadow-sm flex items-center gap-1.5">
                MerchantPulse
                <span className="skeuo-led-green w-2 h-2" title="Systems Nominal" />
              </div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-nb-muted">AI Recovery Intelligence</div>
            </div>
          </Link>

          {/* Desktop nav - Tactile Segmented Rack */}
          <nav
            className="hidden md:flex items-center p-1 rounded-2xl border border-nb-stroke/60 gap-1 shadow-skeuo-inset"
            style={{ background: 'var(--nb-recessed)' }}
            aria-label="Main Navigation"
          >
            {NAV.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || (href !== '/overview' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest transition-all duration-150 select-none ${
                    active
                      ? 'text-slate-950 font-black shadow-skeuo-gold'
                      : 'text-nb-muted hover:text-nb-white hover:bg-nb-surface/60 active:translate-y-0.5'
                  }`}
                  style={
                    active
                      ? {
                          background: 'linear-gradient(180deg, #FDE68A 0%, #F59E0B 55%, #D97706 100%)',
                          border: '1px solid rgba(255, 255, 255, 0.4)',
                        }
                      : {}
                  }
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
              className="hidden sm:inline-flex rounded-full border px-3 py-1 font-mono text-[9px] font-black uppercase tracking-widest shadow-skeuo-badge"
              style={{
                borderColor: `${plan.color}60`,
                color: plan.color,
                background: `linear-gradient(180deg, ${plan.color}20 0%, ${plan.color}08 100%)`,
              }}
              aria-label={`Plan: ${plan.label}`}
            >
              {plan.label}
            </span>

            {/* User avatar */}
            <div
              className="w-8 h-8 rounded-xl border border-nb-stroke/80 flex items-center justify-center font-mono text-xs font-black text-nb-yellow shadow-skeuo-card"
              style={{
                background: 'linear-gradient(180deg, var(--nb-surface-2) 0%, var(--nb-surface) 100%)',
              }}
              aria-label={`Logged in as ${profile.name || 'User'}`}
            >
              {(profile.name?.[0] ?? 'U').toUpperCase()}
            </div>

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="rounded-xl border border-nb-stroke/70 p-2 text-nb-muted hover:text-nb-white transition-all duration-150 hover:shadow-skeuo-button active:translate-y-0.5 active:shadow-skeuo-button-pressed"
                style={{
                  background: 'linear-gradient(180deg, color-mix(in srgb, var(--nb-surface) 95%, white) 0%, var(--nb-surface) 100%)',
                }}
                title="Toggle theme"
                aria-label="Toggle light/dark theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
              </button>
            )}

            {/* Settings */}
            <button
              onClick={() => setSettingsOpen(true)}
              className="rounded-xl border border-nb-stroke/70 p-2 text-nb-muted hover:text-nb-white transition-all duration-150 hover:shadow-skeuo-button active:translate-y-0.5 active:shadow-skeuo-button-pressed"
              style={{
                background: 'linear-gradient(180deg, color-mix(in srgb, var(--nb-surface) 95%, white) 0%, var(--nb-surface) 100%)',
              }}
              title="Settings"
              aria-label="Open Settings"
            >
              <Settings className="w-4 h-4" aria-hidden="true" />
            </button>

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              className="rounded-xl border border-nb-stroke/70 p-2 text-nb-muted hover:border-nb-red/60 hover:text-nb-red transition-all duration-150 hover:shadow-skeuo-button active:translate-y-0.5 active:shadow-skeuo-button-pressed"
              style={{
                background: 'linear-gradient(180deg, color-mix(in srgb, var(--nb-surface) 95%, white) 0%, var(--nb-surface) 100%)',
              }}
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
              className="md:hidden rounded-xl border border-nb-stroke/70 p-2 text-nb-muted hover:text-nb-white transition-all active:translate-y-0.5"
              style={{
                background: 'linear-gradient(180deg, color-mix(in srgb, var(--nb-surface) 95%, white) 0%, var(--nb-surface) 100%)',
              }}
            >
              {mobileOpen ? <X className="w-4 h-4" aria-hidden="true" /> : <Menu className="w-4 h-4" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <nav
            id="mobile-nav"
            className="md:hidden border-t border-nb-stroke/60 px-4 py-4 grid grid-cols-2 gap-2 shadow-skeuo-inset"
            style={{ background: 'var(--nb-recessed)' }}
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
                  className={`flex items-center gap-2 rounded-xl px-3 py-3 font-mono text-[10px] font-bold uppercase tracking-widest transition-all duration-150 ${
                    active
                      ? 'text-slate-950 font-black shadow-skeuo-gold'
                      : 'border border-nb-stroke/50 text-nb-muted hover:text-nb-white'
                  }`}
                  style={
                    active
                      ? {
                          background: 'linear-gradient(180deg, #FDE68A 0%, #F59E0B 55%, #D97706 100%)',
                        }
                      : {
                          background: 'var(--nb-surface)',
                        }
                  }
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
