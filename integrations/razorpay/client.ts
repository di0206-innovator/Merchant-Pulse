import crypto from 'node:crypto';

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

export class MockRazorpayClientAdapter implements RazorpayClientAdapter {
  public readonly name = 'MockRazorpayClientAdapter';
  private links: Map<string, PaymentLinkResponse> = new Map();

  public async createPaymentLink(params: CreatePaymentLinkParams): Promise<PaymentLinkResponse> {
    const now = Math.floor(Date.now() / 1000);
    const expireBy = params.expireByMinutes ? now + (params.expireByMinutes * 60) : now + (2 * 3600);
    const hash = crypto.createHash('sha256').update(`${params.referenceId}_${now}`).digest('hex').slice(0, 14);
    const linkId = `plink_${hash}`;
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
    const link = this.links.get(paymentLinkId);
    if (link) {
      link.status = 'cancelled';
      this.links.set(paymentLinkId, link);
    }
    return { success: true, id: paymentLinkId, status: 'cancelled' };
  }

  public async sendNotification(paymentLinkId: string, medium: 'sms' | 'email'): Promise<{ success: boolean }> {
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
    this.keyId = keyId || process.env.RAZORPAY_KEY_ID || '';
    this.keySecret = keySecret || process.env.RAZORPAY_KEY_SECRET || '';
  }

  private getAuthHeader(): string {
    return `Basic ${Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64')}`;
  }

  public async createPaymentLink(params: CreatePaymentLinkParams): Promise<PaymentLinkResponse> {
    const now = Math.floor(Date.now() / 1000);
    const expireBy = params.expireByMinutes ? now + (params.expireByMinutes * 60) : undefined;

    const payload = {
      amount: params.amountPaise,
      currency: params.currency || 'INR',
      accept_partial: false,
      reference_id: params.referenceId,
      description: params.description,
      customer: {
        name: params.customer.name,
        email: params.customer.email,
        contact: params.customer.contact,
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
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`[LiveRazorpayClientAdapter] Failed to create payment link: ${res.status} ${errText}`);
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
    const res = await fetch(`${this.baseUrl}/payment_links/${paymentLinkId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`[LiveRazorpayClientAdapter] Failed to cancel payment link: ${res.status} ${errText}`);
    }

    const data = await res.json();
    return { success: true, id: data.id, status: data.status };
  }

  public async sendNotification(paymentLinkId: string, medium: 'sms' | 'email'): Promise<{ success: boolean }> {
    const res = await fetch(`${this.baseUrl}/payment_links/${paymentLinkId}/notify_by/${medium}`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`[LiveRazorpayClientAdapter] Failed to notify payment link: ${res.status} ${errText}`);
    }

    return { success: true };
  }
}
