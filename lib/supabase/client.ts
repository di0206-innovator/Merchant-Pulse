import { createBrowserClient } from '@supabase/ssr';
import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL) && Boolean(SUPABASE_ANON_KEY) && SUPABASE_ANON_KEY !== 'dummy_anon_key_for_demo';
}

export function getSupabaseMode(): 'CONFIGURED' | 'DEMO MODE' {
  return isSupabaseConfigured() ? 'CONFIGURED' : 'DEMO MODE';
}

export function createClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (typeof window !== 'undefined') {
    return createBrowserClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
  }
  return createSupabaseClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
}

export async function signInWithGoogle(redirectTo?: string) {
  const supabase = createClient();
  if (!supabase) {
    console.warn('[MerchantPulse Auth] Supabase not configured. Operating in Demo Mode.');
    return null;
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const targetRedirect = redirectTo || `${origin}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: targetRedirect,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('[Supabase Auth] Google sign in error:', error);
    throw error;
  }

  return data;
}

export async function signOutUser() {
  const supabase = createClient();
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('[Supabase Auth] Sign out error:', error);
    throw error;
  }
}
