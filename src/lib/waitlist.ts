import { isEmail } from "@/lib/auth";

/*
 * Waitlist input checks, shared by the server action and the tests. The database function checks
 * again; this only gives a friendly message first.
 */

export type WaitlistInput = { name: string; email: string; platform: "android" | "ios" };

export type WaitlistState = { ok?: boolean; error?: string };

export function parseWaitlist(form: FormData): WaitlistInput | { error: string } {
  const str = (k: string) => {
    const v = form.get(k);
    return typeof v === "string" ? v.trim() : "";
  };
  // A field people can't see: bots fill it in, people don't.
  if (str("company")) return { error: "Something went wrong. Try again." };
  const email = str("email").toLowerCase();
  const name = str("name").slice(0, 80);
  if (!isEmail(email)) return { error: "Enter a valid email so we can tell you when it's ready." };
  return { name, email, platform: str("platform") === "ios" ? "ios" : "android" };
}
