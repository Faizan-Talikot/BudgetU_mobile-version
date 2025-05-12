import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ArrowLeft,
    User,
    Shield,
    Settings as SettingsIcon
} from 'lucide-react-native';
import { getUserData, isAuthenticated } from '@/lib/api';
import { colors, typography, spacing } from '@/theme';
import type { NavigationProps } from '@/types/navigation';
import ProfileSettings from '../components/settings/ProfileSettings';
import SecuritySettings from '../components/settings/SecuritySettings';
import PreferencesSettings from '../components/settings/PreferencesSettings';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const navigation = useNavigation<NavigationProps>();
    const [userName, setUserName] = useState('');

    useEffect(() => {
        if (!isAuthenticated()) {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }]
            });
            return;
        }

        const userData = getUserData();
        if (userData) {
            setUserName(`${userData.firstName} ${userData.lastName}`);
        }
    }, [navigation]);

    const handleBackToDashboard = () => {
        navigation.navigate('Dashboard');
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return <ProfileSettings />;
            case 'security':
                return <SecuritySettings />;
            case 'preferences':
                return <PreferencesSettings />;
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.logo}>
                        <View style={styles.logoIcon}>
                            <Text style={styles.logoText}>B</Text>
                        </View>
                        <Text style={styles.logoTitle}>BudgetU</Text>
                    </View>
                </View>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.backButton}>
                    <TouchableOpacity
                        onPress={handleBackToDashboard}
                        style={styles.backButtonTouch}
                    >
                        <ArrowLeft size={16} color={colors.text} />
                        <Text style={styles.backButtonText}>Back to Dashboard</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.mainContent}>
                    {/* Sidebar */}
                    <View style={styles.sidebar}>
                        <View style={styles.accountCard}>
                            <Text style={styles.accountTitle}>Account Settings</Text>
                            <Text style={styles.userName}>{userName}</Text>
                        </View>

                        <View style={styles.tabs}>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
                                onPress={() => setActiveTab('profile')}
                            >
                                <User size={16} color={colors.text} />
                                <Text style={styles.tabText}>Profile</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'security' && styles.activeTab]}
                                onPress={() => setActiveTab('security')}
                            >
                                <Shield size={16} color={colors.text} />
                                <Text style={styles.tabText}>Security</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'preferences' && styles.activeTab]}
                                onPress={() => setActiveTab('preferences')}
                            >
                                <SettingsIcon size={16} color={colors.text} />
                                <Text style={styles.tabText}>Preferences</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Content */}
                    <View style={styles.tabContent}>
                        <Text style={styles.contentTitle}>
                            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Settings
                        </Text>
                        {renderTabContent()}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerContent: {
        paddingHorizontal: spacing.lg,
        height: 64,
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    logoIcon: {
        height: 32,
        width: 32,
        backgroundColor: colors.primary,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        color: colors.background,
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
    },
    logoTitle: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
    },
    content: {
        flex: 1,
        padding: spacing.lg,
    },
    backButton: {
        marginBottom: spacing.xl,
    },
    backButtonTouch: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    backButtonText: {
        color: colors.text,
        fontSize: typography.sizes.base,
    },
    mainContent: {
        flexDirection: 'column',
        gap: spacing.lg,
    },
    sidebar: {
        gap: spacing.lg,
    },
    accountCard: {
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
    },
    accountTitle: {
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.medium,
        marginBottom: spacing.sm,
    },
    userName: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    tabs: {
        gap: spacing.xs,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: colors.secondary,
    },
    tabText: {
        fontSize: typography.sizes.base,
        color: colors.text,
    },
    tabContent: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: spacing.xl,
    },
    contentTitle: {
        fontSize: typography.sizes['2xl'],
        fontWeight: typography.weights.bold,
        marginBottom: spacing.xl,
    },
});

export default Settings; 