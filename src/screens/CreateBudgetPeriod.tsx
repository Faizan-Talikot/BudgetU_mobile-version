import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    Modal,
    Alert,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { format, endOfMonth, startOfMonth, addMonths, isAfter, isBefore, isWithinInterval, addDays, isSameMonth } from 'date-fns';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BudgetStackParamList } from '../navigation/BudgetStackNavigator';
import { Calendar } from 'react-native-calendars';
import { Button } from '../components/Button';
import { budgetAPI } from '../services/api';
import { transactionApi } from '../services/api';

interface ExistingBudget {
    name: string;
    startDate: Date;
    endDate: Date;
}

type MarkedDates = {
    [date: string]: {
        selected?: boolean;
        marked?: boolean;
        startingDay?: boolean;
        color?: string;
        dotColor?: string;
    };
};

interface PaginatedTransactionResponse {
    pagination: {
        page: number;
        pages: number;
        total: number;
    };
    transactions: Array<{
        _id: string;
        amount: number;
        isIncome: boolean;
        description: string;
        date: string;
        category: string;
        [key: string]: any;
    }>;
}

const CreateBudgetPeriod: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<BudgetStackParamList>>();
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
    const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
    const [dateType, setDateType] = useState<'start' | 'end'>('start');
    const [existingBudgets, setExistingBudgets] = useState<ExistingBudget[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        loadExistingBudgets();
    }, []);

    const loadExistingBudgets = async () => {
        try {
            const budgets = await budgetAPI.getAll();
            setExistingBudgets(budgets.map(budget => ({
                name: budget.name,
                startDate: new Date(budget.startDate),
                endDate: new Date(budget.endDate)
            })));
        } catch (error) {
            console.error('Error loading budgets:', error);
            Alert.alert('Error', 'Failed to load existing budgets');
        } finally {
            setIsLoading(false);
        }
    };

    const checkDateOverlap = (start: Date, end: Date): ExistingBudget | null => {
        return existingBudgets.find(budget => {
            const budgetStart = new Date(budget.startDate);
            const budgetEnd = new Date(budget.endDate);
            
            // Check if either the start or end date falls within an existing budget period
            return (
                isWithinInterval(start, { start: budgetStart, end: budgetEnd }) ||
                isWithinInterval(end, { start: budgetStart, end: budgetEnd }) ||
                isWithinInterval(budgetStart, { start, end }) ||
                isWithinInterval(budgetEnd, { start, end })
            );
        }) || null;
    };

    const handlePeriodSelect = async (type: 'current' | 'next' | 'custom') => {
        const today = new Date();
        let startDate: Date;
        let endDate: Date;

        switch (type) {
            case 'current':
                startDate = today;
                endDate = endOfMonth(today);
                await validateAndNavigate(startDate, endDate);
                break;
            case 'next':
                startDate = startOfMonth(addMonths(today, 1));
                endDate = endOfMonth(startDate);
                await validateAndNavigate(startDate, endDate);
                break;
            case 'custom':
                setShowCalendar(true);
                setDateType('start');
                setSelectedStartDate(null);
                setSelectedEndDate(null);
                break;
            default:
                return;
        }
    };

    const validateAndNavigate = async (startDate: Date, endDate: Date) => {
        const overlappingBudget = checkDateOverlap(startDate, endDate);
        if (overlappingBudget) {
            Alert.alert(
                'Date Conflict',
                `You already have a budget "${overlappingBudget.name}" for the period ${format(overlappingBudget.startDate, 'MMM d')} to ${format(overlappingBudget.endDate, 'MMM d')}. Please choose different dates.`
            );
            return;
        }

        try {
            setIsLoading(true);
            // Calculate existing income for the period
            const formattedStartDate = format(startDate, 'yyyy-MM-dd');
            const formattedEndDate = format(endDate, 'yyyy-MM-dd');
            const existingIncome = await calculateExistingIncome(formattedStartDate, formattedEndDate);

            // Navigate to next screen with existing income
            navigation.navigate('CreateBudgetAmount', {
                startDate: formattedStartDate,
                endDate: formattedEndDate,
                existingIncome
            });
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'Failed to process dates. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDateSelect = async (day: any) => {
        const selectedDate = new Date(day.timestamp);
        
        if (dateType === 'start') {
            setSelectedStartDate(selectedDate);
            setDateType('end');
        } else {
            let start = selectedStartDate!;
            let end = selectedDate;
            
            if (isBefore(selectedDate, start)) {
                // If end date is before start date, swap them
                end = start;
                start = selectedDate;
            }
            
            setSelectedEndDate(end);
            setShowCalendar(false);
            await validateAndNavigate(start, end);
        }
    };

    const getMarkedDates = (): MarkedDates => {
        const markedDates: MarkedDates = {};
        
        // Mark existing budget periods
        existingBudgets.forEach(budget => {
            let currentDate = new Date(budget.startDate);
            const endDate = new Date(budget.endDate);
            
            while (currentDate <= endDate) {
                const dateStr = format(currentDate, 'yyyy-MM-dd');
                markedDates[dateStr] = {
                    marked: true,
                    dotColor: colors.error,
                };
                currentDate = addDays(currentDate, 1);
            }
        });

        // Mark selected dates
        if (selectedStartDate) {
            const startStr = format(selectedStartDate, 'yyyy-MM-dd');
            markedDates[startStr] = {
                ...markedDates[startStr],
                selected: true,
                startingDay: true,
                color: colors.primary
            };
        }

        return markedDates;
    };

    const groupBudgetsByMonth = () => {
        const grouped: { [key: string]: ExistingBudget[] } = {};
        
        existingBudgets.forEach(budget => {
            const monthKey = format(new Date(budget.startDate), 'yyyy-MM');
            if (!grouped[monthKey]) {
                grouped[monthKey] = [];
            }
            grouped[monthKey].push(budget);
        });

        return Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, budgets]) => ({
                month,
                title: format(new Date(month), 'MMMM yyyy'),
                budgets: budgets.sort((a, b) => 
                    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
                )
            }));
    };

    const renderListView = () => {
        const groupedBudgets = groupBudgetsByMonth();
        
        return (
            <ScrollView style={styles.listContainer}>
                {groupedBudgets.map(({ month, title, budgets }) => (
                    <View key={month} style={styles.monthSection}>
                        <Text style={styles.monthTitle}>{title}</Text>
                        {budgets.length > 0 ? (
                            budgets.map((budget, index) => (
                                <View key={index} style={styles.budgetItem}>
                                    <View style={styles.budgetItemDot} />
                                    <View style={styles.budgetItemContent}>
                                        <Text style={styles.budgetItemTitle}>
                                            {budget.name}
                                        </Text>
                                        <Text style={styles.budgetItemDates}>
                                            {format(new Date(budget.startDate), 'MMM d')} - {format(new Date(budget.endDate), 'MMM d')}
                                        </Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.noBudgetsText}>No budgets for this month</Text>
                        )}
                    </View>
                ))}
            </ScrollView>
        );
    };

    // Calculate existing income for the selected period
    const calculateExistingIncome = async (start: string, end: string) => {
        try {
            setIsLoading(true);
            console.log('Fetching transactions for period:', { start, end });
            
            // Get transactions for the period
            const response = await transactionApi.getByDateRange(start, end);
            console.log('Got transactions:', response);
            
            // Extract transactions array from paginated response
            const transactions = response.transactions || [];
            
            // Filter and sum up income transactions
            const totalIncome = transactions
                .filter(t => t.isIncome)
                .reduce((sum, t) => sum + t.amount, 0);
            
            console.log('Calculated total income:', totalIncome);
            return totalIncome;
            
        } catch (error) {
            console.error('Error calculating existing income:', error);
            return 0;
        } finally {
            setIsLoading(false);
        }
    };

    const handleContinue = async () => {
        if (!startDate || !endDate) {
            Alert.alert('Error', 'Please select both start and end dates');
            return;
        }

        try {
            setIsLoading(true);
            // Calculate existing income for the period
            const existingIncome = await calculateExistingIncome(startDate, endDate);

            // Navigate to next screen with existing income
            navigation.navigate('CreateBudgetAmount', {
                startDate,
                endDate,
                existingIncome
            });
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'Failed to process dates. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.title}>Select Period</Text>
                    <Text style={styles.subtitle}>Choose your budget duration</Text>
                </View>
            </View>

            <View style={styles.content}>
                <TouchableOpacity 
                    style={styles.option}
                    onPress={() => handlePeriodSelect('current')}
                >
                    <View style={styles.optionIcon}>
                        <Ionicons name="calendar-outline" size={24} color={colors.primary} />
                    </View>
                    <View style={styles.optionContent}>
                        <Text style={styles.optionTitle}>Rest of Current Month</Text>
                        <Text style={styles.optionDescription}>
                            {format(new Date(), 'MMM d')} - {format(endOfMonth(new Date()), 'MMM d')}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.option}
                    onPress={() => handlePeriodSelect('next')}
                >
                    <View style={styles.optionIcon}>
                        <Ionicons name="calendar-outline" size={24} color={colors.primary} />
                    </View>
                    <View style={styles.optionContent}>
                        <Text style={styles.optionTitle}>Next Month</Text>
                        <Text style={styles.optionDescription}>
                            {format(startOfMonth(addMonths(new Date(), 1)), 'MMM d')} - {format(endOfMonth(addMonths(new Date(), 1)), 'MMM d')}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.option}
                    onPress={() => handlePeriodSelect('custom')}
                >
                    <View style={styles.optionIcon}>
                        <Ionicons name="calendar-outline" size={24} color={colors.primary} />
                    </View>
                    <View style={styles.optionContent}>
                        <Text style={styles.optionTitle}>Custom Period</Text>
                        <Text style={styles.optionDescription}>
                            Choose your own start and end dates
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <Modal
                visible={showCalendar}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowCalendar(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.calendarContainer}>
                        <View style={styles.calendarHeader}>
                            <Text style={styles.calendarTitle}>
                                {isLoading ? 'Loading Budgets...' : `Select ${dateType === 'start' ? 'Start' : 'End'} Date`}
                            </Text>
                            <View style={styles.viewToggle}>
                                <TouchableOpacity 
                                    style={[
                                        styles.viewToggleButton,
                                        viewMode === 'calendar' && styles.viewToggleButtonActive
                                    ]}
                                    onPress={() => setViewMode('calendar')}
                                >
                                    <Ionicons 
                                        name="calendar" 
                                        size={20} 
                                        color={viewMode === 'calendar' ? colors.primary : colors.textSecondary} 
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[
                                        styles.viewToggleButton,
                                        viewMode === 'list' && styles.viewToggleButtonActive
                                    ]}
                                    onPress={() => setViewMode('list')}
                                >
                                    <Ionicons 
                                        name="list" 
                                        size={20} 
                                        color={viewMode === 'list' ? colors.primary : colors.textSecondary} 
                                    />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity 
                                onPress={() => setShowCalendar(false)}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        
                        {isLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={colors.primary} />
                                <Text style={styles.loadingText}>Loading existing budgets...</Text>
                            </View>
                        ) : viewMode === 'calendar' ? (
                            <>
                                <Calendar
                                    minDate={format(new Date(), 'yyyy-MM-dd')}
                                    onDayPress={handleDateSelect}
                                    markedDates={getMarkedDates()}
                                    theme={{
                                        selectedDayBackgroundColor: colors.primary,
                                        todayTextColor: colors.primary,
                                        arrowColor: colors.primary,
                                        monthTextColor: colors.text,
                                        textDayFontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
                                        textMonthFontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
                                        textDayHeaderFontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
                                    }}
                                />

                                {selectedStartDate && (
                                    <View style={styles.dateInfo}>
                                        <Text style={styles.dateInfoText}>
                                            Selected: {format(selectedStartDate, 'MMM d, yyyy')}
                                            {dateType === 'end' ? ' (Now select end date)' : ''}
                                        </Text>
                                    </View>
                                )}

                                <View style={styles.legend}>
                                    <View style={styles.legendItem}>
                                        <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
                                        <Text style={styles.legendText}>Existing Budget Period</Text>
                                    </View>
                                    <View style={styles.legendItem}>
                                        <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                                        <Text style={styles.legendText}>Selected Period</Text>
                                    </View>
                                </View>
                            </>
                        ) : (
                            renderListView()
                        )}
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
    header: {
        padding: spacing.lg,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    backButton: {
        padding: spacing.xs,
        marginRight: spacing.sm,
        marginTop: 4,
    },
    headerTextContainer: {
        flex: 1,
    },
    title: {
        fontSize: typography.sizes['2xl'],
        fontWeight: typography.weights.bold,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: typography.sizes.base,
        color: colors.textSecondary,
    },
    content: {
        padding: spacing.lg,
        gap: spacing.lg,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.secondary,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        gap: spacing.md,
    },
    optionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionContent: {
        flex: 1,
    },
    optionTitle: {
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.medium,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    optionDescription: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        padding: spacing.lg,
    },
    calendarContainer: {
        backgroundColor: colors.background,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    calendarTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.text,
    },
    closeButton: {
        padding: spacing.xs,
    },
    dateInfo: {
        marginTop: spacing.md,
        padding: spacing.md,
        backgroundColor: colors.secondary,
        borderRadius: borderRadius.md,
    },
    dateInfoText: {
        fontSize: typography.sizes.sm,
        color: colors.text,
        textAlign: 'center',
    },
    loadingContainer: {
        padding: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: spacing.md,
        fontSize: typography.sizes.base,
        color: colors.textSecondary,
    },
    legend: {
        marginTop: spacing.md,
        padding: spacing.md,
        backgroundColor: colors.secondary,
        borderRadius: borderRadius.md,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: spacing.sm,
    },
    legendText: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    viewToggle: {
        flexDirection: 'row',
        backgroundColor: colors.secondary,
        borderRadius: borderRadius.full,
        padding: 2,
        marginHorizontal: spacing.md,
    },
    viewToggleButton: {
        padding: spacing.sm,
        borderRadius: borderRadius.full,
    },
    viewToggleButtonActive: {
        backgroundColor: colors.background,
    },
    listContainer: {
        maxHeight: 400,
    },
    monthSection: {
        marginBottom: spacing.lg,
    },
    monthTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.text,
        marginBottom: spacing.sm,
    },
    budgetItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.secondary,
        borderRadius: borderRadius.md,
        marginBottom: spacing.xs,
    },
    budgetItemDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.error,
        marginRight: spacing.sm,
    },
    budgetItemContent: {
        flex: 1,
    },
    budgetItemTitle: {
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.medium,
        color: colors.text,
    },
    budgetItemDates: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginTop: 2,
    },
    noBudgetsText: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        fontStyle: 'italic',
        paddingVertical: spacing.sm,
    },
});

export default CreateBudgetPeriod; 