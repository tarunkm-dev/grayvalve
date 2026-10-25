# Grayvalve website

The Grayvalve marketing site, account login and web dashboard.
Next.js 16 (App Router) · Supabase Auth · deployed on Vercel.

## What's here

| Route | What it is |
|---|---|
| `/` | Home: hero, the three app roots with annotated real screenshots, feature explorer, screen gallery, Aura Glass design system and palette, organ guides, privacy, web dashboard and pairing, roadmap preview, download |
| `/features` | Every feature, grouped, each with a real app capture |
| `/roadmap` | Horizons from today's app to future medical-grade devices (all clearly labelled as concepts) |
| `/download` | Download / beta, requirements and FAQ |
| `/login`, `/signup`, `/forgot-password`, `/update-password` | Supabase email + password and email-link sign-in |
| `/dashboard` | Overview (next move, readiness, sleep, recovery, steps, focus, mood, check-ins) |
| `/dashboard/body`, `/dashboard/mind` | Body signals, vitals, organs; mind practice, mood, energy, stress |
| `/dashboard/devices` | Pair a phone or wearable with a single-use QR code; revoke or remove devices |
| `/dashboard/account` | Profile and data summary |

The dashboard shows **sample data** (labelled as such) until health data sync is built; that is the
planned last step. Pairing creates real device records today.

## Design

Tokens come straight from the Android app (`ui/theme/Tokens.kt`): Deep Mode black canvas, the aura
palette (jade, dusk, ocean, ember, amber, violet), one Signal lime (`#E2FC5B`) for whatever is live,
and the brand anchors (oxblood, nocturne, alloy sage, porcelain). Poppins carries all type, as in
the app. Dot-matrix numerals, aura cards with a dotted inner frame, range bands and tick meters are
ported from the app's visualisation library (`src/components/charts.tsx`, `DotMatrix.tsx`).

Reference ideology from the RON Design Lab cases: Veri's "interface as a decision surface" (the
next move comes first, every card answers one question fast, data never competes with branding)
and FitSync's "neutral for context, accent for signal" modular widget dashboard.

Screens in `public/screens` are real captures from the Android app (`tmp/capture`). Organ art,
DeepMind imagery (Pexels licence) and component renders come from `Application/0. assets` and the
app's screenshot tests.

## Run locally

Requires Node 22 or newer (the Supabase client needs it).

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

Without Supabase keys, `npm run dev` still works: sign-in shows a notice and `/dashboard` opens in
**preview mode** with sample data. Preview mode never runs in production builds; there the
dashboard always requires sign-in.

## Set up Supabase

1. Create a project at supabase.com.
2. **Project Settings → API**: copy the Project URL and the **publishable** key into
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Never put the secret /
   service-role key in this app.
3. **SQL**: run `supabase/migrations/20261024120000_accounts_and_pairing.sql` (SQL editor, or
   `supabase db push` with the CLI). It creates `profiles`, `device_pairings` and `devices`, all
   with row-level security so people only ever see their own rows.
4. **Authentication → URL configuration**: set Site URL to your domain and add
   `https://<your-domain>/auth/callback` (and `http://localhost:3000/auth/callback`) to the
   redirect allow-list.
5. Keep **Confirm email** on (Authentication → Providers → Email).
6. Set up email through Brevo (see below) and paste the branded templates.
7. Deploy the pairing function used by the app:
   `supabase functions deploy pair-device --no-verify-jwt`.

## Email with Brevo

Supabase sends every auth email (confirm sign-up, invite, sign-in link, email change, password
reset, security code). Its built-in sender only allows a few emails an hour, so the site uses
**Brevo over SMTP**. Brevo can send from a single verified address, so no custom domain is needed
while the site lives on `grayvalve.vercel.app`. No email code or key lives in this repo; the SMTP
key goes into Supabase only.

1. **Brevo → Senders:** profile menu → *Senders, Domains & Dedicated IPs* → *Senders* →
   *Add a sender* (name `Grayvalve`, the address mail should come from). Click the link Brevo
   emails you so the sender shows *Verified*.
