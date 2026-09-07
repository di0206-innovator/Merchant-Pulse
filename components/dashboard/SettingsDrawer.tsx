import React, { useState } from 'react';
import { X, Settings, ShieldCheck, Key, Database, Sparkles, Sliders, CheckCircle2, Lock, Cpu, Globe, User, Sun, Moon, Palette, Users } from 'lucide-react';
import { UserProfile, UserRole } from '@/core/auth/types';
import { useAuth } from '@/lib/supabase/authContext';
import { useTheme } from '@/lib/themeContext';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
}

export function SettingsDrawer({ isOpen, onClose, currentUser }: SettingsDrawerProps) {
  const { setProfile, profile, switchRole } = useAuth();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<'PROFILE' | 'MERCHANT' | 'GUARDRAILS' | 'RAZORPAY' | 'GEMINI' | 'SUPABASE'>('PROFILE');
  const [savedToast, setSavedToast] = useState(false);

  // Profile Edit State
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');

  // Merchant Settings State
  const [merchantName, setMerchantName] = useState('MerchantPulse Store');
  const [merchantId, setMerchantId] = useState(currentUser.merchantId);
  const [currency, setCurrency] = useState('INR');
  const [maxAutoGmv, setMaxAutoGmv] = useState(25000);
  const [minEv, setMinEv] = useState(20);
  const [cooldownHours, setCooldownHours] = useState(24);
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const [razorpaySecret, setRazorpaySecret] = useState('');
  const [razorpayMode, setRazorpayMode] = useState<'TEST' | 'LIVE'>('TEST');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [geminiModel, setGeminiModel] = useState('gemini-2.5-flash');
  const [supabaseUrl, setSupabaseUrl] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    // Update active profile in context
    setProfile(prev => ({
      ...prev,
      name,
      email,
      avatarUrl: avatarUrl || undefined,
    }));

    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm transition-opacity">
      <div
        className="w-full max-w-2xl border-l border-nb-stroke/70 text-nb-white flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-200 font-mono"
        style={{
          background: 'linear-gradient(180deg, var(--nb-surface) 0%, color-mix(in srgb, var(--nb-surface) 95%, black) 100%)',
          boxShadow: 'inset 1px 0 0 var(--nb-bevel), -10px 0 30px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b border-nb-stroke/60 flex items-center justify-between"
          style={{
            background: 'linear-gradient(180deg, color-mix(in srgb, var(--nb-surface-2) 95%, white) 0%, var(--nb-surface) 100%)',
            boxShadow: 'inset 0 1px 0 var(--nb-bevel)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl border border-blue-400/40 flex items-center justify-center shadow-skeuo-blue" style={{ background: 'linear-gradient(180deg, #93C5FD 0%, #3B82F6 60%, #1D4ED8 100%)' }}>
              <Settings className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <h2 className="text-base font-black text-nb-white uppercase tracking-tight">Merchant Terminal Settings</h2>
              <p className="text-xs text-nb-muted font-sans">Configure role, theme, guardrails, API keys &amp; Supabase Auth</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-nb-stroke/60 text-nb-muted hover:text-nb-white transition-all duration-150 shadow-skeuo-button active:translate-y-0.5"
            style={{ background: 'var(--nb-surface-2)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation - Tactile Segmented Rack */}
        <div
          className="flex items-center gap-1.5 px-6 py-2 border-b border-nb-stroke/60 overflow-x-auto text-xs font-mono shadow-skeuo-inset"
          style={{ background: 'var(--nb-recessed)' }}
        >
          {[
            { id: 'PROFILE', label: 'Role & Theme', icon: User },
            { id: 'MERCHANT', label: 'Merchant Profile', icon: Globe },
            { id: 'GUARDRAILS', label: 'Policy Guardrails', icon: ShieldCheck },
            { id: 'RAZORPAY', label: 'Razorpay APIs', icon: Key },
            { id: 'GEMINI', label: 'Gemini AI Strategy', icon: Sparkles },
            { id: 'SUPABASE', label: 'Supabase Auth', icon: Database },
          ].map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 select-none ${
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
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {savedToast && (
            <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs font-mono flex items-center gap-2 shadow-skeuo-green animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Settings updated successfully! Profile and preferences saved.</span>
            </div>
          )}

          {/* Tab 1: Role, Theme & Profile */}
          {activeTab === 'PROFILE' && (
            <div className="space-y-6 font-mono text-xs">
              {/* Active Role Selector */}
              <div className="nb-panel p-5 space-y-3 shadow-skeuo-card">
                <div className="flex items-center justify-between border-b border-nb-stroke/50 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="font-bold text-nb-white text-xs uppercase">Active Merchant Role (RBAC)</span>
                  </div>
                  <span className="nb-chip-blue text-[10px] uppercase">{profile.role}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <button
                    onClick={() => switchRole('OWNER')}
                    className={`p-3.5 rounded-xl border text-left transition-all duration-150 active:translate-y-0.5 ${
                      profile.role === 'OWNER'
                        ? 'shadow-skeuo-blue border-blue-400/60'
                        : 'border-nb-stroke/50 text-nb-muted hover:text-nb-white shadow-skeuo-card'
                    }`}
                    style={
                      profile.role === 'OWNER'
                        ? { background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.25) 0%, rgba(37, 99, 235, 0.1) 100%)' }
                        : { background: 'var(--nb-recessed)' }
                    }
                  >
                    <div className="font-black text-xs text-nb-white">Owner (Admin)</div>
                    <div className="text-[10px] text-nb-muted mt-1">Full overrides &amp; policy write</div>
                  </button>

                  <button
                    onClick={() => switchRole('OPS_MANAGER')}
                    className={`p-3.5 rounded-xl border text-left transition-all duration-150 active:translate-y-0.5 ${
                      profile.role === 'OPS_MANAGER'
                        ? 'shadow-skeuo-gold border-amber-400/60'
                        : 'border-nb-stroke/50 text-nb-muted hover:text-nb-white shadow-skeuo-card'
                    }`}
                    style={
                      profile.role === 'OPS_MANAGER'
                        ? { background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.1) 100%)' }
                        : { background: 'var(--nb-recessed)' }
                    }
                  >
                    <div className="font-black text-xs text-nb-white">Ops Manager</div>
                    <div className="text-[10px] text-nb-muted mt-1">Intervene &amp; approve recovery</div>
                  </button>

                  <button
                    onClick={() => switchRole('AUDITOR')}
                    className={`p-3.5 rounded-xl border text-left transition-all duration-150 active:translate-y-0.5 ${
                      profile.role === 'AUDITOR'
                        ? 'shadow-skeuo-badge border-purple-400/60'
                        : 'border-nb-stroke/50 text-nb-muted hover:text-nb-white shadow-skeuo-card'
                    }`}
                    style={
                      profile.role === 'AUDITOR'
                        ? { background: 'linear-gradient(180deg, rgba(168, 85, 247, 0.25) 0%, rgba(147, 51, 234, 0.1) 100%)' }
                        : { background: 'var(--nb-recessed)' }
                    }
                  >
                    <div className="font-black text-xs text-nb-white">Auditor</div>
                    <div className="text-[10px] text-nb-muted mt-1">Read-only ledger &amp; reports</div>
                  </button>
                </div>
              </div>

              {/* Theme Preference Toggle */}
              <div className="nb-panel p-5 space-y-3 shadow-skeuo-card">
                <div className="flex items-center justify-between border-b border-nb-stroke/50 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-nb-white text-xs uppercase">Interface Theme</span>
                  </div>
                  <span className="text-[10px] text-nb-muted uppercase">{theme} Mode</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-black uppercase tracking-wider transition-all duration-150 active:translate-y-0.5 ${
                      theme === 'dark'
                        ? 'shadow-skeuo-gold border-amber-400/60 text-slate-950'
                        : 'border-nb-stroke/50 text-nb-muted hover:text-nb-white shadow-skeuo-card'
                    }`}
                    style={
                      theme === 'dark'
                        ? { background: 'linear-gradient(180deg, #FDE68A 0%, #F59E0B 60%, #D97706 100%)' }
                        : { background: 'var(--nb-recessed)' }
                    }
                  >
                    <Moon className="w-4 h-4" />
                    <span>Dark Obsidian</span>
                  </button>

                  <button
                    onClick={() => setTheme('light')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-black uppercase tracking-wider transition-all duration-150 active:translate-y-0.5 ${
                      theme === 'light'
                        ? 'shadow-skeuo-gold border-amber-400/60 text-slate-950'
                        : 'border-nb-stroke/50 text-nb-muted hover:text-nb-white shadow-skeuo-card'
                    }`}
                    style={
                      theme === 'light'
                        ? { background: 'linear-gradient(180deg, #FDE68A 0%, #F59E0B 60%, #D97706 100%)' }
                        : { background: 'var(--nb-recessed)' }
                    }
                  >
                    <Sun className="w-4 h-4" />
                    <span>Light Aluminum</span>
                  </button>
                </div>
              </div>

              {/* User Profile Form */}
              <div className="nb-panel p-5 space-y-4 shadow-skeuo-card">
                <h3 className="font-bold text-nb-muted text-xs uppercase tracking-wider">
                  User Account Information
                </h3>

                <div>
                  <label className="block text-nb-muted mb-1 uppercase text-[10px]">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="nb-input"
                  />
                </div>

                <div>
                  <label className="block text-nb-muted mb-1 uppercase text-[10px]">Primary Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="nb-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Merchant Profile */}
          {activeTab === 'MERCHANT' && (
            <div className="nb-panel p-5 space-y-4 font-mono text-xs shadow-skeuo-card">
              <div>
                <label className="block text-nb-muted mb-1 uppercase text-[10px]">Merchant Store Name</label>
                <input
                  type="text"
                  value={merchantName}
                  onChange={e => setMerchantName(e.target.value)}
                  className="nb-input"
                />
              </div>

              <div>
                <label className="block text-nb-muted mb-1 uppercase text-[10px]">Razorpay Merchant Account ID</label>
                <input
                  type="text"
                  value={merchantId}
                  onChange={e => setMerchantId(e.target.value)}
                  className="nb-input"
                />
              </div>

              <div>
                <label className="block text-nb-muted mb-1 uppercase text-[10px]">Base Currency</label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="nb-input cursor-pointer"
                >
                  <option value="INR">INR (₹ Indian Rupee)</option>
                  <option value="USD">USD ($ US Dollar)</option>
                </select>
              </div>
            </div>
          )}

          {/* Tab 3: Policy Guardrails */}
          {activeTab === 'GUARDRAILS' && (
            <div className="nb-panel p-5 space-y-5 font-mono text-xs shadow-skeuo-card">
              <div>
                <label className="block text-nb-muted mb-1 uppercase text-[10px]">Max Auto-Execution GMV Threshold (₹)</label>
                <input
                  type="number"
                  value={maxAutoGmv}
                  onChange={e => setMaxAutoGmv(Number(e.target.value))}
                  className="nb-input tabular-nums"
                />
                <p className="text-[10px] text-nb-muted mt-1.5">
                  Transactions above ₹{(maxAutoGmv).toLocaleString('en-IN')} are automatically routed to the Human Ops Review Queue (`ESCALATED`).
                </p>
              </div>

              <div>
                <label className="block text-nb-muted mb-1 uppercase text-[10px]">Minimum Net Expected Value (₹)</label>
                <input
                  type="number"
                  value={minEv}
                  onChange={e => setMinEv(Number(e.target.value))}
                  className="nb-input tabular-nums"
                />
                <p className="text-[10px] text-nb-muted mt-1.5">
                  Interventions with Net EV below ₹{minEv} are rejected to prevent dispatch fee erosion.
                </p>
              </div>

              <div>
                <label className="block text-nb-muted mb-1 uppercase text-[10px]">Customer Contact Cooldown Period (Hours)</label>
                <input
                  type="number"
                  value={cooldownHours}
                  onChange={e => setCooldownHours(Number(e.target.value))}
                  className="nb-input tabular-nums"
                />
                <p className="text-[10px] text-nb-muted mt-1.5">
                  Prevents sending multiple SMS/Email recovery messages to the same customer within {cooldownHours} hours.
                </p>
              </div>
            </div>
          )}

          {/* Tab 4: Razorpay APIs */}
          {activeTab === 'RAZORPAY' && (
            <div className="nb-panel p-5 space-y-5 font-mono text-xs shadow-skeuo-card">
              <div>
                <label className="block text-nb-muted mb-2 uppercase text-[10px]">Razorpay Integration Mode</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setRazorpayMode('TEST')}
                    className={`flex-1 py-2.5 rounded-xl font-bold uppercase text-[10px] border transition-all duration-150 active:translate-y-0.5 ${
                      razorpayMode === 'TEST'
                        ? 'shadow-skeuo-blue border-blue-400/60 text-blue-400 bg-blue-500/15'
                        : 'border-nb-stroke/50 text-nb-muted shadow-skeuo-inset bg-slate-900/30'
                    }`}
                  >
                    Razorpay Test Mode (Live Keys Active)
                  </button>

                  <button
                    onClick={() => setRazorpayMode('LIVE')}
                    className={`flex-1 py-2.5 rounded-xl font-bold uppercase text-[10px] border transition-all duration-150 active:translate-y-0.5 ${
                      razorpayMode === 'LIVE'
                        ? 'shadow-skeuo-green border-emerald-400/60 text-emerald-400 bg-emerald-500/15'
                        : 'border-nb-stroke/50 text-nb-muted shadow-skeuo-inset bg-slate-900/30'
                    }`}
                  >
                    Razorpay Live Production
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-nb-muted mb-1 uppercase text-[10px]">Razorpay Key ID</label>
                <input
                  type="text"
                  value={razorpayKeyId}
                  onChange={e => setRazorpayKeyId(e.target.value)}
                  className="nb-input"
                />
              </div>

              <div>
                <label className="block text-nb-muted mb-1 uppercase text-[10px]">Razorpay Key Secret</label>
                <input
                  type="password"
                  value={razorpaySecret}
                  onChange={e => setRazorpaySecret(e.target.value)}
                  className="nb-input"
                />
              </div>
            </div>
          )}

          {/* Tab 5: Gemini AI Strategy */}
          {activeTab === 'GEMINI' && (
            <div className="nb-panel p-5 space-y-5 font-mono text-xs shadow-skeuo-card">
              <div>
                <label className="block text-nb-muted mb-1 uppercase text-[10px]">Google Gemini API Key (@google/genai SDK)</label>
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={e => setGeminiApiKey(e.target.value)}
                  className="nb-input"
                />
                <p className="text-[10px] text-nb-muted mt-1.5">
                  When omitted or invalid, GeminiStrategyProvider gracefully falls back to MockStrategyProvider.
                </p>
              </div>

              <div>
                <label className="block text-nb-muted mb-1 uppercase text-[10px]">Gemini Model Version</label>
                <input
                  type="text"
                  value={geminiModel}
                  onChange={e => setGeminiModel(e.target.value)}
                  className="nb-input"
                />
              </div>
            </div>
          )}

          {/* Tab 6: Supabase Auth */}
          {activeTab === 'SUPABASE' && (
            <div className="nb-panel p-5 space-y-5 font-mono text-xs shadow-skeuo-card">
              <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/10 space-y-1.5 shadow-skeuo-badge">
                <div className="flex items-center gap-2 text-blue-400 font-bold uppercase text-[11px]">
                  <Database className="w-4 h-4" />
                  <span>Supabase Auth &amp; Database Integration</span>
                </div>
                <p className="text-[11px] text-nb-muted">
                  Project Ref: <code className="text-nb-white font-bold">ttxbgdosrtohcksvydsc</code> (Google OAuth Enabled)
                </p>
              </div>

              <div>
                <label className="block text-nb-muted mb-1 uppercase text-[10px]">Supabase Project URL</label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={e => setSupabaseUrl(e.target.value)}
                  className="nb-input"
                />
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between text-xs text-nb-muted">
                  <span>Google OAuth Status:</span>
                  <span className="nb-chip-green text-[10px]">
                    <span className="skeuo-led-green w-1.5 h-1.5" />
                    Active &amp; Ready
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          className="p-5 border-t border-nb-stroke/60 flex items-center justify-end gap-3"
          style={{
            background: 'linear-gradient(180deg, var(--nb-surface) 0%, color-mix(in srgb, var(--nb-surface) 95%, black) 100%)',
            boxShadow: 'inset 0 1px 0 var(--nb-bevel)',
          }}
        >
          <button
            onClick={onClose}
            className="nb-secondary-button text-xs py-2.5 px-5"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="nb-primary-button text-xs py-2.5 px-6"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
