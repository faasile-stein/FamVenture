/**
 * Theme System - Main export
 * Centralized design system for consistent UI
 */

export { colors, getChoreTypeColor, getStatusColor, type ColorMode } from './colors';
export { spacing, getPadding, getMargin, getHorizontalPadding, getVerticalPadding } from './spacing';
export { fontSizes, fontWeights, lineHeights, textStyles } from './typography';
export { ThemeProvider, useTheme, useThemedColors } from './ThemeContext';
