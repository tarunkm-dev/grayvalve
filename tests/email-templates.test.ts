import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Each Supabase template must link to /auth/confirm with the OTP type that route verifies.
const templates = [
  { file: "confirm-signup", type: "email", next: "/dashboard" },
  { file: "magic-link", type: "email", next: "/dashboard" },
  { file: "reset-password", type: "recovery", next: "/update-password" },
  { file: "change-email", type: "email_change", next: "/dashboard/account" },
];

describe("auth email templates", () => {
  for (const t of templates) {
    it(`${t.file} links to /auth/confirm with type=${t.type}`, () => {
      const html = readFileSync(`supabase/templates/${t.file}.html`, "utf8");
      expect(html).toContain("{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}");
      expect(html).toContain(`type=${t.type}`);
      expect(html).toContain(`next=${t.next}`);
      // No raw ConfirmationURL: that link skips our confirm route.
      expect(html).not.toContain("ConfirmationURL");
    });
  }
});
