/*
 * Grayvalve auth emails, sent by Supabase through Brevo SMTP.
 *
 * One layout, one content table: run `npm run emails` to regenerate supabase/templates/*.html,
 * then paste each file into Supabase → Authentication → Emails → Templates (subjects in
 * supabase/templates/README.md). A test fails if the committed files drift from this source.
 *
 * Email clients are strict: table layout, inline styles, no SVG, no web fonts required, and a
 * plain-text link under every button. Colours match the site (Deep canvas, Signal lime).
 */

const C = {
  canvas: "#000000",
  card: "#111113",
  border: "#26262a",
  content: "#f3f1ec",
  muted: "#b4b4ba",
  faint: "#8e8e95",
  footer: "#6b6b72",
  signal: "#e2fc5b",
  onSignal: "#111111",
};

const FONT = "Poppins,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

/** Link to the site's token-hash confirm route; works on any device or browser. */
const confirmLink = (type, next) => `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&amp;type=${type}&amp;next=${next}`;

export const templates = [
  {
    file: "confirm-signup",
    supabase: "Confirm signup",
    subject: "Confirm your Grayvalve email",
    preheader: "One tap to finish creating your Grayvalve account.",
    eyebrow: "Welcome to Grayvalve",
    heading: "Confirm your email",
    body: "Tap the button below to confirm this address and finish creating your account. Your dashboard is ready when you are.",
    cta: "Confirm email",
    link: confirmLink("email", "/dashboard"),
    note: "This link works once and expires in 24 hours.",
  },
  {
    file: "invite",
    supabase: "Invite user",
    subject: "You're invited to Grayvalve",
    preheader: "Accept your invitation and choose a password.",
    eyebrow: "Invitation",
    heading: "You're invited to Grayvalve",
    body: "Someone on the Grayvalve team invited you to the web dashboard. Accept below, then choose a password for your account.",
    cta: "Accept invitation",
    link: confirmLink("invite", "/update-password"),
    note: "This invitation works once and expires in 24 hours.",
  },
  {
    file: "magic-link",
    supabase: "Magic link",
    subject: "Your Grayvalve sign-in link",
    preheader: "Sign in to Grayvalve with one tap.",
    eyebrow: "Sign in",
    heading: "Your sign-in link",
    body: "Tap the button below to sign in to Grayvalve. No password needed.",
    cta: "Sign in to Grayvalve",
    link: confirmLink("email", "/dashboard"),
    note: "This link works once and expires soon. If you didn't ask to sign in, you can ignore it.",
  },
  {
    file: "change-email",
    supabase: "Change email address",
    subject: "Confirm your new Grayvalve email",
    preheader: "Confirm the new email address for your Grayvalve account.",
    eyebrow: "Account",
    heading: "Confirm your new email",
    body: "Tap the button below to confirm {{ .NewEmail }} as the email for your Grayvalve account.",
    cta: "Confirm new email",
    link: confirmLink("email_change", "/dashboard/account"),
    note: "If you didn't ask for this change, ignore this email and your address stays the same.",
  },
  {
    file: "reset-password",
    supabase: "Reset password",
    subject: "Reset your Grayvalve password",
    preheader: "Choose a new password for Grayvalve.",
    eyebrow: "Password",
    heading: "Reset your password",
    body: "Tap the button below to choose a new password for your Grayvalve account.",
    cta: "Choose a new password",
    link: confirmLink("recovery", "/update-password"),
    note: "This link works once and expires soon. If you didn't ask for a reset, your password hasn't changed.",
  },
  {
    file: "reauthentication",
    supabase: "Reauthentication",
    subject: "Your Grayvalve security code",
    preheader: "Use this code to confirm it's you.",
    eyebrow: "Security check",
    heading: "Confirm it's you",
    body: "Enter this code in Grayvalve to continue. It confirms a sensitive change to your account.",
    code: "{{ .Token }}",
    note: "The code expires soon. If you didn't try to change anything, you can ignore this email.",
  },
];

