import React, { useEffect, useState } from 'react';
import {
    View,
    ScrollView,
    Text,
    StyleSheet,
    RefreshControl,
    TouchableOpacity,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { colors, typography, spacing } from '../theme';
import { budgetAPI } from '../services/api';
import { differenceInDays } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

const DashboardScreen = () => {
    const [refreshing, setRefreshing] = useState(false);
    const [dailyBudget, setDailyBudget] = useState(0);
    const [daysLeft, setDaysLeft] = useState(0);
    const [monthlyBudget, setMonthlyBudget] = useState(0);
    const [spentSoFar, setSpentSoFar] = useState(0);
    const [remaining, setRemaining] = useState(0);
    const [showFeatureModal, setShowFeatureModal] = useState(false);
    const [featureModalText, setFeatureModalText] = useState('Can I Afford This?');

    const fetchBudgetData = async () => {
        try {
            const budgets = await budgetAPI.getActive();
            if (budgets && budgets.length > 0) {
                const budget = budgets[0];
                setMonthlyBudget(budget.amount);
                setSpentSoFar(budget.totalSpent);
                // Calculate totalAllocated
                const totalAllocated = budget.categories.reduce((sum, cat) => sum + (cat.allocatedAmount || 0), 0);
                // Calculate remainingAmount
                const remainingAmount = totalAllocated - budget.totalSpent;
                setRemaining(remainingAmount);
                // Calculate days left
                const today = new Date();
                const end = new Date(budget.endDate);
                const days = Math.max(1, differenceInDays(end, today));
                setDaysLeft(days);
                // Calculate daily budget
                const isOverBudget = remainingAmount < 0;
                const daily = isOverBudget ? 0 : (remainingAmount / (days || 1));
                setDailyBudget(Math.floor(daily));
            }
        } catch (e) {
            setMonthlyBudget(0);
            setSpentSoFar(0);
            setRemaining(0);
            setDailyBudget(0);
            setDaysLeft(0);
        }
    };

    useEffect(() => {
        fetchBudgetData();
    }, []);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchBudgetData().finally(() => setRefreshing(false));
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Safe to Spend Card */}
                <Card variant="elevated" style={styles.safeToSpendCard}>
                    <Text style={styles.cardTitle}>Safe to Spend</Text>
                    <Text style={styles.amount}>₹{dailyBudget}</Text>
                    <Text style={styles.subtitle}>per day for the next {daysLeft} days</Text>

                    <View style={styles.budgetInfo}>
                        <View style={styles.budgetRow}>
                            <Text style={styles.budgetLabel}>Monthly Budget</Text>
                            <Text style={styles.budgetValue}>₹{monthlyBudget}</Text>
                        </View>
                        <View style={styles.budgetRow}>
                            <Text style={styles.budgetLabel}>Spent So Far</Text>
                            <Text style={styles.budgetValue}>₹{spentSoFar}</Text>
                        </View>
                        <View style={styles.budgetRow}>
                            <Text style={styles.budgetLabel}>Remaining</Text>
                            <Text style={styles.budgetValue}>₹{remaining}</Text>
                        </View>
                    </View>
                </Card>

                {/* Can I Afford This Feature Button */}
                <TouchableOpacity
                    style={styles.affordFeatureCard}
                    activeOpacity={0.85}
                    onPress={() => {
                        setFeatureModalText('Can I Afford This?');
                        setShowFeatureModal(true);
                    }}
                >
                    <View style={styles.affordIconContainer}>
                        <Ionicons name="star" size={32} color={colors.background} />
                    </View>
                    <View style={styles.affordTextContainer}>
                        <Text style={styles.affordTitle}>Can I Afford This?</Text>
                        <Text style={styles.affordSubtitle}>
                            Instantly check if you can afford a purchase before you buy. Tap to try!
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Future You Predictions Feature Button */}
                <TouchableOpacity
                    style={styles.affordFeatureCard}
                    activeOpacity={0.85}
                    onPress={() => {
                        setFeatureModalText('Future You Predictions');
                        setShowFeatureModal(true);
                    }}
                >
                    <View style={styles.affordIconContainer}>
                        <Ionicons name="trending-up" size={32} color={colors.background} />
                    </View>
                    <View style={styles.affordTextContainer}>
                        <Text style={styles.affordTitle}>
                            "Future You" Predictions
                        </Text>
                        <Text style={styles.affordSubtitle}>
                            Will you run out of money? We'll tell you before it happens.
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Feature Coming Soon Modal */}
                <Modal
                    visible={showFeatureModal}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowFeatureModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Ionicons name="star" size={48} color={colors.primary} style={{ marginBottom: 16 }} />
                            <Text style={styles.modalTitle}>Coming Soon!</Text>
                            <Text style={styles.modalMessage}>
                                The "{featureModalText}" feature is coming soon. Stay tuned!
                            </Text>
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={() => setShowFeatureModal(false)}
                            >
                                <Text style={styles.modalButtonText}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
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
    safeToSpendCard: {
        margin: spacing.lg,
        backgroundColor: colors.primary,
    },
    cardTitle: {
        color: colors.background,
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        marginBottom: spacing.xs,
    },
    amount: {
        color: colors.background,
        fontSize: typography.sizes['3xl'],
        fontWeight: typography.weights.bold,
    },
    subtitle: {
        color: colors.background,
        fontSize: typography.sizes.sm,
        opacity: 0.8,
    },
    budgetInfo: {
        marginTop: spacing.xl,
    },
    budgetRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.sm,
    },
    budgetLabel: {
        color: colors.background,
        opacity: 0.8,
    },
    budgetValue: {
        color: colors.background,
        fontWeight: typography.weights.medium,
    },
    affordFeatureCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: spacing.lg,
        marginTop: spacing.xl,
        marginBottom: spacing.lg,
        backgroundColor: colors.secondary,
        borderRadius: 16,
        padding: spacing.lg,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    affordIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.lg,
    },
    affordTextContainer: {
        flex: 1,
    },
    affordTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    affordSubtitle: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: colors.background,
        borderRadius: 20,
        padding: spacing.xl,
        alignItems: 'center',
        width: 300,
    },
    modalTitle: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.primary,
        marginBottom: spacing.md,
    },
    modalMessage: {
        fontSize: typography.sizes.base,
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    modalButton: {
        backgroundColor: colors.primary,
        borderRadius: 12,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
    },
    modalButtonText: {
        color: colors.background,
        fontWeight: typography.weights.bold,
        fontSize: typography.sizes.base,
    },
});

export default DashboardScreen; 