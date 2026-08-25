'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  LayoutDashboard,
  FileCheck2,
  BarChart3,
  Settings,
  ArrowRight,
  ShieldCheck,
  Download,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { ProfileBar } from '@/components/dashboard/ProfileBar';
import { SettingsDrawer } from '@/components/dashboard/SettingsDrawer';
import { PwaInstallPrompt } from '@/components/PwaInstallPrompt';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuth } from '@/lib/supabase/authContext';
import { useTheme } from '@/lib/themeContext';

interface MaterialAppLayoutProps {
  children: React.ReactNode;
}

export function MaterialAppLayout({ children }: MaterialAppLayoutProps) {
  const pathname = usePathname();
  const { profile: currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Overview', href: '/', icon: Home },
    { label: 'Live Terminal', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Audit Trail', href: '/audit', icon: FileCheck2 },
    { label: 'Benchmark', href: '/benchmark', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070B12] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-600/30 selection:text-white transition-colors duration-200">
      {/* Material Design 3 Top AppBar */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#0A0E1A]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
                MP
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                  MerchantPulse
                </span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono -mt-1">
                  Razorpay AI Recovery
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-full border border-slate-200 dark:border-slate-800/80">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold font-mono transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Theme Switcher Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            <PwaInstallPrompt />

            <ProfileBar onOpenSettings={() => setIsSettingsOpen(true)} />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 py-3 space-y-2 font-mono text-xs animate-in slide-in-from-top-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/30'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-16 sm:pb-0">
        <AuthGuard>
          {children}
        </AuthGuard>
      </main>

      {/* Material Design 3 Bottom Navigation Bar (Mobile Only < 640px) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0A0E1A]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800/80 px-2 py-2 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-2xl transition-all ${
                isActive ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <div
                className={`p-1.5 rounded-full ${
                  isActive ? 'bg-blue-600/20 text-blue-600 dark:text-blue-400' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Settings Modal Drawer */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
}
