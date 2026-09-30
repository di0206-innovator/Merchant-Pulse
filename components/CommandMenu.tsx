'use client';

import React, { useState, useEffect } from 'react';

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  onSwitchMerchant: (id: string) => void;
  onToggleTheme: () => void;
  onTriggerRecovery: () => void;
  onExportAudit: () => void;
}

export function CommandMenu({
  isOpen,
  onClose,
  onNavigate,
  onSwitchMerchant,
  onToggleTheme,
  onTriggerRecovery,
  onExportAudit,
}: CommandMenuProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands = [
    { id: 'view-dashboard', label: 'Go to Dashboard', category: 'Navigation', icon: '⌘1', action: () => onNavigate('dashboard') },
    { id: 'view-opportunities', label: 'Go to Opportunity Radar', category: 'Navigation', icon: '⌘2', action: () => onNavigate('opportunities') },
    { id: 'view-strategy', label: 'Go to AI Strategy Intelligence', category: 'Navigation', icon: '⌘3', action: () => onNavigate('strategy') },
    { id: 'view-audit', label: 'Go to Audit Trail', category: 'Navigation', icon: '⌘4', action: () => onNavigate('audit') },
    { id: 'view-policy', label: 'Go to Policy Guardrails Engine', category: 'Navigation', icon: '⌘5', action: () => onNavigate('policy') },
    { id: 'view-enterprise', label: 'Go to Enterprise SLA & Compliance', category: 'Navigation', icon: '⌘6', action: () => onNavigate('enterprise') },
    { id: 'act-recover', label: 'Execute Autonomous Recovery Batch', category: 'Actions', icon: '⚡', action: () => onTriggerRecovery() },
    { id: 'act-export', label: 'Export Cryptographic Audit Ledger (CSV)', category: 'Actions', icon: '⬇', action: () => onExportAudit() },
    { id: 'act-theme', label: 'Toggle Light / Dark Theme', category: 'Preferences', icon: '◐', action: () => onToggleTheme() },
    { id: 'merchant-northstar', label: 'Switch to Northstar Commerce (D2C)', category: 'Merchants', icon: '🏢', action: () => onSwitchMerchant('northstar') },
    { id: 'merchant-kolkata', label: 'Switch to Kolkata Artisans Co. (Export)', category: 'Merchants', icon: '🏢', action: () => onSwitchMerchant('kolkata') },
    { id: 'merchant-bengaluru', label: 'Switch to Bengaluru CloudStack (SaaS)', category: 'Merchants', icon: '🏢', action: () => onSwitchMerchant('bengaluru') },
  ];

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
          onClose();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="command-palette-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Command Menu">
      <div className="command-palette-modal" onClick={(e) => e.stopPropagation()}>
        <div className="command-palette-header">
          <svg className="command-palette-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="command-palette-input"
            placeholder="Type a command, navigate, or search telemetry..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <kbd className="command-palette-kbd">ESC</kbd>
        </div>

        <div className="command-palette-list">
          {filtered.length === 0 ? (
            <div className="command-palette-empty">No commands match &ldquo;{query}&rdquo;</div>
          ) : (
            filtered.map((cmd, idx) => (
              <div
                key={cmd.id}
                className={`command-palette-item ${idx === selectedIndex ? 'selected' : ''}`}
                onMouseEnter={() => setSelectedIndex(idx)}
                onClick={() => {
                  cmd.action();
                  onClose();
                }}
              >
                <span className="command-palette-item-icon">{cmd.icon}</span>
                <span className="command-palette-item-label">{cmd.label}</span>
                <span className="command-palette-item-category">{cmd.category}</span>
              </div>
            ))
          )}
        </div>

        <div className="command-palette-footer">
          <div className="command-palette-hint">
            <span><kbd className="command-mini-kbd">↑</kbd> <kbd className="command-mini-kbd">↓</kbd> Navigate</span>
            <span><kbd className="command-mini-kbd">↵</kbd> Select</span>
            <span><kbd className="command-mini-kbd">ESC</kbd> Close</span>
          </div>
          <div className="command-palette-version">MerchantPulse OS 2.0</div>
        </div>
      </div>
    </div>
  );
}
