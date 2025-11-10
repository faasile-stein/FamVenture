// Edge Function: approve-chore
// Handles chore approval with overdue bonus calculation and reward distribution

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

interface ApprovalRequest {
  instanceId: string
  approve: boolean
  reason?: string
  overridePoints?: number
  overrideCashCents?: number
}

interface FamilySettings {
  grace_days: number
  overdue_cap: number
  cash_points_percent: number
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const body: ApprovalRequest = await req.json()
    const { instanceId, approve, reason, overridePoints, overrideCashCents } = body

    // Get the chore instance with all related data
    const { data: instance, error: instanceError } = await supabaseClient
      .from('chore_instances')
      .select(`
        *,
        chore:chores(*),
        family:families(*)
      `)
      .eq('id', instanceId)
      .single()

    if (instanceError || !instance) {
      return new Response(
        JSON.stringify({ error: 'Chore instance not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify user is a parent in this family
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role, family_id')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'parent' || profile.family_id !== instance.family_id) {
      return new Response(
        JSON.stringify({ error: 'Only parents can approve chores' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if already approved/rejected
    if (instance.status === 'approved' || instance.status === 'rejected') {
      return new Response(
        JSON.stringify({ error: 'Chore already processed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If rejecting, just update status
    if (!approve) {
      const { error: updateError } = await supabaseClient
        .from('chore_instances')
        .update({
          status: 'rejected',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', instanceId)

      if (updateError) throw updateError

      // Create approval record
      await supabaseClient.from('approvals').insert({
        instance_id: instanceId,
        parent_id: user.id,
        action: 'rejected',
        reason: reason || null,
      })

      // Create notification for the child
      if (instance.claimed_by) {
        await supabaseClient.from('notifications').insert({
          profile_id: instance.claimed_by,
          type: 'rejected',
          title: 'Chore Rejected',
          body: `Your chore "${instance.title}" was not approved${reason ? ': ' + reason : ''}`,
          payload: { instance_id: instanceId, reason },
        })
      }

      return new Response(
        JSON.stringify({ success: true, action: 'rejected' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // APPROVAL LOGIC
    const settings: FamilySettings = instance.family.settings
    const graceDays = settings.grace_days || 3
    const overdueCapMultiplier = settings.overdue_cap || 2.0

    let pointsAwarded = 0
    let cashCents = 0

    // Calculate cash-out or points
    if (instance.cash_out_requested && instance.minutes_reported) {
      // Cash-out mode
      const { data: claimantProfile } = await supabaseClient
        .from('profiles')
        .select('hourly_rate_cents')
        .eq('id', instance.claimed_by)
        .single()

      if (claimantProfile?.hourly_rate_cents) {
        cashCents = overrideCashCents ?? Math.round(
          (claimantProfile.hourly_rate_cents / 60) * instance.minutes_reported
        )

        // Optionally award some points with cash (based on family settings)
        const cashPointsPercent = settings.cash_points_percent || 0
        if (cashPointsPercent > 0) {
          pointsAwarded = Math.floor(instance.base_points * (cashPointsPercent / 100))
        }
      }
    } else {
      // Points mode - calculate with overdue bonus
      const dueAt = new Date(instance.due_at)
      const approvedAt = new Date()
      const overdueDays = Math.max(
        0,
        Math.floor((approvedAt.getTime() - dueAt.getTime()) / (1000 * 60 * 60 * 24))
      )

      const multiplier = 1 + Math.min(overdueCapMultiplier - 1, overdueDays / graceDays)
      pointsAwarded = overridePoints ?? Math.floor(instance.base_points * multiplier)

      // Store audit info
      const audit = {
        overdue_days: overdueDays,
        multiplier: multiplier,
        grace_days: graceDays,
        cap: overdueCapMultiplier,
        calculated_points: Math.floor(instance.base_points * multiplier),
        override_applied: !!overridePoints,
      }

      // Update instance with audit trail
      await supabaseClient
        .from('chore_instances')
        .update({ audit })
        .eq('id', instanceId)
    }

    // Update chore instance to approved
    const { error: updateError } = await supabaseClient
      .from('chore_instances')
      .update({
        status: 'approved',
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        points_awarded: pointsAwarded > 0 ? pointsAwarded : null,
        cash_cents: cashCents > 0 ? cashCents : null,
      })
      .eq('id', instanceId)

    if (updateError) throw updateError

    // Create approval record
    await supabaseClient.from('approvals').insert({
      instance_id: instanceId,
      parent_id: user.id,
      action: 'approved',
      reason: reason || null,
      points_awarded: pointsAwarded > 0 ? pointsAwarded : null,
      cash_cents: cashCents > 0 ? cashCents : null,
    })

    // Create notification for the child
    if (instance.claimed_by) {
      const rewardText = cashCents > 0
        ? `$${(cashCents / 100).toFixed(2)}`
        : `${pointsAwarded} points`

      await supabaseClient.from('notifications').insert({
        profile_id: instance.claimed_by,
        type: 'approved',
        title: 'Chore Approved! 🎉',
        body: `Your chore "${instance.title}" was approved! You earned ${rewardText}`,
        payload: {
          instance_id: instanceId,
          points_awarded: pointsAwarded,
          cash_cents: cashCents,
        },
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        action: 'approved',
        points_awarded: pointsAwarded,
        cash_cents: cashCents,
      }),
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
