import type { Metadata } from "next";
import Link from "next/link";
import { ResetForm } from "../forms";
import s from "../auth.module.css";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <>
      <span className="eyebrow">Password</span>
      <h1 className={s.title} style={{ marginTop: 16 }}>
        Reset your password
      </h1>
      <p className={s.sub}>We&apos;ll email you a link to choose a new one.</p>
      <ResetForm />
      <p className={s.switch}>
        Remembered it? <Link href="/login">Back to sign in</Link>
      </p>
    </>
  );
}
