import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isPreviewMode, isSupabaseConfigured } from "@/lib/site";

export type Viewer = {
  id: string;
  email: string;
  name: string;
  preview: boolean;
};

/**
 * The signed-in user for dashboard pages. Verifies the JWT with getClaims() (never getSession()
 * on the server). In local preview mode, returns a sample viewer. `next` is where sign-in returns to.
 */
export const getViewer = cache(async (next = "/dashboard"): Promise<Viewer> => {
  if (!isSupabaseConfigured()) {
    if (isPreviewMode()) return { id: "preview", email: "you@example.com", name: "Sam", preview: true };
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) redirect(`/login?next=${encodeURIComponent(next)}`);

  const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", claims.sub).maybeSingle();
  const email = typeof claims.email === "string" ? claims.email : "";
  const name = profile?.display_name || email.split("@")[0] || "there";
  return { id: claims.sub, email, name, preview: false };
});
