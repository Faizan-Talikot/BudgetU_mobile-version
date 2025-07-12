import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme';
import { transactionApi } from '../services/api';
import { Transaction } from '../services/transactionService';
import { format } from 'date-fns';

interface Props {
    visible: boolean;
    onClose: () => void;
    budgetId: string;
    startDate: string;
    endDate: string;
    categories: Array<{
        id: string;
        name: string;
        icon: string;
        color: string;
    }>;
}

export const UnbudgetedTransactionsModal: React.FC<Props> = ({
    visible,
    onClose,
    budgetId,
    startDate,
    endDate,
    categories,
}) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());
    const [categoryAssignments, setCategoryAssignments] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (visible) {
            loadUnbudgetedTransactions();
        }
    }, [visible]);

    const loadUnbudgetedTransactions = async () => {
        try {
            setIsLoading(true);
            const unbudgetedTransactions = await transactionApi.getUnbudgeted(startDate, endDate);
            setTransactions(unbudgetedTransactions);
        } catch (error) {
            console.error('Error loading unbudgeted transactions:', error);
            Alert.alert('Error', 'Failed to load unbudgeted transactions');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTransaction = (transactionId: string) => {
        const newSelected = new Set(selectedTransactions);
        if (newSelected.has(transactionId)) {
            newSelected.delete(transactionId);
            const newAssignments = { ...categoryAssignments };
            delete newAssignments[transactionId];
            setCategoryAssignments(newAssignments);
        } else {
            newSelected.add(transactionId);
        }
        setSelectedTransactions(newSelected);
    };

    const assignCategory = (transactionId: string, categoryId: string) => {
        setCategoryAssignments(prev => ({
            ...prev,
            [transactionId]: categoryId,
        }));
    };

    const handleAssign = async () => {
        // Validate all selected transactions have categories assigned
        const unassignedTransactions = Array.from(selectedTransactions).filter(
            id => !categoryAssignments[id]
        );

        if (unassignedTransactions.length > 0) {
            Alert.alert('Error', 'Please assign categories to all selected transactions');
            return;
        }

        try {
            setIsProcessing(true);
            const assignments = Array.from(selectedTransactions).map(transactionId => ({
                transactionId,
                categoryId: categoryAssignments[transactionId],
            }));

            const result = await transactionApi.assignToBudget(budgetId, assignments);

            if (result.success) {
                Alert.alert(
                    'Success',
                    `Successfully assigned ${result.assignedCount} transactions to budget`,
                    [{ text: 'OK', onPress: onClose }]
                );
            } else if (result.failedAssignments.length > 0) {
                Alert.alert(
                    'Warning',
                    `${result.assignedCount} transactions assigned, but ${result.failedAssignments.length} failed`
                );
            }
        } catch (error) {
            console.error('Error assigning transactions:', error);
            Alert.alert('Error', 'Failed to assign transactions to budget');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalBackdrop}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Unbudgeted Transactions</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.primary} />
                        </View>
                    ) : transactions.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No unbudgeted transactions found</Text>
                        </View>
                    ) : (
                        <ScrollView style={styles.transactionList}>
                            {transactions.map(transaction => (
                                <View key={transaction.id} style={styles.transactionItem}>
                                    <TouchableOpacity
                                        style={styles.transactionHeader}
                                        onPress={() => toggleTransaction(transaction.id)}
                                    >
                                        <Ionicons
                                            name={selectedTransactions.has(transaction.id) ? "checkbox" : "square-outline"}
                                            size={24}
                                            color={colors.primary}
                                        />
                                        <View style={styles.transactionInfo}>
                                            <Text style={styles.transactionAmount}>
                                                ₹{transaction.amount.toLocaleString()}
                                            </Text>
                                            <Text style={styles.transactionDate}>
                                                {format(new Date(transaction.date), 'MMM d, yyyy')}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>

                                    {selectedTransactions.has(transaction.id) && (
                                        <View style={styles.categorySelector}>
                                            <Text style={styles.selectorLabel}>Assign to category:</Text>
                                            <ScrollView
                                                horizontal
                                                showsHorizontalScrollIndicator={false}
                                                style={styles.categoryList}
                                            >
                                                {categories.map(category => (
                                                    <TouchableOpacity
                                                        key={category.id}
                                                        style={[
                                                            styles.categoryButton,
                                                            categoryAssignments[transaction.id] === category.id && styles.selectedCategory
                                                        ]}
                                                        onPress={() => assignCategory(transaction.id, category.id)}
                                                    >
                                                        <Ionicons
                                                            name={category.icon as any}
                                                            size={20}
                                                            color={categoryAssignments[transaction.id] === category.id ? colors.background : category.color}
                                                        />
                                                        <Text style={[
                                                            styles.categoryName,
                                                            categoryAssignments[transaction.id] === category.id && styles.selectedCategoryText
                                                        ]}>
                                                            {category.name}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>
                                        </View>
                                    )}
                                </View>
                            ))}
                        </ScrollView>
                    )}

                    {transactions.length > 0 && (
                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={[
                                    styles.assignButton,
                                    (selectedTransactions.size === 0 || isProcessing) && styles.disabledButton
                                ]}
                                onPress={handleAssign}
                                disabled={selectedTransactions.size === 0 || isProcessing}
                            >
                                {isProcessing ? (
                                    <ActivityIndicator size="small" color={colors.background} />
                                ) : (
                                    <Text style={styles.assignButtonText}>
                                        Assign {selectedTransactions.size} Transaction{selectedTransactions.size !== 1 ? 's' : ''}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    title: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.text,
    },
    closeButton: {
        padding: spacing.xs,
    },
    loadingContainer: {
        padding: spacing.xl * 2,
        alignItems: 'center',
    },
    emptyContainer: {
        padding: spacing.xl,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: typography.sizes.lg,
        color: colors.textSecondary,
    },
    transactionList: {
        padding: spacing.lg,
    },
    transactionItem: {
        marginBottom: spacing.md,
        backgroundColor: colors.secondary,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
    },
    transactionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        gap: spacing.md,
    },
    transactionInfo: {
        flex: 1,
    },
    transactionAmount: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        color: colors.text,
    },
    transactionDate: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    categorySelector: {
        padding: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    selectorLabel: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    categoryList: {
        flexDirection: 'row',
    },
    categoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        backgroundColor: colors.background,
        marginRight: spacing.sm,
        gap: spacing.xs,
    },
    selectedCategory: {
        backgroundColor: colors.primary,
    },
    categoryName: {
        fontSize: typography.sizes.sm,
        color: colors.text,
    },
    selectedCategoryText: {
        color: colors.background,
    },
    footer: {
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    assignButton: {
        backgroundColor: colors.primary,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.5,
    },
    assignButtonText: {
        color: colors.background,
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.semibold,
    },
}); 