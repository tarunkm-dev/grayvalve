/** Only allow same-site relative redirects, so `?next=` can't send people to another origin. */
export function safeNext(next: unknown, fallback = "/dashboard") {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}

/** A light shape check before calling Supabase; Supabase does the real validation. */
export function isEmail(v: string) {
  return v.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export type FormState = { error?: string; message?: string };
