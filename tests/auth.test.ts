import { describe, expect, it, vi } from "vitest";
import { isEmail, safeNext } from "@/lib/auth";
import { authErrorMessage, logAuthError } from "@/lib/auth-errors";

describe("safeNext", () => {
  it("keeps same-site paths", () => {
    expect(safeNext("/dashboard/devices")).toBe("/dashboard/devices");
    expect(safeNext("/update-password")).toBe("/update-password");
  });

  it("rejects anything that could leave the site", () => {
    for (const bad of ["https://evil.com", "//evil.com", "/\\evil.com", "javascript:alert(1)", "dashboard", ""]) {
      expect(safeNext(bad)).toBe("/dashboard");
    }
    expect(safeNext(null)).toBe("/dashboard");
    expect(safeNext(undefined, "/")).toBe("/");
  });
});

describe("isEmail", () => {
  it("accepts ordinary addresses", () => {
    expect(isEmail("sam@grayvalve.com")).toBe(true);
    expect(isEmail("first.last+tag@mail.co.in")).toBe(true);
  });

  it("rejects malformed input", () => {
    for (const bad of ["", "sam", "sam@", "@grayvalve.com", "sam@grayvalve", "sam @grayvalve.com", `${"a".repeat(250)}@x.co`]) {
      expect(isEmail(bad)).toBe(false);
    }
  });
});

describe("authErrorMessage", () => {
  const fallback = "Generic";

  it("explains email and request rate limits", () => {
    expect(authErrorMessage({ code: "over_email_send_rate_limit", status: 429 }, fallback)).toMatch(/too many emails/i);
    expect(authErrorMessage({ code: "over_request_rate_limit", status: 429 }, fallback)).toMatch(/too many attempts/i);
    expect(authErrorMessage({ status: 429 }, fallback)).toMatch(/too many attempts/i);
  });

  it("explains rejected addresses and weak passwords", () => {
    expect(authErrorMessage({ code: "email_address_invalid" }, fallback)).toMatch(/isn't accepted/);
    expect(authErrorMessage({ code: "weak_password" }, fallback)).toMatch(/too easy to guess/);
  });

  it("recognises SMTP send failures from Resend or any provider", () => {
    expect(authErrorMessage({ status: 500, message: "Error sending confirmation email" }, fallback)).toMatch(/couldn't send the email/);
    expect(authErrorMessage({ status: 500, message: "Error sending recovery email" }, fallback)).toMatch(/couldn't send the email/);
  });

  it("keeps invalid credentials generic and falls back for unknown errors", () => {
    expect(authErrorMessage({ code: "invalid_credentials" }, fallback)).toBe("That email and password don't match.");
    expect(authErrorMessage({ code: "something_new" }, fallback)).toBe(fallback);
    expect(authErrorMessage(null, fallback)).toBe(fallback);
  });

  it("logs codes without personal data", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logAuthError("signup", { code: "over_email_send_rate_limit", status: 429, message: "email rate limit exceeded" });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("[auth:signup] code=over_email_send_rate_limit status=429"));
    spy.mockRestore();
  });
});
