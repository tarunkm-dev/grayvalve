"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { requestPasswordReset, sendMagicLink, signIn, signUp, updatePassword } from "./actions";
import type { FormState } from "@/lib/auth";
import s from "./auth.module.css";

function Status({ state }: { state: FormState }) {
  if (state.error)
    return (
      <p className="notice error" role="alert">
        {state.error}
      </p>
    );
  if (state.message)
    return (
      <p className="notice ok" role="status">
        {state.message}
      </p>
    );
  return null;
}

function Submit({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button type="submit" className="btn btn-primary" disabled={pending} style={{ width: "100%" }}>
      {pending ? "One moment…" : children}
    </button>
  );
}

export function LoginForm({ next }: { next: string }) {
  const [mode, setMode] = useState<"password" | "link">("password");
  const [pwState, pwAction, pwPending] = useActionState(signIn, {});
  const [linkState, linkAction, linkPending] = useActionState(sendMagicLink, {});

  return (
    <>
      {mode === "password" ? (
        <form action={pwAction} className={s.form}>
          <input type="hidden" name="next" value={next} />
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required className="input" placeholder="you@example.com" />
          </div>
          <div className="field">
            <div className={s.row}>
              <label htmlFor="password">Password</label>
              <Link href="/forgot-password">Forgot password?</Link>
            </div>
            <input id="password" name="password" type="password" autoComplete="current-password" required className="input" />
          </div>
          <Status state={pwState} />
          <Submit pending={pwPending}>Sign in</Submit>
        </form>
      ) : (
        <form action={linkAction} className={s.form}>
          <input type="hidden" name="next" value={next} />
          <div className="field">
            <label htmlFor="email-link">Email</label>
            <input id="email-link" name="email" type="email" autoComplete="email" required className="input" placeholder="you@example.com" />
          </div>
          <Status state={linkState} />
          <Submit pending={linkPending}>Email me a sign-in link</Submit>
        </form>
      )}
      <div className={s.divider}>or</div>
      <button type="button" className="btn btn-glass" style={{ width: "100%" }} onClick={() => setMode(mode === "password" ? "link" : "password")}>
        {mode === "password" ? "Sign in with an email link" : "Sign in with a password"}
      </button>
    </>
  );
}

export function SignupForm() {
  const [state, action, pending] = useActionState(signUp, {});
  return (
    <form action={action} className={s.form}>
      <div className="field">
        <label htmlFor="name">What should Gray call you?</label>
        <input id="name" name="name" type="text" autoComplete="given-name" maxLength={80} className="input" placeholder="Your first name" />
      </div>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" placeholder="you@example.com" />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={10} required className="input" placeholder="At least 10 characters" />
      </div>
      <label className={s.check}>
        <input type="checkbox" name="consent" required />
        <span>I understand Grayvalve offers wellbeing guidance, not medical advice, and that nothing syncs until I pair a device.</span>
      </label>
      <Status state={state} />
      <Submit pending={pending}>Create account</Submit>
    </form>
  );
}

export function ResetForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, {});
  return (
    <form action={action} className={s.form}>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" placeholder="you@example.com" />
      </div>
      <Status state={state} />
      <Submit pending={pending}>Send reset link</Submit>
    </form>
  );
}

export function UpdatePasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, {});
  return (
    <form action={action} className={s.form}>
      <div className="field">
        <label htmlFor="password">New password</label>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={10} required className="input" placeholder="At least 10 characters" />
      </div>
      <Status state={state} />
      <Submit pending={pending}>Save password</Submit>
    </form>
  );
}
