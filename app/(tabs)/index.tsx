// Home screen - Dashboard view (Notion-quality refactored)
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { useMyChores } from '@/hooks/useChores';
import { useMyRank } from '@/hooks/useLeaderboard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Goal } from '@/types/database.types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  StatCard,
  Card,
  Badge,
  EmptyState,
  SkeletonStatCard,
  SkeletonCard,
} from '@/components';
import { colors, spacing, textStyles, useThemedColors, getChoreTypeColor } from '@/theme';
import * as Haptics from 'expo-haptics';

export default function HomeScreen() {
  const router = useRouter();
  const themedColors = useThemedColors();
  const profile = useAuthStore((state) => state.profile);
  const { data: myChores, isLoading: choresLoading } = useMyChores();
  const { rank, points } = useMyRank('week');

  // Get active goal
  const { data: activeGoal } = useQuery({
    queryKey: ['active-goal', profile?.family_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('family_id', profile?.family_id)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as Goal | null;
    },
    enabled: !!profile?.family_id,
  });

  const todayChores = myChores?.filter((chore) => {
    const dueDate = new Date(chore.due_at);
    const today = new Date();
    return (
      dueDate.toDateString() === today.toDateString() &&
      (chore.status === 'open' || chore.status === 'claimed')
    );
  });

  const overdueChores = myChores?.filter((chore) => {
    const dueDate = new Date(chore.due_at);
    const now = new Date();
    return dueDate < now && (chore.status === 'open' || chore.status === 'claimed');
  });

  const getChoreIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      study: 'book',
      household: 'home',
      activity: 'basketball',
    };
    return iconMap[type] || 'checkmark-circle';
  };

  const handleChorePress = async (choreId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/chore/${choreId}`);
  };

  const handleNavigateToChores = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/chores');
  };

  if (choresLoading) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: themedColors.background }]}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Skeleton */}
        <View style={[styles.header, { backgroundColor: themedColors.surface.card }]}>
          <SkeletonCard />
        </View>

        {/* Stats Skeleton */}
        <View style={styles.statsContainer}>
          <SkeletonStatCard style={styles.statCardWrapper} />
          <SkeletonStatCard style={styles.statCardWrapper} />
          <SkeletonStatCard style={styles.statCardWrapper} />
          <SkeletonStatCard style={styles.statCardWrapper} />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themedColors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Welcome Header */}
      <View style={[styles.header, { backgroundColor: themedColors.surface.card }]}>
        <Text style={[textStyles.displaySmall, { color: themedColors.text.primary }]}>
          Hello, {profile?.display_name}! 👋
        </Text>
        <Text style={[textStyles.bodyLarge, { color: themedColors.text.secondary, marginTop: spacing.xs }]}>
          {profile?.role === 'parent' ? 'Managing your family' : 'Ready to earn points?'}
        </Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCardWrapper}>
          <StatCard
            icon="star"
            iconColor={colors.gold}
            value={profile?.total_points || 0}
            label="Total Points"
            animate={true}
            testID="stat-total-points"
          />
        </View>

        <View style={styles.statCardWrapper}>
          <StatCard
            icon="flame"
            iconColor={colors.warning[500]}
            value={profile?.streak_days || 0}
            label="Day Streak"
            animate={true}
            testID="stat-streak"
          />
        </View>

        <View style={styles.statCardWrapper}>
          <StatCard
            icon="trophy"
            iconColor={colors.warning[500]}
            value={rank ? `#${rank}` : '-'}
            label="This Week"
            animate={true}
            testID="stat-rank"
          />
        </View>

        <View style={styles.statCardWrapper}>
          <StatCard
            icon="ribbon"
            iconColor={colors.purple[500]}
            value={`Lv. ${profile?.level || 1}`}
            label="Level"
            animate={true}
            testID="stat-level"
          />
        </View>
      </View>

      {/* Family Goal */}
      {activeGoal && (
        <View style={styles.section}>
          <Text style={[textStyles.h3, { color: themedColors.text.primary, marginBottom: spacing.md }]}>
            Family Goal 🎯
          </Text>
          <Card variant="elevated" testID="family-goal-card">
            <Text style={[textStyles.h4, { color: themedColors.text.primary }]}>
              {activeGoal.name}
            </Text>
            {activeGoal.description && (
              <Text
                style={[
                  textStyles.body,
                  { color: themedColors.text.secondary, marginTop: spacing.xs },
                ]}
              >
                {activeGoal.description}
              </Text>
            )}
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  { backgroundColor: themedColors.backgroundTertiary },
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(
                        100,
                        (activeGoal.current_points / activeGoal.target_points) * 100
                      )}%`,
                      backgroundColor: colors.success[500],
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  textStyles.label,
                  { color: themedColors.text.secondary, textAlign: 'center' },
                ]}
              >
                {activeGoal.current_points} / {activeGoal.target_points} points
              </Text>
            </View>
          </Card>
        </View>
      )}

      {/* Overdue Chores Alert */}
      {overdueChores && overdueChores.length > 0 && (
        <View style={styles.section}>
          <TouchableOpacity
            onPress={handleNavigateToChores}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`${overdueChores.length} overdue chores`}
          >
            <View
              style={[
                styles.alertCard,
                { backgroundColor: colors.error[500], ...themedColors.shadow.md },
              ]}
            >
              <Ionicons name="warning" size={spacing.icon.lg} color="#FFFFFF" />
              <View style={styles.alertContent}>
                <Text style={[textStyles.h4, { color: '#FFFFFF' }]}>
                  {overdueChores.length} Overdue Chore{overdueChores.length > 1 ? 's' : ''}!
                </Text>
                <Text style={[textStyles.body, { color: '#FFFFFF', opacity: 0.9 }]}>
                  Complete them soon for bonus points
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={spacing.icon.md} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Today's Chores */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[textStyles.h3, { color: themedColors.text.primary }]}>Today's Chores</Text>
          <TouchableOpacity
            onPress={handleNavigateToChores}
            accessibilityRole="button"
            accessibilityLabel="See all chores"
          >
            <Text style={[textStyles.label, { color: colors.primary[500] }]}>See All</Text>
          </TouchableOpacity>
        </View>

        {todayChores && todayChores.length > 0 ? (
          todayChores.slice(0, 3).map((chore) => (
            <Card
              key={chore.id}
              onPress={() => handleChorePress(chore.id)}
              variant="elevated"
              padding="base"
              style={{ marginBottom: spacing.md }}
              testID={`chore-card-${chore.id}`}
            >
              <View style={styles.choreCardContent}>
                <View
                  style={[
                    styles.choreIcon,
                    {
                      backgroundColor: `${getChoreTypeColor(chore.type)}20`,
                    },
                  ]}
                >
                  <Ionicons
                    name={getChoreIcon(chore.type)}
                    size={spacing.icon.md}
                    color={getChoreTypeColor(chore.type)}
                  />
                </View>
                <View style={styles.choreInfo}>
                  <Text style={[textStyles.h4, { color: themedColors.text.primary }]}>
                    {chore.title}
                  </Text>
                  <View style={styles.choreMetaRow}>
                    <Badge
                      label={`${chore.base_points} pts`}
                      variant="primary"
                      size="small"
                      icon="star"
                    />
                    <Badge
                      label={chore.status}
                      variant={chore.status === 'claimed' ? 'warning' : 'neutral'}
                      size="small"
                      style={{ marginLeft: spacing.sm }}
                    />
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={spacing.icon.sm}
                  color={themedColors.text.disabled}
                />
              </View>
            </Card>
          ))
        ) : (
          <EmptyState
            icon="checkmark-circle"
            iconColor={colors.success[500]}
            title="No chores for today!"
            message="You're all caught up. Great job!"
            testID="empty-today-chores"
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing['3xl'],
  },
  header: {
    padding: spacing.sectionPadding,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.md,
  },
  statCardWrapper: {
    width: '48%',
    margin: '1%',
  },
  section: {
    padding: spacing.base,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressContainer: {
    marginTop: spacing.md,
  },
  progressBar: {
    height: 8,
    borderRadius: spacing.radius.md,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    borderRadius: spacing.radius.lg,
  },
  alertContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  choreCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  choreIcon: {
    width: spacing.icon['2xl'] + spacing.md,
    height: spacing.icon['2xl'] + spacing.md,
    borderRadius: (spacing.icon['2xl'] + spacing.md) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  choreInfo: {
    flex: 1,
  },
  choreMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
});
