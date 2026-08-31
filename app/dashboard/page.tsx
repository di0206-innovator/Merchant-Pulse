'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/overview');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center font-mono text-xs text-[#888888]">
      Redirecting to MerchantPulse Overview...
    </div>
  );
}
