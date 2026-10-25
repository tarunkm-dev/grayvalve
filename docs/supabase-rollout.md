# Rolling out the redesign: Supabase and verification checklist

For project `zggtrihndlfxbaioozmr`. Only step 1 changes the database. Nothing here stores health
data. The pairing (`pair-device`) and live view (`sync-device`, Realtime) functions don't change.

## 1. Add the waitlist (SQL editor)

1. Supabase dashboard → your project → **SQL Editor** → **New query**.
2. Paste all of `supabase/migrations/20261026120000_waitlist.sql` and press **Run**.
   (With the CLI instead: `supabase link --project-ref zggtrihndlfxbaioozmr`, then `supabase db push`.)
3. Check it. Run these one at a time:

   ```sql
   -- No policies: the list can't be read through the API.
   select * from pg_policies where tablename = 'waitlist';          -- expect 0 rows

   -- The sign-up function works, and a repeat is ignored.
   select public.join_waitlist('test@example.com', 'Test', 'android');
   select public.join_waitlist('TEST@example.com', 'Again', 'ios');
   select email, name, platform from public.waitlist;               -- expect 1 row

   -- Clean up the test row.
   delete from public.waitlist where email = 'test@example.com';
   ```

To read the list later, use **Table Editor → waitlist** (dashboard only).

## 2. Let the Vercel preview sign people in

Do this to test on the preview before merging.

1. **Authentication → URL Configuration → Redirect URLs** → add
   `https://grayvalve-git-*-tarun-kms-projects-01cf6a9c.vercel.app/**`
2. Leave **Site URL** as `https://grayvalve.vercel.app`. Email links (sign-in link, password reset)
   always open the live site; on the preview, sign in with your **password**.
3. **Vercel → Project → Settings → Environment Variables**: make sure
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are ticked for
   **Preview** as well as Production. If you add them now, redeploy the preview (Deployments → ⋯ → Redeploy).

## 3. Verify with an existing account

Use the preview URL from the PR, or the live site after merging.

1. **Sign in** with your existing email and password. Accounts, profiles and devices are unchanged.
2. **Already paired?** If your account has a device that isn't revoked (Table Editor → `devices`,
   `revoked_at` empty), you go straight to the dashboard. If not, you see **Connect your phone first**.
3. **Pair:** choose *Show pairing code*. On the phone: Grayvalve → Spaces → Systems → **Pair with web**
   → scan → approve. Within a few seconds the page opens the dashboard by itself. A new row
   appears in `devices`.
4. **Live view:** Overview → **Start live view** → scan the QR with the phone → check the website name
   → *Start*. The cards fill in. While it's live, `live_sessions` has one row; it disappears when you
   press Stop or leave.
5. **Analytics:** open *Analytics* in the menu. Recovery index, sleep debt, autonomic balance,
   cognitive load, links between signals, weekly rhythm and unusual days, all from the 30 days
   the phone sends. *Print or save as PDF* gives you a copy to keep or share.
6. **Nano:** *Ask Nano*, bottom right. In Chrome with Gemini Nano it runs on your computer;
   elsewhere it answers with built-in guidance and says so.
7. **Waitlist:** on the home page, join with a test email, then check Table Editor → `waitlist`.

## If something's off

| What you see | Likely cause | Fix |
|---|---|---|
| "Sign-in isn't set up yet" on the preview | Supabase env vars not set for Preview | Step 2.3, then redeploy |
| Sign-in link email opens the live site | Site URL points at production (expected) | Use password sign-in on the preview |
| Still on the pairing screen after approving on the phone | The page polls every 4 s | Wait or refresh; check `devices` has the row |
| "We couldn't add you right now" on the waitlist | Migration not applied | Step 1 |
| "Couldn't open the live channel" | Network, or Realtime settings changed since the live-view release | Check Realtime → Settings: private channels still authorised by RLS |
