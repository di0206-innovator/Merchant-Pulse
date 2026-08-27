'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  FileCheck2,
  Home,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  X,
} from 'lucide-react';
import { ProfileBar } from '@/components/dashboard/ProfileBar';
import { SettingsDrawer } from '@/components/dashboard/SettingsDrawer';
import { PwaInstallPrompt } from '@/components/PwaInstallPrompt';
import { useAuth } from '@/lib/supabase/authContext';

interface MaterialAppLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { label: 'Overview',   href: '/',          icon: Home },
  { label: 'Reviewer',   href: '/reviewer',  icon: ShieldCheck },
  { label: 'Dashboard',  href: '/dashboard', icon: LayoutDashboard },
  { label: 'Benchmark',  href: '/benchmark', icon: BarChart3 },
  { label: 'Audit',      href: '/audit',     icon: FileCheck2 },
];

export function MaterialAppLayout({ children }: MaterialAppLayoutProps) {
  const pathname = usePathname();
  const { profile: currentUser } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5]">

      {/* ── Top bar ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b-2 border-white bg-[#0A0A0A]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">

          {/* Logo */}
          <Link href="/" className="flex min-w-0 items-center gap-3 group">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-white bg-[#FFE500] font-mono text-sm font-black text-black shadow-brutal transition-all duration-100 group-hover:shadow-brutal-lg group-hover:-translate-x-0.5 group-hover:-translate-y-0.5">
              MP
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-black uppercase tracking-tight text-white">
                MerchantPulse
              </div>
              <div className="truncate font-mono text-[9px] font-bold uppercase tracking-widest text-[#888888]">
                Razorpay · Revenue Recovery
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 border-2 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-widest transition-all duration-100 ${
                    isActive
                      ? 'border-[#FFE500] bg-[#FFE500] text-black shadow-brutal-y'
                      : 'border-white/20 bg-transparent text-[#888888] hover:border-white hover:text-white hover:shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <PwaInstallPrompt />
            <ProfileBar onOpenSettings={() => setIsSettingsOpen(true)} />
            <button
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              className="border-2 border-white/20 bg-transparent p-2 text-[#888888] transition-all duration-100 hover:border-white hover:text-white hover:shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 md:hidden"
              aria-label="Open navigation"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="border-t-2 border-white bg-[#111111] px-4 py-4 md:hidden animate-slide-up">
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2 border-2 px-3 py-3 font-mono text-[10px] font-bold uppercase tracking-widest transition-all duration-100 ${
                      isActive
                        ? 'border-[#FFE500] bg-[#FFE500] text-black'
                        : 'border-white/20 bg-[#0A0A0A] text-[#888888] hover:border-white hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      <main className="pb-12">{children}</main>

      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
}
