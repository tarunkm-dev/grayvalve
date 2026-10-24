-- Grayvalve web: accounts and device pairing.
-- Health data sync is a later migration; nothing here stores health records.

create schema if not exists private;

-- ---------------------------------------------------------------------------
-- Profiles: one row per auth user.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles: owner can read"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Profiles: owner can update"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Create the profile when a user signs up. Lives in the unexposed `private` schema so it
-- can't be called through the Data API.
create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'display_name', ''), 80));
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- ---------------------------------------------------------------------------
-- Pairing codes: short-lived, single-use. Only the SHA-256 of the code is stored.
-- ---------------------------------------------------------------------------
create table public.device_pairings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  code_hash text not null unique check (char_length(code_hash) = 64),
  transport text not null check (transport in ('wifi', 'bluetooth')),
  status text not null default 'pending' check (status in ('pending', 'claimed', 'cancelled')),
  expires_at timestamptz not null default now() + interval '10 minutes',
  claimed_device_id uuid,
  created_at timestamptz not null default now()
);

create index device_pairings_user_id_idx on public.device_pairings (user_id);

alter table public.device_pairings enable row level security;

create policy "Pairings: owner can read"
  on public.device_pairings for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- A user can only open a pending code for themselves, valid for at most 15 minutes.
create policy "Pairings: owner can create pending codes"
  on public.device_pairings for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and status = 'pending'
    and claimed_device_id is null
    and expires_at <= now() + interval '15 minutes'
  );

create policy "Pairings: owner can delete"
  on public.device_pairings for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Devices: phones and future Grayvalve hardware linked to an account.
-- Rows are inserted only by the pair-device Edge Function (service role); users can
-- read, rename, revoke and remove their own devices.
-- ---------------------------------------------------------------------------
create table public.devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  kind text not null default 'phone' check (kind in ('phone', 'wearable', 'patch', 'bedside')),
  platform text check (char_length(platform) <= 40),
  transport text not null check (transport in ('wifi', 'bluetooth')),
  public_key text check (char_length(public_key) <= 2048),
  paired_at timestamptz not null default now(),
  last_seen_at timestamptz,
  revoked_at timestamptz
);

create index devices_user_id_idx on public.devices (user_id);

alter table public.devices enable row level security;

create policy "Devices: owner can read"
  on public.devices for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Devices: owner can rename or revoke"
  on public.devices for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Devices: owner can remove"
  on public.devices for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Users may only change a device's name and revocation, never its owner, key or transport.
revoke update on public.devices from authenticated;
grant update (name, revoked_at) on public.devices to authenticated;

alter table public.device_pairings
  add constraint device_pairings_claimed_device_fk
  foreign key (claimed_device_id) references public.devices (id) on delete set null;

-- Explicit Data API grants (new projects may not expose tables automatically).
revoke update on public.profiles from authenticated;
grant select, update (display_name) on public.profiles to authenticated;
grant select, insert, delete on public.device_pairings to authenticated;
grant select, delete on public.devices to authenticated;
