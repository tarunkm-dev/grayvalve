import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "../forms";
import s from "../auth.module.css";

export const metadata: Metadata = { title: "Create an account" };

export default function SignupPage() {
  return (
    <>
      <span className="eyebrow">Create your account</span>
      <h1 className={s.title} style={{ marginTop: 16 }}>
        Join Grayvalve
      </h1>
      <p className={s.sub}>An account unlocks the web dashboard and, soon, device pairing. The app itself works without one.</p>
      <SignupForm />
      <p className={s.switch}>
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
    </>
  );
}
