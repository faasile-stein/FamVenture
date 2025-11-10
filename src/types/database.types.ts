// Database type definitions
// Generated from Supabase schema

export type Role = 'parent' | 'child'
export type ChoreType = 'study' | 'household' | 'activity'
export type ChoreStatus = 'open' | 'claimed' | 'submitted' | 'approved' | 'rejected' | 'expired'
export type Period = 'week' | 'month' | 'all_time'
export type Plan = 'free' | 'premium'

export interface Family {
  id: string
  name: string
  timezone: string
  plan: Plan
  settings: FamilySettings
  created_at: string
  updated_at: string
}

export interface FamilySettings {
  grace_days: number
  overdue_cap: number
  cash_points_percent: number
}

export interface Profile {
  id: string
  family_id: string
  role: Role
  display_name: string
  avatar_url: string | null
  hourly_rate_cents: number | null
  total_points: number
  streak_days: number
  last_completion_date: string | null
  level: number
  badges: Badge[]
  created_at: string
  updated_at: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earned_at: string
}

export interface Chore {
  id: string
  family_id: string
  title: string
  description: string | null
  type: ChoreType
  base_points: number
  expected_duration_min: number | null
  is_recurring: boolean
  rrule: string | null
  assignee_id: string | null
  created_by: string
  active: boolean
  allow_cash_out: boolean
  created_at: string
  updated_at: string
}

export interface ChoreInstance {
  id: string
  chore_id: string
  family_id: string
  title: string
  description: string | null
  type: ChoreType
  base_points: number
  expected_duration_min: number | null
  due_at: string
  assignee_id: string | null
  status: ChoreStatus
  claimed_by: string | null
  claimed_at: string | null
  completed_at: string | null
  approved_at: string | null
  approved_by: string | null
  cash_out_requested: boolean
  minutes_reported: number | null
  points_awarded: number | null
  cash_cents: number | null
  proof_urls: string[]
  notes: string | null
  audit: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Goal {
  id: string
  family_id: string
  name: string
  description: string | null
  target_points: number
  current_points: number
  is_active: boolean
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface Approval {
  id: string
  instance_id: string
  parent_id: string
  action: 'approved' | 'rejected'
  reason: string | null
  points_awarded: number | null
  cash_cents: number | null
  created_at: string
}

export interface Notification {
  id: string
  profile_id: string
  type: 'reminder_due' | 'approval_needed' | 'streak' | 'goal_progress' | 'approved' | 'rejected' | 'level_up'
  title: string
  body: string
  payload: Record<string, any>
  read: boolean
  scheduled_at: string | null
  sent_at: string | null
  created_at: string
}

export interface Invite {
  id: string
  family_id: string
  role: Role
  code: string
  created_by: string
  max_uses: number
  uses: number
  expires_at: string
  created_at: string
}

export interface LeaderboardSnapshot {
  id: string
  family_id: string
  period: Period
  starts_on: string
  ends_on: string
  profile_id: string
  points: number
  chores_completed: number
  earliest_completion: string | null
  created_at: string
  updated_at: string
}

export interface LeaderboardEntry {
  profile: Profile
  points: number
  chores_completed: number
  rank: number
}
