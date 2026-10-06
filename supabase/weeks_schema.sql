-- 1. Tabela de Semanas do Desafio (Weeks)
create table if not exists public.challenge_weeks (
  id uuid primary key default uuid_generate_v4(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  week_number integer not null check (week_number > 0),
  title text not null, -- Ex: "Semana 1: Adaptação & Hábitos"
  bonus_points integer default 0 not null check (bonus_points >= 0),
  start_date date,
  end_date date,
  unique (challenge_id, week_number)
);

-- 2. Atualizar tabela de Missões para pertencer a uma Semana e ter Categoria
alter table public.missions
add column if not exists week_id uuid references public.challenge_weeks(id) on delete cascade,
add column if not exists category text default 'treino' check (category in ('treino', 'cardio', 'refeicao', 'habito', 'outro')),
add column if not exists target_frequency integer default 1 check (target_frequency > 0); -- Quantidade de vezes na semana

-- 3. Habilitar RLS em challenge_weeks
alter table public.challenge_weeks enable row level security;

drop policy if exists "Semanas visíveis por todos autenticados" on public.challenge_weeks;
create policy "Semanas visíveis por todos autenticados" on public.challenge_weeks
  for select using (auth.role() = 'authenticated');

drop policy if exists "Profissionais gerenciam semanas" on public.challenge_weeks;
create policy "Profissionais gerenciam semanas" on public.challenge_weeks
  for all using (
    exists (
      select 1 from public.challenges
      where challenges.id = challenge_weeks.challenge_id
      and challenges.professional_id = auth.uid()
    )
  );
