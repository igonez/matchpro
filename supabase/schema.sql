-- Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 1. Professionals Table
create table if not exists public.professionals (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  specialty text check (specialty in ('personal_trainer', 'nutritionist', 'holistic_coach', 'gym_owner')),
  stripe_account_id text,
  created_at timestamptz default now() not null
);

-- 2. Challenges Table
create table if not exists public.challenges (
  id uuid primary key default uuid_generate_v4(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  title text not null,
  start_date date not null,
  end_date date not null,
  price numeric(10,2) default 0.00 not null,
  is_active boolean default true not null
);

-- 3. Students Table
create table if not exists public.students (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  avatar_url text
);

-- 4. Challenge Participants Table
create table if not exists public.challenge_participants (
  id uuid primary key default uuid_generate_v4(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  joined_at timestamptz default now() not null,
  unique (challenge_id, student_id)
);

-- 5. Missions Table
create table if not exists public.missions (
  id uuid primary key default uuid_generate_v4(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  title text not null,
  points_rewarded integer not null check (points_rewarded > 0)
);

-- 6. Student Submissions Table
create table if not exists public.student_submissions (
  id uuid primary key default uuid_generate_v4(),
  mission_id uuid not null references public.missions(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  photo_url text not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  submitted_at timestamptz default now() not null
);

-- 7. Leaderboard Standings Table
create table if not exists public.leaderboard_standings (
  id uuid primary key default uuid_generate_v4(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  total_points integer default 0 not null,
  unique (challenge_id, student_id)
);

-- Trigger Function: Automatic Leaderboard Points on Approval
create or replace function public.handle_submission_approval()
returns trigger as $$
declare
  v_challenge_id uuid;
  v_points integer;
begin
  if (old.status != 'approved' and new.status = 'approved') then
    select challenge_id, points_rewarded into v_challenge_id, v_points
    from public.missions where id = new.mission_id;
    
    insert into public.leaderboard_standings (challenge_id, student_id, total_points)
    values (v_challenge_id, new.student_id, v_points)
    on conflict (challenge_id, student_id)
    do update set total_points = leaderboard_standings.total_points + excluded.total_points;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger definition
drop trigger if exists on_submission_approved on public.student_submissions;
create trigger on_submission_approved
  after update on public.student_submissions
  for each row when (old.status is distinct from new.status)
  execute function public.handle_submission_approval();

-- RLS (Row Level Security)
alter table public.professionals enable row level security;
alter table public.challenges enable row level security;
alter table public.students enable row level security;
alter table public.challenge_participants enable row level security;
alter table public.missions enable row level security;
alter table public.student_submissions enable row level security;
alter table public.leaderboard_standings enable row level security;

-- Policies: Professionals
create policy "Professionals can view own profile" on public.professionals
  for select using (auth.uid() = id);
create policy "Professionals can update own profile" on public.professionals
  for update using (auth.uid() = id);
create policy "Professionals can insert own profile" on public.professionals
  for insert with check (auth.uid() = id);

-- Policies: Students
create policy "Students can view all students in their challenge" on public.students
  for select using (true);
create policy "Students can update own profile" on public.students
  for update using (auth.uid() = id);
create policy "Students can insert own profile" on public.students
  for insert with check (auth.uid() = id);

-- Policies: Challenges
create policy "Public view active challenges" on public.challenges
  for select using (true);
create policy "Professionals can manage own challenges" on public.challenges
  for all using (auth.uid() = professional_id);

-- Policies: Missions
create policy "Missions are viewable by all authenticated users" on public.missions
  for select using (auth.role() = 'authenticated');
create policy "Professionals can manage missions of their challenges" on public.missions
  for all using (
    exists (
      select 1 from public.challenges
      where challenges.id = missions.challenge_id
      and challenges.professional_id = auth.uid()
    )
  );

-- Policies: Challenge Participants
create policy "Participants can view their challenges" on public.challenge_participants
  for select using (auth.role() = 'authenticated');
create policy "Students can join challenges" on public.challenge_participants
  for insert with check (auth.uid() = student_id);

-- Policies: Student Submissions
create policy "Students can view own submissions and Professionals can view challenge submissions" on public.student_submissions
  for select using (
    auth.uid() = student_id or exists (
      select 1 from public.missions m
      join public.challenges c on c.id = m.challenge_id
      where m.id = student_submissions.mission_id
      and c.professional_id = auth.uid()
    )
  );

create policy "Students can insert submissions" on public.student_submissions
  for insert with check (auth.uid() = student_id);

create policy "Professionals can update submission status" on public.student_submissions
  for update using (
    exists (
      select 1 from public.missions m
      join public.challenges c on c.id = m.challenge_id
      where m.id = student_submissions.mission_id
      and c.professional_id = auth.uid()
    )
  );

-- Policies: Leaderboard Standings
create policy "Leaderboard standings are viewable by everyone" on public.leaderboard_standings
  for select using (true);
-- Frontend cannot update leaderboard_standings directly, trigger handles this via SECURITY DEFINER!

-- Storage Bucket Setup (Submissions)
insert into storage.buckets (id, name, public)
values ('submissions', 'submissions', true)
on conflict (id) do nothing;

create policy "Submissions images are publicly accessible" on storage.objects
  for select using (bucket_id = 'submissions');

create policy "Authenticated users can upload submission images" on storage.objects
  for insert with check (bucket_id = 'submissions' and auth.role() = 'authenticated');
