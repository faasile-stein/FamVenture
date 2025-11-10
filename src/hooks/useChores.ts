// Custom hooks for chore management using TanStack Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { ChoreInstance, ChoreStatus } from '@/types/database.types'
import { useAuthStore } from '@/store/useAuthStore'

// Fetch chore instances for the current user's family
export function useChoreInstances(status?: ChoreStatus) {
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: ['chore-instances', profile?.family_id, status],
    queryFn: async () => {
      let query = supabase
        .from('chore_instances')
        .select('*')
        .eq('family_id', profile?.family_id)
        .order('due_at', { ascending: true })

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query

      if (error) throw error
      return data as ChoreInstance[]
    },
    enabled: !!profile?.family_id,
  })
}

// Fetch my chores (assigned or claimed by me)
export function useMyChores(status?: ChoreStatus) {
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: ['my-chores', profile?.id, status],
    queryFn: async () => {
      let query = supabase
        .from('chore_instances')
        .select('*')
        .eq('family_id', profile?.family_id)
        .or(`assignee_id.eq.${profile?.id},claimed_by.eq.${profile?.id}`)
        .order('due_at', { ascending: true })

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query

      if (error) throw error
      return data as ChoreInstance[]
    },
    enabled: !!profile?.id,
  })
}

// Fetch available chores (open, unassigned or assigned to me)
export function useAvailableChores() {
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: ['available-chores', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chore_instances')
        .select('*')
        .eq('family_id', profile?.family_id)
        .eq('status', 'open')
        .or(`assignee_id.is.null,assignee_id.eq.${profile?.id}`)
        .order('due_at', { ascending: true })

      if (error) throw error
      return data as ChoreInstance[]
    },
    enabled: !!profile?.id,
  })
}

// Fetch pending approvals (for parents)
export function usePendingApprovals() {
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: ['pending-approvals', profile?.family_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chore_instances')
        .select(`
          *,
          claimed_by_profile:profiles!chore_instances_claimed_by_fkey(*)
        `)
        .eq('family_id', profile?.family_id)
        .eq('status', 'submitted')
        .order('completed_at', { ascending: true })

      if (error) throw error
      return data
    },
    enabled: !!profile?.family_id && profile?.role === 'parent',
  })
}

// Claim a chore
export function useClaimChore() {
  const queryClient = useQueryClient()
  const profile = useAuthStore((state) => state.profile)

  return useMutation({
    mutationFn: async (instanceId: string) => {
      const { data, error } = await supabase
        .from('chore_instances')
        .update({
          status: 'claimed',
          claimed_by: profile?.id,
          claimed_at: new Date().toISOString(),
        })
        .eq('id', instanceId)
        .eq('status', 'open')
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chore-instances'] })
      queryClient.invalidateQueries({ queryKey: ['my-chores'] })
      queryClient.invalidateQueries({ queryKey: ['available-chores'] })
    },
  })
}

// Submit a chore for approval
export function useSubmitChore() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      instanceId,
      proofUrls,
      notes,
      cashOutRequested,
      minutesReported,
    }: {
      instanceId: string
      proofUrls?: string[]
      notes?: string
      cashOutRequested?: boolean
      minutesReported?: number
    }) => {
      const { data, error } = await supabase
        .from('chore_instances')
        .update({
          status: 'submitted',
          completed_at: new Date().toISOString(),
          proof_urls: proofUrls || [],
          notes: notes || null,
          cash_out_requested: cashOutRequested || false,
          minutes_reported: minutesReported || null,
        })
        .eq('id', instanceId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chore-instances'] })
      queryClient.invalidateQueries({ queryKey: ['my-chores'] })
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] })
    },
  })
}

// Approve or reject a chore (calls edge function)
export function useApproveChore() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      instanceId,
      approve,
      reason,
      overridePoints,
      overrideCashCents,
    }: {
      instanceId: string
      approve: boolean
      reason?: string
      overridePoints?: number
      overrideCashCents?: number
    }) => {
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/approve-chore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          instanceId,
          approve,
          reason,
          overridePoints,
          overrideCashCents,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to process approval')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chore-instances'] })
      queryClient.invalidateQueries({ queryKey: ['my-chores'] })
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] })
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
