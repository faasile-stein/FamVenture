-- Initial schema for FamVenture gamified family chore planner
-- Created: 2025-01-10

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create custom types
create type role as enum ('parent', 'child');
create type chore_type as enum ('study', 'household', 'activity');
create type chore_status as enum ('open', 'claimed', 'submitted', 'approved', 'rejected', 'expired');
create type period as enum ('week', 'month', 'all_time');

-- ============================================================================
-- FAMILIES table
-- ============================================================================
create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  timezone text not null default 'Europe/Brussels',
  plan text not null check (plan in ('free', 'premium')) default 'free',
  settings jsonb not null default jsonb_build_object(
    'grace_days', 3,
    'overdue_cap', 2.0,
    'cash_points_percent', 0
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- PROFILES table
-- ============================================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  role role not null,
  display_name text not null,
  avatar_url text,
  hourly_rate_cents int check (hourly_rate_cents >= 0),
  total_points int not null default 0,
  streak_days int not null default 0,
  last_completion_date date,
  level int not null default 1,
  badges jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- CHORES table (templates)
-- ============================================================================
create table public.chores (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  title text not null,
  description text,
  type chore_type not null,
  base_points int not null check (base_points > 0),
  expected_duration_min int check (expected_duration_min >= 0),
  is_recurring boolean not null default false,
  rrule text, -- iCal RRULE format
  assignee_id uuid references public.profiles(id) on delete set null,
  created_by uuid not null references public.profiles(id),
  active boolean not null default true,
  allow_cash_out boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- CHORE_INSTANCES table (concrete occurrences)
-- ============================================================================
create table public.chore_instances (
  id uuid primary key default gen_random_uuid(),
  chore_id uuid not null references public.chores(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  title text not null, -- denormalized for display
  description text,
  type chore_type not null,
  base_points int not null,
  expected_duration_min int,
  due_at timestamptz not null,
  assignee_id uuid references public.profiles(id) on delete set null,
  status chore_status not null default 'open',
  claimed_by uuid references public.profiles(id),
  claimed_at timestamptz,
  completed_at timestamptz,
  approved_at timestamptz,
  approved_by uuid references public.profiles(id),
  cash_out_requested boolean not null default false,
  minutes_reported int,
  points_awarded int,
  cash_cents int,
  proof_urls text[] default array[]::text[],
  notes text,
  audit jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for performance
create index idx_chore_instances_family_status_due on public.chore_instances (family_id, status, due_at);
create index idx_chore_instances_assignee_status on public.chore_instances (assignee_id, status);
create index idx_chore_instances_claimed_by on public.chore_instances (claimed_by);
create index idx_chore_instances_due_at on public.chore_instances (due_at);

-- ============================================================================
-- GOALS table (shared family goals)
-- ============================================================================
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  name text not null,
  description text,
  target_points int not null check (target_points > 0),
  current_points int not null default 0,
  is_active boolean not null default true,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- APPROVALS table (audit trail)
-- ============================================================================
create table public.approvals (
  id uuid primary key default gen_random_uuid(),
  instance_id uuid not null references public.chore_instances(id) on delete cascade,
  parent_id uuid not null references public.profiles(id),
  action text not null check (action in ('approved', 'rejected')),
  reason text,
  points_awarded int,
  cash_cents int,
  created_at timestamptz not null default now()
);

-- Index for audit queries
create index idx_approvals_instance on public.approvals (instance_id);
create index idx_approvals_parent on public.approvals (parent_id);

-- ============================================================================
-- NOTIFICATIONS table
-- ============================================================================
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('reminder_due', 'approval_needed', 'streak', 'goal_progress', 'approved', 'rejected', 'level_up')),
  title text not null,
  body text not null,
  payload jsonb not null default '{}'::jsonb,
  read boolean not null default false,
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- Index for querying user notifications
create index idx_notifications_profile_read on public.notifications (profile_id, read, created_at desc);

-- ============================================================================
-- INVITES table
-- ============================================================================
create table public.invites (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  role role not null,
  code text not null unique,
  created_by uuid not null references public.profiles(id),
  max_uses int not null default 1,
  uses int not null default 0,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- Index for invite lookup
create index idx_invites_code on public.invites (code);

-- ============================================================================
-- LEADERBOARD_SNAPSHOTS table (materialized leaderboard data)
-- ============================================================================
create table public.leaderboard_snapshots (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  period period not null,
  starts_on date not null,
  ends_on date not null,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  points int not null default 0,
  chores_completed int not null default 0,
  earliest_completion timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (family_id, period, starts_on, profile_id)
);

-- Index for leaderboard queries
create index idx_leaderboard_family_period on public.leaderboard_snapshots (family_id, period, starts_on, points desc);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get authenticated user's family_id
create or replace function public.auth_family_id()
returns uuid
language sql stable
security definer
as $$
  select family_id from public.profiles where id = auth.uid();
$$;

-- Function to check if user is a parent
create or replace function public.is_parent()
returns boolean
language sql stable
security definer
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'parent'
  );
$$;

-- Function to check if user is in a specific family
create or replace function public.in_family(fam_id uuid)
returns boolean
language sql stable
security definer
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and family_id = fam_id
  );
$$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply updated_at trigger to relevant tables
create trigger update_families_updated_at before update on public.families
  for each row execute function public.update_updated_at();

create trigger update_profiles_updated_at before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger update_chores_updated_at before update on public.chores
  for each row execute function public.update_updated_at();

create trigger update_chore_instances_updated_at before update on public.chore_instances
  for each row execute function public.update_updated_at();

create trigger update_goals_updated_at before update on public.goals
  for each row execute function public.update_updated_at();

-- ============================================================================
-- Update goal progress when chore approved
-- ============================================================================
create or replace function public.update_goal_progress()
returns trigger
language plpgsql
security definer
as $$
declare
  active_goal_id uuid;
begin
  -- Only update when status changes to approved and points are awarded
  if new.status = 'approved' and new.points_awarded is not null and new.points_awarded > 0 then
    -- Get active goal for this family
    select id into active_goal_id
    from public.goals
    where family_id = new.family_id
      and is_active = true
    limit 1;

    if active_goal_id is not null then
      -- Update goal progress
      update public.goals
      set current_points = current_points + new.points_awarded,
          completed_at = case
            when current_points + new.points_awarded >= target_points then now()
            else completed_at
          end
      where id = active_goal_id;
    end if;
  end if;

  return new;
end;
$$;

create trigger trigger_update_goal_progress
  after update on public.chore_instances
  for each row
  when (new.status = 'approved' and old.status <> 'approved')
  execute function public.update_goal_progress();

-- ============================================================================
-- Update profile stats when chore approved
-- ============================================================================
create or replace function public.update_profile_stats()
returns trigger
language plpgsql
security definer
as $$
declare
  prev_level int;
  new_level int;
begin
  if new.status = 'approved' and new.points_awarded is not null and new.points_awarded > 0 then
    -- Update total points
    select level into prev_level
    from public.profiles
    where id = new.claimed_by;

    update public.profiles
    set total_points = total_points + new.points_awarded,
        last_completion_date = current_date
    where id = new.claimed_by;

    -- Calculate new level (every 100 points = 1 level)
    select floor((total_points / 100.0) + 1) into new_level
    from public.profiles
    where id = new.claimed_by;

    if new_level > prev_level then
      update public.profiles
      set level = new_level
      where id = new.claimed_by;

      -- Create level-up notification
      insert into public.notifications (profile_id, type, title, body, payload)
      values (
        new.claimed_by,
        'level_up',
        'Level Up!',
        'Congratulations! You reached level ' || new_level || '!',
        jsonb_build_object('level', new_level)
      );
    end if;
  end if;

  return new;
end;
$$;

create trigger trigger_update_profile_stats
  after update on public.chore_instances
  for each row
  when (new.status = 'approved' and old.status <> 'approved')
  execute function public.update_profile_stats();

-- ============================================================================
-- Comments for documentation
-- ============================================================================
comment on table public.families is 'Family groups with shared chores and goals';
comment on table public.profiles is 'User profiles (both parents and children)';
comment on table public.chores is 'Chore templates/definitions';
comment on table public.chore_instances is 'Concrete chore occurrences';
comment on table public.goals is 'Shared family goals';
comment on table public.approvals is 'Audit trail of chore approvals/rejections';
comment on table public.notifications is 'User notifications and reminders';
comment on table public.invites is 'Family invitation codes';
comment on table public.leaderboard_snapshots is 'Pre-computed leaderboard rankings';
