// Edge Function: update-leaderboard
// Calculates and updates leaderboard snapshots for all families

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

interface LeaderboardEntry {
  profile_id: string
  points: number
  chores_completed: number
  earliest_completion: string | null
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all families
    const { data: families, error: familiesError } = await supabaseClient
      .from('families')
      .select('id')

    if (familiesError) throw familiesError

    const results = []

    for (const family of families) {
      // Calculate weekly leaderboard
      const weekStart = getStartOfWeek()
      const weekEnd = getEndOfWeek()

      const weeklyData = await calculateLeaderboard(
        supabaseClient,
        family.id,
        weekStart,
        weekEnd,
        'week'
      )
      results.push({ family: family.id, period: 'week', entries: weeklyData.length })

      // Calculate monthly leaderboard
      const monthStart = getStartOfMonth()
      const monthEnd = getEndOfMonth()

      const monthlyData = await calculateLeaderboard(
        supabaseClient,
        family.id,
        monthStart,
        monthEnd,
        'month'
      )
      results.push({ family: family.id, period: 'month', entries: monthlyData.length })

      // All-time is already tracked in profiles.total_points
      // But we can still create snapshots for consistency
      const allTimeData = await calculateLeaderboard(
        supabaseClient,
        family.id,
        new Date('2000-01-01'),
        new Date(),
        'all_time'
      )
      results.push({ family: family.id, period: 'all_time', entries: allTimeData.length })
    }

    return new Response(
      JSON.stringify({ success: true, processed: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function calculateLeaderboard(
  supabase: any,
  familyId: string,
  startDate: Date,
  endDate: Date,
  period: 'week' | 'month' | 'all_time'
): Promise<LeaderboardEntry[]> {
  // Query approved chores in the date range
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
  const profileMap: Map<string, LeaderboardEntry> = new Map()

  for (const chore of chores || []) {
    if (!chore.claimed_by) continue

    const existing = profileMap.get(chore.claimed_by) || {
      profile_id: chore.claimed_by,
      points: 0,
      chores_completed: 0,
      earliest_completion: null,
    }

    existing.points += chore.points_awarded || 0
    existing.chores_completed += 1

    if (!existing.earliest_completion || chore.approved_at < existing.earliest_completion) {
      existing.earliest_completion = chore.approved_at
    }

    profileMap.set(chore.claimed_by, existing)
  }

  const entries = Array.from(profileMap.values())

  // Upsert into leaderboard_snapshots
  for (const entry of entries) {
    await supabase
      .from('leaderboard_snapshots')
      .upsert(
        {
          family_id: familyId,
          period,
          starts_on: startDate.toISOString().split('T')[0],
          ends_on: endDate.toISOString().split('T')[0],
          profile_id: entry.profile_id,
          points: entry.points,
          chores_completed: entry.chores_completed,
          earliest_completion: entry.earliest_completion,
        },
        {
          onConflict: 'family_id,period,starts_on,profile_id',
        }
      )
  }

  return entries
}

function getStartOfWeek(): Date {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Sunday
  const start = new Date(now.setDate(diff))
  start.setHours(0, 0, 0, 0)
  return start
}

function getEndOfWeek(): Date {
  const start = getStartOfWeek()
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}

function getStartOfMonth(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
}

function getEndOfMonth(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
}
