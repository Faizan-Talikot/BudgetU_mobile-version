import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
    Dimensions,
    Animated,
    ViewStyle,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays, startOfMonth, endOfMonth, differenceInDays, isValid, isBefore, isAfter, isSameDay, addMonths, subMonths } from 'date-fns';
import { Calendar } from 'react-native-calendars';
import { MarkedDates } from 'react-native-calendars/src/types';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { budgetAPI, categoryAPI, type Budget } from '../services/api';
import type { Category } from '../types/category';

const { width } = Dimensions.get('window');

// Interface for budget categories as they come from the API
interface BudgetCategory {
    category: string;  // Category ID
    allocatedAmount: number;
    spentAmount: number;
}

// Interface for the processed category details we use in the UI
interface CategoryDetails {
    id: string;
    name: string;
    color: string;
    type: 'income' | 'expense';
    icon: string;
    isDefault: boolean;
}

interface ProcessedBudget extends Omit<Budget, 'categories'> {
    categories: {
        category: CategoryDetails;
        allocatedAmount: number;
        spentAmount: number;
    }[];
}

const BudgetsScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [activeTab, setActiveTab] = useState('active');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [categories, setCategories] = useState<Record<string, CategoryDetails>>({});
    const [hasAnyBudgets, setHasAnyBudgets] = useState(true);
    
    // Animation value for progress bar
    const progressAnim = React.useRef(new Animated.Value(0)).current;

    // Load budgets when component mounts or activeTab changes
    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        loadData();
    }, [currentDate, activeTab]);

    // Reset to current month when navigating back to this screen
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setCurrentDate(new Date());
            loadData(); // Refresh data when screen is focused
        });

        return unsubscribe;
    }, [navigation]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [budgetsData, categoriesData] = await Promise.all([
                budgetAPI.getAll(),
                categoryAPI.getAll()
            ]);

            // Set hasAnyBudgets based on whether there are any budgets at all
            setHasAnyBudgets(budgetsData.length > 0);

            // Create a map of category details by ID
            const categoryMap = categoriesData.reduce((acc: Record<string, CategoryDetails>, cat: any) => {
                const id = cat._id || cat.id;
                if (id) {
                    // Check if name is actually an ID (starts with a number and is long)
                    const isNameAnId = /^\d/.test(cat.name) && cat.name.length > 20;
                    
                    // Handle icon - ensure it's a valid Ionicons name
                    let icon = cat.icon;
                    if (icon === 'default-icon' || !icon) {
                        icon = 'help-circle-outline';
                    } else if (!icon.endsWith('-outline')) {
                        icon = `${icon}-outline`;
                    }

                    acc[id] = {
                        id,
                        name: isNameAnId ? 'Unnamed Category' : (cat.name || 'Unknown Category'),
                        color: cat.color || colors.primary,
                        type: cat.type || 'expense',
                        icon,
                        isDefault: cat.isDefault || false
                    };
                }
                return acc;
            }, {});

            // Filter budgets by month and active/past status
            const filteredBudgets = budgetsData.filter(budget => {
                const budgetStartDate = new Date(budget.startDate);
                const budgetEndDate = new Date(budget.endDate);
                const currentMonthStart = startOfMonth(currentDate);
                const currentMonthEnd = endOfMonth(currentDate);

                // Check if budget overlaps with current month
                const isInCurrentMonth = (
                    (budgetStartDate <= currentMonthEnd && budgetEndDate >= currentMonthStart)
                );

                // Check active/past status
                const isActive = budget.status === 'active';
                return isInCurrentMonth && (
                    (activeTab === 'active' && isActive) ||
                    (activeTab === 'past' && !isActive)
                );
            });

            setCategories(categoryMap);
            setBudgets(filteredBudgets);
        } catch (error) {
            console.error('Error loading data:', error);
            Alert.alert('Error', 'Failed to load budgets and categories');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBudget = () => {
        // Navigate to the budget creation flow starting with period selection
        navigation.navigate('CreateBudget', {
            screen: 'CreateBudgetPeriod'
        });
    };

    const handleDeleteBudget = async (budgetId: string) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this budget?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await budgetAPI.delete(budgetId);
                            setBudgets(prev => prev.filter(b => b._id !== budgetId));
                            Alert.alert('Success', 'Budget deleted successfully');
                        } catch (error) {
                            console.error('Error deleting budget:', error);
                            Alert.alert('Error', 'Failed to delete budget');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handlePreviousMonth = () => {
        setCurrentDate(prevDate => subMonths(prevDate, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(prevDate => addMonths(prevDate, 1));
    };

    const renderBudgetCard = (budget: Budget) => {
        // Calculate progress and other metrics
        const totalAllocated = budget.categories.reduce((sum, cat) => sum + (cat.allocatedAmount || 0), 0);
        const availableToBudget = budget.totalIncome - totalAllocated;
        const remainingAmount = totalAllocated - budget.totalSpent;
        const daysLeft = differenceInDays(new Date(budget.endDate), new Date());
        const spentPercentage = (budget.totalSpent / totalAllocated) * 100;
        const isOverBudget = remainingAmount < 0;
        const overBudgetAmount = Math.abs(remainingAmount);
        const dailyBudget = isOverBudget ? 0 : (remainingAmount / (daysLeft || 1));

        return (
            <Card key={budget._id} style={styles.budgetCard}>
                {/* Budget Header */}
                <View style={styles.budgetHeader}>
                    <View>
                        <Text style={styles.budgetTitle}>{budget.name}</Text>
                        <Text style={styles.budgetDate}>
                            {format(new Date(budget.startDate), 'MMM d')} - {format(new Date(budget.endDate), 'MMM d, yyyy')}
                        </Text>
                    </View>
                    <TouchableOpacity 
                        onPress={() => handleDeleteBudget(budget._id!)}
                        style={styles.deleteButton}
                    >
                        <Ionicons name="trash-outline" size={24} color={colors.error} />
                    </TouchableOpacity>
                </View>

                {/* Budget Overview */}
                <View style={styles.budgetInfo}>
                    <View style={styles.budgetRow}>
                        <Text style={styles.budgetLabel}>Total Income</Text>
                        <Text style={styles.budgetAmount}>₹{budget.totalIncome || 0}</Text>
                    </View>
                    <View style={styles.budgetRow}>
                        <Text style={styles.budgetLabel}>Available to Budget</Text>
                        <Text style={[
                            styles.budgetAmount,
                            availableToBudget < 0 ? styles.negativeAmount : styles.positiveAmount
                        ]}>
                            ₹{availableToBudget || 0}
                        </Text>
                    </View>
                    {availableToBudget > 0 && (
                        <Text style={styles.availableMessage}>
                            You have ₹{availableToBudget} unallocated. Consider adding to savings or increasing categories.
                        </Text>
                    )}
                    {availableToBudget < 0 && (
                        <Text style={[styles.availableMessage, styles.warningMessage]}>
                            ⚠️ Warning: You've budgeted ₹{Math.abs(availableToBudget)} more than your income.
                        </Text>
                    )}
                    <View style={styles.budgetRow}>
                        <Text style={styles.budgetLabel}>Total Budgeted</Text>
                        <Text style={styles.budgetAmount}>₹{totalAllocated}</Text>
                    </View>
                    <View style={styles.budgetRow}>
                        <Text style={styles.budgetLabel}>Remaining</Text>
                        <Text style={[
                            styles.budgetAmount,
                            remainingAmount < 0 ? styles.negativeAmount : styles.positiveAmount
                        ]}>
                            ₹{remainingAmount}
                        </Text>
                    </View>
                </View>

                {/* Spent Amount */}
                <Text style={styles.spentText}>
                    Spent: ₹{budget.totalSpent} ({spentPercentage.toFixed(1)}%)
                </Text>

                {/* Days Left */}
                <Text style={styles.daysLeft}>{daysLeft} days left</Text>

                {/* Daily Budget */}
                <View style={[
                    styles.dailyBudgetContainer,
                    isOverBudget && styles.overBudgetContainer
                ]}>
                    <Ionicons 
                        name={isOverBudget ? "warning-outline" : "calendar-outline"} 
                        size={24} 
                        color={isOverBudget ? colors.error : colors.primary} 
                    />
                    <View style={styles.dailyBudgetContent}>
                        {isOverBudget ? (
                            <>
                                <Text style={[styles.dailyBudgetLabel, styles.overBudgetLabel]}>
                                    Over Budget
                                </Text>
                                <Text style={[styles.dailyBudgetAmount, styles.overBudgetAmount]}>
                                    ₹{overBudgetAmount.toFixed(0)} total overspent
                                </Text>
                            </>
                        ) : (
                            <>
                                <Text style={styles.dailyBudgetLabel}>Daily Budget</Text>
                                <Text style={styles.dailyBudgetAmount}>₹{dailyBudget.toFixed(0)}/day</Text>
                            </>
                        )}
                    </View>
                </View>

                {/* Category Breakdown */}
                <View style={styles.categorySection}>
                    <Text style={styles.sectionTitle}>Category Breakdown</Text>
                    {budget.categories && budget.categories.length > 0 ? (
                        budget.categories
                            .map((cat, index) => {
                                // Extract category ID from the category field
                                let categoryId = '';
                                let categoryDetails;

                                if (typeof cat.category === 'string') {
                                    categoryId = cat.category;
                                    categoryDetails = categories[categoryId];
                                } else if (typeof cat.category === 'object' && cat.category !== null) {
                                    // Try to get ID from either id or _id field
                                    categoryId = (cat.category as any).id || (cat.category as any)._id || '';
                                    
                                    // If we have the full category object, use it directly
                                    if (categoryId) {
                                        categoryDetails = {
                                            id: categoryId,
                                            name: (cat.category as any).name || 'Unknown Category',
                                            color: (cat.category as any).color || colors.primary,
                                            type: (cat.category as any).type || 'expense',
                                            icon: (cat.category as any).icon === 'default-icon' ? 'wallet-outline' : ((cat.category as any).icon || 'wallet-outline'),
                                            isDefault: (cat.category as any).isDefault || false
                                        };
                                        
                                        // Add to our categories map if not already there
                                        if (!(categoryId in categories)) {
                                            categories[categoryId] = categoryDetails;
                                        }
                                    }
                                }

                                // Return null for unknown categories to filter them out
                                if (!categoryDetails) {
                                    return null;
                                }

                                // Ensure icon is valid
                                const iconName = categoryDetails.icon === 'default-icon' || !categoryDetails.icon
                                    ? 'wallet-outline'
                                    : categoryDetails.icon.endsWith('-outline') 
                                        ? categoryDetails.icon 
                                        : `${categoryDetails.icon}-outline`;

                                return (
                                    <View key={categoryDetails.id} style={styles.categoryRow}>
                                        <View style={styles.categoryNameContainer}>
                                            <Ionicons 
                                                name={iconName as any} 
                                                size={20} 
                                                color={categoryDetails.color || colors.primary} 
                                            />
                                            <Text style={styles.categoryName}>{categoryDetails.name}</Text>
                                        </View>
                                        <Text style={styles.categoryAmount}>
                                            ₹{cat.spentAmount} / ₹{cat.allocatedAmount}
                                        </Text>
                                    </View>
                                );
                            })
                            .filter(Boolean) // Remove null entries (unknown categories)
                    ) : (
                        <Text style={styles.emptyText}>No categories added</Text>
                    )}
                </View>
            </Card>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyStateContainer}>
            <Ionicons name="wallet-outline" size={80} color={colors.primary} />
            <Text style={styles.emptyStateTitle}>No Budgets Yet</Text>
            <Text style={styles.emptyStateText}>
                Start managing your finances better by creating your first budget.
                Track your spending and achieve your financial goals!
            </Text>
            <Button
                onPress={handleCreateBudget}
                style={styles.emptyStateButton}
                fullWidth
            >
                Create Your First Budget
            </Button>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.header}>
                    <Text style={styles.title}>My Budgets</Text>
                    <Text style={styles.subtitle}>
                        Manage and track your monthly budgets
                    </Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={colors.primary} />
                ) : !hasAnyBudgets ? (
                    // Show this only when user has no budgets at all
                    renderEmptyState()
                ) : (
                    <>
                        <View style={styles.buttonContainer}>
                            <Button
                                onPress={handleCreateBudget}
                                style={styles.createButton}
                                fullWidth
                            >
                                + Create New Budget
                            </Button>
                        </View>

                        <View style={styles.tabContainer}>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'active' && styles.activeTab]}
                                onPress={() => setActiveTab('active')}
                            >
                                <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
                                    Active
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'past' && styles.activeTab]}
                                onPress={() => setActiveTab('past')}
                            >
                                <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
                                    Past
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.monthContainer}>
                            <TouchableOpacity onPress={handlePreviousMonth} style={styles.monthArrow}>
                                <Ionicons name="chevron-back" size={24} color={colors.text} />
                            </TouchableOpacity>
                            <Text style={styles.monthText}>
                                {format(currentDate, 'MMMM yyyy')}
                            </Text>
                            <TouchableOpacity onPress={handleNextMonth} style={styles.monthArrow}>
                                <Ionicons name="chevron-forward" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        {budgets.length === 0 ? (
                            <View style={styles.noMonthBudgetsContainer}>
                                <Ionicons name="calendar-outline" size={40} color={colors.textSecondary} />
                                <Text style={styles.noMonthBudgetsText}>
                                    No budgets for {format(currentDate, 'MMMM yyyy')}
                                </Text>
                            </View>
                        ) : (
                            budgets.map(renderBudgetCard)
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    } as ViewStyle,
    scrollView: {
        flex: 1,
    } as ViewStyle,
    header: {
        padding: spacing.lg,
        paddingTop: 0,
    } as ViewStyle,
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
    buttonContainer: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.xl,
        width: '100%',
    },
    createButton: {
        width: '100%',
    },
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
    } as ViewStyle,
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
        padding: spacing.lg,
        backgroundColor: colors.background,
        borderRadius: borderRadius.lg,
        ...shadows.md,
    },
    budgetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    budgetTitle: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.text,
    },
    budgetDate: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    deleteButton: {
        padding: spacing.xs,
    },
    budgetInfo: {
        marginBottom: spacing.md,
    },
    budgetRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    budgetLabel: {
        fontSize: typography.sizes.base,
        color: colors.textSecondary,
    },
    budgetAmount: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.text,
    },
    spentText: {
        fontSize: typography.sizes.base,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    daysLeft: {
        fontSize: typography.sizes.base,
        color: colors.textSecondary,
        marginBottom: spacing.lg,
    },
    dailyBudgetContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
        backgroundColor: colors.secondary,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
    },
    dailyBudgetContent: {
        marginLeft: spacing.sm,
    },
    dailyBudgetLabel: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    dailyBudgetAmount: {
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.bold,
        color: colors.text,
    },
    categorySection: {
        marginTop: spacing.lg,
    },
    sectionTitle: {
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.medium,
        color: colors.text,
        marginBottom: spacing.md,
    },
    categoryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    categoryNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    categoryName: {
        fontSize: typography.sizes.base,
        color: colors.text,
    },
    categoryAmount: {
        fontSize: typography.sizes.base,
        color: colors.textSecondary,
    },
    emptyText: {
        textAlign: 'center',
        color: colors.textSecondary,
        fontStyle: 'italic',
    },
    emptyStateContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
        marginTop: spacing.xl * 2,
    },
    emptyStateTitle: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.text,
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    emptyStateText: {
        fontSize: typography.sizes.base,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
        lineHeight: typography.sizes.xl,
    },
    emptyStateButton: {
        marginTop: spacing.lg,
    },
    monthContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        marginBottom: spacing.lg,
    } as ViewStyle,
    monthArrow: {
        padding: spacing.sm,
    } as ViewStyle,
    monthText: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.text,
        marginHorizontal: spacing.lg,
    },
    noMonthBudgetsContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
        marginTop: spacing.xl * 2,
    },
    noMonthBudgetsText: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.textSecondary,
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    negativeAmount: {
        color: colors.error
    },
    positiveAmount: {
        color: colors.success
    },
    availableMessage: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs,
        marginBottom: spacing.sm,
        paddingHorizontal: spacing.sm,
    },
    warningMessage: {
        color: colors.error,
    },
    overBudgetContainer: {
        backgroundColor: colors.error + '15', // 15% opacity
        borderWidth: 1,
        borderColor: colors.error,
    },
    overBudgetLabel: {
        color: colors.error,
        fontWeight: typography.weights.medium,
    },
    overBudgetAmount: {
        color: colors.error,
        fontWeight: typography.weights.bold,
    },
    unbudgetedLabel: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        fontStyle: 'italic',
    },
});

export default BudgetsScreen; 