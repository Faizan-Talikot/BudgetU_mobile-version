import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays, startOfMonth, endOfMonth, differenceInDays, isValid, isBefore, isAfter, isSameDay } from 'date-fns';
import { Calendar } from 'react-native-calendars';
import { MarkedDates } from 'react-native-calendars/src/types';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

const { width } = Dimensions.get('window');

// Define types for our data structures
interface Category {
    name: string;
    allocated: number;
    spent: number;
    color: string;
}

interface Budget {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    totalAmount: number;
    spentAmount: number;
    categories: Category[];
}

// Sample data - replace with real data later
const sampleBudget: Budget = {
    id: '1',
    name: 'May Budget',
    startDate: '2024-05-01',
    endDate: '2024-05-31',
    totalAmount: 15000,
    spentAmount: 3750,
    categories: [
        { name: 'Food & Dining', allocated: 5000, spent: 2000, color: '#FF6B6B' },
        { name: 'Transportation', allocated: 2000, spent: 800, color: '#4ECDC4' },
        { name: 'Entertainment', allocated: 1500, spent: 500, color: '#45B7D1' },
        { name: 'Education', allocated: 4000, spent: 450, color: '#96CEB4' },
    ]
};

const BudgetsScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('active');
    const [currentStep, setCurrentStep] = useState(1);
    const [budgetName, setBudgetName] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
    const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
    const [showStartCalendar, setShowStartCalendar] = useState(false);
    const [showEndCalendar, setShowEndCalendar] = useState(false);
    const [dateError, setDateError] = useState('');
    const [calendarVisible, setCalendarVisible] = useState(false);
    const [dateType, setDateType] = useState<'start' | 'end'>('start');
    
    // Animation value for progress bar
    const progressAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        // Animate progress bar when component mounts
        Animated.timing(progressAnim, {
            toValue: sampleBudget.spentAmount / sampleBudget.totalAmount,
            duration: 1000,
            useNativeDriver: false,
        }).start();
    }, []);

    // Function to format date for calendar marking
    const getMarkedDates = (): MarkedDates => {
        const markedDates: MarkedDates = {};
        
        if (!selectedStartDate) return markedDates;

        const startDateStr = format(selectedStartDate, 'yyyy-MM-dd');
        markedDates[startDateStr] = {
            selected: true,
            startingDay: true,
            color: colors.primary,
        };
        
        if (selectedEndDate) {
            const endDateStr = format(selectedEndDate, 'yyyy-MM-dd');
            markedDates[endDateStr] = {
                selected: true,
                endingDay: true,
                color: colors.primary,
            };

            // Mark dates in between
            let currentDate = addDays(selectedStartDate, 1);
            while (isBefore(currentDate, selectedEndDate)) {
                const dateStr = format(currentDate, 'yyyy-MM-dd');
                markedDates[dateStr] = {
                    selected: true,
                    color: colors.primary,
                };
                currentDate = addDays(currentDate, 1);
            }
        }

        return markedDates;
    };

    // Format date safely
    const formatDate = (date: Date | null, formatStr: string): string => {
        if (!date) return '';
        return format(date, formatStr);
    };

    // Validate dates and update error state
    const validateDates = (start: Date | null, end: Date | null): boolean => {
        if (!start || !end) {
            setDateError('Please select both start and end dates');
            return false;
        }

        if (isBefore(start, startOfMonth(new Date()))) {
            setDateError('Start date cannot be in the past');
            return false;
        }

        if (isBefore(end, start)) {
            setDateError('End date must be after or same as start date');
            return false;
        }

        setDateError('');
        return true;
    };

    // Check if form is valid for next step
    const isFormValid = (): boolean => {
        return Boolean(
            budgetName.trim() !== '' &&
            parseFloat(totalAmount) > 0 &&
            selectedStartDate &&
            selectedEndDate &&
            !dateError
        );
    };

    const handleDateSelection = (type: 'current' | 'next' | 'custom') => {
        if (type === 'current') {
            const now = new Date();
            const monthEnd = endOfMonth(now);
            setSelectedStartDate(now);
            setSelectedEndDate(monthEnd);
        } else if (type === 'next') {
            const today = new Date();
            const firstDayNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
            const lastDayNextMonth = endOfMonth(firstDayNextMonth);
            setSelectedStartDate(firstDayNextMonth);
            setSelectedEndDate(lastDayNextMonth);
        } else {
            setSelectedStartDate(null);
            setSelectedEndDate(null);
            handleShowCalendar('start');
        }
    };

    const handleShowCalendar = (type: 'start' | 'end') => {
        setDateType(type);
        setCalendarVisible(true);
    };

    const handleDateSelect = (day: any) => {
        const selectedDate = new Date(day.timestamp);
        if (dateType === 'start') {
            setSelectedStartDate(selectedDate);
            // If end date exists and is before new start date, clear it
            if (selectedEndDate && isBefore(selectedEndDate, selectedDate)) {
                setSelectedEndDate(null);
            }
        } else {
            setSelectedEndDate(selectedDate);
        }
        setCalendarVisible(false);
    };

    const handleCreateBudget = () => {
        // Navigate to the budget creation flow starting with period selection
        navigation.navigate('CreateBudget', {
            screen: 'CreateBudgetPeriod'
        });
    };

    const renderBudgetCard = (budget: Budget) => {
        const spentPercentage = (budget.spentAmount / budget.totalAmount) * 100;
        const remainingAmount = budget.totalAmount - budget.spentAmount;
        const daysLeft = differenceInDays(new Date(budget.endDate), new Date());
        const dailyBudget = remainingAmount / (daysLeft || 1);

        return (
            <Card style={styles.budgetCard}>
                {/* Budget Header */}
                <View style={styles.budgetHeader}>
                    <View>
                        <Text style={styles.budgetTitle}>{budget.name}</Text>
                        <Text style={styles.budgetDate}>
                            {format(new Date(budget.startDate), 'MMM d')} - {format(new Date(budget.endDate), 'MMM d, yyyy')}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.moreButton}>
                        <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Budget Overview */}
                <View style={styles.overview}>
                    <View style={styles.overviewItem}>
                        <Text style={styles.overviewLabel}>Total Budget</Text>
                        <Text style={styles.overviewAmount}>₹{budget.totalAmount.toLocaleString()}</Text>
                    </View>
                    <View style={styles.overviewDivider} />
                    <View style={styles.overviewItem}>
                        <Text style={styles.overviewLabel}>Remaining</Text>
                        <Text style={[styles.overviewAmount, { color: colors.success }]}>
                            ₹{remainingAmount.toLocaleString()}
                        </Text>
                    </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.progressLabel}>
                            Spent: ₹{budget.spentAmount.toLocaleString()} ({spentPercentage.toFixed(1)}%)
                        </Text>
                        <Text style={styles.daysLeft}>{daysLeft} days left</Text>
                    </View>
                    <View style={styles.progressBar}>
                        <Animated.View 
                            style={[
                                styles.progressFill,
                                {
                                    width: progressAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['0%', '100%']
                                    }),
                                    backgroundColor: spentPercentage > 90 ? colors.error : 
                                                   spentPercentage > 75 ? colors.warning : 
                                                   colors.success
                                }
                            ]} 
                        />
                    </View>
                </View>

                {/* Daily Budget */}
                <View style={styles.dailyBudgetContainer}>
                    <View style={styles.dailyBudgetContent}>
                        <Ionicons name="calendar-outline" size={24} color={colors.primary} />
                        <View style={styles.dailyBudgetText}>
                            <Text style={styles.dailyBudgetLabel}>Daily Budget</Text>
                            <Text style={styles.dailyBudgetAmount}>₹{dailyBudget.toFixed(0)}/day</Text>
                        </View>
                    </View>
                </View>

                {/* Categories */}
                <View style={styles.categorySection}>
                    <Text style={styles.sectionTitle}>Category Breakdown</Text>
                    {budget.categories.map((category: Category, index: number) => (
                        <View key={index} style={styles.categoryItem}>
                            <View style={styles.categoryHeader}>
                                <View style={styles.categoryTitleSection}>
                                    <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                                    <Text style={styles.categoryName}>{category.name}</Text>
                                </View>
                                <Text style={styles.categoryAmount}>
                                    ₹{category.spent.toLocaleString()} / ₹{category.allocated.toLocaleString()}
                                </Text>
                            </View>
                            <View style={styles.categoryProgress}>
                                <View 
                                    style={[
                                        styles.categoryProgressFill,
                                        {
                                            width: `${(category.spent / category.allocated) * 100}%`,
                                            backgroundColor: category.color
                                        }
                                    ]} 
                                />
                            </View>
                        </View>
                    ))}
                </View>
            </Card>
        );
    };

    const renderModalContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <ScrollView 
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.modalContentContainer}
                    >
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
                                value={budgetName}
                                onChangeText={setBudgetName}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Total Budget Amount (₹)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. 12000"
                                keyboardType="numeric"
                                placeholderTextColor={colors.textSecondary}
                                value={totalAmount}
                                onChangeText={setTotalAmount}
                            />
                        </View>

                        <View style={styles.dateContainer}>
                            <Text style={styles.label}>Budget Duration</Text>
                            <TouchableOpacity 
                                style={[
                                    styles.dateOption,
                                    !selectedStartDate && !selectedEndDate && styles.selectedDateOption
                                ]}
                                onPress={() => handleDateSelection('current')}
                            >
                                <Ionicons 
                                    name="calendar-outline" 
                                    size={24} 
                                    color={!selectedStartDate && !selectedEndDate ? colors.background : colors.primary} 
                                />
                                <View style={styles.dateOptionText}>
                                    <Text style={[
                                        styles.dateOptionTitle,
                                        !selectedStartDate && !selectedEndDate && styles.selectedDateText
                                    ]}>Rest of Current Month</Text>
                                    <Text style={[
                                        styles.dateOptionSubtitle,
                                        !selectedStartDate && !selectedEndDate && styles.selectedDateText
                                    ]}>
                                        {format(new Date(), 'MMM d')} - {format(endOfMonth(new Date()), 'MMM d')}
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[
                                    styles.dateOption,
                                    selectedStartDate && selectedEndDate && 
                                    isSameDay(selectedStartDate, startOfMonth(addDays(new Date(), 1))) && 
                                    styles.selectedDateOption
                                ]}
                                onPress={() => handleDateSelection('next')}
                            >
                                <Ionicons 
                                    name="calendar-outline" 
                                    size={24} 
                                    color={selectedStartDate && selectedEndDate && 
                                          isSameDay(selectedStartDate, startOfMonth(addDays(new Date(), 1))) ? 
                                          colors.background : colors.primary} 
                                />
                                <View style={styles.dateOptionText}>
                                    <Text style={[
                                        styles.dateOptionTitle,
                                        selectedStartDate && selectedEndDate && 
                                        isSameDay(selectedStartDate, startOfMonth(addDays(new Date(), 1))) && 
                                        styles.selectedDateText
                                    ]}>Next Month</Text>
                                    <Text style={[
                                        styles.dateOptionSubtitle,
                                        selectedStartDate && selectedEndDate && 
                                        isSameDay(selectedStartDate, startOfMonth(addDays(new Date(), 1))) && 
                                        styles.selectedDateText
                                    ]}>
                                        {format(startOfMonth(addDays(new Date(), 31)), 'MMM d')} - {format(endOfMonth(addDays(new Date(), 31)), 'MMM d')}
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[
                                    styles.dateOption,
                                    selectedStartDate && selectedEndDate && 
                                    !isSameDay(selectedStartDate, new Date()) && 
                                    !isSameDay(selectedStartDate, startOfMonth(addDays(new Date(), 1))) && 
                                    styles.selectedDateOption
                                ]}
                                onPress={() => handleDateSelection('custom')}
                            >
                                <Ionicons 
                                    name="calendar-outline" 
                                    size={24} 
                                    color={selectedStartDate && selectedEndDate && 
                                          !isSameDay(selectedStartDate, new Date()) && 
                                          !isSameDay(selectedStartDate, startOfMonth(addDays(new Date(), 1))) ? 
                                          colors.background : colors.primary} 
                                />
                                <View style={styles.dateOptionText}>
                                    <Text style={[
                                        styles.dateOptionTitle,
                                        selectedStartDate && selectedEndDate && 
                                        !isSameDay(selectedStartDate, new Date()) && 
                                        !isSameDay(selectedStartDate, startOfMonth(addDays(new Date(), 1))) && 
                                        styles.selectedDateText
                                    ]}>Custom Period</Text>
                                    <Text style={[
                                        styles.dateOptionSubtitle,
                                        selectedStartDate && selectedEndDate && 
                                        !isSameDay(selectedStartDate, new Date()) && 
                                        !isSameDay(selectedStartDate, startOfMonth(addDays(new Date(), 1))) && 
                                        styles.selectedDateText
                                    ]}>Choose your own start and end dates</Text>
                                </View>
                            </TouchableOpacity>

                            <View style={styles.selectedDatesContainer}>
                                <View style={styles.selectedDateRow}>
                                    <TouchableOpacity 
                                        style={[styles.selectedDateButton, { flex: 1 }]}
                                        onPress={() => handleShowCalendar('start')}
                                    >
                                        <Text style={styles.selectedDateLabel}>Start:</Text>
                                        <Text style={styles.selectedDateValue}>
                                            {selectedStartDate ? formatDate(selectedStartDate, 'MMM d, yyyy') : 'Select Start Date'}
                                        </Text>
                                        <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                                    </TouchableOpacity>

                                    <TouchableOpacity 
                                        style={[styles.selectedDateButton, { flex: 1 }]}
                                        onPress={() => handleShowCalendar('end')}
                                    >
                                        <Text style={styles.selectedDateLabel}>End:</Text>
                                        <Text style={styles.selectedDateValue}>
                                            {selectedEndDate ? formatDate(selectedEndDate, 'MMM d, yyyy') : 'Select End Date'}
                                        </Text>
                                        <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                                    </TouchableOpacity>
                                </View>
                                {selectedStartDate && selectedEndDate && (
                                    <Text style={styles.dateRangeSummary}>
                                        Duration: {differenceInDays(selectedEndDate, selectedStartDate) + 1} days
                                    </Text>
                                )}
                            </View>

                            {dateError ? (
                                <Text style={styles.errorText}>{dateError}</Text>
                            ) : null}
                        </View>
                    </ScrollView>
                );
            // Add more cases for additional steps
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.header}>
                    <Text style={styles.title}>My Budgets</Text>
                    <Text style={styles.subtitle}>
                        Manage and track your monthly budgets
                    </Text>
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        onPress={handleCreateBudget}
                        style={styles.createButton}
                        fullWidth
                    >
                        + Create New Budget
                    </Button>
                </View>

                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'active' && styles.activeTab]}
                        onPress={() => setActiveTab('active')}
                    >
                        <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
                            Active Budgets
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'past' && styles.activeTab]}
                        onPress={() => setActiveTab('past')}
                    >
                        <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
                            Past Budgets
                        </Text>
                    </TouchableOpacity>
                </View>

                {renderBudgetCard(sampleBudget)}
            </ScrollView>

            {/* Budget Creation Modal */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalBody}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Create New Budget</Text>
                                <TouchableOpacity 
                                    style={styles.closeButton}
                                    onPress={() => {
                                        setIsModalVisible(false);
                                        setCurrentStep(1);
                                        setSelectedStartDate(null);
                                        setSelectedEndDate(null);
                                        setBudgetName('');
                                        setTotalAmount('');
                                    }}
                                >
                                    <Ionicons name="close" size={24} color={colors.text} />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.modalSubtitle}>
                                Set up your budget details. You'll be able to add categories in the next step.
                            </Text>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Budget Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. November 2023"
                                    placeholderTextColor={colors.textSecondary}
                                    value={budgetName}
                                    onChangeText={setBudgetName}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Total Budget Amount (₹)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. 12000"
                                    keyboardType="numeric"
                                    placeholderTextColor={colors.textSecondary}
                                    value={totalAmount}
                                    onChangeText={setTotalAmount}
                                />
                            </View>

                            <View style={styles.dateContainer}>
                                <Text style={styles.label}>Budget Duration</Text>
                                <TouchableOpacity 
                                    style={[
                                        styles.dateOption,
                                        !selectedStartDate && !selectedEndDate && styles.selectedDateOption
                                    ]}
                                    onPress={() => handleDateSelection('current')}
                                >
                                    <Ionicons 
                                        name="calendar-outline" 
                                        size={24} 
                                        color={!selectedStartDate && !selectedEndDate ? colors.background : colors.primary} 
                                    />
                                    <View style={styles.dateOptionText}>
                                        <Text style={[
                                            styles.dateOptionTitle,
                                            !selectedStartDate && !selectedEndDate && styles.selectedDateText
                                        ]}>Rest of Current Month</Text>
                                        <Text style={[
                                            styles.dateOptionSubtitle,
                                            !selectedStartDate && !selectedEndDate && styles.selectedDateText
                                        ]}>
                                            {format(new Date(), 'MMM d')} - {format(endOfMonth(new Date()), 'MMM d')}
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={[
                                        styles.dateOption,
                                        selectedStartDate && selectedEndDate && 
                                        isSameDay(selectedStartDate, startOfMonth(addDays(new Date(), 1))) && 
                                        styles.selectedDateOption
                                    ]}
                                    onPress={() => handleDateSelection('next')}
                                >
                                    <Ionicons 
                                        name="calendar-outline" 
                                        size={24} 
                                        color={selectedStartDate && selectedEndDate && 
                                              isSameDay(selectedStartDate, startOfMonth(addDays(new Date(), 1))) ? 
                                              colors.background : colors.primary} 
                                    />
                                    <View style={styles.dateOptionText}>
                                        <Text style={[
                                            styles.dateOptionTitle,
                                            selectedStartDate && selectedEndDate && 
                                            isSameDay(selectedStartDate, startOfMonth(addDays(new Date(), 1))) && 
                                            styles.selectedDateText
                                        ]}>Next Month</Text>
                                        <Text style={[
                                            styles.dateOptionSubtitle,
                                            selectedStartDate && selectedEndDate && 
                                            isSameDay(selectedStartDate, startOfMonth(addDays(new Date(), 1))) && 
                                            styles.selectedDateText
                                        ]}>
                                            {format(startOfMonth(addDays(new Date(), 31)), 'MMM d')} - {format(endOfMonth(addDays(new Date(), 31)), 'MMM d')}
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={[
                                        styles.dateOption,
                                        selectedStartDate && selectedEndDate && 
                                        !isSameDay(selectedStartDate, new Date()) && 
                                        !isSameDay(selectedStartDate, startOfMonth(addDays(new Date(), 1))) && 
                                        styles.selectedDateOption
                                    ]}
                                    onPress={() => handleDateSelection('custom')}
                                >
                                    <Ionicons 
                                        name="calendar-outline" 
                                        size={24} 
                                        color={selectedStartDate && selectedEndDate && 
                                              !isSameDay(selectedStartDate, new Date()) && 
                                              !isSameDay(selectedStartDate, startOfMonth(addDays(new Date(), 1))) ? 
                                              colors.background : colors.primary} 
                                    />
                                    <View style={styles.dateOptionText}>
                                        <Text style={[
                                            styles.dateOptionTitle,
                                            selectedStartDate && selectedEndDate && 
                                            !isSameDay(selectedStartDate, new Date()) && 
                                            !isSameDay(selectedStartDate, startOfMonth(addDays(new Date(), 1))) && 
                                            styles.selectedDateText
                                        ]}>Custom Period</Text>
                                        <Text style={[
                                            styles.dateOptionSubtitle,
                                            selectedStartDate && selectedEndDate && 
                                            !isSameDay(selectedStartDate, new Date()) && 
                                            !isSameDay(selectedStartDate, startOfMonth(addDays(new Date(), 1))) && 
                                            styles.selectedDateText
                                        ]}>Choose your own start and end dates</Text>
                                    </View>
                                </TouchableOpacity>

                                <View style={styles.selectedDatesContainer}>
                                    <View style={styles.selectedDateRow}>
                                        <TouchableOpacity 
                                            style={[styles.selectedDateButton, { flex: 1 }]}
                                            onPress={() => handleShowCalendar('start')}
                                        >
                                            <Text style={styles.selectedDateLabel}>Start:</Text>
                                            <Text style={styles.selectedDateValue}>
                                                {selectedStartDate ? formatDate(selectedStartDate, 'MMM d, yyyy') : 'Select Start Date'}
                                            </Text>
                                            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                                        </TouchableOpacity>

                                        <TouchableOpacity 
                                            style={[styles.selectedDateButton, { flex: 1 }]}
                                            onPress={() => handleShowCalendar('end')}
                                        >
                                            <Text style={styles.selectedDateLabel}>End:</Text>
                                            <Text style={styles.selectedDateValue}>
                                                {selectedEndDate ? formatDate(selectedEndDate, 'MMM d, yyyy') : 'Select End Date'}
                                            </Text>
                                            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                                        </TouchableOpacity>
                                    </View>
                                    {selectedStartDate && selectedEndDate && (
                                        <Text style={styles.dateRangeSummary}>
                                            Duration: {differenceInDays(selectedEndDate, selectedStartDate) + 1} days
                                        </Text>
                                    )}
                                </View>

                                {dateError ? (
                                    <Text style={styles.errorText}>{dateError}</Text>
                                ) : null}
                            </View>
                        </View>

                        <View style={styles.modalFooter}>
                            <Button
                                variant="primary"
                                onPress={() => setCurrentStep(currentStep + 1)}
                                style={styles.nextButton}
                                fullWidth
                                disabled={!isFormValid()}
                            >
                                Next: Add Categories
                            </Button>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Calendar Modal */}
            <Modal
                visible={calendarVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setCalendarVisible(false)}
            >
                <View style={styles.calendarModalContainer}>
                    <View style={styles.calendarModalContent}>
                        <View style={styles.calendarHeader}>
                            <Text style={styles.calendarTitle}>
                                Select {dateType === 'start' ? 'Start' : 'End'} Date
                            </Text>
                            <TouchableOpacity 
                                onPress={() => setCalendarVisible(false)}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        <Calendar
                            minDate={dateType === 'start' ? format(new Date(), 'yyyy-MM-dd') : 
                                   selectedStartDate ? format(selectedStartDate, 'yyyy-MM-dd') : undefined}
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
    buttonContainer: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.xl,
        width: '100%',
    },
    createButton: {
        width: '100%',
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
        padding: spacing.lg,
    },
    budgetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.lg,
    },
    budgetTitle: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    budgetDate: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    moreButton: {
        padding: spacing.xs,
    },
    overview: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
        backgroundColor: colors.secondary,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
    },
    overviewItem: {
        flex: 1,
        alignItems: 'center',
    },
    overviewDivider: {
        width: 1,
        height: '100%',
        backgroundColor: colors.border,
        marginHorizontal: spacing.md,
    },
    overviewLabel: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    overviewAmount: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.text,
    },
    progressContainer: {
        marginBottom: spacing.lg,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    progressLabel: {
        fontSize: typography.sizes.sm,
        color: colors.text,
    },
    daysLeft: {
        fontSize: typography.sizes.sm,
        color: colors.primary,
        fontWeight: typography.weights.medium,
    },
    progressBar: {
        height: 8,
        backgroundColor: colors.secondary,
        borderRadius: borderRadius.full,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: borderRadius.full,
    },
    dailyBudgetContainer: {
        backgroundColor: colors.secondary,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.lg,
    },
    dailyBudgetContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dailyBudgetText: {
        marginLeft: spacing.sm,
    },
    dailyBudgetLabel: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    dailyBudgetAmount: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.text,
    },
    categorySection: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.medium,
        color: colors.text,
        marginBottom: spacing.md,
    },
    categoryItem: {
        marginBottom: spacing.md,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    categoryTitleSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: spacing.xs,
    },
    categoryName: {
        fontSize: typography.sizes.sm,
        color: colors.text,
    },
    categoryAmount: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    categoryProgress: {
        height: 4,
        backgroundColor: colors.secondary,
        borderRadius: borderRadius.full,
        overflow: 'hidden',
    },
    categoryProgressFill: {
        height: '100%',
        borderRadius: borderRadius.full,
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
        height: '90%',
        display: 'flex',
        flexDirection: 'column',
    },
    modalBody: {
        flex: 1,
        padding: spacing.lg,
    },
    modalFooter: {
        padding: spacing.lg,
        paddingBottom: Platform.OS === 'ios' ? 34 : spacing.xl,
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        gap: spacing.md,
    },
    nextButton: {
        marginBottom: spacing.xs,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    modalTitle: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.text,
    },
    closeButton: {
        padding: spacing.xs,
        marginRight: -spacing.xs,
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
        backgroundColor: colors.secondary,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        fontSize: typography.sizes.base,
        color: colors.text,
    },
    dateContainer: {
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    dateOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.secondary,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        gap: spacing.sm,
    },
    selectedDateOption: {
        backgroundColor: colors.primary,
    },
    selectedDateText: {
        color: colors.background,
    },
    dateOptionText: {
        flex: 1,
    },
    dateOptionTitle: {
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.medium,
        color: colors.text,
    },
    dateOptionSubtitle: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    selectedDatesContainer: {
        marginTop: spacing.md,
    },
    selectedDateRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.xs,
    },
    selectedDateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: spacing.sm,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    selectedDateLabel: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginRight: spacing.xs,
    },
    selectedDateValue: {
        fontSize: typography.sizes.sm,
        color: colors.text,
        fontWeight: typography.weights.medium,
        flex: 1,
        marginRight: spacing.xs,
    },
    dateRangeSummary: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginTop: spacing.sm,
    },
    errorText: {
        color: colors.error,
        fontSize: typography.sizes.sm,
        marginTop: spacing.xs,
    },
    calendarModalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        padding: spacing.lg,
    },
    calendarModalContent: {
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
    modalContentContainer: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
    },
});

export default BudgetsScreen; 