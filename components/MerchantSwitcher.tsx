'use client';

import React from 'react';
import type { MerchantProfile, RazorpayPayment } from '@/core/types';

export interface MerchantPreset {
  id: string;
  name: string;
  tagline: string;
  category: string;
  profile: MerchantProfile;
  payments: RazorpayPayment[];
}

export const MERCHANT_PRESETS: MerchantPreset[] = [
  {
    id: 'mer_northstar',
    name: 'Northstar Commerce',
    tagline: 'D2C Apparel & Footwear · Mumbai Flagship',
    category: 'E-commerce',
    profile: {
      id: 'mer_northstar_01',
      name: 'Northstar Commerce',
      monthly_gmv_paise: 1240000000,
      daily_action_budget_paise: 3000000,
      max_payment_attempts: 3,
      auto_execute_threshold: 0.62,
    },
    payments: [
      { id: 'pay_ns_001', order_id: 'order_ns_001', amount: 349900, currency: 'INR', status: 'failed', method: 'card', error_code: 'GATEWAY_TIMEOUT', error_description: 'Gateway network timeout', created_at: 1756000010, attempts: 1, customer_id: 'cust_ns_1' },
      { id: 'pay_ns_002', order_id: 'order_ns_002', amount: 79900, currency: 'INR', status: 'failed', method: 'upi', error_code: 'BAD_REQUEST_ERROR', error_description: 'Customer declined payment', created_at: 1756000210, attempts: 1, customer_id: 'cust_ns_2' },
      { id: 'pay_ns_003', order_id: 'order_ns_003', amount: 129900, currency: 'INR', status: 'captured', method: 'card', created_at: 1756000310, attempts: 1, customer_id: 'cust_ns_3' },
      { id: 'pay_ns_004', order_id: 'order_ns_004', amount: 549900, currency: 'INR', status: 'failed', method: 'card', error_code: 'GATEWAY_TIMEOUT', error_description: 'Gateway network timeout', created_at: 1756000410, attempts: 1, customer_id: 'cust_ns_4' },
      { id: 'pay_ns_005', order_id: 'order_ns_005', amount: 219900, currency: 'INR', status: 'captured', method: 'upi', created_at: 1756000510, attempts: 1, customer_id: 'cust_ns_5' },
      { id: 'pay_ns_006', order_id: 'order_ns_006', amount: 649900, currency: 'INR', status: 'failed', method: 'card', error_code: 'AUTH_ERROR', error_description: '3DS authentication timeout', created_at: 1756000610, attempts: 2, customer_id: 'cust_ns_1' },
      { id: 'pay_ns_007', order_id: 'order_ns_007', amount: 99900, currency: 'INR', status: 'captured', method: 'upi', created_at: 1756000710, attempts: 1, customer_id: 'cust_ns_7' },
      { id: 'pay_ns_008', order_id: 'order_ns_008', amount: 459900, currency: 'INR', status: 'failed', method: 'card', error_code: 'GATEWAY_TIMEOUT', error_description: 'Gateway network timeout', created_at: 1756000810, attempts: 2, customer_id: 'cust_ns_8' },
    ],
  },
  {
    id: 'mer_kolkata',
    name: 'Kolkata Artisans Co.',
    tagline: 'Handcrafted Heritage & Textiles · Esplanade',
    category: 'Luxury Retail',
    profile: {
      id: 'mer_kolkata_02',
      name: 'Kolkata Artisans Co.',
      monthly_gmv_paise: 2850000000,
      daily_action_budget_paise: 5000000,
      max_payment_attempts: 2,
      auto_execute_threshold: 0.70,
    },
    payments: [
      { id: 'pay_kol_01', order_id: 'order_kol_01', amount: 850000, currency: 'INR', status: 'failed', method: 'card', error_code: 'GATEWAY_TIMEOUT', error_description: 'Acquiring bank timeout', created_at: 1756001000, attempts: 1, customer_id: 'cust_vip_kol_1' },
      { id: 'pay_kol_02', order_id: 'order_kol_02', amount: 1250000, currency: 'INR', status: 'failed', method: 'card', error_code: 'GATEWAY_TIMEOUT', error_description: 'Acquiring bank timeout', created_at: 1756001200, attempts: 1, customer_id: 'cust_vip_kol_2' },
      { id: 'pay_kol_03', order_id: 'order_kol_03', amount: 620000, currency: 'INR', status: 'captured', method: 'upi', created_at: 1756001300, attempts: 1, customer_id: 'cust_kol_3' },
      { id: 'pay_kol_04', order_id: 'order_kol_04', amount: 980000, currency: 'INR', status: 'failed', method: 'card', error_code: 'AUTH_ERROR', error_description: 'OTP challenge incomplete', created_at: 1756001400, attempts: 2, customer_id: 'cust_vip_kol_1' },
      { id: 'pay_kol_05', order_id: 'order_kol_05', amount: 1450000, currency: 'INR', status: 'captured', method: 'card', created_at: 1756001500, attempts: 1, customer_id: 'cust_kol_5' },
    ],
  },
  {
    id: 'mer_bengaluru',
    name: 'Bengaluru CloudStack',
    tagline: 'Developer Infrastructure & APIs · Indiranagar',
    category: 'Fintech SaaS',
    profile: {
      id: 'mer_bengaluru_03',
      name: 'Bengaluru CloudStack',
      monthly_gmv_paise: 4500000000,
      daily_action_budget_paise: 8000000,
      max_payment_attempts: 3,
      auto_execute_threshold: 0.65,
    },
    payments: [
      { id: 'pay_blr_01', order_id: 'order_blr_01', amount: 2499900, currency: 'INR', status: 'failed', method: 'card', error_code: 'GATEWAY_TIMEOUT', error_description: 'Issuer latency exceeded', created_at: 1756002000, attempts: 1, customer_id: 'cust_saas_1' },
      { id: 'pay_blr_02', order_id: 'order_blr_02', amount: 1899900, currency: 'INR', status: 'failed', method: 'card', error_code: 'GATEWAY_TIMEOUT', error_description: 'Issuer latency exceeded', created_at: 1756002200, attempts: 1, customer_id: 'cust_saas_2' },
      { id: 'pay_blr_03', order_id: 'order_blr_03', amount: 4999900, currency: 'INR', status: 'captured', method: 'netbanking', created_at: 1756002300, attempts: 1, customer_id: 'cust_saas_3' },
      { id: 'pay_blr_04', order_id: 'order_blr_04', amount: 3200000, currency: 'INR', status: 'captured', method: 'card', created_at: 1756002400, attempts: 1, customer_id: 'cust_saas_4' },
    ],
  },
];

