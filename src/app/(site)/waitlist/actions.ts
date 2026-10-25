"use server";

import { createClient } from "@/lib/supabase/server";
import { isPreviewMode, isSupabaseConfigured } from "@/lib/site";
import { parseWaitlist, type WaitlistState } from "@/lib/waitlist";

export async function joinWaitlist(_prev: WaitlistState, form: FormData): Promise<WaitlistState> {
  const input = parseWaitlist(form);
  if ("error" in input) return { error: input.error };
  if (!isSupabaseConfigured()) {
    // Local preview without keys: show the success state so the page can be reviewed.
    return isPreviewMode() ? { ok: true } : { error: "The waitlist isn't open yet. Try again soon." };
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc("join_waitlist", { p_email: input.email, p_name: input.name, p_platform: input.platform });
  if (error) {
    console.error("waitlist", error.code);
    return { error: "We couldn't add you right now. Try again in a minute." };
  }
  // Same answer whether the email was new or already on the list.
  return { ok: true };
}
