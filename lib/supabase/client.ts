import { createBrowserClient } from '@supabase/ssr';
import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

export function isSupabaseConfigured(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return false;
  if (
    supabaseUrl.includes('your-project') ||
    supabaseUrl.includes('example.supabase.co') ||
    supabaseAnonKey.includes('your_supabase_anon_key') ||
    supabaseAnonKey === 'dummy_anon_key_for_demo'
  ) {
    return false;
  }
  return true;
}

export function getSupabaseMode(): 'CONFIGURED' | 'DEMO MODE' {
  return isSupabaseConfigured() ? 'CONFIGURED' : 'DEMO MODE';
}

export function createClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (typeof window !== 'undefined') {
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}

export async function signInWithGoogle(redirectTo?: string) {
  const supabase = createClient();
  if (!supabase) {
    console.warn('[MerchantPulse Auth] Supabase not configured. Operating in Demo Mode.');
    return null;
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  let targetRedirect = `${origin}/auth/callback`;

  if (redirectTo && typeof redirectTo === 'string') {
    try {
      const parsed = new URL(redirectTo, origin);
      if (parsed.origin === origin) {
        targetRedirect = parsed.toString();
      }
    } catch {
      // Fallback to default callback URL on invalid redirectTo
    }
  }

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
