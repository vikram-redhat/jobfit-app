-- Track deleted account emails to prevent free tier abuse
-- Run this in Supabase Dashboard > SQL Editor

create table if not exists public.deleted_accounts (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  deleted_at timestamptz default now()
);

create index if not exists idx_deleted_accounts_email on public.deleted_accounts(lower(email));
