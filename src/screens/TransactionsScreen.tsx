import React, { useState } from 'react';
import {
    View,
    ScrollView,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Ionicons } from '@expo/vector-icons';

const TransactionsScreen = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [activeFilter, setActiveFilter] = useState('All');

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.header}>
                    <Text style={styles.title}>My Transactions</Text>
                    <Text style={styles.subtitle}>
                        Track and manage your expenses and income
                    </Text>
                </View>

                <Button
                    onPress={() => setIsModalVisible(true)}
                    style={styles.addButton}
                    fullWidth
                >
                    + Add Transaction
                </Button>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color={colors.textSecondary} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search transactions..."
                            placeholderTextColor={colors.textSecondary}
                        />
                    </View>
                </View>

                {/* Filters */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filtersContainer}
                >
                    {['All', 'Expenses', 'Income'].map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[
                                styles.filterChip,
                                activeFilter === filter && styles.activeFilterChip,
                            ]}
                            onPress={() => setActiveFilter(filter)}
                        >
                            <Text
                                style={[
                                    styles.filterText,
                                    activeFilter === filter && styles.activeFilterText,
                                ]}
                            >
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Transaction List */}
                <View style={styles.transactionList}>
                    <View style={styles.transactionHeader}>
                        <Text style={styles.transactionTitle}>Transaction History</Text>
                        <Text style={styles.transactionCount}>4 transactions</Text>
                    </View>

                    <Card style={styles.transactionCard}>
                        <TouchableOpacity style={styles.transaction}>
                            <View style={styles.transactionIconContainer}>
                                <Ionicons
                                    name="arrow-down"
                                    size={20}
                                    color={colors.error}
                                    style={styles.transactionIcon}
                                />
                            </View>
                            <View style={styles.transactionInfo}>
                                <Text style={styles.transactionName}>food</Text>
                                <View style={styles.transactionMeta}>
                                    <Text style={styles.transactionCategory}>food</Text>
                                    <Text style={styles.transactionBudget}>May budget</Text>
                                </View>
                            </View>
                            <View style={styles.transactionDetails}>
                                <Text style={[styles.transactionAmount, styles.expense]}>
                                    -₹20
                                </Text>
                                <Text style={styles.transactionDate}>09 May</Text>
                                <Text style={styles.transactionMethod}>Cash</Text>
                            </View>
                        </TouchableOpacity>
                    </Card>
                </View>
            </ScrollView>

            {/* Add Transaction Modal */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add New Transaction</Text>
                        <Text style={styles.modalSubtitle}>
                            Record your income or expenses to keep track of your finances.
                        </Text>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Type</Text>
                            <View style={styles.typeContainer}>
                                <TouchableOpacity
                                    style={[styles.typeButton, styles.activeTypeButton]}
                                >
                                    <Text style={[styles.typeText, styles.activeTypeText]}>
                                        Income
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.typeButton}>
                                    <Text style={styles.typeText}>Expense</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Amount (₹)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0.00"
                                keyboardType="numeric"
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Category</Text>
                            <TouchableOpacity style={styles.selectButton}>
                                <Text style={styles.selectButtonText}>Select category</Text>
                                <Ionicons name="chevron-down" size={20} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Grocery shopping, Dinner out, Salary"
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Budget (Optional)</Text>
                            <TouchableOpacity style={styles.selectButton}>
                                <Text style={styles.selectButtonText}>No specific budget</Text>
                                <Ionicons name="chevron-down" size={20} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalButtons}>
                            <Button
                                variant="primary"
                                onPress={() => { }}
                                style={styles.saveButton}
                                fullWidth
                            >
                                Save Transaction
                            </Button>
                            <Button
                                variant="secondary"
                                onPress={() => setIsModalVisible(false)}
                                fullWidth
                            >
                                Cancel
                            </Button>
                        </View>
                    </View>
                </View>
            </Modal>
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
    addButton: {
        marginHorizontal: spacing.lg,
        marginBottom: spacing.xl,
    },
    searchContainer: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.lg,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.secondary,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    searchInput: {
        flex: 1,
        marginLeft: spacing.sm,
        fontSize: typography.sizes.base,
        color: colors.text,
    },
    filtersContainer: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.xl,
    },
    filterChip: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        backgroundColor: colors.secondary,
        marginRight: spacing.sm,
    },
    activeFilterChip: {
        backgroundColor: colors.primary,
    },
    filterText: {
        color: colors.textSecondary,
        fontSize: typography.sizes.sm,
    },
    activeFilterText: {
        color: colors.background,
        fontWeight: typography.weights.medium,
    },
    transactionList: {
        paddingHorizontal: spacing.lg,
    },
    transactionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    transactionTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        color: colors.text,
    },
    transactionCount: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    transactionCard: {
        padding: 0,
        marginBottom: spacing.md,
    },
    transaction: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
    },
    transactionIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    transactionIcon: {
        transform: [{ rotate: '45deg' }],
    },
    transactionInfo: {
        flex: 1,
    },
    transactionName: {
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.medium,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    transactionMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    transactionCategory: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginRight: spacing.sm,
    },
    transactionBudget: {
        fontSize: typography.sizes.sm,
        color: colors.primary,
    },
    transactionDetails: {
        alignItems: 'flex-end',
    },
    transactionAmount: {
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.medium,
        marginBottom: spacing.xs,
    },
    expense: {
        color: colors.error,
    },
    transactionDate: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    transactionMethod: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: spacing.xl,
    },
    modalTitle: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    modalSubtitle: {
        fontSize: typography.sizes.base,
        color: colors.textSecondary,
        marginBottom: spacing.xl,
    },
    formGroup: {
        marginBottom: spacing.lg,
    },
    label: {
        fontSize: typography.sizes.sm,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    typeContainer: {
        flexDirection: 'row',
        backgroundColor: colors.secondary,
        borderRadius: borderRadius.lg,
        padding: spacing.xs,
    },
    typeButton: {
        flex: 1,
        paddingVertical: spacing.sm,
        alignItems: 'center',
        borderRadius: borderRadius.md,
    },
    activeTypeButton: {
        backgroundColor: colors.background,
        ...shadows.sm,
    },
    typeText: {
        fontSize: typography.sizes.base,
        color: colors.textSecondary,
    },
    activeTypeText: {
        color: colors.text,
        fontWeight: typography.weights.medium,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        fontSize: typography.sizes.base,
        color: colors.text,
    },
    selectButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
    },
    selectButtonText: {
        fontSize: typography.sizes.base,
        color: colors.textSecondary,
    },
    modalButtons: {
        marginTop: spacing.xl,
    },
    saveButton: {
        marginBottom: spacing.md,
    },
});

export default TransactionsScreen; 