/**
 * EmptyState Component - Notion-quality empty list display
 * Features: Clear messaging, call-to-action, illustrations
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';
import { colors, spacing, textStyles } from '../theme';
import { useThemedColors } from '../theme';

interface EmptyStateProps {
  title: string;
  message?: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  actionLabel?: string;
  onAction?: () => void;
  testID?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon,
  iconColor = colors.primary[500],
  actionLabel,
  onAction,
  testID,
}) => {
  const themedColors = useThemedColors();

  return (
    <View style={styles.container} testID={testID}>
      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={icon} size={spacing.icon['3xl']} color={iconColor} />
      </View>

      {/* Title */}
      <Text style={[textStyles.h3, { color: themedColors.text.primary, marginTop: spacing.lg }]}>
        {title}
      </Text>

      {/* Message */}
      {message && (
        <Text
          style={[
            textStyles.body,
            {
              color: themedColors.text.secondary,
              marginTop: spacing.sm,
              textAlign: 'center',
              paddingHorizontal: spacing.xl,
            },
          ]}
        >
          {message}
        </Text>
      )}

      {/* Action Button */}
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="primary"
          style={{ marginTop: spacing.xl }}
          testID={`${testID}-action-button`}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  iconContainer: {
    width: spacing.icon['6xl'] + spacing.xl,
    height: spacing.icon['6xl'] + spacing.xl,
    borderRadius: (spacing.icon['6xl'] + spacing.xl) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
