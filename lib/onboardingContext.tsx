'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Plan = 'base' | 'pro' | 'max';

export interface BusinessProfile {
  businessName: string;
  businessType: string;
  website: string;
  monthlyGmv: string;
  phone: string;
}

interface OnboardingContextType {
  onboardingComplete: boolean;
  planSelected: Plan;
  businessProfile: BusinessProfile | null;
  completeOnboarding: (plan: Plan, biz: BusinessProfile) => void;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType>({
  onboardingComplete: false,
  planSelected: 'base',
  businessProfile: null,
  completeOnboarding: () => {},
  resetOnboarding: () => {},
});

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [planSelected, setPlanSelected] = useState<Plan>('base');
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('mp_onboarding');
      if (stored) {
        const parsed = JSON.parse(stored);
        setOnboardingComplete(parsed.complete ?? false);
        setPlanSelected(parsed.plan ?? 'base');
        setBusinessProfile(parsed.business ?? null);
      }
    } catch {}
  }, []);

  const completeOnboarding = (plan: Plan, biz: BusinessProfile) => {
    setPlanSelected(plan);
    setBusinessProfile(biz);
    setOnboardingComplete(true);
    try {
      localStorage.setItem('mp_onboarding', JSON.stringify({ complete: true, plan, business: biz }));
    } catch {}
  };

  const resetOnboarding = () => {
    setOnboardingComplete(false);
    setPlanSelected('base');
    setBusinessProfile(null);
    try { localStorage.removeItem('mp_onboarding'); } catch {}
  };

  return (
    <OnboardingContext.Provider value={{ onboardingComplete, planSelected, businessProfile, completeOnboarding, resetOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  return useContext(OnboardingContext);
}
