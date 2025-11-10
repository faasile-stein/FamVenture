-- Seed data for testing FamVenture
-- Run this after migrations to populate test data

-- Note: You'll need to create auth users first through Supabase Studio or API
-- Then use their UUIDs here

-- Instructions:
-- 1. Create auth users in Supabase Studio (Authentication > Users):
--    - parent@test.com (password: password123)
--    - child1@test.com (password: password123)
--    - child2@test.com (password: password123)
-- 2. Copy their UUIDs
-- 3. Replace the UUIDs below with actual values
-- 4. Run this seed script

-- Example Family Structure:
-- Family: "The Test Family"
-- Parent: "Mom" (parent@test.com)
-- Child 1: "Alice" (child1@test.com)
-- Child 2: "Bob" (child2@test.com)

-- ============================================================================
-- Create Test Family
-- ============================================================================
INSERT INTO public.families (id, name, timezone, plan, settings)
VALUES (
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'The Test Family',
  'America/New_York',
  'premium',
  jsonb_build_object(
    'grace_days', 3,
    'overdue_cap', 2.0,
    'cash_points_percent', 10
  )
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Create Test Profiles
-- ============================================================================

-- Parent Profile
-- REPLACE 'parent-auth-uuid-here' with actual auth.users UUID
INSERT INTO public.profiles (id, family_id, role, display_name, hourly_rate_cents, total_points, level)
VALUES (
  'parent-auth-uuid-here'::uuid,
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'parent',
  'Mom',
  NULL,
  0,
  1
)
ON CONFLICT (id) DO NOTHING;

-- Child 1 Profile
-- REPLACE 'child1-auth-uuid-here' with actual auth.users UUID
INSERT INTO public.profiles (id, family_id, role, display_name, hourly_rate_cents, total_points, level)
VALUES (
  'child1-auth-uuid-here'::uuid,
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'child',
  'Alice',
  1000, -- $10.00/hour
  0,
  1
)
ON CONFLICT (id) DO NOTHING;

-- Child 2 Profile
-- REPLACE 'child2-auth-uuid-here' with actual auth.users UUID
INSERT INTO public.profiles (id, family_id, role, display_name, hourly_rate_cents, total_points, level)
VALUES (
  'child2-auth-uuid-here'::uuid,
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'child',
  'Bob',
  800, -- $8.00/hour
  0,
  1
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Create Test Chores (Templates)
-- ============================================================================

-- Household Chores
INSERT INTO public.chores (family_id, title, description, type, base_points, expected_duration_min, created_by, is_recurring, active, allow_cash_out)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Clean Your Room', 'Vacuum, dust, make bed, and organize', 'household', 20, 30, 'parent-auth-uuid-here', false, true, false),
  ('a0000000-0000-0000-0000-000000000001', 'Do the Dishes', 'Wash, dry, and put away all dishes', 'household', 15, 20, 'parent-auth-uuid-here', false, true, false),
  ('a0000000-0000-0000-0000-000000000001', 'Take Out Trash', 'Empty all trash bins and take to curb', 'household', 10, 10, 'parent-auth-uuid-here', false, true, false),
  ('a0000000-0000-0000-0000-000000000001', 'Vacuum Living Room', 'Vacuum entire living room and under furniture', 'household', 15, 25, 'parent-auth-uuid-here', false, true, false),
  ('a0000000-0000-0000-0000-000000000001', 'Water Plants', 'Water all indoor and outdoor plants', 'household', 10, 15, 'parent-auth-uuid-here', false, true, false);

-- Study Chores
INSERT INTO public.chores (family_id, title, description, type, base_points, expected_duration_min, created_by, is_recurring, active, allow_cash_out)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Math Homework', 'Complete all math assignments', 'study', 30, 45, 'parent-auth-uuid-here', false, true, false),
  ('a0000000-0000-0000-0000-000000000001', 'Reading Time', 'Read for 30 minutes', 'study', 25, 30, 'parent-auth-uuid-here', false, true, true),
  ('a0000000-0000-0000-0000-000000000001', 'Practice Piano', 'Piano practice session', 'study', 20, 30, 'parent-auth-uuid-here', false, true, true),
  ('a0000000-0000-0000-0000-000000000001', 'Science Project', 'Work on science fair project', 'study', 40, 60, 'parent-auth-uuid-here', false, true, true);

-- Activity Chores
INSERT INTO public.chores (family_id, title, description, type, base_points, expected_duration_min, created_by, is_recurring, active, allow_cash_out)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Play Outside', 'Get fresh air and exercise', 'activity', 15, 60, 'parent-auth-uuid-here', false, true, false),
  ('a0000000-0000-0000-0000-000000000001', 'Bike Ride', 'Go for a bike ride around the neighborhood', 'activity', 20, 45, 'parent-auth-uuid-here', false, true, false),
  ('a0000000-0000-0000-0000-000000000001', 'Help Sibling', 'Help your brother or sister with something', 'activity', 25, 30, 'parent-auth-uuid-here', false, true, false);

-- ============================================================================
-- Create Test Chore Instances
-- ============================================================================

-- Today's chores (open)
INSERT INTO public.chore_instances (chore_id, family_id, title, description, type, base_points, expected_duration_min, due_at, status)
SELECT
  id,
  family_id,
  title,
  description,
  type,
  base_points,
  expected_duration_min,
  CURRENT_TIMESTAMP + interval '8 hours', -- Due later today
  'open'
FROM public.chores
WHERE family_id = 'a0000000-0000-0000-0000-000000000001'
  AND title IN ('Clean Your Room', 'Do the Dishes', 'Math Homework', 'Play Outside')
LIMIT 4;

-- Tomorrow's chores
INSERT INTO public.chore_instances (chore_id, family_id, title, description, type, base_points, expected_duration_min, due_at, status)
SELECT
  id,
  family_id,
  title,
  description,
  type,
  base_points,
  expected_duration_min,
  CURRENT_TIMESTAMP + interval '1 day',
  'open'
FROM public.chores
WHERE family_id = 'a0000000-0000-0000-0000-000000000001'
  AND title IN ('Take Out Trash', 'Water Plants', 'Reading Time')
LIMIT 3;

-- Overdue chores (for testing bonus points)
INSERT INTO public.chore_instances (chore_id, family_id, title, description, type, base_points, expected_duration_min, due_at, status)
SELECT
  id,
  family_id,
  title,
  description,
  type,
  base_points,
  expected_duration_min,
  CURRENT_TIMESTAMP - interval '3 days', -- 3 days overdue
  'open'
FROM public.chores
WHERE family_id = 'a0000000-0000-0000-0000-000000000001'
  AND title = 'Vacuum Living Room'
LIMIT 1;

-- ============================================================================
-- Create Test Family Goal
-- ============================================================================
INSERT INTO public.goals (family_id, name, description, target_points, current_points, is_active)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Theme Park Adventure',
  'Earn 500 points as a family for a trip to the theme park!',
  500,
  0,
  true
);

-- ============================================================================
-- Create Test Invite Code
-- ============================================================================
INSERT INTO public.invites (family_id, role, code, created_by, max_uses, expires_at)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'child',
  'TEST2025',
  'parent-auth-uuid-here',
  5,
  CURRENT_TIMESTAMP + interval '30 days'
);

-- ============================================================================
-- USAGE INSTRUCTIONS
-- ============================================================================

-- After running this seed:
-- 1. Sign in as parent@test.com
-- 2. You should see the family dashboard with stats
-- 3. Go to Chores tab - you'll see available chores
-- 4. Sign in as child1@test.com or child2@test.com
-- 5. Claim a chore, submit it
-- 6. Sign back in as parent and approve it
-- 7. Check leaderboard for updated rankings

-- To test overdue bonus:
-- 1. The "Vacuum Living Room" chore is already 3 days overdue
-- 2. Claim it as a child and submit it
-- 3. Approve as parent - you should get 2x points (base_points * 2)

-- To test cash-out:
-- 1. Claim a chore with allow_cash_out = true (e.g., "Reading Time")
-- 2. When submitting via SQL or future UI, set:
--    - cash_out_requested = true
--    - minutes_reported = 30
-- 3. Approve as parent - child will get cash instead of points
