"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, site } from "@/lib/site";
import { safeNext, type FormState } from "@/lib/auth";

const NOT_CONFIGURED: FormState = {
  error: "Sign-in isn't set up yet. Add the Supabase URL and publishable key to the environment (see README).",
};

async function origin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return process.env.NEXT_PUBLIC_SITE_URL || (host ? `${proto}://${host}` : site.url);
}

function field(form: FormData, name: string) {
  const v = form.get(name);
  return typeof v === "string" ? v.trim() : "";
}

export async function signIn(_prev: FormState, form: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  const email = field(form, "email");
  const password = form.get("password");
  if (!email || typeof password !== "string" || !password) return { error: "Enter your email and password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  // Keep the message generic so it doesn't reveal which emails have accounts.
  if (error) return { error: error.code === "email_not_confirmed" ? "Confirm your email first. We sent you a link." : "That email and password don't match." };

  redirect(safeNext(form.get("next")));
}

export async function sendMagicLink(_prev: FormState, form: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  const email = field(form, "email");
  if (!email) return { error: "Enter your email to get a sign-in link." };

  const supabase = await createClient();
  const next = safeNext(form.get("next"));
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false, emailRedirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error && error.status !== 422) return { error: "We couldn't send a link right now. Try again in a minute." };
  return { message: "If that email has an account, a sign-in link is on its way." };
}

export async function signUp(_prev: FormState, form: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  const email = field(form, "email");
  const password = form.get("password");
  const name = field(form, "name").slice(0, 80);
  if (!email || typeof password !== "string") return { error: "Enter your email and a password." };
  if (password.length < 10) return { error: "Use at least 10 characters for your password." };
  if (form.get("consent") !== "on") return { error: "Please confirm you understand Grayvalve isn't medical advice." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: name },
      emailRedirectTo: `${await origin()}/auth/callback?next=/dashboard`,
    },
  });
  if (error) {
    if (error.code === "weak_password") return { error: "That password is too easy to guess. Try a longer one." };
    return { error: "We couldn't create your account. Check the email and try again." };
  }
  // With email confirmation on (recommended), there's no session until the link is opened.
  if (data.session) redirect("/dashboard");
  return { message: "Check your inbox. Open the link we sent to confirm your email and finish signing up." };
}

export async function requestPasswordReset(_prev: FormState, form: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  const email = field(form, "email");
  if (!email) return { error: "Enter the email you signed up with." };
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await origin()}/auth/callback?next=/update-password`,
  });
  return { message: "If that email has an account, a reset link is on its way." };
}

export async function updatePassword(_prev: FormState, form: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  const password = form.get("password");
  if (typeof password !== "string" || password.length < 10) return { error: "Use at least 10 characters for your password." };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "Your reset link has expired. Request a new one." };
  redirect("/dashboard");
}
