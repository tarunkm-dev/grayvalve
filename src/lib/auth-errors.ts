/*
 * Maps Supabase Auth error codes to messages people can act on. Codes are from
 * https://supabase.com/docs/guides/auth/debugging/error-codes. Anything unknown falls back to the
 * caller's generic message. Messages never reveal whether an email already has an account.
 */

export type AuthFlow = "signin" | "signup" | "link" | "reset" | "update";

type ErrorLike = { code?: string | null; status?: number | null; message?: string | null } | null | undefined;

const RATE_LIMITED = "Too many attempts. Please wait a few minutes and try again.";
const EMAIL_LIMIT = "We've sent too many emails in the last hour. Please try again a little later.";
const EMAIL_SEND_FAILED = "We couldn't send the email right now. Please try again in a few minutes.";

const BY_CODE: Record<string, string> = {
  over_email_send_rate_limit: EMAIL_LIMIT,
  over_request_rate_limit: RATE_LIMITED,
  over_sms_send_rate_limit: RATE_LIMITED,
  email_address_invalid: "That email address isn't accepted. Please use a different one.",
  email_address_not_authorized: "We can't send email to that address yet. Please use a different one.",
  email_provider_disabled: "Email sign-in is turned off right now.",
  signup_disabled: "New sign-ups are paused right now.",
  weak_password: "That password is too easy to guess. Try a longer one, or a short phrase.",
  same_password: "Choose a password you haven't used here before.",
  email_not_confirmed: "Confirm your email first. Open the link we sent you, or sign up again to get a new one.",
  invalid_credentials: "That email and password don't match.",
  user_banned: "This account can't sign in right now.",
  otp_expired: "That link has expired. Request a new one.",
  flow_state_expired: "That link has expired. Request a new one.",
  session_not_found: "Your session has expired. Request a new reset link.",
  reauthentication_needed: "For security, request a new reset link and try again.",
  unexpected_failure: EMAIL_SEND_FAILED,
};

export function authErrorMessage(error: ErrorLike, fallback: string): string {
  if (!error) return fallback;
  if (error.code && BY_CODE[error.code]) return BY_CODE[error.code];
  if (error.status === 429) return RATE_LIMITED;
  // Supabase returns this text (no code) when the SMTP provider rejects or fails a send.
  if (error.message && /error sending .*email/i.test(error.message)) return EMAIL_SEND_FAILED;
  return fallback;
}

/** Server log line for an auth failure: code and status only, never the email or password. */
export function logAuthError(flow: AuthFlow, error: ErrorLike) {
  if (!error) return;
  console.error(`[auth:${flow}] code=${error.code ?? "none"} status=${error.status ?? "none"} message=${error.message ?? ""}`);
}
