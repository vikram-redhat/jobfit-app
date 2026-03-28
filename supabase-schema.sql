-- JobFit Database Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Enable Row Level Security
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;

-- Profiles table
create table if not exists public.profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  full_name text not null,
  email text,
  location text,
  education text,
  experience jsonb default '[]'::jsonb,
  skills text,
  target_roles text,
  work_arrangement text default 'Open to anything',
  contract_perm text default 'Open to either',
  salary_floor text,
  industry_pref text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Jobs table
create table if not exists public.jobs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text,
  company text,
  location text,
  arrangement text,
  salary text,
  url text,
  summary text,
  score integer,
  verdict text,
  strengths jsonb default '[]'::jsonb,
  gaps jsonb default '[]'::jsonb,
  angle text,
  red_flags jsonb default '[]'::jsonb,
  key_requirements jsonb default '[]'::jsonb,
  status text default 'New' check (status in ('New', 'Applied', 'Interview', 'Offered', 'Rejected', 'Dismissed')),
  resume text,
  cover_letter text,
  raw_input text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_profiles_user_id on public.profiles(user_id);
create index if not exists idx_jobs_user_id on public.jobs(user_id);
create index if not exists idx_jobs_created_at on public.jobs(created_at desc);

-- Row Level Security policies
alter table public.profiles enable row level security;
alter table public.jobs enable row level security;

-- Users can only see and modify their own profile
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = user_id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = user_id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = user_id);

-- Users can only see and modify their own jobs
create policy "Users can view own jobs" on public.jobs
  for select using (auth.uid() = user_id);

create policy "Users can insert own jobs" on public.jobs
  for insert with check (auth.uid() = user_id);

create policy "Users can update own jobs" on public.jobs
  for update using (auth.uid() = user_id);

create policy "Users can delete own jobs" on public.jobs
  for delete using (auth.uid() = user_id);

-- Updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profiles_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger on_jobs_updated
  before update on public.jobs
  for each row execute function public.handle_updated_at();
