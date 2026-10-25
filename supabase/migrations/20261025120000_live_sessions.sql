-- Grayvalve web: live, end-to-end encrypted view of a paired phone's daily summaries.
--
-- No health data is stored in this database. A browser opens a live session and shows a QR code
-- holding its own ECDH P-256 public key. The person scans it with their phone and confirms; the
-- phone wraps a fresh per-session key to that browser and then sends encrypted updates about once
-- a minute through the sync-device Edge Function, which relays them over a private Realtime
-- Broadcast channel (REST broadcast, not written to realtime.messages). Only the browser holding
-- the session's private key can read them, and it keeps them in memory only.
--
-- What is stored is what authentication needs: the device row with its public key, pairing codes
-- (hashed, deleted once claimed), the live session rows below and short-lived request nonces.

-- ---------------------------------------------------------------------------
-- Live sessions: one per open dashboard tab that asked a phone to stream.
-- ---------------------------------------------------------------------------
create table public.live_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- Uncompressed P-256 point, 65 bytes as unpadded base64url.
  browser_public_key text not null check (char_length(browser_public_key) = 87),
  status text not null default 'pending' check (status in ('pending', 'live')),
  device_id uuid references public.devices (id) on delete cascade,
  -- Pending: time to scan the QR. Live: the session's hard end (set by the Edge Function).
  expires_at timestamptz not null default now() + interval '10 minutes',
  created_at timestamptz not null default now()
);

create index live_sessions_user_id_idx on public.live_sessions (user_id);
create index live_sessions_device_id_idx on public.live_sessions (device_id);

alter table public.live_sessions enable row level security;

create policy "Live sessions: owner can read"
  on public.live_sessions for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- A browser can only open a pending session for its own account, for at most 15 minutes.
create policy "Live sessions: owner can create pending sessions"
  on public.live_sessions for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and status = 'pending'
    and device_id is null
    and expires_at <= now() + interval '15 minutes'
  );

-- Closing the tab, signing out or pressing Stop deletes the row; the phone then stops sending.
create policy "Live sessions: owner can end"
  on public.live_sessions for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, delete on public.live_sessions to authenticated;

-- ---------------------------------------------------------------------------
-- Realtime: a browser may join only the private channel of its own live session
-- (topic "gv-live:<session id>"). Only the Edge Function (service role) broadcasts.
-- ---------------------------------------------------------------------------
create policy "Live sessions: owner can receive their channel"
  on realtime.messages for select
  to authenticated
  using (
    realtime.messages.extension = 'broadcast'
    and exists (
      select 1 from public.live_sessions s
      where s.user_id = (select auth.uid())
        and realtime.topic() = 'gv-live:' || s.id::text
    )
  );

-- ---------------------------------------------------------------------------
-- Replay protection: each signed phone request carries a random nonce, accepted once per device.
-- No policies: only the Edge Function (service role) reads or writes it. Rows older than 15
-- minutes are deleted by the function.
-- ---------------------------------------------------------------------------
create table public.sync_request_nonces (
  device_id uuid not null references public.devices (id) on delete cascade,
  nonce text not null check (char_length(nonce) = 22),
  created_at timestamptz not null default now(),
  primary key (device_id, nonce)
);

create index sync_request_nonces_created_idx on public.sync_request_nonces (created_at);

alter table public.sync_request_nonces enable row level security;
revoke all on public.sync_request_nonces from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Pairing codes are only needed until claimed: drop the ones already used.
-- ---------------------------------------------------------------------------
delete from public.device_pairings where status <> 'pending' or expires_at < now();
