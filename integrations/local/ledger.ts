import fs from 'node:fs/promises';
import path from 'node:path';
import type { EventLedger } from '@/core/events/ledger';

export class FileBasedEventLedger implements EventLedger {
  private readonly filepath: string;
  private memoryCache: Set<string> | null = null;

  constructor(storageDir: string = '.data') {
    this.filepath = path.join(process.cwd(), storageDir, 'events.json');
  }

  private async load(): Promise<Set<string>> {
    if (this.memoryCache) return this.memoryCache;

    try {
      const data = await fs.readFile(this.filepath, 'utf8');
      const events = JSON.parse(data);
      if (Array.isArray(events)) {
        this.memoryCache = new Set(events);
      } else {
        this.memoryCache = new Set();
      }
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        this.memoryCache = new Set();
      } else {
        throw err;
      }
    }

    return this.memoryCache;
  }

  private async save(): Promise<void> {
    if (!this.memoryCache) return;
    const dir = path.dirname(this.filepath);
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (e) {}
    const data = JSON.stringify(Array.from(this.memoryCache));
    await fs.writeFile(this.filepath, data, 'utf8');
  }

  async has(eventId: string): Promise<boolean> {
    const cache = await this.load();
    return cache.has(eventId);
  }

  async record(eventId: string): Promise<boolean> {
    const cache = await this.load();
    if (cache.has(eventId)) return false;
    cache.add(eventId);
    await this.save();
    return true;
  }
}
