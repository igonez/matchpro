-- Tabela de Avisos / Comunicados do Treinador (Announcements)
create table if not exists public.challenge_announcements (
  id uuid primary key default uuid_generate_v4(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  title text not null,
  content text not null,
  is_pinned boolean default false not null,
  priority text default 'normal' check (priority in ('normal', 'important', 'dica', 'urgente')),
  created_at timestamptz default now() not null
);

-- RLS
alter table public.challenge_announcements enable row level security;

drop policy if exists "Avisos visíveis por todos autenticados" on public.challenge_announcements;
create policy "Avisos visíveis por todos autenticados" on public.challenge_announcements
  for select using (auth.role() = 'authenticated');

drop policy if exists "Profissionais gerenciam avisos de seus desafios" on public.challenge_announcements;
create policy "Profissionais gerenciam avisos de seus desafios" on public.challenge_announcements
  for all using (
    exists (
      select 1 from public.challenges
      where challenges.id = challenge_announcements.challenge_id
      and challenges.professional_id = auth.uid()
    )
  );
