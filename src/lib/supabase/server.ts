import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createAdminClient } from './admin';

export async function createClient(): Promise<SupabaseClient> {
  if (typeof window !== 'undefined') {
    const { createClient: createBrowserClient } = await import('./client');
    return createBrowserClient();
  }

  // When server service role credentials are configured, use the admin client
  // so server-side operations bypass Row Level Security policies
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey && !serviceKey.includes('your-service-role-key') && !serviceKey.includes('placeholder')) {
    try {
      return createAdminClient();
    } catch {
      // Fallback to cookie client below
    }
  }

  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'placeholder-anon-key';

  return createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Can happen in Server Components where headers cannot be mutated
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options, maxAge: 0 });
        } catch {
          // Can happen in Server Components
        }
      },
    },
  });
}
