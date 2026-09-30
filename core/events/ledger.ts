export interface EventLedger {
  has(eventId: string): Promise<boolean>;
  record(eventId: string): Promise<boolean>;
}

export class InMemoryEventLedger implements EventLedger {
  private readonly seen = new Set<string>();

  async has(eventId: string): Promise<boolean> {
    return this.seen.has(eventId);
  }

  async record(eventId: string): Promise<boolean> {
    if (this.seen.has(eventId)) return false;
    this.seen.add(eventId);
    return true;
  }
}
