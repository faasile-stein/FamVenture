// Edge Function: check-time-estimate
// Validates reported time against expected duration using heuristics
// Can be upgraded to use AI model later

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

interface TimeCheckRequest {
  instanceId: string
  reportedMinutes: number
}

interface TimeCheckResponse {
  status: 'ok' | 'high' | 'low'
  message: string
  suggestedMinutes?: number
  confidence: number
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

    // Parse request
    const body: TimeCheckRequest = await req.json()
    const { instanceId, reportedMinutes } = body

    // Get the chore instance
    const { data: instance, error: instanceError } = await supabaseClient
      .from('chore_instances')
      .select('*, chore:chores(expected_duration_min)')
      .eq('id', instanceId)
      .single()

    if (instanceError || !instance) {
      return new Response(
        JSON.stringify({ error: 'Chore instance not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const expectedMinutes = instance.expected_duration_min || instance.chore?.expected_duration_min

    if (!expectedMinutes) {
      return new Response(
        JSON.stringify({
          status: 'ok',
          message: 'No expected duration set for this chore',
          confidence: 0,
        } as TimeCheckResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get historical data for this chore type and user
    const { data: historicalInstances } = await supabaseClient
      .from('chore_instances')
      .select('minutes_reported, chore_id')
      .eq('claimed_by', user.id)
      .eq('chore_id', instance.chore_id)
      .eq('status', 'approved')
      .not('minutes_reported', 'is', null)
      .order('approved_at', { ascending: false })
      .limit(10)

    // Calculate reasonable bounds
    const minReasonable = expectedMinutes * 0.5 // 50% of expected
    const maxReasonable = expectedMinutes * 2.5 // 250% of expected

    let result: TimeCheckResponse

    if (reportedMinutes < minReasonable) {
      // Too fast
      result = {
        status: 'low',
        message: `This seems faster than expected. Expected around ${expectedMinutes} minutes.`,
        suggestedMinutes: Math.round(expectedMinutes * 0.8),
        confidence: 0.7,
      }
    } else if (reportedMinutes > maxReasonable) {
      // Too slow
      result = {
        status: 'high',
        message: `This seems longer than expected. Expected around ${expectedMinutes} minutes.`,
        suggestedMinutes: Math.round(expectedMinutes * 1.5),
        confidence: 0.7,
      }
    } else {
      // Within reasonable bounds
      result = {
        status: 'ok',
        message: 'Time reported looks reasonable',
        confidence: 0.8,
      }
    }

    // Adjust confidence based on historical data
    if (historicalInstances && historicalInstances.length > 0) {
      const historicalMedian = calculateMedian(
        historicalInstances.map((i) => i.minutes_reported).filter((m) => m !== null)
      )

      if (historicalMedian) {
        const deviation = Math.abs(reportedMinutes - historicalMedian) / historicalMedian

        if (deviation < 0.3) {
          // Within 30% of personal history
          result.confidence = Math.min(1, result.confidence + 0.2)
          result.message += ' (consistent with your history)'
        } else if (deviation > 1) {
          // More than 100% deviation from history
          result.confidence = Math.max(0.3, result.confidence - 0.2)
          result.message += ' (differs from your usual time)'
        }
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function calculateMedian(numbers: number[]): number | null {
  if (numbers.length === 0) return null

  const sorted = [...numbers].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2
  } else {
    return sorted[middle]
  }
}
