-- Row Level Security Policies for FamVenture
-- Created: 2025-01-10

-- ============================================================================
-- FAMILIES table policies
-- ============================================================================
alter table public.families enable row level security;

-- Users can view their own family
create policy "families_select_own"
  on public.families for select
  using (id = auth_family_id());

-- Parents can update their family settings
create policy "families_update_parents"
  on public.families for update
  using (
    id = auth_family_id()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'parent'
    )
  );

-- ============================================================================
-- PROFILES table policies
-- ============================================================================
alter table public.profiles enable row level security;

-- Users can view all profiles in their family
create policy "profiles_select_family"
  on public.profiles for select
  using (family_id = auth_family_id());

-- Users can update their own profile
create policy "profiles_update_self"
  on public.profiles for update
  using (id = auth.uid());

-- Parents can update any profile in their family
create policy "profiles_update_parents"
  on public.profiles for update
  using (
    family_id = auth_family_id()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'parent'
    )
  );

-- Parents can insert new profiles (children) in their family
create policy "profiles_insert_parents"
  on public.profiles for insert
  with check (
    family_id = auth_family_id()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'parent'
    )
  );

-- ============================================================================
-- CHORES table policies
-- ============================================================================
alter table public.chores enable row level security;

-- All family members can view chores
create policy "chores_select_family"
  on public.chores for select
  using (family_id = auth_family_id());

-- Only parents can create chores
create policy "chores_insert_parents"
  on public.chores for insert
  with check (
    family_id = auth_family_id()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'parent'
    )
  );

-- Only parents can update chores
create policy "chores_update_parents"
  on public.chores for update
  using (
    family_id = auth_family_id()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'parent'
    )
  );

-- Only parents can delete chores
create policy "chores_delete_parents"
  on public.chores for delete
  using (
    family_id = auth_family_id()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'parent'
    )
  );

-- ============================================================================
-- CHORE_INSTANCES table policies
-- ============================================================================
alter table public.chore_instances enable row level security;

-- All family members can view chore instances
create policy "instances_select_family"
  on public.chore_instances for select
  using (family_id = auth_family_id());

-- Parents can create instances (manual one-offs or recurring spawns)
create policy "instances_insert_parents"
  on public.chore_instances for insert
  with check (
    family_id = auth_family_id()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'parent'
    )
  );

-- Service role can also create instances (for recurring job)
create policy "instances_insert_service"
  on public.chore_instances for insert
  with check (auth.uid() is null); -- Service role context

-- Family members can claim and submit their own instances
create policy "instances_update_claimant"
  on public.chore_instances for update
  using (
    family_id = auth_family_id()
    and (
      -- Can claim open instances (unassigned or assigned to them)
      (status = 'open' and (assignee_id is null or assignee_id = auth.uid()))
      -- Can update their own claimed instances
      or (claimed_by = auth.uid())
    )
  );

-- Parents can update any instance (for approvals)
create policy "instances_update_parents"
  on public.chore_instances for update
  using (
    family_id = auth_family_id()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'parent'
    )
  );

-- Parents can delete instances
create policy "instances_delete_parents"
  on public.chore_instances for delete
  using (
    family_id = auth_family_id()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'parent'
    )
  );

-- ============================================================================
-- GOALS table policies
-- ============================================================================
alter table public.goals enable row level security;

-- All family members can view goals
create policy "goals_select_family"
  on public.goals for select
  using (family_id = auth_family_id());

-- Only parents can create goals
create policy "goals_insert_parents"
  on public.goals for insert
  with check (
    family_id = auth_family_id()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'parent'
    )
  );

-- Only parents can update goals
create policy "goals_update_parents"
  on public.goals for update
  using (
    family_id = auth_family_id()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'parent'
    )
  );

-- Triggers can update goals (for auto-progress)
create policy "goals_update_system"
  on public.goals for update
  using (true); -- Triggered functions run with definer rights

-- ============================================================================
-- APPROVALS table policies
-- ============================================================================
alter table public.approvals enable row level security;

-- Family members can view approvals in their family
create policy "approvals_select_family"
  on public.approvals for select
  using (
    exists (
      select 1 from public.chore_instances ci
      where ci.id = approvals.instance_id
        and ci.family_id = auth_family_id()
    )
  );

-- Only parents can create approvals
create policy "approvals_insert_parents"
  on public.approvals for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'parent'
    )
    and exists (
      select 1 from public.chore_instances ci
      where ci.id = approvals.instance_id
        and ci.family_id = auth_family_id()
    )
  );

-- ============================================================================
-- NOTIFICATIONS table policies
-- ============================================================================
alter table public.notifications enable row level security;

-- Users can view their own notifications
create policy "notifications_select_own"
  on public.notifications for select
  using (profile_id = auth.uid());

-- Users can update their own notifications (mark as read)
create policy "notifications_update_own"
  on public.notifications for update
  using (profile_id = auth.uid());

-- System can create notifications for any user
create policy "notifications_insert_system"
  on public.notifications for insert
  with check (
    profile_id in (
      select id from public.profiles
      where family_id = auth_family_id()
    )
    or auth.uid() is null -- Service role
  );

-- ============================================================================
-- INVITES table policies
-- ============================================================================
alter table public.invites enable row level security;

-- Anyone can view non-expired invites by code (for joining)
create policy "invites_select_by_code"
  on public.invites for select
  using (expires_at > now() and uses < max_uses);

-- Parents can view their family's invites
create policy "invites_select_family"
  on public.invites for select
  using (
    family_id = auth_family_id()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'parent'
    )
  );

-- Parents can create invites for their family
create policy "invites_insert_parents"
  on public.invites for insert
  with check (
    family_id = auth_family_id()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'parent'
    )
  );

-- System can update invite usage
create policy "invites_update_system"
  on public.invites for update
  using (true);

-- ============================================================================
-- LEADERBOARD_SNAPSHOTS table policies
-- ============================================================================
alter table public.leaderboard_snapshots enable row level security;

-- All family members can view leaderboard
create policy "leaderboard_select_family"
  on public.leaderboard_snapshots for select
  using (family_id = auth_family_id());

-- System can insert/update leaderboard data
create policy "leaderboard_insert_system"
  on public.leaderboard_snapshots for insert
  with check (true);

create policy "leaderboard_update_system"
  on public.leaderboard_snapshots for update
  using (true);

-- ============================================================================
-- Storage policies (for proof photos)
-- ============================================================================

-- Create storage bucket for proof photos
insert into storage.buckets (id, name, public)
values ('proof-photos', 'proof-photos', false)
on conflict (id) do nothing;

-- Allow family members to upload proof photos
create policy "proof_photos_insert_family"
  on storage.objects for insert
  with check (
    bucket_id = 'proof-photos'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = (auth_family_id())::text
  );

-- Allow family members to view their family's proof photos
create policy "proof_photos_select_family"
  on storage.objects for select
  using (
    bucket_id = 'proof-photos'
    and (storage.foldername(name))[1] = (auth_family_id())::text
  );

-- Allow users to delete their own uploaded photos
create policy "proof_photos_delete_uploader"
  on storage.objects for delete
  using (
    bucket_id = 'proof-photos'
    and owner = auth.uid()
  );

-- Parents can delete any proof photo in their family
create policy "proof_photos_delete_parents"
  on storage.objects for delete
  using (
    bucket_id = 'proof-photos'
    and (storage.foldername(name))[1] = (auth_family_id())::text
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'parent'
    )
  );
