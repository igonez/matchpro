-- Tabela de Materiais de Apoio do Desafio (PDFs, Vídeos, Cardápios)
create table if not exists public.challenge_materials (
  id uuid primary key default uuid_generate_v4(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  title text not null,
  description text,
  type text default 'pdf' check (type in ('pdf', 'video', 'cardapio', 'link')),
  file_url text not null, -- URL do arquivo ou link do vídeo/YouTube
  thumbnail_url text,
  created_at timestamptz default now() not null
);

-- RLS
alter table public.challenge_materials enable row level security;

drop policy if exists "Materiais visíveis por todos autenticados" on public.challenge_materials;
create policy "Materiais visíveis por todos autenticados" on public.challenge_materials
  for select using (auth.role() = 'authenticated');

drop policy if exists "Profissionais gerenciam materiais" on public.challenge_materials;
create policy "Profissionais gerenciam materiais" on public.challenge_materials
  for all using (
    exists (
      select 1 from public.challenges
      where challenges.id = challenge_materials.challenge_id
      and challenges.professional_id = auth.uid()
    )
  );
