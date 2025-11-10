// Leaderboard screen
import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useAuthStore } from '@/store/useAuthStore'
import { Period } from '@/types/database.types'
import { Ionicons } from '@expo/vector-icons'

export default function LeaderboardScreen() {
  const [period, setPeriod] = useState<Period>('week')
  const { data: leaderboard, isLoading } = useLeaderboard(period)
  const profile = useAuthStore((state) => state.profile)

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Period Selector */}
      <View style={styles.periodSelector}>
        <TouchableOpacity
          style={[styles.periodButton, period === 'week' && styles.periodButtonActive]}
          onPress={() => setPeriod('week')}
        >
          <Text
            style={[styles.periodText, period === 'week' && styles.periodTextActive]}
          >
            Week
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodButton, period === 'month' && styles.periodButtonActive]}
          onPress={() => setPeriod('month')}
        >
          <Text
            style={[styles.periodText, period === 'month' && styles.periodTextActive]}
          >
            Month
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.periodButton,
            period === 'all_time' && styles.periodButtonActive,
          ]}
          onPress={() => setPeriod('all_time')}
        >
          <Text
            style={[styles.periodText, period === 'all_time' && styles.periodTextActive]}
          >
            All Time
          </Text>
        </TouchableOpacity>
      </View>

      {/* Leaderboard List */}
      {leaderboard && leaderboard.length > 0 ? (
        <FlatList
          data={leaderboard}
          keyExtractor={(item) => item.profile.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            leaderboard.length >= 3 ? (
              <View style={styles.podium}>
                {/* Second Place */}
                {leaderboard[1] && (
                  <View style={styles.podiumPlace}>
                    <View style={[styles.podiumAvatar, styles.secondPlace]}>
                      {leaderboard[1].profile.avatar_url ? (
                        <Image
                          source={{ uri: leaderboard[1].profile.avatar_url }}
                          style={styles.avatarImage}
                        />
                      ) : (
                        <Ionicons name="person" size={32} color="#fff" />
                      )}
                      <View style={[styles.rankBadge, { backgroundColor: '#C0C0C0' }]}>
                        <Text style={styles.rankBadgeText}>2</Text>
                      </View>
                    </View>
                    <Text style={styles.podiumName} numberOfLines={1}>
                      {leaderboard[1].profile.display_name}
                    </Text>
                    <Text style={styles.podiumPoints}>{leaderboard[1].points} pts</Text>
                  </View>
                )}

                {/* First Place */}
                {leaderboard[0] && (
                  <View style={[styles.podiumPlace, styles.firstPlaceContainer]}>
                    <Ionicons
                      name="trophy"
                      size={24}
                      color="#FFD700"
                      style={styles.crownIcon}
                    />
                    <View style={[styles.podiumAvatar, styles.firstPlace]}>
                      {leaderboard[0].profile.avatar_url ? (
                        <Image
                          source={{ uri: leaderboard[0].profile.avatar_url }}
                          style={styles.avatarImage}
                        />
                      ) : (
                        <Ionicons name="person" size={40} color="#fff" />
                      )}
                      <View style={[styles.rankBadge, { backgroundColor: '#FFD700' }]}>
                        <Text style={styles.rankBadgeText}>1</Text>
                      </View>
                    </View>
                    <Text style={[styles.podiumName, styles.firstPlaceName]} numberOfLines={1}>
                      {leaderboard[0].profile.display_name}
                    </Text>
                    <Text style={[styles.podiumPoints, styles.firstPlacePoints]}>
                      {leaderboard[0].points} pts
                    </Text>
                  </View>
                )}

                {/* Third Place */}
                {leaderboard[2] && (
                  <View style={styles.podiumPlace}>
                    <View style={[styles.podiumAvatar, styles.thirdPlace]}>
                      {leaderboard[2].profile.avatar_url ? (
                        <Image
                          source={{ uri: leaderboard[2].profile.avatar_url }}
                          style={styles.avatarImage}
                        />
                      ) : (
                        <Ionicons name="person" size={32} color="#fff" />
                      )}
                      <View style={[styles.rankBadge, { backgroundColor: '#CD7F32' }]}>
                        <Text style={styles.rankBadgeText}>3</Text>
                      </View>
                    </View>
                    <Text style={styles.podiumName} numberOfLines={1}>
                      {leaderboard[2].profile.display_name}
                    </Text>
                    <Text style={styles.podiumPoints}>{leaderboard[2].points} pts</Text>
                  </View>
                )}
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            // Skip first 3 as they're in podium
            if (item.rank <= 3) return null

            const isMe = item.profile.id === profile?.id

            return (
              <View style={[styles.rankCard, isMe && styles.myRankCard]}>
                <View style={styles.rankNumber}>
                  <Text style={styles.rankText}>#{item.rank}</Text>
                </View>

                <View style={styles.rankAvatar}>
                  {item.profile.avatar_url ? (
                    <Image
                      source={{ uri: item.profile.avatar_url }}
                      style={styles.smallAvatarImage}
                    />
                  ) : (
                    <Ionicons name="person" size={24} color="#666" />
                  )}
                </View>

                <View style={styles.rankInfo}>
                  <Text style={styles.rankName}>{item.profile.display_name}</Text>
                  <Text style={styles.rankDetails}>
                    {item.chores_completed} chore{item.chores_completed !== 1 ? 's' : ''}
                  </Text>
                </View>

                <View style={styles.rankPoints}>
                  <Text style={styles.rankPointsText}>{item.points}</Text>
                  <Text style={styles.rankPointsLabel}>pts</Text>
                </View>
              </View>
            )
          }}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="trophy-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No rankings yet</Text>
          <Text style={styles.emptySubtext}>Complete chores to get on the board!</Text>
        </View>
      )}
    </View>
  )
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
  periodSelector: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#007AFF',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  periodTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingBottom: 20,
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: 20,
    backgroundColor: '#fff',
  },
  podiumPlace: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 100,
  },
  firstPlaceContainer: {
    marginBottom: 20,
  },
  podiumAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  firstPlace: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  secondPlace: {
    borderWidth: 3,
    borderColor: '#C0C0C0',
  },
  thirdPlace: {
    borderWidth: 3,
    borderColor: '#CD7F32',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  smallAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  crownIcon: {
    position: 'absolute',
    top: -10,
    zIndex: 1,
  },
  rankBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  rankBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  podiumName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  firstPlaceName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  podiumPoints: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  firstPlacePoints: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
  },
  rankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  myRankCard: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  rankNumber: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  rankAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankInfo: {
    flex: 1,
  },
  rankName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  rankDetails: {
    fontSize: 14,
    color: '#666',
  },
  rankPoints: {
    alignItems: 'flex-end',
  },
  rankPointsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  rankPointsLabel: {
    fontSize: 12,
    color: '#666',
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
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
  },
})
