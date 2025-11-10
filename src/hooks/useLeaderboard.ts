// Custom hooks for leaderboard data
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { LeaderboardEntry, Period, Profile } from '@/types/database.types'
import { useAuthStore } from '@/store/useAuthStore'

export function useLeaderboard(period: Period = 'week') {
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: ['leaderboard', profile?.family_id, period],
    queryFn: async () => {
      // Get the current period's start date
      const now = new Date()
      let startsOn: string

      if (period === 'week') {
        const day = now.getDay()
        const diff = now.getDate() - day + (day === 0 ? -6 : 1)
        const start = new Date(now.setDate(diff))
        start.setHours(0, 0, 0, 0)
        startsOn = start.toISOString().split('T')[0]
      } else if (period === 'month') {
        startsOn = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      } else {
        startsOn = '2000-01-01' // all-time
      }

      // Fetch leaderboard snapshot
      const { data: snapshots, error } = await supabase
        .from('leaderboard_snapshots')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('family_id', profile?.family_id)
        .eq('period', period)
        .eq('starts_on', startsOn)
        .order('points', { ascending: false })
        .order('chores_completed', { ascending: false })
        .order('earliest_completion', { ascending: true })

      if (error && error.code !== 'PGRST116') { // Ignore "no rows" error
        throw error
      }

      // If no snapshots, calculate real-time
      if (!snapshots || snapshots.length === 0) {
        return await calculateRealTimeLeaderboard(profile?.family_id || '', period)
      }

      // Map to LeaderboardEntry with ranks
      const entries: LeaderboardEntry[] = snapshots.map((snapshot: any, index: number) => ({
        profile: snapshot.profile,
        points: snapshot.points,
        chores_completed: snapshot.chores_completed,
        rank: index + 1,
      }))

      return entries
    },
    enabled: !!profile?.family_id,
  })
}

async function calculateRealTimeLeaderboard(
  familyId: string,
  period: Period
): Promise<LeaderboardEntry[]> {
  const now = new Date()
  let startDate: Date
  let endDate = now

  if (period === 'week') {
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1)
    startDate = new Date(now.setDate(diff))
    startDate.setHours(0, 0, 0, 0)
  } else if (period === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
  } else {
    startDate = new Date('2000-01-01')
  }

  // Get all approved chores in the period
  const { data: chores, error } = await supabase
    .from('chore_instances')
    .select('claimed_by, points_awarded, approved_at')
    .eq('family_id', familyId)
    .eq('status', 'approved')
    .gte('approved_at', startDate.toISOString())
    .lte('approved_at', endDate.toISOString())
    .not('points_awarded', 'is', null)

  if (error) throw error

  // Aggregate by profile
  const profileMap: Map<string, { points: number; chores: number; earliest: string | null }> = new Map()

  for (const chore of chores || []) {
    if (!chore.claimed_by) continue

    const existing = profileMap.get(chore.claimed_by) || {
      points: 0,
      chores: 0,
      earliest: null,
    }

    existing.points += chore.points_awarded || 0
    existing.chores += 1

    if (!existing.earliest || chore.approved_at < existing.earliest) {
      existing.earliest = chore.approved_at
    }

    profileMap.set(chore.claimed_by, existing)
  }

  // Get profiles
  const profileIds = Array.from(profileMap.keys())
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', profileIds)

  if (profilesError) throw profilesError

  // Create entries
  const entries: LeaderboardEntry[] = (profiles || []).map((profile: Profile) => {
    const stats = profileMap.get(profile.id)!
    return {
      profile,
      points: stats.points,
      chores_completed: stats.chores,
      rank: 0, // Will be set below
    }
  })

  // Sort and assign ranks
  entries.sort((a, b) => {
    if (a.points !== b.points) return b.points - a.points
    if (a.chores_completed !== b.chores_completed) return b.chores_completed - a.chores_completed
    return 0
  })

  entries.forEach((entry, index) => {
    entry.rank = index + 1
  })

  return entries
}

// Hook to get current user's rank
export function useMyRank(period: Period = 'week') {
  const profile = useAuthStore((state) => state.profile)
  const { data: leaderboard } = useLeaderboard(period)

  const myEntry = leaderboard?.find((entry) => entry.profile.id === profile?.id)

  return {
    rank: myEntry?.rank || null,
    points: myEntry?.points || 0,
    chores_completed: myEntry?.chores_completed || 0,
  }
}