2. **Brevo → SMTP & API → SMTP:** note the server, port and **Login** (`…@smtp-brevo.com`), then
   *Generate a new SMTP key*. Use the SMTP key, not an API key.
3. **Supabase → Authentication → Emails → SMTP Settings → Enable Custom SMTP:**

   | Field | Value |
   |---|---|
   | Host | `smtp-relay.brevo.com` |
   | Port | `587` |
   | Username | the Brevo SMTP **Login** (`…@smtp-brevo.com`) |
   | Password | the Brevo **SMTP key** |
   | Sender email | the verified sender from step 1 |
   | Sender name | `Grayvalve` |

4. **Supabase → Authentication → Rate Limits:** raise *emails per hour* (e.g. 30).
5. **Supabase → Authentication → Emails → Templates:** paste each file from
   `supabase/templates/` with the subject listed in
   [`supabase/templates/README.md`](supabase/templates/README.md).
6. **Check delivery** in Brevo → *Transactional → Email → Logs*: every send shows as delivered,
   deferred, bounced or blocked, with the reason.

The templates link to `/auth/confirm` with a token hash, so links work even when opened on another
device or browser. `{{ .SiteURL }}` comes from **Authentication → URL Configuration → Site URL**,
so that must be the live site. Edit the emails in `scripts/email-templates.mjs`, then run
`npm run emails` to regenerate the files.

When you own a domain, verify it in Brevo (*Senders, Domains & Dedicated IPs → Domains*, add the
DKIM/DMARC records it shows) and switch the sender to `noreply@<your-domain>` for better inbox
placement.

If sign-up fails, the form says why (email limit, address rejected, provider failed), and the
Vercel function logs carry a line like `[auth:signup] code=… status=…` with no personal data.

## Tests

```bash
npm test
```

Unit tests (Vitest) cover redirect safety, email validation, auth error messages, environment
clean-up, pairing codes against the Edge Function's format, and the email templates (links, and
that the committed HTML matches the generator).

## Deploy on Vercel

1. Import the GitHub repository in Vercel (framework: Next.js, root directory: repository root).
2. Add the environment variables from `.env.example` for Production and Preview.
3. Deploy. Set `NEXT_PUBLIC_SITE_URL` to the production domain so auth emails link back correctly.
4. When the Play Store listing (or a signed APK) exists, set `NEXT_PUBLIC_ANDROID_DOWNLOAD_URL`;
   every download button switches from the beta sign-up to that link.

## How pairing works

1. A signed-in user opens **Devices** and chooses the connection: Wi-Fi/internet (phone → dashboard)
   or Bluetooth LE (Grayvalve wearable → phone → dashboard).
2. The server makes an 8-character single-use code (no 0/O/1/I), stores only its SHA-256, and shows
   it with a QR code (`grayvalve://pair?code=…&via=…&host=…`). It expires after 10 minutes; opening a
   new one cancels the old one.
3. The app scans the code and calls the `pair-device` Edge Function with the code, a device name
   and its public key. The function checks the code is pending and unexpired, claims it atomically,
   and inserts the device. The phone never receives the user's session or password.
4. The dashboard notices the claim and shows the device, which can be revoked or removed at any time.

**Still to build:** the app side (a *Pair with web* button in Systems, plus the network permission
with certificate pinning that the app's SECURITY.md requires), then health data sync into new
tables, which replaces the sample data.

## Project layout

```
src/
  app/
    (site)/        marketing pages: home, features, roadmap, download
    (auth)/        login, signup, password reset + server actions
    auth/          callback, confirm and sign-out route handlers
    dashboard/     protected dashboard pages and pairing actions
  components/      Logo, DotMatrix, Phone, charts, nav, footer, home showcases
  lib/             site config, product content, Supabase clients, session, sample data
  proxy.ts         Next.js 16 proxy: refreshes the Supabase session, guards /dashboard
supabase/
  migrations/      schema and RLS
  functions/       pair-device Edge Function (Deno)
```
