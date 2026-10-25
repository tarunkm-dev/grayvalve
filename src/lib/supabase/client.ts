import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/site";

/** Supabase client for Client Components. Uses the publishable key only. */
export function createClient() {
  return createBrowserClient(env.supabaseUrl, env.supabaseKey);
}