interface MerchantSwitcherProps {
  selectedPreset: MerchantPreset;
  onSelectPreset: (preset: MerchantPreset) => void;
  disabled?: boolean;
}

export const MerchantSwitcher: React.FC<MerchantSwitcherProps> = ({
  selectedPreset,
  onSelectPreset,
  disabled = false,
}) => {
  return (
    <div className="merchant-switcher-box" role="region" aria-label="Merchant Profile Switcher">
      <div className="switcher-header">
        <span className="switcher-tag">DEMO SIMULATION ENVIRONMENT</span>
        <h4 className="switcher-title">Select Merchant Profile</h4>
      </div>
      <div className="switcher-options">
        {MERCHANT_PRESETS.map((preset) => {
          const isSelected = preset.id === selectedPreset.id;
          return (
            <button
              key={preset.id}
              type="button"
              className={`switcher-card ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectPreset(preset)}
              disabled={disabled}
              aria-pressed={isSelected}
            >
              <div className="switcher-card-top">
                <span className="preset-name">{preset.name}</span>
                <span className="preset-cat">{preset.category}</span>
              </div>
              <p className="preset-tagline">{preset.tagline}</p>
              <div className="preset-meta">
                <span>GMV: ₹{(preset.profile.monthly_gmv_paise / 10000000).toFixed(2)}Cr/mo</span>
                <span>{preset.payments.length} Payments</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
