import React from 'react';
import {
    View,
    ScrollView,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { colors, typography, spacing } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { storage, StorageKeys } from '../utils/storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SettingsScreen = () => {
    const { signOut } = useAuth();
    const navigation = useNavigation<NavigationProp>();

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Logout",
                    onPress: signOut,
                    style: "destructive"
                }
            ]
        );
    };

    const resetOnboarding = async () => {
        try {
            // First clear the onboarding flag
            await storage.remove(StorageKeys.HAS_SEEN_ONBOARDING);

            // Then clear all other user-related data
            await Promise.all([
                storage.remove(StorageKeys.USER_DATA),
                storage.remove(StorageKeys.TRANSACTIONS),
                storage.remove(StorageKeys.BUDGETS),
                storage.remove(StorageKeys.SETTINGS),
                storage.remove(StorageKeys.PENDING_SYNC)
            ]);

            // Finally sign out - this will trigger navigation update through auth context
            await signOut();
        } catch (error) {
            console.error('Reset error:', error);
            Alert.alert("Error", "Failed to reset app state");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.header}>
                    <Text style={styles.title}>Settings</Text>
                    <Text style={styles.subtitle}>
                        Manage your account and preferences
                    </Text>
                </View>

                {/* Account Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <Card style={styles.settingsCard}>
                        <TouchableOpacity style={styles.settingsItem}>
                            <View style={styles.settingsItemLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
                                    <Ionicons name="person" size={20} color={colors.background} />
                                </View>
                                <View>
                                    <Text style={styles.settingsItemTitle}>Profile</Text>
                                    <Text style={styles.settingsItemSubtitle}>
                                        Manage your personal information
                                    </Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.settingsItem}>
                            <View style={styles.settingsItemLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: colors.warning }]}>
                                    <Ionicons name="shield" size={20} color={colors.background} />
                                </View>
                                <View>
                                    <Text style={styles.settingsItemTitle}>Security</Text>
                                    <Text style={styles.settingsItemSubtitle}>
                                        Password and authentication
                                    </Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </Card>
                </View>

                {/* Preferences */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferences</Text>
                    <Card style={styles.settingsCard}>
                        <View style={styles.settingsItem}>
                            <View style={styles.settingsItemLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: colors.success }]}>
                                    <Ionicons name="notifications" size={20} color={colors.background} />
                                </View>
                                <View>
                                    <Text style={styles.settingsItemTitle}>Notifications</Text>
                                    <Text style={styles.settingsItemSubtitle}>
                                        Push notifications and alerts
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                value={true}
                                onValueChange={() => { }}
                                trackColor={{ false: colors.border, true: colors.primary }}
                                thumbColor={colors.background}
                            />
                        </View>

                        <TouchableOpacity style={styles.settingsItem}>
                            <View style={styles.settingsItemLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: colors.error }]}>
                                    <Ionicons name="globe" size={20} color={colors.background} />
                                </View>
                                <View>
                                    <Text style={styles.settingsItemTitle}>Currency</Text>
                                    <Text style={styles.settingsItemSubtitle}>
                                        ₹ Indian Rupee (INR)
                                    </Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </Card>
                </View>

                {/* Help & Support */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Help & Support</Text>
                    <Card style={styles.settingsCard}>
                        <TouchableOpacity style={styles.settingsItem}>
                            <View style={styles.settingsItemLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
                                    <Ionicons name="help-circle" size={20} color={colors.background} />
                                </View>
                                <View>
                                    <Text style={styles.settingsItemTitle}>FAQ</Text>
                                    <Text style={styles.settingsItemSubtitle}>
                                        Frequently asked questions
                                    </Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.settingsItem}>
                            <View style={styles.settingsItemLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: colors.primaryDark }]}>
                                    <Ionicons name="mail" size={20} color={colors.background} />
                                </View>
                                <View>
                                    <Text style={styles.settingsItemTitle}>Contact Support</Text>
                                    <Text style={styles.settingsItemSubtitle}>
                                        Get help with your account
                                    </Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </Card>
                </View>

                {/* About */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <Card style={styles.settingsCard}>
                        <TouchableOpacity style={styles.settingsItem}>
                            <View style={styles.settingsItemLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: colors.text }]}>
                                    <Ionicons name="information" size={20} color={colors.background} />
                                </View>
                                <View>
                                    <Text style={styles.settingsItemTitle}>App Version</Text>
                                    <Text style={styles.settingsItemSubtitle}>1.0.0</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </Card>
                </View>

                {/* Developer Options */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Developer Options</Text>
                    <Card style={styles.settingsCard}>
                        <TouchableOpacity
                            style={styles.settingsItem}
                            onPress={resetOnboarding}
                        >
                            <View style={styles.settingsItemLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: colors.warning }]}>
                                    <Ionicons name="refresh" size={20} color={colors.background} />
                                </View>
                                <View>
                                    <Text style={styles.settingsItemTitle}>Reset Onboarding</Text>
                                    <Text style={styles.settingsItemSubtitle}>
                                        View the onboarding screens again
                                    </Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </Card>
                </View>

                {/* Logout Section */}
                <View style={styles.section}>
                    <Card style={styles.settingsCard}>
                        <TouchableOpacity
                            style={[styles.settingsItem, styles.logoutItem]}
                            onPress={handleLogout}
                        >
                            <View style={styles.settingsItemLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: colors.error }]}>
                                    <Ionicons name="log-out" size={20} color={colors.background} />
                                </View>
                                <View>
                                    <Text style={[styles.settingsItemTitle, styles.logoutText]}>Logout</Text>
                                    <Text style={styles.settingsItemSubtitle}>
                                        Sign out of your account
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </Card>
                </View>

                {/* Bottom Spacing */}
                <View style={styles.bottomSpacing} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        padding: spacing.lg,
    },
    title: {
        fontSize: typography.sizes['2xl'],
        fontWeight: typography.weights.bold,
        color: colors.text,
    },
    subtitle: {
        fontSize: typography.sizes.base,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    section: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        color: colors.text,
        marginBottom: spacing.md,
    },
    settingsCard: {
        padding: 0,
    },
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    settingsItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    settingsItemTitle: {
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.medium,
        color: colors.text,
    },
    settingsItemSubtitle: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginTop: 2,
    },
    logoutItem: {
        borderBottomWidth: 0,
    },
    logoutText: {
        color: colors.error,
    },
    bottomSpacing: {
        height: spacing.xl,
    },
});

export default SettingsScreen; 