function button(t) {
  return `
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td bgcolor="${C.signal}" style="border-radius:999px;background:${C.signal};">
                  <a href="${t.link}" target="_blank" style="display:inline-block;padding:15px 28px;font-family:${FONT};font-size:15px;font-weight:600;line-height:20px;color:${C.onSignal};text-decoration:none;border-radius:999px;">${t.cta}</a>
                </td>
              </tr>
            </table>`;
}

function codeBlock(t) {
  return `
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="border-radius:16px;background:#1a1a1d;border:1px solid ${C.border};padding:16px 24px;font-family:'SFMono-Regular',Consolas,Menlo,monospace;font-size:28px;letter-spacing:8px;font-weight:600;color:${C.signal};">${t.code}</td>
              </tr>
            </table>`;
}

function fallbackLink(t) {
  if (!t.link) return "";
  return `
            <p style="margin:16px 0 0;font-family:${FONT};font-size:12px;line-height:1.6;color:${C.faint};word-break:break-all;">If the button doesn't work, paste this link into your browser:<br><a href="${t.link}" target="_blank" style="color:${C.signal};text-decoration:underline;">${t.link}</a></p>`;
}

export function render(t) {
  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>${t.subject}</title>
</head>
<body style="margin:0;padding:0;background:${C.canvas};color:${C.content};-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${t.preheader}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.canvas}" style="background:${C.canvas};">
  <tr>
    <td align="center" style="padding:40px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">
        <tr>
          <td style="padding:0 8px 28px;font-family:${FONT};font-size:20px;font-weight:600;letter-spacing:-0.5px;color:${C.content};">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${C.signal};margin-right:8px;vertical-align:middle;"></span>grayvalve
          </td>
        </tr>
        <tr>
          <td bgcolor="${C.card}" style="background:${C.card};border:1px solid ${C.border};border-radius:24px;padding:36px 32px;">
            <p style="margin:0 0 10px;font-family:${FONT};font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${C.muted};">${t.eyebrow}</p>
            <h1 style="margin:0 0 14px;font-family:${FONT};font-size:28px;line-height:1.15;font-weight:500;letter-spacing:-0.6px;color:${C.content};">${t.heading}</h1>
            <p style="margin:0 0 28px;font-family:${FONT};font-size:15px;line-height:1.6;color:${C.muted};">${t.body}</p>${t.code ? codeBlock(t) : button(t)}
            <p style="margin:28px 0 0;font-family:${FONT};font-size:13px;line-height:1.6;color:${C.faint};">${t.note}</p>${fallbackLink(t)}
          </td>
        </tr>
        <tr>
          <td style="padding:24px 8px 0;font-family:${FONT};font-size:12px;line-height:1.6;color:${C.footer};">
            You're receiving this because this address was used on Grayvalve. If it wasn't you, you can ignore this email.<br>
            Grayvalve offers wellbeing guidance, not medical advice.
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>
`;
}

export function renderReadme() {
  const rows = templates.map((t) => `| ${t.supabase} | \`${t.file}.html\` | ${t.subject} |`).join("\n");
  return `# Auth email templates

Generated by \`scripts/email-templates.mjs\` (\`npm run emails\`). Don't edit these files by hand.

Paste each file into **Supabase → Authentication → Emails → Templates**, with the subject shown:

| Supabase template | File | Subject |
|---|---|---|
${rows}

Links use \`{{ .SiteURL }}\`, which comes from **Authentication → URL Configuration → Site URL**, so
that must be the live site (for now \`https://grayvalve.vercel.app\`).
`;
}

// `node scripts/email-templates.mjs` writes the files.
if (process.argv[1]?.endsWith("email-templates.mjs")) {
  const { writeFileSync, mkdirSync } = await import("node:fs");
  mkdirSync("supabase/templates", { recursive: true });
  for (const t of templates) writeFileSync(`supabase/templates/${t.file}.html`, render(t));
  writeFileSync("supabase/templates/README.md", renderReadme());
  console.log(`Wrote ${templates.length} templates to supabase/templates/`);
}
