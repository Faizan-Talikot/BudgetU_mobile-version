import React, { useState, useRef } from 'react';
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
    NativeScrollEvent,
    NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { format, addMonths, subMonths } from 'date-fns';

const { width } = Dimensions.get('window');

// Local theme colors
const THEME = {
    white: '#FFFFFF',
};

// Define transaction type
interface Transaction {
    id: string;
    type: 'income' | 'expense';
    name: string;
    category: string;
    amount: number;
    date: string;
    time: string;
}

// Dummy transactions data grouped by date
const transactionsByDate: Record<string, Transaction[]> = {
    'May 18, Sunday': [
        {
            id: '1',
            type: 'income',
            name: 'Salary',
            category: 'Card',
            amount: 10000.00,
            date: 'May 18',
            time: '10:30 AM'
        },
        {
            id: '2',
            type: 'expense',
            name: 'Beauty',
            category: 'Card',
            amount: 100.00,
            date: 'May 18',
            time: '2:15 PM'
        },
    ],
    'May 12, Monday': [
        {
            id: '3',
            type: 'income',
            name: 'Grants',
            category: 'Cash',
            amount: 500.00,
            date: 'May 12',
            time: '11:45 AM'
        },
        {
            id: '4',
            type: 'expense',
            name: 'Bills',
            category: 'Cash',
            amount: 500.00,
            date: 'May 12',
            time: '4:20 PM'
        },
    ],
};

