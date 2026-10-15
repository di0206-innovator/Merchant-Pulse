import { hashString } from '@/lib/cryptoUtils';

const DEFAULT_MAX_ENTRIES = 50000;

export class IdempotencyLedger {
  private seenKeys: Map<string, { timestamp: number; committed: boolean; result?: unknown }> = new Map();
  private readonly ttlSeconds: number;
  private readonly maxEntries: number;

  constructor(ttlSeconds: number = 86400, maxEntries: number = DEFAULT_MAX_ENTRIES) {
    this.ttlSeconds = Number.isFinite(ttlSeconds) && ttlSeconds > 0 ? ttlSeconds : 86400;
    this.maxEntries = Number.isFinite(maxEntries) && maxEntries > 0 ? maxEntries : DEFAULT_MAX_ENTRIES;
  }

  /**
   * Generates a composite hash key if no explicit event ID is provided.
   * Sanitizes and bounds key length to prevent memory exhaustion via huge headers.
   */
  public generateKey(eventId?: string, rawPayload?: string | Buffer): string {
    if (typeof eventId === 'string' && eventId.trim().length > 0) {
      const cleanId = eventId.trim();
      if (cleanId.length <= 128 && /^[a-zA-Z0-9_.:-]+$/.test(cleanId)) {
        return `evt_key_${cleanId}`;
      }
      return `evt_key_${hashString(cleanId)}`;
    }
    const payloadStr = typeof rawPayload === 'string' ? rawPayload : rawPayload?.toString('utf8') || '';
    const hash = hashString(payloadStr);
    return `hash_key_${hash}`;
  }

  /**
   * Returns true if the key has already been recorded or locked within the TTL window.
   */
  public isDuplicate(key: string): boolean {
    if (typeof key !== 'string' || !key) return false;
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
   * Atomically acquires an in-flight processing lock for a key.
   * Returns true if lock was acquired (first request), false if already seen/locked (duplicate).
   */
  public acquireLock(key: string): boolean {
    if (typeof key !== 'string' || !key) return false;
    if (this.isDuplicate(key)) {
      return false;
    }
    this.evictIfNeeded();
    const now = Math.floor(Date.now() / 1000);
    this.seenKeys.set(key, { timestamp: now, committed: false });
    return true;
  }

  /**
   * Releases a lock if event processing failed before commit.
   */
  public releaseLock(key: string): void {
    const record = this.seenKeys.get(key);
    if (record && !record.committed) {
      this.seenKeys.delete(key);
    }
  }

  /**
   * Records a committed key in the ledger.
   */
  public record(key: string, result?: unknown): void {
    if (typeof key !== 'string' || !key) return;
    this.evictIfNeeded();
    const now = Math.floor(Date.now() / 1000);
    this.seenKeys.set(key, { timestamp: now, committed: true, result });
  }

  private evictIfNeeded(): void {
    if (this.seenKeys.size < this.maxEntries) {
      return;
    }
    const now = Math.floor(Date.now() / 1000);
    for (const [k, rec] of this.seenKeys.entries()) {
      if (now - rec.timestamp > this.ttlSeconds) {
        this.seenKeys.delete(k);
      }
    }
    while (this.seenKeys.size >= this.maxEntries) {
      const oldestKey = this.seenKeys.keys().next().value;
      if (!oldestKey) break;
      this.seenKeys.delete(oldestKey);
    }
  }

  public getStoredResult(key: string): unknown | undefined {
    return this.seenKeys.get(key)?.result;
  }

  public clear(): void {
    this.seenKeys.clear();
  }
}

export const globalIdempotencyLedger = new IdempotencyLedger();
