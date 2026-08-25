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
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-slate-950/95 border-l border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-xl z-50 flex flex-col font-sans text-slate-900 dark:text-slate-100 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60 font-mono">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Merchant Policy Editor
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Sliders */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 font-mono text-xs">
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-500/30 space-y-1">
          <div className="font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Razorpay Agent Studio Policy Guardrails</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
            Modify autonomous boundary limits in real time. Decisions instantly adjust between Autonomous Execution and Human Review Queue.
          </p>
        </div>

        {/* Slider 1: Autonomous GMV Cap */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3">
          <label className="block font-bold text-slate-900 dark:text-slate-200">
            Autonomous GMV Execution Cap: <span className="text-blue-600 dark:text-blue-400">₹{maxAutoGmvRupees.toLocaleString('en-IN')}</span>
          </label>
          <input
            type="range"
            min="5000"
            max="100000"
            step="5000"
            value={maxAutoGmvRupees}
            onChange={(e) => setMaxAutoGmvRupees(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <p className="text-[11px] text-slate-500 font-sans">
            Transactions above ₹{maxAutoGmvRupees.toLocaleString('en-IN')} are automatically routed to the Human Ops Queue.
          </p>
        </div>

        {/* Slider 2: Minimum Net EV */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3">
          <label className="block font-bold text-slate-900 dark:text-slate-200">
            Minimum Net EV Threshold: <span className="text-emerald-600 dark:text-emerald-400">₹{minEvRupees}</span>
          </label>
          <input
            type="range"
            min="0"
            max="200"
            step="10"
            value={minEvRupees}
            onChange={(e) => setMinEvRupees(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <p className="text-[11px] text-slate-500 font-sans">
            Interventions with Net EV below ₹{minEvRupees} are suppressed to prevent margin erosion.
          </p>
        </div>

        {/* Slider 3: Contact Cooldown */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3">
          <label className="block font-bold text-slate-900 dark:text-slate-200">
            Customer Contact Cooldown: <span className="text-amber-600 dark:text-amber-400">{cooldownHours} Hours</span>
          </label>
          <input
            type="range"
            min="6"
            max="72"
            step="6"
            value={cooldownHours}
            onChange={(e) => setCooldownHours(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <p className="text-[11px] text-slate-500 font-sans">
            Prevents customer fatigue by enforcing a {cooldownHours}-hour quiet window between recovery contacts.
          </p>
        </div>
      </div>

      {/* Footer Save Action */}
      <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 font-mono">
        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition-all active:scale-95"
        >
          {savedSuccess ? (
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Policy Updated Successfully!</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              <span>Apply Policy Settings</span>
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
