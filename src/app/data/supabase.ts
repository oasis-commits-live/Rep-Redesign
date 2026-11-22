import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;

// Singleton Supabase client for existing email/password accounts
export const supabase = createClient(supabaseUrl, publicAnonKey, {
  auth: {
    flowType: 'pkce',
    detectSessionInUrl: false,
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Server base URL for existing email/password accounts
export const serverUrl = `${supabaseUrl}/functions/v1/make-server-cef03f12`;

// ── Reactive token tracking ──
let _accessToken: string | null = null;

supabase.auth.onAuthStateChange((_event, session) => {
  _accessToken = session?.access_token ?? null;
});

/** Explicitly set the access token (call right after signInWithPassword). */
export function setAccessToken(token: string | null) {
  _accessToken = token;
}

/** Get the current user access token. */
export function getAccessToken(): string | null {
  return _accessToken;
}

/**
 * Build headers for Supabase Edge Function requests.
 */
export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${publicAnonKey}`,
  };
  if (_accessToken) {
    headers['X-User-Token'] = _accessToken;
  }
  return headers;
}
