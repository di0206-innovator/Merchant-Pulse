import { hashString } from '@/lib/cryptoUtils';

export interface CreatePaymentLinkParams {
  amountPaise: number;
  currency?: string;
  referenceId: string;
  description: string;
  customer: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notify?: {
    sms?: boolean;
    email?: boolean;
  };
  expireByMinutes?: number;
  callbackUrl?: string;
  notes?: Record<string, string>;
}

export interface PaymentLinkResponse {
  id: string;
  status: 'created' | 'partially_paid' | 'paid' | 'cancelled' | 'expired';
  shortUrl: string;
  amountPaise: number;
  currency: string;
  referenceId: string;
  createdAt: number;
  expireBy?: number;
}

export interface RazorpayClientAdapter {
  name: string;
  createPaymentLink(params: CreatePaymentLinkParams): Promise<PaymentLinkResponse>;
  cancelPaymentLink(paymentLinkId: string): Promise<{ success: boolean; id: string; status: string }>;
  sendNotification(paymentLinkId: string, medium: 'sms' | 'email'): Promise<{ success: boolean }>;
}

const PLINK_ID_REGEX = /^plink_[a-zA-Z0-9_-]{4,64}$/;
const REQUEST_TIMEOUT_MS = 10000;

function validatePaymentLinkParams(params: CreatePaymentLinkParams): void {
  if (!Number.isSafeInteger(params.amountPaise) || params.amountPaise <= 0) {
    throw new Error(`[RazorpayClientAdapter] Invalid amountPaise (${params.amountPaise}): must be a positive integer.`);
  }
  if (!params.referenceId || typeof params.referenceId !== 'string' || !params.referenceId.trim()) {
    throw new Error('[RazorpayClientAdapter] Missing or invalid referenceId.');
  }
  if (params.callbackUrl !== undefined) {
    try {
      const parsed = new URL(params.callbackUrl);
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        throw new Error('Unsupported callback URL protocol');
      }
    } catch {
      throw new Error('[RazorpayClientAdapter] Invalid callbackUrl: must be a valid HTTP/HTTPS URL.');
    }
  }
}

function validatePaymentLinkId(paymentLinkId: string): string {
  if (typeof paymentLinkId !== 'string' || !PLINK_ID_REGEX.test(paymentLinkId.trim())) {
    throw new Error('[RazorpayClientAdapter] Invalid paymentLinkId format.');
  }
  return encodeURIComponent(paymentLinkId.trim());
}

export class MockRazorpayClientAdapter implements RazorpayClientAdapter {
  public readonly name = 'MockRazorpayClientAdapter';
  private links: Map<string, PaymentLinkResponse> = new Map();
  private sequence = 0;

  public async createPaymentLink(params: CreatePaymentLinkParams): Promise<PaymentLinkResponse> {
    validatePaymentLinkParams(params);

    const now = Math.floor(Date.now() / 1000);
    const expireBy = params.expireByMinutes && params.expireByMinutes > 0
      ? now + (Math.floor(params.expireByMinutes) * 60)
      : now + (2 * 3600);
    const seq = this.sequence++;
    const hash = hashString(`${params.referenceId}_${now}_${seq}`);
    const linkId = `plink_${hash.slice(0, 14)}`;
    const shortUrl = `https://rzp.io/i/${linkId.slice(6, 14)}`;

    const response: PaymentLinkResponse = {
      id: linkId,
      status: 'created',
      shortUrl,
      amountPaise: params.amountPaise,
      currency: params.currency || 'INR',
      referenceId: params.referenceId,
      createdAt: now,
      expireBy,
    };

    this.links.set(linkId, response);
    return response;
  }

  public async cancelPaymentLink(paymentLinkId: string): Promise<{ success: boolean; id: string; status: string }> {
    const safeId = validatePaymentLinkId(paymentLinkId);
    const link = this.links.get(safeId);
    if (link) {
      link.status = 'cancelled';
      this.links.set(safeId, link);
    }
    return { success: true, id: safeId, status: 'cancelled' };
  }

  public async sendNotification(paymentLinkId: string, medium: 'sms' | 'email'): Promise<{ success: boolean }> {
    validatePaymentLinkId(paymentLinkId);
    if (medium !== 'sms' && medium !== 'email') {
      throw new Error('[MockRazorpayClientAdapter] Invalid notification medium.');
    }
    return { success: true };
  }

