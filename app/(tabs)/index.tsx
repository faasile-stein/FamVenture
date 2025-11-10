// Home screen - Dashboard view
import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { useAuthStore } from '@/store/useAuthStore'
import { useMyChores } from '@/hooks/useChores'
import { useMyRank } from '@/hooks/useLeaderboard'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Goal } from '@/types/database.types'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

export default function HomeScreen() {
  const router = useRouter()
  const profile = useAuthStore((state) => state.profile)
  const { data: myChores, isLoading: choresLoading } = useMyChores()
  const { rank, points } = useMyRank('week')

  // Get active goal
  const { data: activeGoal } = useQuery({
    queryKey: ['active-goal', profile?.family_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('family_id', profile?.family_id)
        .eq('is_active', true)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data as Goal | null
    },
    enabled: !!profile?.family_id,
  })

  const todayChores = myChores?.filter((chore) => {
    const dueDate = new Date(chore.due_at)
    const today = new Date()
    return (
      dueDate.toDateString() === today.toDateString() &&
      (chore.status === 'open' || chore.status === 'claimed')
    )
  })

  const overdueChores = myChores?.filter((chore) => {
    const dueDate = new Date(chore.due_at)
    const now = new Date()
    return dueDate < now && (chore.status === 'open' || chore.status === 'claimed')
  })

  if (choresLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* Welcome Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {profile?.display_name}! 👋</Text>
        <Text style={styles.subGreeting}>
          {profile?.role === 'parent' ? 'Managing your family' : 'Ready to earn points?'}
        </Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#007AFF' }]}>
          <Ionicons name="star" size={24} color="#fff" />
          <Text style={styles.statValue}>{profile?.total_points || 0}</Text>
          <Text style={styles.statLabel}>Total Points</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#34C759' }]}>
          <Ionicons name="flame" size={24} color="#fff" />
          <Text style={styles.statValue}>{profile?.streak_days || 0}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#FF9500' }]}>
          <Ionicons name="trophy" size={24} color="#fff" />
          <Text style={styles.statValue}>#{rank || '-'}</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#AF52DE' }]}>
          <Ionicons name="ribbon" size={24} color="#fff" />
          <Text style={styles.statValue}>Lv. {profile?.level || 1}</Text>
          <Text style={styles.statLabel}>Level</Text>
        </View>
      </View>

      {/* Family Goal */}
      {activeGoal && (
        <View style={styles.goalContainer}>
          <Text style={styles.sectionTitle}>Family Goal 🎯</Text>
          <View style={styles.goalCard}>
            <Text style={styles.goalName}>{activeGoal.name}</Text>
            {activeGoal.description && (
              <Text style={styles.goalDescription}>{activeGoal.description}</Text>
            )}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(
                        100,
                        (activeGoal.current_points / activeGoal.target_points) * 100
                      )}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {activeGoal.current_points} / {activeGoal.target_points} points
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Overdue Chores Alert */}
      {overdueChores && overdueChores.length > 0 && (
        <View style={styles.alertContainer}>
          <View style={[styles.alertCard, { backgroundColor: '#FF3B30' }]}>
            <Ionicons name="warning" size={24} color="#fff" />
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>
                {overdueChores.length} Overdue Chore{overdueChores.length > 1 ? 's' : ''}!
              </Text>
              <Text style={styles.alertText}>
                Complete them soon for bonus points
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/chores')}>
              <Ionicons name="chevron-forward" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Today's Chores */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Chores</Text>
          <TouchableOpacity onPress={() => router.push('/chores')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {todayChores && todayChores.length > 0 ? (
          todayChores.slice(0, 3).map((chore) => (
            <TouchableOpacity
              key={chore.id}
              style={styles.choreCard}
              onPress={() => router.push(`/chore/${chore.id}`)}
            >
              <View style={styles.choreIcon}>
                <Ionicons
                  name={getChoreIcon(chore.type)}
                  size={24}
                  color={getChoreColor(chore.type)}
                />
              </View>
              <View style={styles.choreInfo}>
                <Text style={styles.choreTitle}>{chore.title}</Text>
                <Text style={styles.choreDetails}>
                  {chore.base_points} points • {chore.status}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No chores for today!</Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

function getChoreIcon(type: string) {
  switch (type) {
    case 'study':
      return 'book'
    case 'household':
      return 'home'
    case 'activity':
      return 'basketball'
    default:
      return 'checkmark-circle'
  }
}

function getChoreColor(type: string) {
  switch (type) {
    case 'study':
      return '#007AFF'
    case 'household':
      return '#34C759'
    case 'activity':
      return '#AF52DE'
    default:
      return '#666'
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
  },
  statCard: {
    width: '48%',
    aspectRatio: 1.5,
    borderRadius: 12,
    padding: 16,
    margin: '1%',
    justifyContent: 'space-between',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  goalContainer: {
    padding: 16,
  },
  goalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34C759',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  alertContainer: {
    padding: 16,
    paddingTop: 0,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  alertContent: {
    flex: 1,
    marginLeft: 12,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  alertText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  choreCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  choreIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  choreInfo: {
    flex: 1,
  },
  choreTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  choreDetails: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
})
