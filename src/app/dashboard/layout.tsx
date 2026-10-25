import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { getViewer } from "@/lib/session";
import { DashNav } from "./DashNav";
import s from "./dashboard.module.css";
import { SignOutButton } from "./SignOutButton";
import { LiveProvider } from "./live/LiveProvider";

// Every dashboard page is per-user: never prerender or cache it.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · Grayvalve" },
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();
  const initial = (viewer.name[0] || "G").toUpperCase();

  return (
    <LiveProvider enabled={!viewer.preview}>
    <div className={s.shell}>
      <aside className={s.sidebar}>
        <Link href="/" className={s.brand} aria-label="Grayvalve home">
          <Logo size={19} />
        </Link>
        <nav aria-label="Dashboard">
          <DashNav variant="side" />
        </nav>
        <div className={s.sideFoot}>
          <Link href="/dashboard/devices" className={`aura aura-signal ${s.pairCard}`}>
            <strong>Pair your phone</strong>
            <span>Bring your Grayvalve data to the web.</span>
          </Link>
          <div className={s.me}>
            <span className={s.avatar}>{initial}</span>
            <span className={s.meText}>
              <strong>{viewer.name}</strong>
              <span>{viewer.email}</span>
            </span>
          </div>
          {!viewer.preview && (
            <SignOutButton />
          )}
        </div>
      </aside>

      <div className={s.main}>
        {viewer.preview && (
          <div className={s.previewBar} role="status">
            Preview mode: Supabase isn&apos;t configured, so you&apos;re seeing the dashboard without signing in. This only happens in local development.
          </div>
        )}
        <main id="main">{children}</main>
      </div>

      <nav className={s.bottomWrap} aria-label="Dashboard">
        <DashNav variant="bottom" />
      </nav>
    </div>
    </LiveProvider>
  );
}
