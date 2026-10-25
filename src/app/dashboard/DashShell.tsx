import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import type { Viewer } from "@/lib/session";
import { DashNav } from "./DashNav";
import { SignOutButton } from "./SignOutButton";
import s from "./dashboard.module.css";

/** The signed-in frame shared by the real dashboard and the demo: sidebar, bottom bar, banners. */
export function DashShell({ viewer, base, banner, children, extra }: { viewer: Viewer; base: "/dashboard" | "/demo"; banner?: ReactNode; children: ReactNode; extra?: ReactNode }) {
  const initial = (viewer.name[0] || "G").toUpperCase();
  return (
    <div className={s.shell}>
      <div className={s.backdrop} aria-hidden="true" />
      <aside className={s.sidebar}>
        <Link href="/" className={s.brand} aria-label="Grayvalve home">
          <Logo size={19} />
        </Link>
        <nav aria-label="Dashboard">
          <DashNav variant="side" base={base} />
        </nav>
        <div className={s.sideFoot}>
          {base === "/demo" ? (
            <Link href="/dashboard" className={s.pairCard}>
              <strong>Pair your phone</strong>
              <span>Replace the demo with your own summaries.</span>
            </Link>
          ) : (
            <Link href="/demo" className={s.demoLink}>
              Open the demo
            </Link>
          )}
          <div className={s.me}>
            <span className={s.avatar}>{initial}</span>
            <span className={s.meText}>
              <strong>{viewer.name}</strong>
              <span>{viewer.email}</span>
            </span>
          </div>
          {!viewer.preview && <SignOutButton />}
        </div>
      </aside>

      <div className={s.main}>
        {viewer.preview && (
          <div className={s.previewBar} role="status">
            Preview mode: Supabase isn&apos;t configured, so you&apos;re signed in as a sample person. This only happens in local development.
          </div>
        )}
        {banner}
        <main id="main">{children}</main>
      </div>

      <nav className={s.bottomWrap} aria-label="Dashboard">
        <DashNav variant="bottom" base={base} />
      </nav>
      {extra}
    </div>
  );
}
