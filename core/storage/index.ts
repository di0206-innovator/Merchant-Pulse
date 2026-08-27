import {
  WebhookEventStore,
  OpportunityStore,
  AuditStore,
  ExecutionIntentStore,
  ReconciliationStore,
} from './interfaces';
import {
  InMemoryWebhookEventStore,
  InMemoryOpportunityStore,
  InMemoryAuditStore,
  InMemoryExecutionIntentStore,
  InMemoryReconciliationStore,
} from './inMemoryStores';
import {
  SupabaseWebhookEventStore,
  SupabaseOpportunityStore,
  SupabaseAuditStore,
  SupabaseExecutionIntentStore,
  SupabaseReconciliationStore,
} from './supabaseStores';
import { createServerClient, isServerSupabaseConfigured } from '@/lib/supabase/server';

export * from './interfaces';
export * from './inMemoryStores';
export * from './supabaseStores';

export interface StorageRepositories {
  mode: 'SUPABASE' | 'IN_MEMORY';
  webhookEvents: WebhookEventStore;
  opportunities: OpportunityStore;
  audit: AuditStore;
  executionIntents: ExecutionIntentStore;
  reconciliation: ReconciliationStore;
}

let globalRepositories: StorageRepositories | null = null;

export function createStorageRepositories(forceInMemory = false): StorageRepositories {
  if (forceInMemory || !isServerSupabaseConfigured()) {
    return {
      mode: 'IN_MEMORY',
      webhookEvents: new InMemoryWebhookEventStore(),
      opportunities: new InMemoryOpportunityStore(),
      audit: new InMemoryAuditStore(),
      executionIntents: new InMemoryExecutionIntentStore(),
      reconciliation: new InMemoryReconciliationStore(),
    };
  }

  const supabase = createServerClient();
  if (!supabase) {
    return {
      mode: 'IN_MEMORY',
      webhookEvents: new InMemoryWebhookEventStore(),
      opportunities: new InMemoryOpportunityStore(),
      audit: new InMemoryAuditStore(),
      executionIntents: new InMemoryExecutionIntentStore(),
      reconciliation: new InMemoryReconciliationStore(),
    };
  }

  return {
    mode: 'SUPABASE',
    webhookEvents: new SupabaseWebhookEventStore(supabase),
    opportunities: new SupabaseOpportunityStore(supabase),
    audit: new SupabaseAuditStore(supabase),
    executionIntents: new SupabaseExecutionIntentStore(supabase),
    reconciliation: new SupabaseReconciliationStore(supabase),
  };
}

export function getGlobalRepositories(): StorageRepositories {
  if (!globalRepositories) {
    globalRepositories = createStorageRepositories();
  }
  return globalRepositories;
}
