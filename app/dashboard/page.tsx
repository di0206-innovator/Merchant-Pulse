'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/overview');
  }, [router]);

  return (
    <div className="min-h-screen bg-nb-bg flex flex-col items-center justify-center gap-4">
      <div
        className="w-12 h-12 rounded-2xl border border-amber-300/60 flex items-center justify-center font-mono text-sm font-black text-slate-950 animate-pulse"
        style={{ background: 'linear-gradient(180deg, #FDE68A 0%, #F59E0B 50%, #D97706 100%)' }}
      >
        MP
      </div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-nb-muted animate-pulse">
        Loading MerchantPulse Terminal…
      </p>
    </div>
  );
}
