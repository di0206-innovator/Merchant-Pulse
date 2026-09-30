import type { AuditEvent } from '@/core/types';

export class AuditTrail {
  private events: AuditEvent[] = [];

  append(event: Omit<AuditEvent, 'id' | 'timestamp'>): AuditEvent {
    const record: AuditEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    this.events.push(record);
    return record;
  }

  all(): AuditEvent[] {
    return [...this.events];
  }
}
