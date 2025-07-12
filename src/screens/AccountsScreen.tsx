import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme';
import { accountAPI, type Account } from '../services/api';
import { AxiosError } from 'axios';

// Available account icons
const accountIcons = [
    { icon: 'cash-outline', name: 'Cash' },
    { icon: 'card-outline', name: 'Card' },
    { icon: 'wallet-outline', name: 'Wallet' },
    { icon: 'phone-portrait-outline', name: 'UPI' },
    { icon: 'card-outline', name: 'Credit Card' },
];

const AccountsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [newAccountName, setNewAccountName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState(accountIcons[0].icon);
    const [initialAmount, setInitialAmount] = useState('0');
    const [loading, setLoading] = useState(false);
    const [selectedType, setSelectedType] = useState<Account['type']>('savings');
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        // Load accounts initially and on every focus
        const unsubscribe = navigation.addListener('focus', loadAccounts);
        return unsubscribe;
    }, [navigation]);

    const loadAccounts = async () => {
        try {
            setIsLoading(true);
            const fetchedAccounts = await accountAPI.getAll();
            setAccounts(fetchedAccounts);
        } catch (error) {
            console.error('Error loading accounts:', error);
            Alert.alert('Error', 'Failed to load accounts');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        loadAccounts();
    };

    const handleAddAccount = async () => {
        try {
            setLoading(true);
            const newAccount = await accountAPI.create({
                type: selectedType,
                name: newAccountName,
                balance: parseFloat(initialAmount) || 0,
                icon: selectedIcon,
                isDefault: false
            });
            setAccounts([...accounts, newAccount]);
            setIsModalVisible(false);
            setNewAccountName('');
            setInitialAmount('0');
            setSelectedIcon(accountIcons[0].icon);
        } catch (error) {
            console.error('Error creating account:', error);
            Alert.alert('Error', 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    const handleEditAccount = async () => {
        if (!editingAccount || !newAccountName.trim()) return;

        try {
            setLoading(true);
            const updatedAccount = await accountAPI.update(editingAccount._id, {
                type: selectedType,
                name: newAccountName.trim(),
                icon: selectedIcon,
            });

            setAccounts(accounts.map(acc =>
                acc._id === editingAccount._id ? updatedAccount : acc
            ));
            resetModalState();
            Alert.alert('Success', 'Account updated successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to update account');
            console.error('Error updating account:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!editingAccount) return;

        try {
            setLoading(true);
            await accountAPI.delete(editingAccount._id);
            setAccounts(accounts.filter(acc => acc._id !== editingAccount._id));
            resetModalState();
            Alert.alert('Success', 'Account deleted successfully');
        } catch (error: unknown) {
            if ((error as AxiosError)?.response?.status === 400) {
                Alert.alert('Error', 'Cannot delete default account');
            } else {
                Alert.alert('Error', 'Failed to delete account');
            }
            console.error('Error deleting account:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetModalState = () => {
        setNewAccountName('');
        setSelectedIcon(accountIcons[0].icon);
        setInitialAmount('0');
        setSelectedType('savings');
        setIsModalVisible(false);
        setIsEditModalVisible(false);
        setEditingAccount(null);
    };

    const handleAccountPress = (account: Account) => {
        setEditingAccount(account);
        setNewAccountName(account.name);
        setSelectedIcon(account.icon);
        setSelectedType(account.type);
        setIsEditModalVisible(true);
    };

    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
    const totalExpense = accounts.reduce((sum, account) => sum + (account.balance < 0 ? -account.balance : 0), 0);
    const totalIncome = accounts.reduce((sum, account) => sum + (account.balance > 0 ? account.balance : 0), 0);

    if (loading && accounts.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

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

                    {isEdit && editingAccount?.isDefault && (
                        <View style={styles.defaultAccountMessage}>
                            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
                            <Text style={styles.defaultAccountText}>
                                This is a default account. You can edit its details but it cannot be deleted.
                            </Text>
                        </View>
                    )}

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
                        {isEdit && !editingAccount?.isDefault && (
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
                                key={account._id}
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
                                    {account.isDefault && (
                                        <View style={styles.defaultBadge}>
                                            <Text style={styles.defaultBadgeText}>Default</Text>
                                        </View>
                                    )}
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
        justifyContent: 'space-between',
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    defaultBadge: {
        backgroundColor: colors.primary + '15', // 15% opacity
        paddingHorizontal: spacing.xs,
        paddingVertical: 1,
        borderRadius: borderRadius.sm,
        borderWidth: 0.5,
        borderColor: colors.primary,
        marginLeft: spacing.sm,
    },
    defaultBadgeText: {
        color: colors.primary,
        fontSize: typography.sizes.xs,
        fontWeight: typography.weights.medium,
    },
    defaultAccountMessage: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    defaultAccountText: {
        color: colors.textSecondary,
        fontSize: typography.sizes.base,
        marginLeft: spacing.sm,
    },
});

export default AccountsScreen; 