  public getCreatedLink(linkId: string): PaymentLinkResponse | undefined {
    return this.links.get(linkId);
  }
}

export class LiveRazorpayClientAdapter implements RazorpayClientAdapter {
  public readonly name = 'LiveRazorpayClientAdapter';
  private keyId: string;
  private keySecret: string;
  private baseUrl = 'https://api.razorpay.com/v1';

  constructor(keyId?: string, keySecret?: string) {
    this.keyId = (keyId !== undefined ? keyId : process.env.RAZORPAY_KEY_ID || '').trim();
    this.keySecret = (keySecret !== undefined ? keySecret : process.env.RAZORPAY_KEY_SECRET || '').trim();

    if (!this.keyId || !this.keySecret) {
      throw new Error(
        '[LiveRazorpayClientAdapter] Missing required Razorpay credentials. Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.'
      );
    }
  }

  private getAuthHeader(): string {
    const credentials = `${this.keyId}:${this.keySecret}`;
    const base64 = typeof window !== 'undefined' && typeof window.btoa === 'function'
      ? window.btoa(credentials)
      : Buffer.from(credentials, 'utf8').toString('base64');
    return `Basic ${base64}`;
  }

  private getTimeoutSignal(): AbortSignal | undefined {
    if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
      return AbortSignal.timeout(REQUEST_TIMEOUT_MS);
    }
    return undefined;
  }

  public async createPaymentLink(params: CreatePaymentLinkParams): Promise<PaymentLinkResponse> {
    validatePaymentLinkParams(params);

    const now = Math.floor(Date.now() / 1000);
    const expireBy = params.expireByMinutes && params.expireByMinutes > 0
      ? now + (Math.floor(params.expireByMinutes) * 60)
      : undefined;

    const payload = {
      amount: params.amountPaise,
      currency: params.currency || 'INR',
      accept_partial: false,
      reference_id: params.referenceId.slice(0, 40),
      description: (params.description || 'Payment Recovery').slice(0, 255),
      customer: {
        name: params.customer.name?.slice(0, 100),
        email: params.customer.email?.slice(0, 254),
        contact: params.customer.contact?.slice(0, 20),
      },
      notify: {
        sms: params.notify?.sms ?? true,
        email: params.notify?.email ?? true,
      },
      reminder_enable: true,
      notes: params.notes,
      expire_by: expireBy,
      callback_url: params.callbackUrl,
    };

    const res = await fetch(`${this.baseUrl}/payment_links`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: this.getTimeoutSignal(),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`[LiveRazorpayClientAdapter] Failed to create payment link: ${res.status} ${errText.slice(0, 300)}`);
    }

    const data = await res.json();
    return {
      id: data.id,
      status: data.status,
      shortUrl: data.short_url,
      amountPaise: data.amount,
      currency: data.currency,
      referenceId: data.reference_id,
      createdAt: data.created_at,
      expireBy: data.expire_by,
    };
  }

  public async cancelPaymentLink(paymentLinkId: string): Promise<{ success: boolean; id: string; status: string }> {
    const safeId = validatePaymentLinkId(paymentLinkId);

    const res = await fetch(`${this.baseUrl}/payment_links/${safeId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
      },
      signal: this.getTimeoutSignal(),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`[LiveRazorpayClientAdapter] Failed to cancel payment link: ${res.status} ${errText.slice(0, 300)}`);
    }

    const data = await res.json();
    return { success: true, id: data.id, status: data.status };
  }

  public async sendNotification(paymentLinkId: string, medium: 'sms' | 'email'): Promise<{ success: boolean }> {
    const safeId = validatePaymentLinkId(paymentLinkId);
    if (medium !== 'sms' && medium !== 'email') {
      throw new Error('[LiveRazorpayClientAdapter] Invalid notification medium.');
    }

    const res = await fetch(`${this.baseUrl}/payment_links/${safeId}/notify_by/${medium}`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
      },
      signal: this.getTimeoutSignal(),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`[LiveRazorpayClientAdapter] Failed to notify payment link: ${res.status} ${errText.slice(0, 300)}`);
    }

    return { success: true };
  }
}
