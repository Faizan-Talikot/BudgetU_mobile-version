import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
    TouchableOpacityProps,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';

interface ButtonProps extends TouchableOpacityProps {
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    fullWidth?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    style,
    textStyle,
    disabled,
    ...props
}) => {
    const getVariantStyles = (): ViewStyle => {
        switch (variant) {
            case 'primary':
                return {
                    backgroundColor: disabled ? colors.primaryLight : colors.primary,
                    borderWidth: 0,
                };
            case 'secondary':
                return {
                    backgroundColor: colors.secondary,
                    borderWidth: 0,
                };
            case 'outline':
                return {
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: colors.primary,
                };
            default:
                return {};
        }
    };

    const getSizeStyles = (): ViewStyle => {
        switch (size) {
            case 'sm':
                return {
                    paddingVertical: spacing.xs,
                    paddingHorizontal: spacing.md,
                };
            case 'lg':
                return {
                    paddingVertical: spacing.lg,
                    paddingHorizontal: spacing.xl,
                };
            default:
                return {
                    paddingVertical: spacing.md,
                    paddingHorizontal: spacing.lg,
                };
        }
    };

    const getTextColor = (): string => {
        if (disabled) return colors.textSecondary;
        switch (variant) {
            case 'primary':
                return colors.background;
            case 'secondary':
                return colors.text;
            case 'outline':
                return colors.primary;
            default:
                return colors.text;
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                getVariantStyles(),
                getSizeStyles(),
                fullWidth && styles.fullWidth,
                style,
            ]}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <Text
                    style={[
                        styles.text,
                        {
                            color: getTextColor(),
                            fontSize: size === 'sm' ? typography.sizes.sm : typography.sizes.base,
                        },
                        textStyle,
                    ]}
                >
                    {children}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: borderRadius.md,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullWidth: {
        width: '100%',
    },
    text: {
        fontFamily: typography.fontFamily,
        fontWeight: typography.weights.medium,
        textAlign: 'center',
    },
}); 