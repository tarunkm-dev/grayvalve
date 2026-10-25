/*
 * Environment values are pasted by hand into Vercel, so stray whitespace, line breaks and trailing
 * slashes are common. Everything is normalised here once. NEXT_PUBLIC_ values must be referenced
 * literally so Next.js can inline them into the browser bundle.
 */

function clean(v: string | undefined) {
  return (v ?? "").trim();
}

/** Origin-style URL: trimmed, no trailing slash. */
export function cleanUrl(v: string | undefined) {
  return clean(v).replace(/\/+$/, "");
}

/** The Supabase project URL, tolerating a pasted REST endpoint such as `…/rest/v1/`. */
export function cleanSupabaseUrl(v: string | undefined) {
  return cleanUrl(v).replace(/\/(rest|auth)\/v1$/, "");
}

export const env = {
  supabaseUrl: cleanSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseKey: clean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
  siteUrl: cleanUrl(process.env.NEXT_PUBLIC_SITE_URL),
};

export const site = {
  name: "Grayvalve",
  tagline: "Your day, intelligently tuned.",
  description:
    "Grayvalve reads how you slept, asks how you're arriving, and builds a realistic day around your rhythm. Private, on-device intelligence for body and mind, and the foundation for Grayvalve's future health devices.",
  url: env.siteUrl || "http://localhost:3000",
  minAndroid: "Android 11 or newer",
};

export const navLinks = [
  { href: "/#story", label: "Story" },
  { href: "/#body", label: "Body & mind" },
  { href: "/#privacy", label: "Privacy" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/demo", label: "Demo" },
];

/** True when the Supabase project keys are present. */
export function isSupabaseConfigured() {
  return Boolean(env.supabaseUrl && env.supabaseKey);
}

/**
 * Without Supabase keys, local development can still open the dashboard with sample data so the
 * interface can be reviewed. Production never does this.
 */
export function isPreviewMode() {
  return !isSupabaseConfigured() && process.env.NODE_ENV !== "production";
}
