/**
 * Button Component - Notion-quality interactive button
 * Features: Multiple variants, loading states, haptic feedback, accessibility
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, textStyles } from '../theme';
import { useThemedColors } from '../theme';

type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void | Promise<void>;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  hapticFeedback?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  hapticFeedback = true,
  accessibilityLabel,
  accessibilityHint,
  testID,
  style,
}) => {
  const themedColors = useThemedColors();
  const [isPressed, setIsPressed] = React.useState(false);

  const handlePress = async () => {
    if (disabled || loading) return;

    // Haptic feedback
    if (hapticFeedback) {
      if (variant === 'destructive') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }

    await onPress();
  };

  const getButtonStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: spacing.radius.md,
      ...themedColors.shadow.sm,
    };

    // Size-based padding
    const sizeStyles: Record<ButtonSize, ViewStyle> = {
      small: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.base,
      },
      medium: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
      },
      large: {
        paddingVertical: spacing.base,
        paddingHorizontal: spacing.xl,
      },
    };

    // Variant-based colors
    const variantStyles: Record<ButtonVariant, ViewStyle> = {
      primary: {
        backgroundColor: disabled || loading ? colors.primary[300] : colors.primary[500],
      },
      secondary: {
        backgroundColor: disabled || loading ? themedColors.border.medium : themedColors.backgroundTertiary,
      },
      destructive: {
        backgroundColor: disabled || loading ? colors.error[300] : colors.error[500],
      },
      ghost: {
        backgroundColor: 'transparent',
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: disabled || loading ? themedColors.border.medium : colors.primary[500],
      },
    };

    // Pressed state
    const pressedStyle: ViewStyle = isPressed ? { opacity: 0.8 } : {};

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...pressedStyle,
      ...(fullWidth && { width: '100%' }),
    };
  };

  const getTextStyles = (): TextStyle => {
    const sizeTextStyles: Record<ButtonSize, TextStyle> = {
      small: textStyles.buttonSmall,
      medium: textStyles.button,
      large: { ...textStyles.button, fontSize: 18 },
    };

    const variantTextColors: Record<ButtonVariant, string> = {
      primary: '#FFFFFF',
      secondary: themedColors.text.primary,
      destructive: '#FFFFFF',
      ghost: colors.primary[500],
      outline: disabled || loading ? themedColors.text.disabled : colors.primary[500],
    };

    return {
      ...sizeTextStyles[size],
      color: variantTextColors[variant],
    };
  };

  const getIconSize = (): number => {
    const iconSizes: Record<ButtonSize, number> = {
      small: spacing.icon.sm,
      medium: spacing.icon.md,
      large: spacing.icon.lg,
    };
    return iconSizes[size];
  };

  const getIconColor = (): string => {
    const variantIconColors: Record<ButtonVariant, string> = {
      primary: '#FFFFFF',
      secondary: themedColors.text.primary,
      destructive: '#FFFFFF',
      ghost: colors.primary[500],
      outline: disabled || loading ? themedColors.text.disabled : colors.primary[500],
    };
    return variantIconColors[variant];
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading }}
      testID={testID}
      style={[getButtonStyles(), style]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'destructive' ? '#FFFFFF' : themedColors.text.primary}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={getIconSize()}
              color={getIconColor()}
              style={{ marginRight: spacing.sm }}
            />
          )}
          <Text style={getTextStyles()}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={getIconSize()}
              color={getIconColor()}
              style={{ marginLeft: spacing.sm }}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};
