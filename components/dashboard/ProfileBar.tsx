import React from 'react';
import { useAuth } from '@/lib/supabase/authContext';
import { UserRole } from '@/core/auth/types';
import { Users, Settings, LogOut, LogIn, ShieldCheck, Sparkles } from 'lucide-react';

interface ProfileBarProps {
  onOpenSettings: () => void;
}

export function ProfileBar({ onOpenSettings }: ProfileBarProps) {
  const { profile, user, signInWithGoogle, signOut, switchRole, isConfigured } = useAuth();

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'OWNER':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'OPS_MANAGER':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'AUDITOR':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="flex items-center gap-3 font-mono text-xs">
      {/* Role Switcher Pill */}
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800">
        <Users className="w-3.5 h-3.5 text-blue-400" />
        <span className="text-slate-500 hidden sm:inline">Role:</span>
        <select
          value={profile.role}
          onChange={e => switchRole(e.target.value as UserRole)}
          className="bg-transparent text-white font-bold outline-none cursor-pointer"
        >
          <option value="OWNER" className="bg-slate-900">Owner (Admin)</option>
          <option value="OPS_MANAGER" className="bg-slate-900">Risk Ops Manager</option>
          <option value="AUDITOR" className="bg-slate-900">Finance Auditor (Read-Only)</option>
        </select>
      </div>

      {/* Settings Button */}
      <button
        onClick={onOpenSettings}
        className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
        title="Terminal Settings"
      >
        <Settings className="w-4 h-4" />
      </button>

      {/* Profile & Auth Menu */}
      {user ? (
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

            <div className="hidden lg:block text-left leading-none">
              <div className="font-bold text-white text-xs">{profile.name}</div>
              <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{profile.email}</div>
            </div>
          </div>

          <button
            onClick={() => signOut()}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => signInWithGoogle()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Google Sign In</span>
        </button>
      )}
    </div>
  );
}
