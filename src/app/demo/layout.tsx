import type { Metadata } from "next";
import { getViewer } from "@/lib/session";
import { DashShell } from "../dashboard/DashShell";
import { DemoNano } from "./DemoViews";
import s from "../dashboard/dashboard.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Demo", template: "%s · Demo · Grayvalve" },
  robots: { index: false, follow: false },
};

/** The demo dashboard: signed in, with the person's name and illustrative data. Never real data. */
export default async function DemoLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer("/demo");
  return (
    <DashShell
      viewer={viewer}
      base="/demo"
      extra={<DemoNano />}
      banner={
        <div className={s.demoBanner} role="status">
          <span>You&apos;re viewing a demo with illustrative data. Your real dashboard opens once the production app is released and your phone is paired.</span>
        </div>
      }
    >
      {children}
    </DashShell>
  );
}
