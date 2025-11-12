/**
 * Spacing System - Consistent spacing scale
 * Based on 4px base unit (Notion-like)
 */

export const spacing = {
  // Base spacing scale (multiples of 4)
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
  '6xl': 80,

  // Semantic spacing for common use cases
  cardPadding: 16,
  cardMargin: 12,
  sectionPadding: 20,
  screenPadding: 16,
  listItemSpacing: 12,
  buttonPadding: 12,
  inputPadding: 16,

  // Border radius
  radius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 20,
    '3xl': 24,
    full: 9999,
  },

  // Icon sizes
  icon: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
    '2xl': 48,
    '3xl': 64,
  },

  // Avatar sizes
  avatar: {
    xs: 32,
    sm: 40,
    md: 56,
    lg: 80,
    xl: 100,
    '2xl': 120,
  },
} as const;

// Helper function for consistent margin/padding
export const getPadding = (size: keyof typeof spacing) => ({
  padding: spacing[size as keyof typeof spacing] as number,
});

export const getMargin = (size: keyof typeof spacing) => ({
  margin: spacing[size as keyof typeof spacing] as number,
});

export const getHorizontalPadding = (size: keyof typeof spacing) => ({
  paddingHorizontal: spacing[size as keyof typeof spacing] as number,
});

export const getVerticalPadding = (size: keyof typeof spacing) => ({
  paddingVertical: spacing[size as keyof typeof spacing] as number,
});
