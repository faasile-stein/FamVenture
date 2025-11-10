// Profile screen
import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native'
import { useAuthStore } from '@/store/useAuthStore'
import { supabase } from '@/lib/supabase'
import { Ionicons } from '@expo/vector-icons'

export default function ProfileScreen() {
  const { profile, signOut } = useAuthStore()

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut()
          signOut()
        },
      },
    ])
  }

  if (!profile) {
    return null
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {profile.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar}>
              <Ionicons name="person" size={48} color="#fff" />
            </View>
          )}
          <TouchableOpacity style={styles.editAvatarButton}>
            <Ionicons name="camera" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.displayName}>{profile.display_name}</Text>
        <Text style={styles.role}>
          {profile.role === 'parent' ? '👨‍👩‍👧‍👦 Parent' : '👦 Child'}
        </Text>
      </View>

      {/* Stats Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Stats</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Ionicons name="star" size={28} color="#FFD700" />
            <Text style={styles.statValue}>{profile.total_points}</Text>
            <Text style={styles.statLabel}>Total Points</Text>
          </View>

          <View style={styles.statBox}>
            <Ionicons name="flame" size={28} color="#FF9500" />
            <Text style={styles.statValue}>{profile.streak_days}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>

          <View style={styles.statBox}>
            <Ionicons name="ribbon" size={28} color="#AF52DE" />
            <Text style={styles.statValue}>Level {profile.level}</Text>
            <Text style={styles.statLabel}>Current Level</Text>
          </View>

          <View style={styles.statBox}>
            <Ionicons name="trophy" size={28} color="#007AFF" />
            <Text style={styles.statValue}>{profile.badges?.length || 0}</Text>
            <Text style={styles.statLabel}>Badges Earned</Text>
          </View>
        </View>
      </View>

      {/* Badges Section */}
      {profile.badges && profile.badges.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Badges</Text>
          <View style={styles.badgesContainer}>
            {profile.badges.map((badge, index) => (
              <View key={index} style={styles.badgeItem}>
                <View style={styles.badgeIcon}>
                  <Text style={styles.badgeEmoji}>{badge.icon}</Text>
                </View>
                <Text style={styles.badgeName}>{badge.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>

        {profile.role === 'parent' && (
          <>
            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="people" size={24} color="#007AFF" />
              <Text style={styles.menuText}>Manage Family</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="add-circle" size={24} color="#007AFF" />
              <Text style={styles.menuText}>Create Chore</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="trophy" size={24} color="#007AFF" />
              <Text style={styles.menuText}>Family Goal</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="card" size={24} color="#007AFF" />
              <Text style={styles.menuText}>Plan & Billing</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="notifications" size={24} color="#007AFF" />
          <Text style={styles.menuText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="settings" size={24} color="#007AFF" />
          <Text style={styles.menuText}>Preferences</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* Sign Out */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out" size={24} color="#FF3B30" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>FamVenture v1.0.0</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  statBox: {
    width: '50%',
    alignItems: 'center',
    padding: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badgeItem: {
    width: '33.33%',
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeEmoji: {
    fontSize: 30,
  },
  badgeName: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  signOutText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    padding: 32,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
})
