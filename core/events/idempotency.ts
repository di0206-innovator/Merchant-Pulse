import { hashString } from '@/lib/cryptoUtils';

export class IdempotencyLedger {
  private seenKeys: Map<string, { timestamp: number; result?: unknown }> = new Map();
  private readonly ttlSeconds: number;

  constructor(ttlSeconds: number = 86400) { // 24-hour default retention
    this.ttlSeconds = ttlSeconds;
  }

  /**
   * Generates a composite hash key if no explicit event ID is provided.
   */
  public generateKey(eventId?: string, rawPayload?: string | Buffer): string {
    if (eventId) {
      return `evt_key_${eventId}`;
    }
    const payloadStr = typeof rawPayload === 'string' ? rawPayload : rawPayload?.toString('utf8') || '';
    const hash = hashString(payloadStr);
    return `hash_key_${hash}`;
  }

  /**
   * Returns true if the key has already been recorded within the TTL window.
   */
  public isDuplicate(key: string): boolean {
    const record = this.seenKeys.get(key);
    if (!record) return false;

    const now = Math.floor(Date.now() / 1000);
    if (now - record.timestamp > this.ttlSeconds) {
      this.seenKeys.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Records a key in the ledger.
   */
  public record(key: string, result?: unknown): void {
    const now = Math.floor(Date.now() / 1000);
    this.seenKeys.set(key, { timestamp: now, result });
  }

  public getStoredResult(key: string): unknown | undefined {
    return this.seenKeys.get(key)?.result;
  }

  public clear(): void {
    this.seenKeys.clear();
  }
}

export const globalIdempotencyLedger = new IdempotencyLedger();
