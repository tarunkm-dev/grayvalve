import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "../forms";
import { safeNext } from "@/lib/auth";
import { isPreviewMode, isSupabaseConfigured } from "@/lib/site";
import s from "../auth.module.css";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  return (
    <>
      <span className="eyebrow">Welcome back</span>
      <h1 className={s.title} style={{ marginTop: 16 }}>
        Sign in to Grayvalve
      </h1>
      <p className={s.sub}>See your readiness, sleep and mind minutes on the big screen.</p>

      {error && (
        <p className="notice error" role="alert" style={{ marginTop: 24 }}>
          That link has expired or was already used. Sign in again or request a new link.
        </p>
      )}
      {!isSupabaseConfigured() && (
        <div className="notice" style={{ marginTop: 24 }}>
          Sign-in isn&apos;t connected yet: add the Supabase keys to <code>.env.local</code>.
          {isPreviewMode() && (
            <>
              {" "}
              Meanwhile you can{" "}
              <Link href="/dashboard" style={{ color: "var(--signal)" }}>
                open the dashboard preview
              </Link>
              .
            </>
          )}
        </div>
      )}

      <LoginForm next={safeNext(next)} />

      <p className={s.switch}>
        New to Grayvalve? <Link href="/signup">Create an account</Link>
      </p>
    </>
  );
}