const TransactionsScreen = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [activeFilter, setActiveFilter] = useState('All');
    const [currentDate, setCurrentDate] = useState(new Date());
    const fabAnim = useRef(new Animated.Value(1)).current;
    const lastScrollY = useRef(0);
    const [transactionType, setTransactionType] = useState('INCOME');
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');

    // Dummy data for demonstration
    const summaryData = {
        expense: 600.00,
        income: 10500.00,
        total: 9900.00
    };

    const handlePreviousMonth = () => {
        setCurrentDate(prevDate => subMonths(prevDate, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(prevDate => addMonths(prevDate, 1));
    };

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        
        if (currentScrollY > lastScrollY.current && currentScrollY > 20) {
            // Scrolling down - hide FAB
            Animated.spring(fabAnim, {
                toValue: 0,
                useNativeDriver: true,
            }).start();
        } else {
            // Scrolling up - show FAB
            Animated.spring(fabAnim, {
                toValue: 1,
                useNativeDriver: true,
            }).start();
        }
        
        lastScrollY.current = currentScrollY;
    };

    const handleNumberPress = (num: string) => {
        if (amount.includes('.') && num === '.') return;
        setAmount(prev => prev + num);
    };

    const handleDeletePress = () => {
        setAmount(prev => prev.slice(0, -1));
    };

    const handleOperatorPress = (operator: string) => {
        // Handle basic calculations if needed
        console.log(operator);
    };

    const renderTransaction = (transaction: Transaction) => (
        <Card key={transaction.id} style={styles.transactionCard}>
            <TouchableOpacity style={styles.transaction}>
                <View style={[
                    styles.transactionIconContainer,
                    transaction.type === 'expense' ? styles.expenseIcon : styles.incomeIcon
                ]}>
                    <Ionicons 
                        name={transaction.type === 'expense' ? "arrow-down" : "arrow-up"} 
                        size={20} 
                        color={THEME.white}
                    />
                </View>
                <View style={styles.transactionInfo}>
                    <Text style={styles.transactionName}>{transaction.name}</Text>
                    <Text style={styles.transactionCategory}>{transaction.category}</Text>
                </View>
                <View style={styles.transactionAmount}>
                    <Text style={[
                        styles.amountText,
                        transaction.type === 'expense' ? styles.expenseText : styles.incomeText
                    ]}>
                        {transaction.type === 'expense' ? '-' : '+'}₹{transaction.amount.toFixed(2)}
                    </Text>
                    <Text style={styles.timeText}>{transaction.time}</Text>
                </View>
            </TouchableOpacity>
        </Card>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView 
                style={styles.scrollView}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {/* Month Navigation */}
                <View style={styles.monthContainer}>
                    <TouchableOpacity onPress={handlePreviousMonth} style={styles.monthArrow}>
                        <Ionicons name="chevron-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.monthText}>
                        {format(currentDate, 'MMMM, yyyy')}
                    </Text>
                    <TouchableOpacity onPress={handleNextMonth} style={styles.monthArrow}>
                        <Ionicons name="chevron-forward" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Summary Cards */}
                <View style={styles.summaryContainer}>
                    <View style={[styles.summaryCard, styles.expenseCard]}>
                        <Text style={styles.summaryLabel}>EXPENSE</Text>
                        <Text style={[styles.summaryAmount, styles.expenseText]}>
                            ₹{summaryData.expense.toFixed(2)}
                        </Text>
                    </View>
                    <View style={[styles.summaryCard, styles.incomeCard]}>
                        <Text style={styles.summaryLabel}>INCOME</Text>
                        <Text style={[styles.summaryAmount, styles.incomeText]}>
                            ₹{summaryData.income.toFixed(2)}
                        </Text>
                    </View>
                    <View style={[styles.summaryCard, styles.totalCard]}>
                        <Text style={styles.summaryLabel}>TOTAL</Text>
                        <Text style={[styles.summaryAmount, styles.totalText]}>
                            ₹{summaryData.total.toFixed(2)}
                        </Text>
                    </View>
                </View>

                {/* Transaction Filters */}
                <View style={styles.filtersContainer}>
                    {['All', 'Expenses', 'Income'].map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[
                                styles.filterButton,
                                activeFilter === filter && styles.activeFilterButton,
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
                </View>

                {/* Transaction List */}
                <View style={styles.transactionList}>
                    {Object.entries(transactionsByDate).map(([date, transactions]) => (
                        <View key={date}>
                            <Text style={styles.dateHeader}>{date}</Text>
                            {transactions.map(transaction => renderTransaction(transaction))}
                        </View>
                    ))}
                </View>
            </ScrollView>

            <Animated.View 
                style={[
                    styles.fab,
                    {
                        transform: [
                            {
                                scale: fabAnim
                            },
                            {
                                translateY: fabAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [100, 0]
                                })
                            }
                        ],
                        opacity: fabAnim
                    }
                ]}
            >
                <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                    <Ionicons name="add" size={24} color={THEME.white} />
                </TouchableOpacity>
            </Animated.View>

            {/* Add Transaction Modal */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <TouchableOpacity 
                                onPress={() => setIsModalVisible(false)}
                                style={[styles.modalHeaderButton, styles.headerButtonLeft]}
                            >
                                <Ionicons name="close-outline" size={24} color={colors.text} />
                                <Text style={styles.headerButtonText}>CANCEL</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={() => {
                                    // Handle save
                                    setIsModalVisible(false);
                                }}
                                style={[styles.modalHeaderButton, styles.headerButtonRight]}
                            >
                                <Text style={[styles.headerButtonText, styles.saveButtonText]}>SAVE</Text>
                                <Ionicons name="checkmark-outline" size={24} color={colors.primary} />
                            </TouchableOpacity>
                        </View>

                        {/* Transaction Type Selector */}
                        <View style={styles.transactionTypeContainer}>
                            {['INCOME', 'EXPENSE', 'TRANSFER'].map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.transactionTypeButton,
                                        transactionType === type && styles.activeTransactionType
                                    ]}
                                    onPress={() => setTransactionType(type)}
                                >
                                    <Text style={[
                                        styles.transactionTypeText,
                                        transactionType === type && styles.activeTransactionTypeText
                                    ]}>
                                        {type}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Account and Category Selectors */}
                        <View style={styles.selectorsContainer}>
                            <TouchableOpacity style={styles.selector}>
                                <Ionicons name="wallet-outline" size={24} color={colors.primary} />
                                <Text style={styles.selectorText}>Account</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.selector}>
                                <Ionicons name="pricetag-outline" size={24} color={colors.primary} />
                                <Text style={styles.selectorText}>Category</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Notes Input */}
                        <TextInput
                            style={styles.notesInput}
                            placeholder="Add notes"
                            placeholderTextColor={colors.textSecondary}
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                        />

                        {/* Amount Display */}
                        <View style={styles.amountDisplay}>
                            <Text style={styles.displayText}>
                                {amount || '0'}
                            </Text>
                        </View>

                        {/* Calculator Keypad */}
                        <View style={styles.keypad}>
                            <View style={styles.keypadRow}>
                                <TouchableOpacity style={styles.keypadButton} onPress={() => handleNumberPress('7')}>
                                    <Text style={styles.keypadButtonText}>7</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.keypadButton} onPress={() => handleNumberPress('8')}>
                                    <Text style={styles.keypadButtonText}>8</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.keypadButton} onPress={() => handleNumberPress('9')}>
                                    <Text style={styles.keypadButtonText}>9</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.keypadButton, styles.operatorButton]} onPress={() => handleOperatorPress('+')}>
                                    <Text style={styles.operatorButtonText}>+</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.keypadRow}>
                                <TouchableOpacity style={styles.keypadButton} onPress={() => handleNumberPress('4')}>
                                    <Text style={styles.keypadButtonText}>4</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.keypadButton} onPress={() => handleNumberPress('5')}>
                                    <Text style={styles.keypadButtonText}>5</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.keypadButton} onPress={() => handleNumberPress('6')}>
                                    <Text style={styles.keypadButtonText}>6</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.keypadButton, styles.operatorButton]} onPress={() => handleOperatorPress('-')}>
                                    <Text style={styles.operatorButtonText}>-</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.keypadRow}>
                                <TouchableOpacity style={styles.keypadButton} onPress={() => handleNumberPress('1')}>
                                    <Text style={styles.keypadButtonText}>1</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.keypadButton} onPress={() => handleNumberPress('2')}>
                                    <Text style={styles.keypadButtonText}>2</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.keypadButton} onPress={() => handleNumberPress('3')}>
                                    <Text style={styles.keypadButtonText}>3</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.keypadButton, styles.operatorButton]} onPress={() => handleOperatorPress('×')}>
                                    <Text style={styles.operatorButtonText}>×</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.keypadRow}>
                                <TouchableOpacity style={styles.keypadButton} onPress={() => handleNumberPress('0')}>
                                    <Text style={styles.keypadButtonText}>0</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.keypadButton} onPress={() => handleNumberPress('.')}>
                                    <Text style={styles.keypadButtonText}>.</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.keypadButton} onPress={handleDeletePress}>
                                    <Ionicons name="backspace-outline" size={24} color={colors.primary} />
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.keypadButton, styles.operatorButton]} onPress={() => handleOperatorPress('÷')}>
                                    <Text style={styles.operatorButtonText}>÷</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Date and Time Selector */}
                        <View style={styles.dateTimeContainer}>
                            <TouchableOpacity style={styles.dateSelector}>
                                <Ionicons name="calendar-outline" size={24} color={colors.primary} />
                                <Text style={styles.dateText}>{format(new Date(), 'MMM dd, yyyy')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.timeSelector}>
                                <Ionicons name="time-outline" size={24} color={colors.primary} />
                                <Text style={styles.timeText}>{format(new Date(), 'h:mm a')}</Text>
                            </TouchableOpacity>
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
    monthContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
    },
    monthArrow: {
        padding: spacing.sm,
    },
    monthText: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.text,
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.xl,
    },
    summaryCard: {
        flex: 1,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginHorizontal: spacing.xs,
        ...shadows.sm,
    },
    expenseCard: {
        backgroundColor: '#FEE2E2',
    },
    incomeCard: {
        backgroundColor: '#DCFCE7',
    },
    totalCard: {
        backgroundColor: '#E0E7FF',
    },
    summaryLabel: {
        fontSize: typography.sizes.xs,
        fontWeight: typography.weights.medium,
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
    totalText: {
        color: '#4F46E5',
    },
    filtersContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.xl,
    },
    filterButton: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.full,
        backgroundColor: colors.secondary,
        marginRight: spacing.sm,
    },
    activeFilterButton: {
        backgroundColor: colors.primary,
    },
    filterText: {
        color: colors.textSecondary,
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
    },
    activeFilterText: {
        color: colors.background,
    },
    transactionList: {
        paddingHorizontal: spacing.lg,
    },
    transactionCard: {
        marginBottom: spacing.md,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.background,
        ...shadows.sm,
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
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    expenseIcon: {
        backgroundColor: '#DC2626',
    },
    incomeIcon: {
        backgroundColor: '#059669',
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
    transactionCategory: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    transactionAmount: {
        alignItems: 'flex-end',
    },
    amountText: {
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.semibold,
        marginBottom: spacing.xs,
    },
    timeText: {
        fontSize: typography.sizes.xs,
        color: colors.textSecondary,
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
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: spacing.md,
        paddingBottom: spacing.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
        paddingVertical: spacing.xs,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    modalHeaderButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.xs,
        borderRadius: borderRadius.md,
    },
    headerButtonLeft: {
        gap: spacing.xs,
    },
    headerButtonRight: {
        gap: spacing.xs,
    },
    headerButtonText: {
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.medium,
        color: colors.text,
    },
    saveButtonText: {
        color: colors.primary,
        fontWeight: typography.weights.bold,
    },
    transactionTypeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
        backgroundColor: colors.secondary,
        borderRadius: borderRadius.lg,
        padding: spacing.xs,
    },
    transactionTypeButton: {
        flex: 1,
        paddingVertical: spacing.xs,
        alignItems: 'center',
        borderRadius: borderRadius.md,
    },
    activeTransactionType: {
        backgroundColor: colors.background,
        ...shadows.sm,
    },
    transactionTypeText: {
        color: colors.textSecondary,
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
    },
    activeTransactionTypeText: {
        color: colors.primary,
    },
    selectorsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
        gap: spacing.xs,
    },
    selector: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.secondary,
        padding: spacing.sm,
        borderRadius: borderRadius.lg,
    },
    selectorText: {
        color: colors.text,
        marginLeft: spacing.xs,
        fontSize: typography.sizes.sm,
    },
    notesInput: {
        backgroundColor: colors.secondary,
        borderRadius: borderRadius.lg,
        padding: spacing.sm,
        color: colors.text,
        height: 80,
        textAlignVertical: 'top',
        marginBottom: spacing.sm,
    },
    amountDisplay: {
        backgroundColor: colors.secondary,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    displayText: {
        color: colors.text,
        fontSize: typography.sizes['3xl'],
        fontWeight: typography.weights.bold,
        textAlign: 'right',
    },
    keypad: {
        gap: spacing.xs,
    },
    keypadRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.xs,
    },
    keypadButton: {
        flex: 1,
        aspectRatio: 1,
        backgroundColor: colors.secondary,
        borderRadius: borderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xs,
    },
    operatorButton: {
        backgroundColor: colors.primary,
    },
    keypadButtonText: {
        color: colors.text,
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
    },
    operatorButtonText: {
        color: colors.background,
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
    },
    dateTimeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.sm,
        gap: spacing.xs,
    },
    dateSelector: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.secondary,
        padding: spacing.sm,
        borderRadius: borderRadius.lg,
        gap: spacing.xs,
    },
    timeSelector: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.secondary,
        padding: spacing.sm,
        borderRadius: borderRadius.lg,
        gap: spacing.xs,
    },
    dateText: {
        color: colors.text,
        fontSize: typography.sizes.sm,
    },
    dateHeader: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        color: colors.text,
        marginBottom: spacing.md,
        marginTop: spacing.lg,
    },
});

export default TransactionsScreen; 