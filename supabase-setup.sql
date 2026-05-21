-- ─────────────────────────────────────────────────────────────
-- TOGA · Supabase Setup SQL
-- Execute no SQL Editor do seu projeto Supabase
-- Dashboard → SQL Editor → New Query → Cole → Run
-- ─────────────────────────────────────────────────────────────

-- 1. Tabela principal de sincronização
--    Uma linha por usuário, dados em JSONB (simples e flexível)
create table if not exists public.user_sync (
  user_id    uuid references auth.users(id) on delete cascade primary key,
  shared     jsonb not null default '{}',
  objetiva   jsonb not null default '{}',
  discursiva jsonb not null default '{}',
  meta       jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- 2. Row Level Security — cada usuário vê/edita só seus dados
alter table public.user_sync enable row level security;

create policy "users_own_data"
  on public.user_sync
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 3. Trigger: atualiza updated_at automaticamente
create or replace function public.update_updated_at()
returns trigger
language plpgsql
security definer
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_sync_updated_at on public.user_sync;

create trigger user_sync_updated_at
  before update on public.user_sync
  for each row execute function public.update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- Pronto! Próximos passos:
-- 1. Ative Google OAuth em Authentication → Providers → Google
-- 2. Em Authentication → URL Configuration, adicione:
--    Site URL: https://seu-app.vercel.app
--    Redirect URLs: https://seu-app.vercel.app/*
-- 3. Preencha supabase-config.jsx com URL e anon key
-- ─────────────────────────────────────────────────────────────
