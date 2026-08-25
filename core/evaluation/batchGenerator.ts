import { BatchConfig, SyntheticPaymentEvent } from './benchmarkTypes';
import { PaymentEntity, PaymentMethod } from '../domain/payment';

// Seeded PRNG (Linear Congruential Generator) for reproducible benchmarks
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }

  public nextFloat(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }

  public nextInt(min: number, max: number): number {
    return Math.floor(this.nextFloat() * (max - min + 1)) + min;
  }

  public choice<T>(items: T[]): T {
    return items[this.nextInt(0, items.length - 1)];
  }
}

export class BatchGenerator {
  public generateBatch(config: BatchConfig): SyntheticPaymentEvent[] {
    const rng = new SeededRandom(config.seed);
    const events: SyntheticPaymentEvent[] = [];

    const failureCodes = [
      'BANK_TIMEOUT',
      'GATEWAY_ERROR',
      'AUTHENTICATION_ERROR',
      'CHECKOUT_ABANDONMENT',
      'UPI_APP_TIMEOUT',
      'BAD_REQUEST',
    ];

    const methods: PaymentMethod[] = ['upi', 'card', 'netbanking'];
    const banks = ['HDFC', 'ICICI', 'SBI', 'AXIS', 'KOTAK'];

    const heldOutCutoff = Math.floor(config.batchSize * config.splitRatio);
    const now = Math.floor(Date.now() / 1000);

    for (let i = 0; i < config.batchSize; i++) {
      const isHeldOut = i >= heldOutCutoff;
      const failureCode = rng.choice(failureCodes);
      const method = rng.choice(methods);
      const bank = method === 'netbanking' || method === 'card' ? rng.choice(banks) : undefined;

      // Realistic transaction amounts: 70% small (₹300 - ₹3,500), 20% medium (₹3,500 - ₹20,000), 10% large (₹20,000 - ₹95,000)
      const rAmount = rng.nextFloat();
      let amountPaise = 150000;
      if (rAmount < 0.70) {
        amountPaise = rng.nextInt(3000, 350000); // ₹30 - ₹3,500
      } else if (rAmount < 0.90) {
        amountPaise = rng.nextInt(350000, 2000000); // ₹3,500 - ₹20,000
      } else {
        amountPaise = rng.nextInt(2000000, 9500000); // ₹20,000 - ₹95,000
      }

      const retryCount = rng.nextInt(1, 4);
      const customerLtvPaise = rng.nextFloat() > 0.6 ? rng.nextInt(500000, 25000000) : 0; // 40% have LTV
      const intentScore = Number((0.3 + rng.nextFloat() * 0.65).toFixed(2));
      const isDegraded = bank === 'HDFC' && rng.nextFloat() < 0.35;
      const contactable = rng.nextFloat() > 0.05; // 95% contactable

      const paymentId = `pay_synth_${config.seed}_${i}`;
      const orderId = `order_synth_${config.seed}_${i}`;
      const eventId = `evt_synth_${config.seed}_${i}`;

      const payment: PaymentEntity = {
        id: paymentId,
        orderId,
        amountPaise,
        currency: 'INR',
        status: 'failed',
        method,
        bank,
        contact: contactable ? `+9198${rng.nextInt(10000000, 99999999)}` : undefined,
        email: contactable ? `synth_cust_${i}@example.com` : undefined,
        error: {
          code: failureCode,
          description: `Synthetic failure (${failureCode})`,
        },
        createdAt: now - (config.batchSize - i) * 60,
      };

      // Determine simulated outcome probability for demo simulation
      const baseProb = failureCode === 'BANK_TIMEOUT' ? 0.68 :
                       failureCode === 'UPI_APP_TIMEOUT' ? 0.75 :
                       failureCode === 'AUTHENTICATION_ERROR' ? 0.60 :
                       failureCode === 'GATEWAY_ERROR' ? 0.55 :
                       failureCode === 'CHECKOUT_ABANDONMENT' ? 0.40 : 0.15;

      const outcomeRoll = rng.nextFloat();
      let simulatedOutcome: SyntheticPaymentEvent['simulatedOutcome'] = 'failed';
      if (outcomeRoll < baseProb) {
        simulatedOutcome = 'paid';
      } else if (outcomeRoll < baseProb + 0.15) {
        simulatedOutcome = 'expired';
      } else {
        simulatedOutcome = 'ignored';
      }

      events.push({
        eventIndex: i,
        isHeldOut,
        payment,
        eventId,
        customerLtvPaise,
        retryCount,
        intentScore,
        isDegraded,
        contactable,
        simulatedOutcome,
      });
    }

    return events;
  }
}
