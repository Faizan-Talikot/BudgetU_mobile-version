import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { colors, typography, spacing } from '../theme';

interface LoadingProps {
    message?: string;
}

export const Loading: React.FC<LoadingProps> = ({ message }) => {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={colors.primary} />
            {message && <Text style={styles.message}>{message}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    message: {
        marginTop: spacing.md,
        fontSize: typography.sizes.base,
        color: colors.textSecondary,
    },
}); 