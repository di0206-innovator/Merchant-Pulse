import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from './client';

/**
 * Server persistence requires a real SUPABASE_SERVICE_ROLE_KEY.
 * Falling back to anon key on server would cause silent RLS insert/update rejections.
 */
export function isServerSupabaseConfigured(): boolean {
  if (
    (process.env.NODE_ENV === 'test' || Boolean(process.env.VITEST)) &&
    process.env.ENABLE_SUPABASE_IN_TESTS !== 'true'
  ) {
    return false;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

  if (!isSupabaseConfigured() || !supabaseUrl || !serviceRoleKey) return false;
  if (serviceRoleKey.includes('your_') || serviceRoleKey.includes('placeholder')) return false;
  return true;
}

export function createServerClient(): SupabaseClient | null {
  if (!isServerSupabaseConfigured()) {
    return null;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY)!;

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
