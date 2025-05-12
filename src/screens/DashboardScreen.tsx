import React from 'react';
import {
    View,
    ScrollView,
    Text,
    StyleSheet,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { colors, typography, spacing } from '../theme';

const DashboardScreen = () => {
    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        // Add your refresh logic here
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
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
                    <Text style={styles.amount}>$28</Text>
                    <Text style={styles.subtitle}>per day for the next 9 days</Text>

                    <View style={styles.budgetInfo}>
                        <View style={styles.budgetRow}>
                            <Text style={styles.budgetLabel}>Monthly Budget</Text>
                            <Text style={styles.budgetValue}>$1000</Text>
                        </View>
                        <View style={styles.budgetRow}>
                            <Text style={styles.budgetLabel}>Spent So Far</Text>
                            <Text style={styles.budgetValue}>$745</Text>
                        </View>
                        <View style={styles.budgetRow}>
                            <Text style={styles.budgetLabel}>Remaining</Text>
                            <Text style={styles.budgetValue}>$255</Text>
                        </View>
                    </View>
                </Card>

                {/* Active Budgets Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Active Budgets</Text>
                        <Text style={styles.sectionSubtitle}>You have 2 active budgets</Text>
                    </View>

                    <Card style={styles.budgetCard}>
                        <Text style={styles.budgetTitle}>May budget</Text>
                        <View style={styles.progressBar}>
                            <View style={[styles.progress, { width: '1%' }]} />
                        </View>
                        <View style={styles.budgetDetails}>
                            <Text style={styles.budgetCategory}>food</Text>
                            <Text style={styles.budgetAmount}>₹20 / ₹1,500</Text>
                        </View>
                    </Card>
                </View>

                {/* Recent Transactions Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Transactions</Text>
                        <Text style={styles.sectionSubtitle}>Your most recent activity</Text>
                    </View>

                    {/* Transaction Items */}
                    <Card style={styles.transactionCard}>
                        <View style={styles.transaction}>
                            <View style={styles.transactionInfo}>
                                <Text style={styles.transactionTitle}>food</Text>
                                <Text style={styles.transactionCategory}>food</Text>
                            </View>
                            <View style={styles.transactionAmount}>
                                <Text style={[styles.amount, styles.expense]}>-₹20</Text>
                                <Text style={styles.date}>09 May</Text>
                            </View>
                        </View>
                    </Card>
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
    section: {
        marginHorizontal: spacing.lg,
        marginBottom: spacing.xl,
    },
    sectionHeader: {
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.text,
    },
    sectionSubtitle: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    budgetCard: {
        marginBottom: spacing.md,
    },
    budgetTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        color: colors.text,
        marginBottom: spacing.md,
    },
    progressBar: {
        height: 8,
        backgroundColor: colors.secondary,
        borderRadius: 4,
        marginBottom: spacing.sm,
    },
    progress: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 4,
    },
    budgetDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    budgetCategory: {
        color: colors.textSecondary,
    },
    budgetAmount: {
        fontWeight: typography.weights.medium,
    },
    transactionCard: {
        padding: 0,
    },
    transaction: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    transactionInfo: {
        flex: 1,
    },
    transactionTitle: {
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.medium,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    transactionCategory: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    transactionAmount: {
        alignItems: 'flex-end',
    },
    expense: {
        color: colors.error,
    },
    date: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
});

export default DashboardScreen; 