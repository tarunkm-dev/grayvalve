import type { Metadata } from "next";
import { UpdatePasswordForm } from "../forms";
import s from "../auth.module.css";

export const metadata: Metadata = { title: "Choose a new password" };

export default function UpdatePasswordPage() {
  return (
    <>
      <span className="eyebrow">Password</span>
      <h1 className={s.title} style={{ marginTop: 16 }}>
        Choose a new password
      </h1>
      <p className={s.sub}>Use at least 10 characters. A short phrase works well.</p>
      <UpdatePasswordForm />
    </>
  );
}
