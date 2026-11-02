-- Migration: ranking_share_links
-- Creates table for public short share links of challenge rankings (30-day expiration, frozen LGPD-safe snapshot, revocation support)

create table if not exists public.ranking_share_links (
  id           uuid primary key default gen_random_uuid(),
  code         text not null unique check (code ~ '^[A-Za-z0-9]{8}$'),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  created_by   uuid not null references auth.users(id) on delete cascade,
  snapshot     jsonb not null,
  expires_at   timestamptz not null default (now() + interval '30 days'),
  revoked_at   timestamptz,
  view_count   integer not null default 0,
  created_at   timestamptz not null default now()
);

create index if not exists ranking_share_links_challenge_idx
  on public.ranking_share_links (challenge_id, created_by, created_at desc);

alter table public.ranking_share_links enable row level security;
-- Strict RLS policy: only the authenticated creator can select their own links directly; public lookup is mediated by server routes via service_role.
drop policy if exists "Owners can view their own ranking share links" on public.ranking_share_links;
create policy "Owners can view their own ranking share links"
  on public.ranking_share_links
  for select
  to authenticated
  using ((select auth.uid()) = created_by);

create or replace function public.increment_share_view(p_code text) returns void
language sql security definer set search_path = public as $$
  update public.ranking_share_links
     set view_count = view_count + 1
   where code = p_code
     and revoked_at is null
     and expires_at > now();
$$;

revoke all on function public.increment_share_view(text) from public, anon, authenticated;
grant execute on function public.increment_share_view(text) to service_role;
