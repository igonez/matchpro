-- Adicionar coluna caption (legenda) em student_submissions
alter table public.student_submissions 
add column if not exists caption text;

-- Tabela de Curtidas (Likes) nas fotos
create table if not exists public.submission_likes (
  id uuid primary key default uuid_generate_v4(),
  submission_id uuid not null references public.student_submissions(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  created_at timestamptz default now() not null,
  unique (submission_id, student_id)
);

-- Tabela de Comentários nas fotos
create table if not exists public.submission_comments (
  id uuid primary key default uuid_generate_v4(),
  submission_id uuid not null references public.student_submissions(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  content text not null,
  created_at timestamptz default now() not null
);

-- Habilitar RLS
alter table public.submission_likes enable row level security;
alter table public.submission_comments enable row level security;

-- Policies para Likes
create policy "Likes são visíveis para todos os usuários autenticados" 
  on public.submission_likes for select using (auth.role() = 'authenticated');

create policy "Alunos podem curtir fotos" 
  on public.submission_likes for insert with check (auth.uid() = student_id);

create policy "Alunos podem remover sua curtida" 
  on public.submission_likes for delete using (auth.uid() = student_id);

-- Policies para Comentários
create policy "Comentários são visíveis para todos os usuários autenticados" 
  on public.submission_comments for select using (auth.role() = 'authenticated');

create policy "Alunos podem comentar fotos" 
  on public.submission_comments for insert with check (auth.uid() = student_id);

create policy "Alunos podem deletar seus próprios comentários" 
  on public.submission_comments for delete using (auth.uid() = student_id);
