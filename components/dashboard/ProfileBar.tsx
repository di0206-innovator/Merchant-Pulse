import React, { useState } from 'react';
import { useAuth } from '@/lib/supabase/authContext';
import { UserRole } from '@/core/auth/types';
import { Settings, LogOut, LogIn, User } from 'lucide-react';
import { AuthModal } from '@/components/auth/AuthModal';

interface ProfileBarProps {
  onOpenSettings: () => void;
}

export function ProfileBar({ onOpenSettings }: ProfileBarProps) {
  const { profile, user, signOut, isAuthenticated } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2.5 font-mono text-xs">
        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
          title="Terminal Settings & Role Configuration"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4 text-blue-400" />
          <span className="hidden sm:inline text-[11px] font-bold">Settings</span>
        </button>

        {/* Profile & Auth Menu */}
        {isAuthenticated ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="flex items-center gap-2">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-7 h-7 rounded-full border border-blue-500/50 object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-[11px] shadow-sm">
                  {profile.name.slice(0, 2).toUpperCase()}
                </div>
              )}

              <div className="hidden md:block text-left leading-tight">
                <div className="font-bold text-white text-xs">{profile.name}</div>
                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{profile.role}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => signOut()}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-[0.98]"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
