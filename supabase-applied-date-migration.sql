-- Add applied_date to jobs table
-- Run this in Supabase Dashboard > SQL Editor

alter table public.jobs add column if not exists applied_date date;
