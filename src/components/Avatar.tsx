/**
 * Avatar Component - Notion-quality user avatar
 * Features: Image support, fallback initials, status indicator, sizes
 */

import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, textStyles } from '../theme';
import { useThemedColors } from '../theme';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type StatusType = 'online' | 'offline' | 'busy' | 'away';

interface AvatarProps {
  imageUrl?: string | null;
  name?: string;
  size?: AvatarSize;
  status?: StatusType;
  showStatus?: boolean;
  backgroundColor?: string;
  style?: ViewStyle;
  testID?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  imageUrl,
  name,
  size = 'md',
  status,
  showStatus = false,
  backgroundColor,
  style,
  testID,
}) => {
  const themedColors = useThemedColors();
  const [imageError, setImageError] = React.useState(false);

  const getAvatarSize = (): number => {
    return spacing.avatar[size];
  };

  const getInitials = (): string => {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getFallbackColor = (): string => {
    if (backgroundColor) return backgroundColor;

    // Generate color from name
    if (!name) return colors.primary[500];

    const colorOptions = [
      colors.primary[500],
      colors.success[500],
      colors.warning[500],
      colors.purple[500],
      colors.error[500],
    ];

    const index = name.charCodeAt(0) % colorOptions.length;
    return colorOptions[index];
  };

  const getStatusColor = (): string => {
    const statusMap: Record<StatusType, string> = {
      online: colors.success[500],
      offline: themedColors.text.disabled,
      busy: colors.error[500],
      away: colors.warning[500],
    };
    return status ? statusMap[status] : colors.success[500];
  };

  const getFontSize = (): number => {
    const fontSizeMap: Record<AvatarSize, number> = {
      xs: 12,
      sm: 14,
      md: 18,
      lg: 24,
      xl: 32,
      '2xl': 40,
    };
    return fontSizeMap[size];
  };

  const getStatusSize = (): number => {
    const statusSizeMap: Record<AvatarSize, number> = {
      xs: 8,
      sm: 10,
      md: 12,
      lg: 16,
      xl: 20,
      '2xl': 24,
    };
    return statusSizeMap[size];
  };

  const avatarSize = getAvatarSize();
  const shouldShowImage = imageUrl && !imageError;

  return (
    <View style={[styles.container, style]} testID={testID}>
      {shouldShowImage ? (
        <Image
          source={{ uri: imageUrl }}
          style={[
            styles.image,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
            },
          ]}
          onError={() => setImageError(true)}
          accessibilityLabel={`Avatar for ${name || 'user'}`}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
              backgroundColor: getFallbackColor(),
            },
          ]}
          accessibilityLabel={`Avatar for ${name || 'user'}`}
        >
          <Text style={[styles.initials, { fontSize: getFontSize() }]}>
            {getInitials()}
          </Text>
        </View>
      )}

      {/* Status Indicator */}
      {showStatus && (
        <View
          style={[
            styles.statusIndicator,
            {
              width: getStatusSize(),
              height: getStatusSize(),
              borderRadius: getStatusSize() / 2,
              backgroundColor: getStatusColor(),
              borderWidth: size === 'xs' || size === 'sm' ? 1.5 : 2,
              borderColor: themedColors.background,
            },
          ]}
          accessibilityLabel={status ? `Status: ${status}` : undefined}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    resizeMode: 'cover',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
});
