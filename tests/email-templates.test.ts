import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
// @ts-expect-error: plain ESM script without type declarations
import { render, renderReadme, templates } from "../scripts/email-templates.mjs";

type Template = { file: string; link?: string; code?: string };

// Each linked template must reach /auth/confirm with the OTP type that route verifies.
const expected: Record<string, { type: string; next: string }> = {
  "confirm-signup": { type: "email", next: "/dashboard" },
  invite: { type: "invite", next: "/update-password" },
  "magic-link": { type: "email", next: "/dashboard" },
  "change-email": { type: "email_change", next: "/dashboard/account" },
  "reset-password": { type: "recovery", next: "/update-password" },
};

describe("auth email templates", () => {
  it("cover all six Supabase auth emails", () => {
    expect((templates as Template[]).map((t) => t.file).sort()).toEqual(
      ["change-email", "confirm-signup", "invite", "magic-link", "reauthentication", "reset-password"].sort(),
    );
  });

  for (const [file, { type, next }] of Object.entries(expected)) {
    it(`${file} links to /auth/confirm with type=${type}`, () => {
      const html = readFileSync(`supabase/templates/${file}.html`, "utf8");
      expect(html).toContain("{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}");
      expect(html).toContain(`type=${type}`);
      expect(html).toContain(`next=${next}`);
      // ConfirmationURL would skip our confirm route; SVG is blocked by Gmail and Outlook.
      expect(html).not.toContain("ConfirmationURL");
      expect(html).not.toContain("<svg");
    });
  }

  it("reauthentication shows the one-time code instead of a link", () => {
    const html = readFileSync("supabase/templates/reauthentication.html", "utf8");
    expect(html).toContain("{{ .Token }}");
    expect(html).not.toContain("token_hash");
  });

  it("committed files match the generator (run `npm run emails` after editing it)", () => {
    // Git on Windows may check files out with CRLF; compare content, not line endings.
    const read = (f: string) => readFileSync(f, "utf8").split("\r\n").join("\n");
    for (const t of templates as Template[]) expect(read(`supabase/templates/${t.file}.html`)).toBe(render(t));
    expect(read("supabase/templates/README.md")).toBe(renderReadme());
  });
});
