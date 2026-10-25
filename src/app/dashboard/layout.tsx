import type { Metadata } from "next";
import { getDevices } from "@/lib/devices";
import { getViewer } from "@/lib/session";
import { DashShell } from "./DashShell";
import { PairFirst } from "./PairFirst";
import { LiveNano } from "./live/LiveNano";
import { LiveProvider } from "./live/LiveProvider";

// Every dashboard page is per-user: never prerender or cache it.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · Grayvalve" },
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();
  const devices = await getDevices(viewer);
  const paired = devices.some((d) => !d.revoked_at);

  // Pairing comes first: until a phone is linked, no other dashboard page opens.
  if (!paired) return <PairFirst viewer={viewer} />;

  return (
    <LiveProvider enabled={!viewer.preview}>
      <DashShell viewer={viewer} base="/dashboard" extra={<LiveNano />}>
        {children}
      </DashShell>
    </LiveProvider>
  );
}
