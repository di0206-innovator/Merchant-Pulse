import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { isSupabaseConfigured } from '@/lib/supabase/client';

/**
 * Prevents Open Redirect vulnerabilities by ensuring the redirect target
 * is a strictly relative path on the same origin.
 */
export function sanitizeRedirectPath(nextParam: string | null, origin: string): string {
  const fallback = '/dashboard';
  if (!nextParam || typeof nextParam !== 'string') {
    return fallback;
  }

  const trimmed = nextParam.trim();
  // Must start with a single '/' and never '//' or '/\' or contain control characters
  if (
    !trimmed.startsWith('/') ||
    trimmed.startsWith('//') ||
    trimmed.startsWith('/\\') ||
    /[\r\n\t\0]/.test(trimmed)
  ) {
    return fallback;
  }

  try {
    const resolved = new URL(trimmed, origin);
    if (resolved.origin !== origin) {
      return fallback;
    }
    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return fallback;
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const safeNext = sanitizeRedirectPath(searchParams.get('next'), origin);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (code && isSupabaseConfigured() && supabaseUrl && supabaseAnonKey) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Server component write suppression
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(safeNext, origin));
    }
  }

  return NextResponse.redirect(new URL('/dashboard?auth_error=callback_failed', origin));
}
