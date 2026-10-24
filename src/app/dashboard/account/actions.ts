"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getViewer } from "@/lib/session";
import type { FormState } from "@/lib/auth";

export async function updateProfile(_prev: FormState, form: FormData): Promise<FormState> {
  const viewer = await getViewer();
  if (viewer.preview) return { error: "Preview mode can't save." };
  const raw = form.get("display_name");
  const display_name = typeof raw === "string" ? raw.trim().slice(0, 80) : "";

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ display_name }).eq("id", viewer.id);
  if (error) return { error: "We couldn't save that. Try again." };
  revalidatePath("/dashboard", "layout");
  return { message: "Saved." };
}
