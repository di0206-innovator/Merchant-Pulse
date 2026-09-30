import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'MerchantPulse - AI Revenue Intelligence for Razorpay Merchants';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #08212D 0%, #0d3b4c 60%, #061822 100%)',
          padding: '60px 80px',
          fontFamily: 'sans-serif',
          color: '#ffffff',
          position: 'relative',
        }}
      >
        {/* Decorative corner accent */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 400,
            height: 400,
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, transparent 70%)',
          }}
        />

        {/* Brand header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              fontWeight: 900,
              color: '#08212D',
              boxShadow: '0 8px 24px rgba(245, 158, 11, 0.4)',
            }}
          >
            M
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: -0.5 }}>MerchantPulse</span>
            <span style={{ fontSize: 16, color: '#FBBF24', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              मर्चेंट पल्स · RAZORPAY REVENUE INTELLIGENCE
            </span>
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 900 }}>
          <div
            style={{
              fontSize: 54,
              fontWeight: 900,
              lineHeight: 1.15,
              color: '#ffffff',
              letterSpacing: -1,
            }}
          >
            Find the revenue worth acting on next.
          </div>
          <div
            style={{
              fontSize: 22,
              color: '#94A3B8',
              lineHeight: 1.45,
            }}
          >
            Deterministic payment analysis + AI strategy + policy verification before execution.
          </div>
        </div>

        {/* Footer badges */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <div
            style={{
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: 12,
              padding: '10px 20px',
              fontSize: 16,
              fontWeight: 700,
              color: '#FDE68A',
            }}
          >
            ⚡ Deterministic Pipeline
          </div>
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: 12,
              padding: '10px 20px',
              fontSize: 16,
              fontWeight: 700,
              color: '#6EE7B7',
            }}
          >
            ✓ Policy Guardrails
          </div>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 12,
              padding: '10px 20px',
              fontSize: 16,
              color: '#CBD5E1',
            }}
          >
            Razorpay Integration Spine
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
