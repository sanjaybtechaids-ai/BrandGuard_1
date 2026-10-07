import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let clientInstance: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return Boolean(
    url &&
      key &&
      !url.includes('brandguard-mock') &&
      !url.includes('your-project-id') &&
      !key.includes('mock-') &&
      !key.includes('your-anon')
  );
}

/**
 * Demo records are intentionally limited to local development and automated
 * checks. A production deployment without Supabase configuration must fail
 * closed instead of exposing a shared in-memory tenant.
 */
export function isDemoMode(): boolean {
  return (
    !isSupabaseConfigured() &&
    (process.env.NEXT_PUBLIC_BRANDGUARD_DEMO_MODE === 'true' || process.env.NODE_ENV !== 'production')
  );
}

export function createClient(): SupabaseClient {
  if (clientInstance) return clientInstance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'placeholder-anon-key';

  clientInstance = createBrowserClient(url, key);
  return clientInstance;
}
