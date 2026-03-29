-- Stripe + billing migration
-- Run in Supabase SQL Editor after the initial schema

-- Add subscription columns to profiles
alter table public.profiles
  add column if not exists analysis_count int default 0,
  add column if not exists stripe_customer_id text,
  add column if not exists is_subscribed boolean default false,
  add column if not exists subscription_status text,
  add column if not exists subscription_end_date timestamptz;

-- App-wide settings (free tier limit, etc.)
create table if not exists public.app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz default now()
);

insert into public.app_settings (key, value) values ('free_tier_limit', '2')
  on conflict (key) do nothing;

-- RLS: authenticated users can read settings; only service role can write
alter table public.app_settings enable row level security;

create policy "Authenticated users can read settings" on public.app_settings
  for select to authenticated using (true);
