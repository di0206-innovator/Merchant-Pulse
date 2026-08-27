import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from './client';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Server persistence requires a real SUPABASE_SERVICE_ROLE_KEY.
 * Falling back to anon key on server would cause silent RLS insert/update rejections.
 */
export function isServerSupabaseConfigured(): boolean {
  if (!isSupabaseConfigured() || !SUPABASE_URL || !SERVICE_ROLE_KEY) return false;
  if (SERVICE_ROLE_KEY.includes('your_') || SERVICE_ROLE_KEY.includes('placeholder')) return false;
  return true;
}

export function createServerClient(): SupabaseClient | null {
  if (!isServerSupabaseConfigured() || !SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return null;
  }
  return createSupabaseClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
