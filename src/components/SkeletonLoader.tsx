/**
 * SkeletonLoader Component - Notion-quality loading placeholder
 * Features: Smooth shimmer animation, customizable shapes
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { spacing } from '../theme';
import { useThemedColors } from '../theme';

type SkeletonShape = 'rect' | 'circle' | 'text';

interface SkeletonLoaderProps {
  shape?: SkeletonShape;
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  shape = 'rect',
  width = '100%',
  height = 20,
  borderRadius,
  style,
}) => {
  const themedColors = useThemedColors();
  const shimmerValue = useSharedValue(0);

  useEffect(() => {
    shimmerValue.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0, { duration: 1000 })
      ),
      -1, // Infinite repeat
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(shimmerValue.value, [0, 1], [0.3, 0.7]);
    return { opacity };
  });

  const getShapeStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: themedColors.backgroundTertiary,
      width,
      height,
    };

    const shapes: Record<SkeletonShape, ViewStyle> = {
      rect: {
        borderRadius: borderRadius ?? spacing.radius.md,
      },
      circle: {
        borderRadius: (height as number) / 2,
        width: height, // Circle should be square
      },
      text: {
        borderRadius: spacing.radius.sm,
        height: height || 16,
      },
    };

    return {
      ...baseStyle,
      ...shapes[shape],
    };
  };

  return (
    <Animated.View
      style={[getShapeStyle(), animatedStyle, style]}
      accessibilityLabel="Loading"
      accessibilityRole="progressbar"
    />
  );
};

// Predefined skeleton layouts
export const SkeletonCard: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  return (
    <View style={[styles.cardContainer, style]}>
      <View style={styles.cardHeader}>
        <SkeletonLoader shape="circle" height={40} />
        <View style={styles.cardHeaderText}>
          <SkeletonLoader shape="text" height={16} width="70%" />
          <SkeletonLoader shape="text" height={12} width="50%" style={{ marginTop: spacing.xs }} />
        </View>
      </View>
      <SkeletonLoader shape="text" height={14} width="100%" style={{ marginTop: spacing.md }} />
      <SkeletonLoader shape="text" height={14} width="90%" style={{ marginTop: spacing.sm }} />
      <SkeletonLoader shape="text" height={14} width="80%" style={{ marginTop: spacing.sm }} />
    </View>
  );
};

export const SkeletonStatCard: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  return (
    <View style={[styles.statCardContainer, style]}>
      <SkeletonLoader shape="circle" height={48} />
      <View style={styles.statCardContent}>
        <SkeletonLoader shape="text" height={24} width="60%" />
        <SkeletonLoader shape="text" height={12} width="40%" style={{ marginTop: spacing.xs }} />
      </View>
    </View>
  );
};

export const SkeletonListItem: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  return (
    <View style={[styles.listItemContainer, style]}>
      <SkeletonLoader shape="circle" height={40} />
      <View style={styles.listItemContent}>
        <SkeletonLoader shape="text" height={16} width="70%" />
        <SkeletonLoader shape="text" height={12} width="50%" style={{ marginTop: spacing.xs }} />
      </View>
      <SkeletonLoader shape="text" height={20} width={60} />
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: 'transparent',
    padding: spacing.base,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  statCardContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.base,
  },
  statCardContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  listItemContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
});
