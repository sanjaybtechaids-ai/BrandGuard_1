import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';

let adminClientInstance: SupabaseClient | null = null;

export function createAdminClient(): SupabaseClient {
  if (typeof window !== 'undefined') {
    throw new Error('FATAL SECURITY ERROR: SUPABASE_SERVICE_ROLE_KEY cannot be accessed from client-side code.');
  }

  if (adminClientInstance) return adminClientInstance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Supabase admin client is unavailable because server credentials are not configured.');
  }

  adminClientInstance = createSupabaseClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return adminClientInstance;
}
