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
import { colors, typography, spacing } from '../theme';

const BudgetsScreen = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('active');

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.header}>
                    <Text style={styles.title}>My Budgets</Text>
                    <Text style={styles.subtitle}>
                        Manage and track your monthly budgets
                    </Text>
                </View>

                <Button
                    onPress={() => setIsModalVisible(true)}
                    style={styles.createButton}
                    fullWidth
                >
                    + Create New Budget
                </Button>

                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={[
                            styles.tab,
                            activeTab === 'active' && styles.activeTab,
                        ]}
                        onPress={() => setActiveTab('active')}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === 'active' && styles.activeTabText,
                            ]}
                        >
                            Active Budgets
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.tab,
                            activeTab === 'past' && styles.activeTab,
                        ]}
                        onPress={() => setActiveTab('past')}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === 'past' && styles.activeTabText,
                            ]}
                        >
                            Past Budgets
                        </Text>
                    </TouchableOpacity>
                </View>

                <Card style={styles.budgetCard}>
                    <View style={styles.budgetHeader}>
                        <View>
                            <Text style={styles.budgetTitle}>May budget</Text>
                            <Text style={styles.budgetDate}>29/5/2025 - 20/5/2025</Text>
                        </View>
                        <TouchableOpacity>
                            <Text style={styles.moreButton}>...</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.budgetTotal}>
                        <Text style={styles.budgetLabel}>Total Budget</Text>
                        <Text style={styles.budgetAmount}>₹1,500</Text>
                    </View>

                    <View style={styles.spentContainer}>
                        <Text style={styles.spentLabel}>Spent</Text>
                        <Text style={styles.spentAmount}>₹20 (1%)</Text>
                    </View>

                    <View style={styles.progressBar}>
                        <View style={[styles.progress, { width: '1%' }]} />
                    </View>

                    <View style={styles.categoriesSection}>
                        <Text style={styles.categoryTitle}>Top Categories</Text>
                        <View style={styles.category}>
                            <View style={styles.categoryHeader}>
                                <View style={[styles.categoryDot, { backgroundColor: colors.primary }]} />
                                <Text style={styles.categoryName}>food</Text>
                            </View>
                            <Text style={styles.categoryAmount}>₹20 / ₹1,000</Text>
                        </View>
                    </View>

                    <View style={styles.unallocatedSection}>
                        <Text style={styles.unallocatedLabel}>Unallocated Budget</Text>
                        <Text style={styles.unallocatedAmount}>₹500</Text>
                    </View>

                    <Button
                        variant="outline"
                        onPress={() => { }}
                        style={styles.allocateButton}
                        fullWidth
                    >
                        + Allocate Remaining
                    </Button>
                </Card>
            </ScrollView>

            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Create New Budget</Text>
                        <Text style={styles.modalSubtitle}>
                            Set up your budget details. You'll be able to add categories in the next step.
                        </Text>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Budget Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. November 2023"
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Total Budget Amount (₹)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. 12000"
                                keyboardType="numeric"
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>

                        <View style={styles.dateContainer}>
                            <View style={styles.dateField}>
                                <Text style={styles.label}>Start Date</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="dd-mm-yyyy"
                                    placeholderTextColor={colors.textSecondary}
                                />
                            </View>
                            <View style={styles.dateField}>
                                <Text style={styles.label}>End Date</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="dd-mm-yyyy"
                                    placeholderTextColor={colors.textSecondary}
                                />
                            </View>
                        </View>

                        <View style={styles.modalButtons}>
                            <Button
                                variant="primary"
                                onPress={() => { }}
                                style={styles.nextButton}
                                fullWidth
                            >
                                Next: Add Categories
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
    createButton: {
        marginHorizontal: spacing.lg,
        marginBottom: spacing.xl,
    },
    tabs: {
        flexDirection: 'row',
        marginHorizontal: spacing.lg,
        marginBottom: spacing.lg,
    },
    tab: {
        flex: 1,
        paddingVertical: spacing.sm,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: colors.primary,
    },
    tabText: {
        color: colors.textSecondary,
        fontSize: typography.sizes.base,
    },
    activeTabText: {
        color: colors.primary,
        fontWeight: typography.weights.medium,
    },
    budgetCard: {
        marginHorizontal: spacing.lg,
        marginBottom: spacing.lg,
    },
    budgetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    budgetTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        color: colors.text,
    },
    budgetDate: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    moreButton: {
        fontSize: typography.sizes.xl,
        color: colors.textSecondary,
    },
    budgetTotal: {
        marginTop: spacing.lg,
    },
    budgetLabel: {
        fontSize: typography.sizes.base,
        color: colors.text,
    },
    budgetAmount: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.text,
        marginTop: spacing.xs,
    },
    spentContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.lg,
    },
    spentLabel: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    spentAmount: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    progressBar: {
        height: 8,
        backgroundColor: colors.secondary,
        borderRadius: 4,
        marginTop: spacing.sm,
    },
    progress: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 4,
    },
    categoriesSection: {
        marginTop: spacing.xl,
    },
    categoryTitle: {
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.medium,
        color: colors.text,
        marginBottom: spacing.md,
    },
    category: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: spacing.sm,
    },
    categoryName: {
        fontSize: typography.sizes.base,
        color: colors.text,
    },
    categoryAmount: {
        fontSize: typography.sizes.base,
        color: colors.text,
    },
    unallocatedSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.xl,
        marginBottom: spacing.lg,
    },
    unallocatedLabel: {
        fontSize: typography.sizes.base,
        color: colors.text,
    },
    unallocatedAmount: {
        fontSize: typography.sizes.base,
        color: colors.warning,
        fontWeight: typography.weights.medium,
    },
    allocateButton: {
        marginTop: spacing.md,
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
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: spacing.md,
        fontSize: typography.sizes.base,
        color: colors.text,
    },
    dateContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xl,
    },
    dateField: {
        flex: 1,
        marginRight: spacing.md,
    },
    modalButtons: {
        gap: spacing.md,
    },
    nextButton: {
        marginBottom: spacing.md,
    },
});

export default BudgetsScreen; 