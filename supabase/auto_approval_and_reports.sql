-- 1. Modificar o trigger para pontuar automaticamente na criação (status default 'approved')
-- E permitir dedução de pontos caso o profissional rejeite/invalide a foto!

create or replace function public.handle_submission_points_lifecycle()
returns trigger as $$
declare
  v_challenge_id uuid;
  v_points integer;
begin
  -- Buscar o desafio e a pontuação da missão
  select challenge_id, points_rewarded into v_challenge_id, v_points
  from public.missions where id = coalesce(new.mission_id, old.mission_id);

  -- Cenário A: Nova submissão inserida já aprovada (Auto-aprovação imediata)
  if (tg_op = 'INSERT' and new.status = 'approved') then
    insert into public.leaderboard_standings (challenge_id, student_id, total_points)
    values (v_challenge_id, new.student_id, v_points)
    on conflict (challenge_id, student_id)
    do update set total_points = leaderboard_standings.total_points + excluded.total_points;
  end if;

  -- Cenário B: Foto que era 'approved' foi invalidada/rejeitada pelo treinador (Dedução de pontos)
  if (tg_op = 'UPDATE' and old.status = 'approved' and new.status = 'rejected') then
    update public.leaderboard_standings
    set total_points = greatest(0, leaderboard_standings.total_points - v_points)
    where challenge_id = v_challenge_id and student_id = new.student_id;
  end if;

  -- Cenário C: Foto que era 'rejected' foi reabilitada para 'approved'
  if (tg_op = 'UPDATE' and old.status = 'rejected' and new.status = 'approved') then
    update public.leaderboard_standings
    set total_points = leaderboard_standings.total_points + v_points
    where challenge_id = v_challenge_id and student_id = new.student_id;
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Atualizar triggers
drop trigger if exists on_submission_approved on public.student_submissions;
drop trigger if exists on_submission_lifecycle on public.student_submissions;

create trigger on_submission_lifecycle
  after insert or update on public.student_submissions
  for each row execute function public.handle_submission_points_lifecycle();

-- 2. Tabela de Denúncias da Comunidade (Peer-to-Peer Moderation)
create table if not exists public.submission_reports (
  id uuid primary key default uuid_generate_v4(),
  submission_id uuid not null references public.student_submissions(id) on delete cascade,
  reporter_student_id uuid not null references public.students(id) on delete cascade,
  reason text default 'Foto não corresponde à missão' not null,
  created_at timestamptz default now() not null,
  unique (submission_id, reporter_student_id)
);

-- RLS para denúncias
alter table public.submission_reports enable row level security;

drop policy if exists "Denuncias visiveis pelo personal" on public.submission_reports;
create policy "Denuncias visiveis pelo personal" on public.submission_reports
  for select using (auth.role() = 'authenticated');

drop policy if exists "Alunos podem denunciar fotos suspeitas" on public.submission_reports;
create policy "Alunos podem denunciar fotos suspeitas" on public.submission_reports
  for insert with check (auth.uid() = reporter_student_id);
