import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme';
import { storage, StorageKeys } from '../utils/storage';

interface Account {
    id: string;
    type: 'upi' | 'cash' | 'savings';
    name: string;
    balance: number;
    icon: string;
}

// Available account icons
const accountIcons = [
    { icon: 'cash-outline', name: 'Cash' },
    { icon: 'card-outline', name: 'Card' },
    { icon: 'wallet-outline', name: 'Wallet' },
    { icon: 'phone-portrait-outline', name: 'UPI' },
    { icon: 'card-outline', name: 'Credit Card' },
];

// Default accounts
const defaultAccounts: Account[] = [
    { id: '1', type: 'upi', name: 'UPI', balance: 0, icon: 'phone-portrait-outline' },
    { id: '2', type: 'cash', name: 'Cash', balance: 0, icon: 'cash-outline' },
    { id: '3', type: 'savings', name: 'Savings', balance: 0, icon: 'wallet-outline' },
];

const AccountsScreen = () => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [newAccountName, setNewAccountName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState(accountIcons[0].icon);
    const [initialAmount, setInitialAmount] = useState('0');

    useEffect(() => {
        loadAccounts();
    }, []);

    const loadAccounts = async () => {
        try {
            const savedAccounts = await storage.get<Account[]>(StorageKeys.ACCOUNTS);
            if (savedAccounts) {
                setAccounts(savedAccounts);
            } else {
                // If no saved accounts, use defaults
                setAccounts(defaultAccounts);
                await storage.set(StorageKeys.ACCOUNTS, defaultAccounts);
            }
        } catch (error) {
            console.error('Error loading accounts:', error);
        }
    };

    const saveAccounts = async (updatedAccounts: Account[]) => {
        try {
            await storage.set(StorageKeys.ACCOUNTS, updatedAccounts);
        } catch (error) {
            console.error('Error saving accounts:', error);
        }
    };

    const handleAddAccount = async () => {
        if (newAccountName.trim()) {
            const newAccount: Account = {
                id: `account_${Date.now()}`,
                type: 'savings',
                name: newAccountName.trim(),
                balance: parseFloat(initialAmount) || 0,
                icon: selectedIcon,
            };

            const updatedAccounts = [...accounts, newAccount];
            setAccounts(updatedAccounts);
            await saveAccounts(updatedAccounts);
            resetModalState();
        }
    };

    const handleEditAccount = async () => {
        if (!editingAccount || !newAccountName.trim()) return;

        const updatedAccount = {
            ...editingAccount,
            name: newAccountName.trim(),
            icon: selectedIcon,
            balance: parseFloat(initialAmount) || editingAccount.balance,
        };

        const updatedAccounts = accounts.map(acc =>
            acc.id === editingAccount.id ? updatedAccount : acc
        );

        setAccounts(updatedAccounts);
        await saveAccounts(updatedAccounts);
        resetModalState();
    };

    const handleDeleteAccount = async () => {
        if (!editingAccount) return;

        const updatedAccounts = accounts.filter(acc => acc.id !== editingAccount.id);
        setAccounts(updatedAccounts);
        await saveAccounts(updatedAccounts);
        resetModalState();
    };

    const resetModalState = () => {
        setNewAccountName('');
        setSelectedIcon(accountIcons[0].icon);
        setInitialAmount('0');
        setIsModalVisible(false);
        setIsEditModalVisible(false);
        setEditingAccount(null);
    };

    const handleAccountPress = (account: Account) => {
        setEditingAccount(account);
        setNewAccountName(account.name);
        setSelectedIcon(account.icon);
        setInitialAmount(account.balance.toString());
        setIsEditModalVisible(true);
    };

    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
    const totalExpense = accounts.reduce((sum, account) => sum + (account.balance < 0 ? -account.balance : 0), 0);
    const totalIncome = accounts.reduce((sum, account) => sum + (account.balance > 0 ? account.balance : 0), 0);

    const renderAccountModal = (isEdit: boolean) => (
        <Modal
            visible={isEdit ? isEditModalVisible : isModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={resetModalState}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            {isEdit ? 'Edit account' : 'Add new account'}
                        </Text>
                        <TouchableOpacity 
                            onPress={resetModalState}
                            style={styles.closeButton}
                        >
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Initial Amount Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.modalLabel}>Initial amount</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0"
                            value={initialAmount}
                            onChangeText={setInitialAmount}
                            keyboardType="numeric"
                            placeholderTextColor={colors.textSecondary}
                        />
                        <Text style={styles.helperText}>
                            *Initial amount will not be reflected in analysis
                        </Text>
                    </View>

                    {/* Account Name Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.modalLabel}>Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter account name"
                            value={newAccountName}
                            onChangeText={setNewAccountName}
                            placeholderTextColor={colors.textSecondary}
                        />
                    </View>

                    {/* Icon Selection */}
                    <View style={styles.iconSection}>
                        <Text style={styles.modalLabel}>Icon</Text>
                        <View style={styles.iconGrid}>
                            {accountIcons.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.iconOption,
                                        selectedIcon === item.icon && styles.selectedIconOption
                                    ]}
                                    onPress={() => setSelectedIcon(item.icon)}
                                >
                                    <Ionicons
                                        name={item.icon as any}
                                        size={24}
                                        color={selectedIcon === item.icon ? colors.background : colors.text}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.modalActions}>
                        {isEdit && (
                            <TouchableOpacity
                                style={[styles.modalButton, styles.deleteButton]}
                                onPress={handleDeleteAccount}
                            >
                                <Text style={styles.deleteButtonText}>DELETE</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={resetModalState}
                        >
                            <Text style={styles.cancelButtonText}>CANCEL</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.saveButton]}
                            onPress={isEdit ? handleEditAccount : handleAddAccount}
                            disabled={!newAccountName.trim()}
                        >
                            <Text style={styles.saveButtonText}>SAVE</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
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
                        {accounts.map((account) => (
                            <TouchableOpacity
                                key={account.id}
                                onPress={() => handleAccountPress(account)}
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
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                    
                    {/* Add New Account Button */}
                    <TouchableOpacity 
                        style={styles.addAccountButton}
                        onPress={() => setIsModalVisible(true)}
                    >
                        <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
                        <Text style={styles.addAccountText}>ADD NEW ACCOUNT</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Add Account Modal */}
            {renderAccountModal(false)}

            {/* Edit Account Modal */}
            {renderAccountModal(true)}
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
        paddingVertical: spacing.xl,
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
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
    },
    modalContent: {
        backgroundColor: colors.background,
        margin: spacing.lg,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    modalTitle: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.text,
    },
    closeButton: {
        padding: spacing.xs,
    },
    inputContainer: {
        marginBottom: spacing.lg,
    },
    modalLabel: {
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.medium,
        color: colors.text,
        marginBottom: spacing.sm,
    },
    input: {
        backgroundColor: colors.secondary,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        fontSize: typography.sizes.base,
        color: colors.text,
    },
    helperText: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    iconSection: {
        marginBottom: spacing.xl,
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    iconOption: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedIconOption: {
        backgroundColor: colors.primary,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: spacing.md,
    },
    modalButton: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.lg,
        minWidth: 100,
        alignItems: 'center',
    },
    deleteButton: {
        backgroundColor: '#FEE2E2',
    },
    deleteButtonText: {
        color: '#DC2626',
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.medium,
    },
    cancelButton: {
        backgroundColor: colors.secondary,
    },
    saveButton: {
        backgroundColor: colors.primary,
    },
    cancelButtonText: {
        color: colors.text,
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.medium,
    },
    saveButtonText: {
        color: colors.background,
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.medium,
    },
});

export default AccountsScreen; 