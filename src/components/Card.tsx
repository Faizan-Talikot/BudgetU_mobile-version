import React from 'react';
import {
    View,
    StyleSheet,
    ViewStyle,
    ViewProps,
    TouchableOpacity,
    TouchableOpacityProps,
} from 'react-native';
import { colors, shadows, borderRadius, spacing } from '../theme';

interface CardProps extends ViewProps {
    variant?: 'default' | 'elevated';
    style?: ViewStyle;
}

interface TouchableCardProps extends TouchableOpacityProps {
    variant?: 'default' | 'elevated';
    style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
    children,
    variant = 'default',
    style,
    ...props
}) => {
    return (
        <View
            style={[
                styles.card,
                variant === 'elevated' && styles.elevated,
                style,
            ]}
            {...props}
        >
            {children}
        </View>
    );
};

export const TouchableCard: React.FC<TouchableCardProps> = ({
    children,
    variant = 'default',
    style,
    ...props
}) => {
    return (
        <TouchableOpacity
            style={[
                styles.card,
                variant === 'elevated' && styles.elevated,
                style,
            ]}
            {...props}
        >
            {children}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.background,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    elevated: {
        ...shadows.md,
        borderWidth: 0,
    },
}); 