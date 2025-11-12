/**
 * Card Component - Notion-quality card container
 * Features: Elevation, theming, press states, customization
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { colors, spacing } from '../theme';
import { useThemedColors } from '../theme';
import * as Haptics from 'expo-haptics';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: keyof typeof spacing;
  style?: ViewStyle;
  hapticFeedback?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  variant = 'elevated',
  padding = 'base',
  style,
  hapticFeedback = true,
  accessibilityLabel,
  testID,
}) => {
  const themedColors = useThemedColors();
  const [isPressed, setIsPressed] = React.useState(false);

  const handlePress = async () => {
    if (!onPress) return;

    if (hapticFeedback) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onPress();
  };

  const getCardStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: themedColors.surface.card,
      borderRadius: spacing.radius.lg,
      padding: spacing[padding as keyof typeof spacing] as number,
    };

    const variantStyles: Record<typeof variant, ViewStyle> = {
      elevated: {
        ...themedColors.shadow.md,
      },
      outlined: {
        borderWidth: 1,
        borderColor: themedColors.border.medium,
      },
      flat: {},
    };

    const pressedStyle: ViewStyle = isPressed ? { opacity: 0.9, transform: [{ scale: 0.98 }] } : {};

    return {
      ...baseStyle,
      ...variantStyles[variant],
      ...pressedStyle,
    };
  };

  const WrapperComponent = onPress ? TouchableOpacity : View;

  return (
    <WrapperComponent
      {...(onPress && {
        onPress: handlePress,
        onPressIn: () => setIsPressed(true),
        onPressOut: () => setIsPressed(false),
        activeOpacity: 1,
        accessibilityRole: 'button',
        accessibilityLabel,
      })}
      testID={testID}
      style={[getCardStyles(), style]}
    >
      {children}
    </WrapperComponent>
  );
};
