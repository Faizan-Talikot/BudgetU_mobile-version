import { Platform } from 'react-native';

export const colors = {
    primary: '#7C3AED', // Purple
    primaryLight: '#9F67FF',
    primaryDark: '#5B21B6',
    secondary: '#F4F4F5',
    background: '#FFFFFF',
    text: '#18181B',
    textSecondary: '#71717A',
    border: '#E4E4E7',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
} as const;

export const typography = {
    fontFamily: Platform.select({
        ios: 'System',
        android: 'Roboto',
    }),
    sizes: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
    },
    weights: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    },
} as const;

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
} as const;

export const borderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
} as const;

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
} as const; 