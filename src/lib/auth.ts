/** Only allow same-site relative redirects, so `?next=` can't send people to another origin. */
export function safeNext(next: unknown, fallback = "/dashboard") {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}

export type FormState = { error?: string; message?: string };
