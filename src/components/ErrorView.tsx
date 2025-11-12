/**
 * ErrorView Component - Notion-quality error display
 * Features: Retry functionality, clear messaging, illustrations
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';
import { colors, spacing, textStyles } from '../theme';
import { useThemedColors } from '../theme';

interface ErrorViewProps {
  title?: string;
  message?: string;
  error?: Error;
  onRetry?: () => void;
  retryLabel?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  testID?: string;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  error,
  onRetry,
  retryLabel = 'Try Again',
  icon = 'alert-circle-outline',
  testID,
}) => {
  const themedColors = useThemedColors();

  return (
    <View style={styles.container} testID={testID}>
      {/* Error Icon */}
      <View style={[styles.iconContainer, { backgroundColor: `${colors.error[500]}15` }]}>
        <Ionicons name={icon} size={spacing.icon['3xl']} color={colors.error[500]} />
      </View>

      {/* Error Title */}
      <Text style={[textStyles.h3, { color: themedColors.text.primary, marginTop: spacing.lg }]}>
        {title}
      </Text>

      {/* Error Message */}
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

      {/* Technical Error Details (Development) */}
      {__DEV__ && error && (
        <View style={[styles.errorDetails, { backgroundColor: themedColors.backgroundTertiary }]}>
          <Text
            style={[textStyles.caption, { color: themedColors.text.tertiary }]}
            numberOfLines={3}
          >
            {error.message}
          </Text>
        </View>
      )}

      {/* Retry Button */}
      {onRetry && (
        <Button
          title={retryLabel}
          onPress={onRetry}
          variant="primary"
          icon="refresh"
          style={{ marginTop: spacing.xl }}
          testID={`${testID}-retry-button`}
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
  errorDetails: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: spacing.radius.md,
    maxWidth: '100%',
  },
});
