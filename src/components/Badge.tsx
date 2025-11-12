/**
 * Badge Component - Notion-quality status badge
 * Features: Multiple variants, sizes, icons, dot indicator
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, textStyles } from '../theme';
import { useThemedColors } from '../theme';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'neutral' | 'purple';
type BadgeSize = 'small' | 'medium' | 'large';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: keyof typeof Ionicons.glyphMap;
  showDot?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'medium',
  icon,
  showDot = false,
  style,
  testID,
}) => {
  const themedColors = useThemedColors();

  const getVariantColors = (): { background: string; text: string } => {
    const variantMap: Record<BadgeVariant, { background: string; text: string }> = {
      primary: {
        background: `${colors.primary[500]}20`,
        text: colors.primary[700],
      },
      success: {
        background: `${colors.success[500]}20`,
        text: colors.success[700],
      },
      warning: {
        background: `${colors.warning[500]}20`,
        text: colors.warning[700],
      },
      error: {
        background: `${colors.error[500]}20`,
        text: colors.error[700],
      },
      purple: {
        background: `${colors.purple[500]}20`,
        text: colors.purple[700],
      },
      neutral: {
        background: themedColors.backgroundTertiary,
        text: themedColors.text.primary,
      },
    };
    return variantMap[variant];
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle; iconSize: number } => {
    const sizeMap: Record<BadgeSize, { container: ViewStyle; text: TextStyle; iconSize: number }> = {
      small: {
        container: {
          paddingVertical: spacing.xs - 2,
          paddingHorizontal: spacing.sm,
          borderRadius: spacing.radius.sm,
        },
        text: textStyles.captionBold,
        iconSize: spacing.icon.xs,
      },
      medium: {
        container: {
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.md,
          borderRadius: spacing.radius.md,
        },
        text: textStyles.labelSmall,
        iconSize: spacing.icon.sm,
      },
      large: {
        container: {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.base,
          borderRadius: spacing.radius.md,
        },
        text: textStyles.label,
        iconSize: spacing.icon.md,
      },
    };
    return sizeMap[size];
  };

  const variantColors = getVariantColors();
  const sizeStyles = getSizeStyles();

  return (
    <View
      style={[
        styles.container,
        sizeStyles.container,
        { backgroundColor: variantColors.background },
        style,
      ]}
      testID={testID}
      accessibilityRole="text"
      accessibilityLabel={label}
    >
      {showDot && (
        <View
          style={[
            styles.dot,
            {
              backgroundColor: variantColors.text,
              width: size === 'small' ? 6 : 8,
              height: size === 'small' ? 6 : 8,
            },
          ]}
        />
      )}
      {icon && (
        <Ionicons
          name={icon}
          size={sizeStyles.iconSize}
          color={variantColors.text}
          style={styles.icon}
        />
      )}
      <Text style={[sizeStyles.text, { color: variantColors.text }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  dot: {
    borderRadius: spacing.radius.full,
    marginRight: spacing.xs,
  },
  icon: {
    marginRight: spacing.xs,
  },
});
