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
  const [razorpayKeyId, setRazorpayKeyId] = useState('rzp_test_TUHSBfjPgODDOy');
  const [razorpaySecret, setRazorpaySecret] = useState('eAr7mPqHUDHycKZa65409Mjs');
  const [razorpayMode, setRazorpayMode] = useState<'TEST' | 'LIVE'>('TEST');
  const [geminiApiKey, setGeminiApiKey] = useState('••••••••••••••••');
  const [geminiModel, setGeminiModel] = useState('gemini-2.5-flash');
  const [supabaseUrl, setSupabaseUrl] = useState(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ttxbgdosrtohcksvydsc.supabase.co');

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
      <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-base font-bold text-white font-mono">Merchant Terminal Settings</h2>
              <p className="text-xs text-slate-400">Configure role, theme, guardrails, API keys & Supabase Auth</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-800/80 bg-slate-950/30 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`px-3 py-2.5 font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'PROFILE' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Role & Theme</span>
          </button>

          <button
            onClick={() => setActiveTab('MERCHANT')}
            className={`px-3 py-2.5 font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'MERCHANT' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Merchant Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('GUARDRAILS')}
            className={`px-3 py-2.5 font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'GUARDRAILS' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Policy Guardrails</span>
          </button>

          <button
            onClick={() => setActiveTab('RAZORPAY')}
            className={`px-3 py-2.5 font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'RAZORPAY' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Razorpay APIs</span>
          </button>

          <button
            onClick={() => setActiveTab('GEMINI')}
            className={`px-3 py-2.5 font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'GEMINI' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gemini AI Strategy</span>
          </button>

          <button
            onClick={() => setActiveTab('SUPABASE')}
            className={`px-3 py-2.5 font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'SUPABASE' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Supabase Auth</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {savedToast && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Settings updated successfully! Profile and preferences saved.</span>
            </div>
          )}

          {/* Tab 1: Role, Theme & Profile */}
          {activeTab === 'PROFILE' && (
            <div className="space-y-6 font-mono text-xs">
              {/* Active Role Selector */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="font-bold text-white text-xs">Active Merchant Role (RBAC)</span>
                  </div>
                  <span className="text-[10px] text-blue-400 font-bold uppercase">{profile.role}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <button
                    onClick={() => switchRole('OWNER')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      profile.role === 'OWNER'
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-xs text-white">Owner (Admin)</div>
                    <div className="text-[10px] text-slate-400 mt-1">Full overrides & policy write</div>
                  </button>

                  <button
                    onClick={() => switchRole('OPS_MANAGER')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      profile.role === 'OPS_MANAGER'
                        ? 'bg-amber-600/20 border-amber-500 text-white shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-xs text-white">Ops Manager</div>
                    <div className="text-[10px] text-slate-400 mt-1">Intervene & approve recovery</div>
                  </button>

                  <button
                    onClick={() => switchRole('AUDITOR')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      profile.role === 'AUDITOR'
                        ? 'bg-purple-600/20 border-purple-500 text-white shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-xs text-white">Auditor</div>
                    <div className="text-[10px] text-slate-400 mt-1">Read-only ledger & reports</div>
                  </button>
                </div>
              </div>

              {/* Theme Preference Toggle */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-blue-400" />
                    <span className="font-bold text-white text-xs">Interface Theme</span>
                  </div>
                  <span className="text-[10px] text-slate-400 capitalize">{theme} Mode</span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    onClick={() => setTheme('retro')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                      theme === 'retro'
                        ? 'bg-[#8BE8F5]/20 border-[#8BE8F5] text-[#8BE8F5] shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Retro Cyan</span>
                  </button>

                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                      theme === 'dark'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>Dark</span>
                  </button>

                  <button
                    onClick={() => setTheme('light')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                      theme === 'light'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>Light</span>
                  </button>
                </div>
              </div>

              {/* User Profile Form */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">
                  User Account Information
                </h3>

                <div>
                  <label className="block text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-sans focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Primary Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Merchant Profile */}
          {activeTab === 'MERCHANT' && (
            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Merchant Store Name</label>
                <input
                  type="text"
                  value={merchantName}
                  onChange={e => setMerchantName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-sans focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Razorpay Merchant Account ID</label>
                <input
                  type="text"
                  value={merchantId}
                  onChange={e => setMerchantId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Base Currency</label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-blue-500"
                >
                  <option value="INR">INR (₹ Indian Rupee)</option>
                  <option value="USD">USD ($ US Dollar)</option>
                </select>
              </div>
            </div>
          )}

          {/* Tab 3: Policy Guardrails */}
          {activeTab === 'GUARDRAILS' && (
            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Max Auto-Execution GMV Threshold (₹)</label>
                <input
                  type="number"
                  value={maxAutoGmv}
                  onChange={e => setMaxAutoGmv(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-blue-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Transactions above ₹{(maxAutoGmv).toLocaleString('en-IN')} are automatically routed to the Human Ops Review Queue (`ESCALATED`).
                </p>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Minimum Net Expected Value (₹)</label>
                <input
                  type="number"
                  value={minEv}
                  onChange={e => setMinEv(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-blue-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Interventions with Net EV below ₹{minEv} are rejected to prevent dispatch fee erosion.
                </p>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Customer Contact Cooldown Period (Hours)</label>
                <input
                  type="number"
                  value={cooldownHours}
                  onChange={e => setCooldownHours(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-blue-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Prevents sending multiple SMS/Email recovery messages to the same customer within {cooldownHours} hours.
                </p>
              </div>
            </div>
          )}

          {/* Tab 4: Razorpay APIs */}
          {activeTab === 'RAZORPAY' && (
            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Razorpay Integration Mode</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setRazorpayMode('TEST')}
                    className={`flex-1 py-2 rounded-xl font-bold border transition-all ${
                      razorpayMode === 'TEST'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Razorpay Test Mode (Live Keys Active)
                  </button>

                  <button
                    onClick={() => setRazorpayMode('LIVE')}
                    className={`flex-1 py-2 rounded-xl font-bold border transition-all ${
                      razorpayMode === 'LIVE'
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Razorpay Live Production
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Razorpay Key ID</label>
                <input
                  type="text"
                  value={razorpayKeyId}
                  onChange={e => setRazorpayKeyId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Razorpay Key Secret</label>
                <input
                  type="password"
                  value={razorpaySecret}
                  onChange={e => setRazorpaySecret(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Tab 5: Gemini AI Strategy */}
          {activeTab === 'GEMINI' && (
            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Google Gemini API Key (@google/genai SDK)</label>
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={e => setGeminiApiKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-blue-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  When omitted or invalid, GeminiStrategyProvider gracefully falls back to MockStrategyProvider.
                </p>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Gemini Model Version</label>
                <input
                  type="text"
                  value={geminiModel}
                  onChange={e => setGeminiModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Tab 6: Supabase Auth */}
          {activeTab === 'SUPABASE' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-800/50 space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-bold">
                  <Database className="w-4 h-4" />
                  <span>Supabase Auth & Database Integration</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Project Ref: <code className="text-white font-bold">ttxbgdosrtohcksvydsc</code> (Google OAuth Enabled)
                </p>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Supabase Project URL</label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={e => setSupabaseUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Google OAuth Status:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Active & Ready
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
