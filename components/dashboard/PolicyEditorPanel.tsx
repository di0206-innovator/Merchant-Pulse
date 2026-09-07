'use client';

import React, { useState } from 'react';
import { Sliders, ShieldCheck, Save, RotateCcw, X, CheckCircle2 } from 'lucide-react';

interface PolicyEditorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePolicy?: (policy: {
    maxAutoGmvPaise: number;
    minEvPaise: number;
    contactCooldownHours: number;
  }) => void;
}

export const PolicyEditorPanel: React.FC<PolicyEditorPanelProps> = ({
  isOpen,
  onClose,
  onSavePolicy,
}) => {
  const [maxAutoGmvRupees, setMaxAutoGmvRupees] = useState<number>(25000);
  const [minEvRupees, setMinEvRupees] = useState<number>(20);
  const [cooldownHours, setCooldownHours] = useState<number>(24);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (onSavePolicy) {
      onSavePolicy({
        maxAutoGmvPaise: maxAutoGmvRupees * 100,
        minEvPaise: minEvRupees * 100,
        contactCooldownHours: cooldownHours,
      });
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div
      className="fixed inset-y-0 right-0 w-full max-w-md border-l border-nb-stroke/70 shadow-2xl z-50 flex flex-col font-mono text-nb-white animate-in slide-in-from-right duration-200"
      style={{
        background: 'linear-gradient(180deg, var(--nb-surface) 0%, color-mix(in srgb, var(--nb-surface) 95%, black) 100%)',
        boxShadow: 'inset 1px 0 0 var(--nb-bevel), -10px 0 30px rgba(0, 0, 0, 0.6)',
      }}
    >
      {/* Header */}
      <div
        className="p-6 border-b border-nb-stroke/60 flex items-center justify-between"
        style={{
          background: 'linear-gradient(180deg, color-mix(in srgb, var(--nb-surface-2) 95%, white) 0%, var(--nb-surface) 100%)',
          boxShadow: 'inset 0 1px 0 var(--nb-bevel)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl border border-blue-400/40 flex items-center justify-center shadow-skeuo-blue" style={{ background: 'linear-gradient(180deg, #93C5FD 0%, #3B82F6 60%, #1D4ED8 100%)' }}>
            <Sliders className="w-4 h-4 text-slate-950" />
          </div>
          <h2 className="text-base font-black text-nb-white uppercase tracking-tight">
            Merchant Policy Editor
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl border border-nb-stroke/60 text-nb-muted hover:text-nb-white transition-all duration-150 shadow-skeuo-button active:translate-y-0.5"
          style={{ background: 'var(--nb-surface-2)' }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Sliders */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 font-mono text-xs">
        <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/10 space-y-1 shadow-skeuo-badge">
          <div className="font-bold text-blue-400 flex items-center gap-1.5 uppercase text-[11px]">
            <ShieldCheck className="w-4 h-4" />
            <span>Razorpay Agent Studio Policy Guardrails</span>
          </div>
          <p className="text-[11px] text-nb-muted font-sans leading-relaxed">
            Modify autonomous boundary limits in real time. Decisions instantly adjust between Autonomous Execution and Human Review Queue.
          </p>
        </div>

        {/* Slider 1: Autonomous GMV Cap */}
        <div className="p-4 rounded-xl border border-nb-stroke/50 shadow-skeuo-inset space-y-3" style={{ background: 'var(--nb-recessed)' }}>
          <label className="block font-bold text-nb-white text-[11px] uppercase">
            Autonomous GMV Execution Cap: <span className="text-blue-400 tabular-nums">₹{maxAutoGmvRupees.toLocaleString('en-IN')}</span>
          </label>
          <input
            type="range"
            min="5000"
            max="100000"
            step="5000"
            value={maxAutoGmvRupees}
            onChange={(e) => setMaxAutoGmvRupees(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-[10px] text-nb-muted font-mono">
            Transactions above ₹{maxAutoGmvRupees.toLocaleString('en-IN')} are automatically routed to the Human Ops Queue.
          </p>
        </div>

        {/* Slider 2: Minimum Net EV */}
        <div className="p-4 rounded-xl border border-nb-stroke/50 shadow-skeuo-inset space-y-3" style={{ background: 'var(--nb-recessed)' }}>
          <label className="block font-bold text-nb-white text-[11px] uppercase">
            Minimum Net EV Threshold: <span className="text-emerald-400 tabular-nums">₹{minEvRupees}</span>
          </label>
          <input
            type="range"
            min="0"
            max="200"
            step="10"
            value={minEvRupees}
            onChange={(e) => setMinEvRupees(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-[10px] text-nb-muted font-mono">
            Interventions with Net EV below ₹{minEvRupees} are suppressed to prevent margin erosion.
          </p>
        </div>

        {/* Slider 3: Contact Cooldown */}
        <div className="p-4 rounded-xl border border-nb-stroke/50 shadow-skeuo-inset space-y-3" style={{ background: 'var(--nb-recessed)' }}>
          <label className="block font-bold text-nb-white text-[11px] uppercase">
            Customer Contact Cooldown: <span className="text-amber-400 tabular-nums">{cooldownHours} Hours</span>
          </label>
          <input
            type="range"
            min="6"
            max="72"
            step="6"
            value={cooldownHours}
            onChange={(e) => setCooldownHours(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-[10px] text-nb-muted font-mono">
            Prevents customer fatigue by enforcing a {cooldownHours}-hour quiet window between recovery contacts.
          </p>
        </div>
      </div>

      {/* Footer Save Action */}
      <div
        className="p-5 border-t border-nb-stroke/60"
        style={{
          background: 'linear-gradient(180deg, var(--nb-surface) 0%, color-mix(in srgb, var(--nb-surface) 95%, black) 100%)',
          boxShadow: 'inset 0 1px 0 var(--nb-bevel)',
        }}
      >
        <button
          onClick={handleSave}
          className="w-full nb-primary-button text-xs py-3"
        >
          {savedSuccess ? (
            <span className="flex items-center gap-2 text-slate-950 font-black">
              <CheckCircle2 className="w-4 h-4 text-emerald-950" />
              <span>Policy Updated Successfully!</span>
            </span>
          ) : (
            <span className="flex items-center gap-2 text-slate-950 font-black">
              <Save className="w-4 h-4" />
              <span>Apply Policy Settings</span>
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
