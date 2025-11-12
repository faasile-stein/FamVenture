/**
 * Color System - Notion-inspired color palette
 * Supports both light and dark modes
 */

export const colors = {
  // Brand colors
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#007AFF', // Main primary
    600: '#0066DD',
    700: '#0052BB',
    800: '#003E99',
    900: '#002A77',
  },

  // Semantic colors
  success: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#34C759', // Main success
    600: '#2DB84C',
    700: '#26A83F',
    900: '#1F9832',
  },

  warning: {
    50: '#FFF3E0',
    100: '#FFE0B2',
    200: '#FFCC80',
    300: '#FFB74D',
    400: '#FFA726',
    500: '#FF9500', // Main warning
    600: '#E68600',
    700: '#CC7700',
    800: '#B36800',
    900: '#995900',
  },

  error: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#FF3B30', // Main error
    600: '#E63329',
    700: '#CC2B22',
    800: '#B3231B',
    900: '#991B14',
  },

  purple: {
    50: '#F3E5F5',
    100: '#E1BEE7',
    200: '#CE93D8',
    300: '#BA68C8',
    400: '#AB47BC',
    500: '#AF52DE', // Main purple
    600: '#9C47C6',
    700: '#893CAE',
    800: '#763196',
    900: '#63267E',
  },

  // Gamification colors
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',

  // Light mode
  light: {
    background: '#FFFFFF',
    backgroundSecondary: '#F8F9FA',
    backgroundTertiary: '#F0F1F3',

    text: {
      primary: '#1A1A1A',
      secondary: '#666666',
      tertiary: '#999999',
      disabled: '#CCCCCC',
      inverse: '#FFFFFF',
    },

    border: {
      light: '#F0F0F0',
      medium: '#E0E0E0',
      dark: '#D0D0D0',
    },

    surface: {
      elevated: '#FFFFFF',
      card: '#FFFFFF',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },

    shadow: {
      color: '#000000',
      sm: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
      },
      md: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
      lg: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
      },
    },
  },

  // Dark mode
  dark: {
    background: '#1A1A1A',
    backgroundSecondary: '#252525',
    backgroundTertiary: '#2F2F2F',

    text: {
      primary: '#FFFFFF',
      secondary: '#B3B3B3',
      tertiary: '#808080',
      disabled: '#4D4D4D',
      inverse: '#1A1A1A',
    },

    border: {
      light: '#2F2F2F',
      medium: '#3D3D3D',
      dark: '#4D4D4D',
    },

    surface: {
      elevated: '#252525',
      card: '#202020',
      overlay: 'rgba(0, 0, 0, 0.7)',
    },

    shadow: {
      color: '#000000',
      sm: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 2,
      },
      md: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 3,
      },
      lg: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 5,
      },
    },
  },
} as const;

// Helper function to get chore type colors
export const getChoreTypeColor = (type: 'study' | 'household' | 'activity') => {
  switch (type) {
    case 'study':
      return colors.primary[500];
    case 'household':
      return colors.success[500];
    case 'activity':
      return colors.purple[500];
    default:
      return colors.primary[500];
  }
};

// Helper function to get status colors
export const getStatusColor = (status: 'open' | 'claimed' | 'submitted' | 'approved' | 'rejected' | 'expired') => {
  switch (status) {
    case 'open':
      return colors.primary[500];
    case 'claimed':
      return colors.primary[500];
    case 'submitted':
      return colors.warning[500];
    case 'approved':
      return colors.success[500];
    case 'rejected':
      return colors.error[500];
    case 'expired':
      return colors.error[500];
    default:
      return colors.primary[500];
  }
};

export type ColorMode = 'light' | 'dark';
