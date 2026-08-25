import React, { useState } from 'react';
import { X, Settings, ShieldCheck, Key, Database, Sparkles, Sliders, CheckCircle2, Lock, Cpu, Globe } from 'lucide-react';
import { UserProfile } from '@/core/auth/types';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
}

export function SettingsDrawer({ isOpen, onClose, currentUser }: SettingsDrawerProps) {
  const [activeTab, setActiveTab] = useState<'MERCHANT' | 'GUARDRAILS' | 'RAZORPAY' | 'GEMINI' | 'SUPABASE'>('MERCHANT');
  const [savedToast, setSavedToast] = useState(false);

  // Settings State
  const [merchantName, setMerchantName] = useState('MerchantPulse Store');
  const [merchantId, setMerchantId] = useState(currentUser.merchantId);
  const [currency, setCurrency] = useState('INR');
  const [maxAutoGmv, setMaxAutoGmv] = useState(25000);
  const [minEv, setMinEv] = useState(20);
  const [cooldownHours, setCooldownHours] = useState(24);
  const [razorpayKeyId, setRazorpayKeyId] = useState(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_MerchantPulseMain');
  const [razorpaySecret, setRazorpaySecret] = useState('••••••••••••••••');
  const [razorpayMode, setRazorpayMode] = useState<'TEST' | 'LIVE'>('TEST');
  const [geminiApiKey, setGeminiApiKey] = useState('••••••••••••••••');
  const [geminiModel, setGeminiModel] = useState('gemini-2.5-flash');
  const [supabaseUrl, setSupabaseUrl] = useState(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ttxbgdosrtohcksvydsc.supabase.co');

  if (!isOpen) return null;

  const handleSave = () => {
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
              <p className="text-xs text-slate-400">Configure guardrails, API keys, AI model & Supabase Auth</p>
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
              <span>Settings updated successfully! Policy guardrails updated in memory.</span>
            </div>
          )}

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
                    Razorpay Test Mode
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
