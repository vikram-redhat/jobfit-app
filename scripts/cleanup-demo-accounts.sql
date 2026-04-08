-- Run this first to clean up any partial data from the failed SQL attempt
-- Supabase Dashboard > SQL Editor

DELETE FROM public.jobs WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
);

DELETE FROM public.profiles WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
);

-- Also delete any jobs with the demo UUIDs we tried
DELETE FROM public.jobs WHERE id IN (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
  'a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2',
  'a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3'
);
