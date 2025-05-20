import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

interface Account {
    id: string;
    type: 'upi' | 'cash' | 'savings';
    name: string;
    balance: number;
    icon: string;
}

const accounts: Account[] = [
    { id: '1', type: 'upi', name: 'UPI', balance: -47284.00, icon: 'phone-portrait-outline' },
    { id: '2', type: 'cash', name: 'Cash', balance: -51221.00, icon: 'cash-outline' },
    { id: '3', type: 'savings', name: 'Savings', balance: 0.00, icon: 'wallet-outline' },
];

const AccountsScreen = () => {
    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
    const totalExpense = accounts.reduce((sum, account) => sum + (account.balance < 0 ? -account.balance : 0), 0);
    const totalIncome = accounts.reduce((sum, account) => sum + (account.balance > 0 ? account.balance : 0), 0);

    const renderAccount = (account: Account) => (
        <TouchableOpacity 
            key={account.id}
            style={styles.accountCard}
        >
            <View style={styles.accountInfo}>
                <View style={styles.accountIconContainer}>
                    <Ionicons name={account.icon as any} size={24} color={colors.primary} />
                </View>
                <View style={styles.accountDetails}>
                    <Text style={styles.accountName}>{account.name}</Text>
                    <Text style={[
                        styles.accountBalance,
                        account.balance < 0 ? styles.negativeBalance : styles.positiveBalance
                    ]}>
                        {account.balance < 0 ? '-' : ''}₹{Math.abs(account.balance).toFixed(2)}
                    </Text>
                </View>
                <TouchableOpacity style={styles.menuButton}>
                    <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Total Balance */}
                <View style={styles.balanceContainer}>
                    <Text style={styles.balanceTitle}>All Accounts</Text>
                    <Text style={styles.balanceAmount}>₹{totalBalance.toFixed(2)}</Text>
                </View>

                {/* Summary Cards */}
                <View style={styles.summaryContainer}>
                    <View style={[styles.summaryCard, styles.expenseCard]}>
                        <Text style={styles.summaryLabel}>EXPENSE SO FAR</Text>
                        <Text style={[styles.summaryAmount, styles.expenseText]}>
                            ₹{totalExpense.toFixed(2)}
                        </Text>
                    </View>
                    <View style={[styles.summaryCard, styles.incomeCard]}>
                        <Text style={styles.summaryLabel}>INCOME SO FAR</Text>
                        <Text style={[styles.summaryAmount, styles.incomeText]}>
                            ₹{totalIncome.toFixed(2)}
                        </Text>
                    </View>
                </View>

                {/* Accounts Section */}
                <View style={styles.accountsSection}>
                    <Text style={styles.sectionTitle}>Accounts</Text>
                    <View style={styles.accountsList}>
                        {accounts.map(renderAccount)}
                    </View>
                    
                    {/* Add New Account Button */}
                    <TouchableOpacity style={styles.addAccountButton}>
                        <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
                        <Text style={styles.addAccountText}>ADD NEW ACCOUNT</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity style={styles.fab}>
                <Ionicons name="add" size={24} color={colors.background} />
            </TouchableOpacity>
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
    balanceContainer: {
        alignItems: 'center',
        paddingBottom: spacing.xl,
    },
    balanceTitle: {
        fontSize: typography.sizes.lg,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    balanceAmount: {
        fontSize: typography.sizes['3xl'],
        fontWeight: typography.weights.bold,
        color: colors.text,
    },
    summaryContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.xl,
        gap: spacing.md,
    },
    summaryCard: {
        flex: 1,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.secondary,
    },
    expenseCard: {
        backgroundColor: '#FEE2E2',
    },
    incomeCard: {
        backgroundColor: '#DCFCE7',
    },
    summaryLabel: {
        fontSize: typography.sizes.xs,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    summaryAmount: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
    },
    expenseText: {
        color: '#DC2626',
    },
    incomeText: {
        color: '#059669',
    },
    accountsSection: {
        padding: spacing.lg,
    },
    sectionTitle: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.text,
        marginBottom: spacing.lg,
    },
    accountsList: {
        gap: spacing.md,
    },
    accountCard: {
        backgroundColor: colors.secondary,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
    },
    accountInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    accountIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    accountDetails: {
        flex: 1,
    },
    accountName: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.medium,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    accountBalance: {
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.medium,
    },
    negativeBalance: {
        color: '#DC2626',
    },
    positiveBalance: {
        color: '#059669',
    },
    menuButton: {
        padding: spacing.xs,
    },
    addAccountButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.xl,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.primary,
        gap: spacing.sm,
    },
    addAccountText: {
        color: colors.primary,
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.medium,
    },
    fab: {
        position: 'absolute',
        right: spacing.xl,
        bottom: spacing.xl,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.lg,
    },
});

export default AccountsScreen; 