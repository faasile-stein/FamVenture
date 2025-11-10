// Chores list screen
import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { useMyChores, useAvailableChores, useClaimChore } from '@/hooks/useChores'
import { useAuthStore } from '@/store/useAuthStore'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { ChoreInstance } from '@/types/database.types'

export default function ChoresScreen() {
  const router = useRouter()
  const profile = useAuthStore((state) => state.profile)
  const [filter, setFilter] = useState<'my' | 'available'>('my')

  const { data: myChores, isLoading: myChoresLoading } = useMyChores()
  const { data: availableChores, isLoading: availableLoading } = useAvailableChores()
  const claimChoreMutation = useClaimChore()

  const chores = filter === 'my' ? myChores : availableChores
  const isLoading = filter === 'my' ? myChoresLoading : availableLoading

  const handleClaimChore = async (instanceId: string) => {
    try {
      await claimChoreMutation.mutateAsync(instanceId)
    } catch (error: any) {
      alert(error.message)
    }
  }

  const renderChoreItem = ({ item }: { item: ChoreInstance }) => {
    const dueDate = new Date(item.due_at)
    const now = new Date()
    const isOverdue = dueDate < now && item.status !== 'approved'
    const canClaim = item.status === 'open' && (!item.assignee_id || item.assignee_id === profile?.id)

    return (
      <TouchableOpacity
        style={styles.choreCard}
        onPress={() => router.push(`/chore/${item.id}` as any)}
      >
        <View style={styles.choreIcon}>
          <Ionicons
            name={getChoreIcon(item.type)}
            size={28}
            color={getChoreColor(item.type)}
          />
        </View>

        <View style={styles.choreContent}>
          <Text style={styles.choreTitle}>{item.title}</Text>
          <Text style={styles.choreDetails}>
            {item.base_points} points • Due {dueDate.toLocaleDateString()}
          </Text>
          {item.description && (
            <Text style={styles.choreDescription} numberOfLines={1}>
              {item.description}
            </Text>
          )}

          {isOverdue && item.status !== 'approved' && (
            <View style={styles.overdueTag}>
              <Ionicons name="warning" size={14} color="#FF3B30" />
              <Text style={styles.overdueText}>Overdue - Bonus points!</Text>
            </View>
          )}
        </View>

        <View style={styles.choreActions}>
          {item.status === 'open' && canClaim && (
            <TouchableOpacity
              style={styles.claimButton}
              onPress={(e) => {
                e.stopPropagation()
                handleClaimChore(item.id)
              }}
            >
              <Ionicons name="hand-right" size={16} color="#fff" />
              <Text style={styles.claimButtonText}>Claim</Text>
            </TouchableOpacity>
          )}

          {item.status === 'claimed' && item.claimed_by === profile?.id && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>In Progress</Text>
            </View>
          )}

          {item.status === 'submitted' && (
            <View style={[styles.statusBadge, { backgroundColor: '#FF9500' }]}>
              <Text style={styles.statusText}>Pending</Text>
            </View>
          )}

          {item.status === 'approved' && (
            <View style={[styles.statusBadge, { backgroundColor: '#34C759' }]}>
              <Ionicons name="checkmark-circle" size={16} color="#fff" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    )
  }

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'my' && styles.filterButtonActive]}
          onPress={() => setFilter('my')}
        >
          <Text style={[styles.filterText, filter === 'my' && styles.filterTextActive]}>
            My Chores
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'available' && styles.filterButtonActive]}
          onPress={() => setFilter('available')}
        >
          <Text
            style={[styles.filterText, filter === 'available' && styles.filterTextActive]}
          >
            Available
          </Text>
        </TouchableOpacity>
      </View>

      {/* Chores List */}
      {chores && chores.length > 0 ? (
        <FlatList
          data={chores}
          keyExtractor={(item) => item.id}
          renderItem={renderChoreItem}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="list-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>
            {filter === 'my' ? 'No chores assigned to you' : 'No available chores'}
          </Text>
          <Text style={styles.emptySubtext}>
            {filter === 'my'
              ? 'Check the Available tab or wait for new chores'
              : 'All chores are claimed!'}
          </Text>
        </View>
      )}
    </View>
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
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
  },
  choreCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  choreIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  choreContent: {
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
    marginBottom: 4,
  },
  choreDescription: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  overdueTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  overdueText: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '600',
    marginLeft: 4,
  },
  choreActions: {
    justifyContent: 'center',
    marginLeft: 8,
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  statusBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
    textAlign: 'center',
  },
})
