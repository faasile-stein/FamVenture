// Approvals screen (Parents only)
import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native'
import { usePendingApprovals, useApproveChore } from '@/hooks/useChores'
import { Ionicons } from '@expo/vector-icons'

export default function ApprovalsScreen() {
  const { data: pendingApprovals, isLoading } = usePendingApprovals()
  const approveMutation = useApproveChore()

  const handleApprove = async (instanceId: string, approve: boolean) => {
    try {
      await approveMutation.mutateAsync({ instanceId, approve })
      Alert.alert('Success', approve ? 'Chore approved!' : 'Chore rejected')
    } catch (error: any) {
      Alert.alert('Error', error.message)
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    )
  }

  const renderApprovalItem = ({ item }: { item: any }) => {
    const dueDate = new Date(item.due_at)
    const completedDate = new Date(item.completed_at)
    const daysOverdue = Math.max(
      0,
      Math.floor((completedDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
    )

    return (
      <View style={styles.approvalCard}>
        <View style={styles.cardHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              {item.claimed_by_profile?.avatar_url ? (
                <Image
                  source={{ uri: item.claimed_by_profile.avatar_url }}
                  style={styles.avatarImage}
                />
              ) : (
                <Ionicons name="person" size={24} color="#666" />
              )}
            </View>
            <View>
              <Text style={styles.userName}>
                {item.claimed_by_profile?.display_name || 'Unknown'}
              </Text>
              <Text style={styles.completedTime}>
                Completed {completedDate.toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.choreTypeIcon}>
            <Ionicons name={getChoreIcon(item.type)} size={20} color={getChoreColor(item.type)} />
          </View>
        </View>

        <Text style={styles.choreTitle}>{item.title}</Text>
        {item.description && <Text style={styles.choreDescription}>{item.description}</Text>}

        <View style={styles.choreStats}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.statText}>{item.base_points} base points</Text>
          </View>

          {daysOverdue > 0 && (
            <View style={styles.statItem}>
              <Ionicons name="warning" size={16} color="#FF9500" />
              <Text style={styles.statText}>{daysOverdue} days overdue</Text>
            </View>
          )}

          {item.cash_out_requested && (
            <View style={styles.statItem}>
              <Ionicons name="cash" size={16} color="#34C759" />
              <Text style={styles.statText}>Cash-out: {item.minutes_reported} min</Text>
            </View>
          )}
        </View>

        {item.proof_urls && item.proof_urls.length > 0 && (
          <View style={styles.proofSection}>
            <Text style={styles.proofLabel}>Proof Photos:</Text>
            <View style={styles.proofContainer}>
              {item.proof_urls.map((url: string, index: number) => (
                <Image
                  key={index}
                  source={{ uri: url }}
                  style={styles.proofImage}
                />
              ))}
            </View>
          </View>
        )}

        {item.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text style={styles.notesText}>{item.notes}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleApprove(item.id, false)}
            disabled={approveMutation.isPending}
          >
            <Ionicons name="close-circle" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Reject</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleApprove(item.id, true)}
            disabled={approveMutation.isPending}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Approve</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {pendingApprovals && pendingApprovals.length > 0 ? (
        <>
          <View style={styles.header}>
            <Text style={styles.headerText}>
              {pendingApprovals.length} pending approval{pendingApprovals.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <FlatList
            data={pendingApprovals}
            keyExtractor={(item) => item.id}
            renderItem={renderApprovalItem}
            contentContainerStyle={styles.listContent}
          />
        </>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-done-circle" size={64} color="#34C759" />
          <Text style={styles.emptyText}>All caught up!</Text>
          <Text style={styles.emptySubtext}>No chores waiting for approval</Text>
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
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  listContent: {
    padding: 16,
  },
  approvalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  completedTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  choreTypeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  choreTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  choreDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  choreStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  statText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  proofSection: {
    marginTop: 12,
  },
  proofLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  proofContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  proofImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  notesSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
  },
  approveButton: {
    backgroundColor: '#34C759',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
})
