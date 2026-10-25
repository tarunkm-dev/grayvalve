"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { env, isSupabaseConfigured } from "@/lib/site";
import { isEmail, safeNext, type FormState } from "@/lib/auth";
import { authErrorMessage, logAuthError } from "@/lib/auth-errors";

const NOT_CONFIGURED: FormState = {
  error: "Sign-in isn't set up yet. Add the Supabase URL and publishable key to the environment (see README).",
};

/** Base URL for links in auth emails: the configured site URL, else the request's own origin. */
async function origin() {
  if (env.siteUrl) return env.siteUrl;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : "http://localhost:3000";
}

function field(form: FormData, name: string) {
  const v = form.get(name);
  return typeof v === "string" ? v.trim() : "";
}

// Errors that would reveal whether an email has an account; these get the neutral reply instead.
const HIDDEN_FOR_PRIVACY = new Set(["otp_disabled", "signup_disabled", "user_not_found", "email_not_confirmed"]);

export async function signIn(_prev: FormState, form: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  const email = field(form, "email");
  const password = form.get("password");
  if (!isEmail(email) || typeof password !== "string" || !password) return { error: "Enter your email and password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    logAuthError("signin", error);
    return { error: authErrorMessage(error, "That email and password don't match.") };
  }
  redirect(safeNext(form.get("next")));
}

export async function sendMagicLink(_prev: FormState, form: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  const email = field(form, "email");
  if (!isEmail(email)) return { error: "Enter a valid email to get a sign-in link." };

  const supabase = await createClient();
  const next = safeNext(form.get("next"));
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false, emailRedirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error && !HIDDEN_FOR_PRIVACY.has(error.code ?? "")) {
    logAuthError("link", error);
    return { error: authErrorMessage(error, "We couldn't send a link right now. Try again in a minute.") };
  }
  return { message: "If that email has an account, a sign-in link is on its way." };
}

export async function signUp(_prev: FormState, form: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  const email = field(form, "email");
  const password = form.get("password");
  const name = field(form, "name").slice(0, 80);
  if (!isEmail(email)) return { error: "Enter a valid email address." };
  if (typeof password !== "string" || password.length < 10) return { error: "Use at least 10 characters for your password." };
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
    logAuthError("signup", error);
    return { error: authErrorMessage(error, "We couldn't create your account. Please try again in a moment.") };
  }
  // With email confirmation on (recommended), there's no session until the link is opened.
  if (data.session) redirect("/dashboard");
  return { message: "Check your inbox. Open the link we sent to confirm your email and finish signing up." };
}

export async function requestPasswordReset(_prev: FormState, form: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  const email = field(form, "email");
  if (!isEmail(email)) return { error: "Enter the email you signed up with." };
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await origin()}/auth/callback?next=/update-password`,
  });
  if (error && !HIDDEN_FOR_PRIVACY.has(error.code ?? "")) {
    logAuthError("reset", error);
    return { error: authErrorMessage(error, "We couldn't send a reset link right now. Try again in a minute.") };
  }
  return { message: "If that email has an account, a reset link is on its way." };
}

export async function updatePassword(_prev: FormState, form: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  const password = form.get("password");
  if (typeof password !== "string" || password.length < 10) return { error: "Use at least 10 characters for your password." };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    logAuthError("update", error);
    return { error: authErrorMessage(error, "Your reset link has expired. Request a new one.") };
  }
  redirect("/dashboard");
}
