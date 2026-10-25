-- Grayvalve web: the waitlist for the production release of the app.
-- Visitors can add themselves and nothing else: there is no select, update or delete policy, so
-- the list can't be read through the Data API. Sign-ups go through one function that answers the
-- same way for new and existing emails, so it can't be used to find out who has signed up.

create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null check (char_length(email) between 3 and 254),
  name text check (char_length(name) <= 80),
  platform text not null default 'android' check (platform in ('android', 'ios')),
  created_at timestamptz not null default now()
);

create unique index waitlist_email_key on public.waitlist (lower(email));

alter table public.waitlist enable row level security;
revoke all on table public.waitlist from anon, authenticated;

create function public.join_waitlist(p_email text, p_name text, p_platform text default 'android')
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_email is null or p_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or char_length(p_email) > 254 then
    raise exception 'invalid email' using errcode = '22023';
  end if;
  insert into public.waitlist (email, name, platform)
  values (lower(trim(p_email)), nullif(left(trim(coalesce(p_name, '')), 80), ''), case when p_platform = 'ios' then 'ios' else 'android' end)
  on conflict (lower(email)) do nothing;
end;
$$;

revoke all on function public.join_waitlist(text, text, text) from public;
grant execute on function public.join_waitlist(text, text, text) to anon, authenticated;
