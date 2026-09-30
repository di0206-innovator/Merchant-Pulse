/**
 * Lightweight, privacy-first telemetry client.
 * Respects cookie consent choices and never tracks personally identifiable information.
 */

export interface TelemetryEvent {
  name: string;
  properties?: Record<string, string | number | boolean>;
  timestamp?: number;
}

const CONSENT_STORAGE_KEY = 'merchantpulse_cookie_consent_v1';

export function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return false;
    const consent = JSON.parse(raw);
    return Boolean(consent?.analytics);
  } catch {
    return false;
  }
}

export function trackEvent(name: string, properties: Record<string, string | number | boolean> = {}): void {
  if (typeof window === 'undefined') return;

  const event: TelemetryEvent = {
    name,
    properties: {
      ...properties,
      viewport_width: window.innerWidth,
      path: window.location.pathname,
    },
    timestamp: Date.now(),
  };

  // Only dispatch if consent has been given
  if (hasAnalyticsConsent()) {
    try {
      // In production, sendBeacon to privacy-preserving endpoint
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics', JSON.stringify(event));
      }
    } catch {
      // Graceful fallback
    }
  }

  // Also log for developer visibility in dev mode
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('[Telemetry Event]:', event.name, event.properties);
  }
}
