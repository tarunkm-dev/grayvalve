import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Viewer } from "@/lib/session";

export type Device = {
  id: string;
  name: string;
  kind: "phone" | "wearable" | "patch" | "bedside";
  platform: string | null;
  transport: "wifi" | "bluetooth";
  paired_at: string;
  last_seen_at: string | null;
  revoked_at: string | null;
};

/** Devices linked to the viewer's account (RLS limits rows to their own). */
export async function getDevices(viewer: Viewer): Promise<Device[]> {
  if (viewer.preview) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("devices")
    .select("id, name, kind, platform, transport, paired_at, last_seen_at, revoked_at")
    .order("paired_at", { ascending: false });
  return (data as Device[] | null) ?? [];
}
