import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { Logo } from './Logo';

export const SplashScreen = () => {
    return (
        <View style={styles.container}>
            <Logo size="large" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
}); 