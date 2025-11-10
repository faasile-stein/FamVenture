// Edge Function: process-recurring-chores
// Spawns new instances for recurring chores based on RRULE
// This should be called via a cron job (e.g., daily at midnight)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { RRule } from 'https://esm.sh/rrule@2.7.2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify this is called from authorized source (cron or authorized user)
    const authHeader = req.headers.get('Authorization')
    const cronSecret = req.headers.get('x-cron-secret')

    if (cronSecret !== Deno.env.get('CRON_SECRET')) {
      // Also allow authenticated service role
      if (!authHeader || !authHeader.includes(Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '')) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Get Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all active recurring chores
    const { data: recurringChores, error: choresError } = await supabaseClient
      .from('chores')
      .select('*, family:families(timezone)')
      .eq('is_recurring', true)
      .eq('active', true)
      .not('rrule', 'is', null)

    if (choresError) throw choresError

    const results = []
    const now = new Date()
    const lookAheadDays = 7 // Look ahead 7 days for spawning

    for (const chore of recurringChores || []) {
      try {
        // Parse RRULE
        const rrule = RRule.fromString(chore.rrule)

        // Get the next occurrences
        const nextOccurrences = rrule.between(
          now,
          new Date(now.getTime() + lookAheadDays * 24 * 60 * 60 * 1000),
          true
        )

        // For each occurrence, check if instance already exists
        for (const occurrence of nextOccurrences) {
          // Check if we already have an instance for this date
          const { data: existingInstances } = await supabaseClient
            .from('chore_instances')
            .select('id')
            .eq('chore_id', chore.id)
            .gte('due_at', occurrence.toISOString())
            .lt('due_at', new Date(occurrence.getTime() + 24 * 60 * 60 * 1000).toISOString())

          if (existingInstances && existingInstances.length > 0) {
            continue // Already exists
          }

          // Create new instance
          const { error: insertError } = await supabaseClient
            .from('chore_instances')
            .insert({
              chore_id: chore.id,
              family_id: chore.family_id,
              title: chore.title,
              description: chore.description,
              type: chore.type,
              base_points: chore.base_points,
              expected_duration_min: chore.expected_duration_min,
              due_at: occurrence.toISOString(),
              assignee_id: chore.assignee_id,
              status: 'open',
            })

          if (insertError) {
            console.error('Error creating instance:', insertError)
          } else {
            results.push({
              chore_id: chore.id,
              title: chore.title,
              due_at: occurrence.toISOString(),
            })
          }
        }
      } catch (error) {
        console.error(`Error processing chore ${chore.id}:`, error)
        results.push({
          chore_id: chore.id,
          error: error.message,
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: recurringChores?.length || 0,
        created: results.length,
        instances: results,
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
