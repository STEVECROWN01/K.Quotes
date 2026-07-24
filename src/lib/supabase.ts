// Supabase client (server-side).
// Reads URL + service-role key from env. The service-role key is used server-side
// so the API routes can perform CRUD without RLS restrictions.
// For browser-side usage (if ever needed), use the anon key + RLS policies.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (supabaseInstance) return supabaseInstance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Prefer service-role key on the server (bypasses RLS).
  // Falls back to anon key if only that is configured (browser context).
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "SUPABASE_SERVICE_ROLE_KEY (server) or NEXT_PUBLIC_SUPABASE_ANON_KEY (browser) " +
        "in .env.local. See README.md for setup instructions."
    );
  }

  supabaseInstance = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
  return supabaseInstance;
}

export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}
