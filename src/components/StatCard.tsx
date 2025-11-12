/**
 * StatCard Component - Notion-quality stat display card
 * Features: Icon, value, label, trend indicator, animations
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { Card } from './Card';
import { colors, spacing, textStyles } from '../theme';
import { useThemedColors } from '../theme';

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  value: string | number;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  onPress?: () => void;
  animate?: boolean;
  testID?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  iconColor,
  value,
  label,
  trend,
  trendValue,
  onPress,
  animate = true,
  testID,
}) => {
  const themedColors = useThemedColors();
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (animate) {
      scale.value = withSpring(1, { damping: 12, stiffness: 100 });
      opacity.value = withSpring(1, { damping: 12 });
    } else {
      scale.value = 1;
      opacity.value = 1;
    }
  }, [animate]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const getTrendIcon = () => {
    if (!trend) return null;
    const iconMap = {
      up: 'trending-up' as keyof typeof Ionicons.glyphMap,
      down: 'trending-down' as keyof typeof Ionicons.glyphMap,
      neutral: 'remove' as keyof typeof Ionicons.glyphMap,
    };
    return iconMap[trend];
  };

  const getTrendColor = () => {
    if (!trend) return themedColors.text.secondary;
    const colorMap = {
      up: colors.success[500],
      down: colors.error[500],
      neutral: themedColors.text.secondary,
    };
    return colorMap[trend];
  };

  return (
    <Animated.View style={animatedStyle}>
      <Card onPress={onPress} variant="elevated" testID={testID}>
        <View style={styles.container}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
            <Ionicons name={icon} size={spacing.icon.md} color={iconColor} />
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text
              style={[textStyles.h2, { color: themedColors.text.primary }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {value}
            </Text>
            <Text style={[textStyles.label, { color: themedColors.text.secondary, marginTop: spacing.xs }]}>
              {label}
            </Text>

            {/* Trend */}
            {trend && trendValue && (
              <View style={styles.trendContainer}>
                <Ionicons name={getTrendIcon()!} size={spacing.icon.xs} color={getTrendColor()} />
                <Text style={[textStyles.caption, { color: getTrendColor(), marginLeft: spacing.xs }]}>
                  {trendValue}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: spacing.icon['2xl'],
    height: spacing.icon['2xl'],
    borderRadius: spacing.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
});
