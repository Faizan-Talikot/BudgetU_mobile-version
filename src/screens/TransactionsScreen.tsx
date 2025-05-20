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
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { format, addMonths, subMonths } from 'date-fns';
import { Calendar } from '../components/ui/calendar';
import { TimePicker } from '../components/ui/time-picker';

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

const accountOptions = [
    { key: 'cash', name: 'Cash', icon: 'cash-outline', amount: 0 },
    { key: 'upi', name: 'UPI', icon: 'phone-portrait-outline', amount: 0 },
    { key: 'saving', name: 'Saving', icon: 'wallet-outline', amount: 0 },
];

const categoryOptions = [
    { id: '1', name: 'Food & Dining', icon: 'restaurant-outline', color: '#FF6B6B' },
    { id: '2', name: 'Transportation', icon: 'car-outline', color: '#4ECDC4' },
    { id: '3', name: 'Shopping', icon: 'cart-outline', color: '#45B7D1' },
    { id: '4', name: 'Bills & Utilities', icon: 'receipt-outline', color: '#96CEB4' },
    { id: '5', name: 'Entertainment', icon: 'film-outline', color: '#D4A5A5' },
    { id: '6', name: 'Healthcare', icon: 'medical-outline', color: '#FF9999' },
    { id: '7', name: 'Education', icon: 'school-outline', color: '#9DC8C8' },
    { id: '8', name: 'Personal Care', icon: 'person-outline', color: '#58B19F' },
];

const TransactionsScreen = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [activeFilter, setActiveFilter] = useState('All');
    const [currentDate, setCurrentDate] = useState(new Date());
    const fabAnim = useRef(new Animated.Value(1)).current;
    const lastScrollY = useRef(0);
    const [transactionType, setTransactionType] = useState('INCOME');
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [expression, setExpression] = useState('');
    const [calcError, setCalcError] = useState('');
    const [selectedAccount, setSelectedAccount] = useState(accountOptions[0]);
    const [isAccountModalVisible, setIsAccountModalVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(categoryOptions[0]);
    const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [isDateModalVisible, setIsDateModalVisible] = useState(false);
    const [selectedTime, setSelectedTime] = useState(format(new Date(), 'HH:mm'));
    const [isTimeModalVisible, setIsTimeModalVisible] = useState(false);
    const [showYearPicker, setShowYearPicker] = useState(false);

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

    // Calculator logic
    const operators = ['+', '-', '×', '÷'];

    const handleNumberPress = (num: string) => {
        setCalcError('');
        // Prevent multiple decimals in a number
        const parts = expression.split(/\+|-|×|÷/);
        const last = parts[parts.length - 1];
        if (num === '.' && last.includes('.')) return;

        // Handle initial zero
        if (expression === '0') {
            if (num === '.') {
                setExpression('0.');
            } else {
                setExpression(num);
            }
            return;
        }

        setExpression(prev => prev + num);
    };

    const handleOperatorPress = (operator: string) => {
        setCalcError('');
        if (!expression) return; // Don't allow operator at start
        const lastChar = expression[expression.length - 1];
        if (operators.includes(lastChar)) {
            // Replace last operator
            setExpression(prev => prev.slice(0, -1) + operator);
        } else {
            setExpression(prev => prev + operator);
        }
    };

    const handleDeletePress = () => {
        setCalcError('');
        setExpression(prev => {
            const newValue = prev.slice(0, -1);
            // If expression becomes empty after deletion, set amount to '0'
            if (!newValue) {
                setAmount('0');
                return '0';
            }
            return newValue;
        });
    };

    const handleEvaluate = () => {
        setCalcError('');
        let exp = expression;
        if (!exp) return;
        // Replace custom operators with JS ones
        exp = exp.replace(/×/g, '*').replace(/÷/g, '/');
        // Prevent ending with operator
        if (operators.includes(exp[exp.length - 1])) {
            exp = exp.slice(0, -1);
        }
        try {
            // eslint-disable-next-line no-eval
            let result = eval(exp);
            if (!isFinite(result)) {
                setCalcError('Cannot divide by zero');
                setAmount('');
                return;
            }
            // Only allow positive numbers for amount
            if (result < 0) result = Math.abs(result);
            setAmount(result.toString());
            setExpression(result.toString());
        } catch (e) {
            setCalcError('Invalid expression');
        }
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

    // Reset calculator when modal closes
    const handleCloseModal = () => {
        setIsModalVisible(false);
        setExpression('');
        setAmount('');
        setCalcError('');
    };

    return (
        <SafeAreaView style={[styles.container, { paddingBottom: 0 }]}>
            <ScrollView 
                style={styles.scrollView}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                contentContainerStyle={{ paddingBottom: spacing.xl }}
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
                onRequestClose={handleCloseModal}
                statusBarTranslucent={true}
            >
                <View style={styles.modalBackdrop}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <TouchableOpacity 
                                onPress={handleCloseModal}
                                style={[styles.modalHeaderButton, styles.headerButtonLeft]}
                            >
                                <Ionicons name="close-outline" size={24} color={colors.text} />
                                <Text style={styles.headerButtonText}>CANCEL</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={() => {
                                    // Handle save
                                    handleCloseModal();
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
                            <TouchableOpacity style={styles.selector} onPress={() => setIsAccountModalVisible(true)}>
                                <Ionicons name={selectedAccount.icon as any} size={24} color={colors.primary} />
                                <Text style={styles.selectorText}>{selectedAccount.name}</Text>
                                <Text style={[styles.selectorText, { marginLeft: 'auto' }]}>₹{selectedAccount.amount}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.selector} onPress={() => setIsCategoryModalVisible(true)}>
                                <Ionicons name={selectedCategory.icon as any} size={24} color={selectedCategory.color} />
                                <Text style={styles.selectorText}>{selectedCategory.name}</Text>
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
                                {expression || amount || '0'}
                            </Text>
                            {!!calcError && (
                                <Text style={{ color: 'red', fontSize: 12 }}>{calcError}</Text>
                            )}
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
                                <TouchableOpacity style={[styles.keypadButton, styles.operatorButton]} onPress={handleEvaluate}>
                                    <Text style={styles.operatorButtonText}>=</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Date and Time Selector */}
                        <View style={styles.dateTimeContainer}>
                            <TouchableOpacity style={styles.dateSelector} onPress={() => setIsDateModalVisible(true)}>
                                <Ionicons name="calendar-outline" size={24} color={colors.primary} />
                                <Text style={styles.dateText}>{format(new Date(selectedDate), 'MMM dd, yyyy')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.timeSelector} onPress={() => setIsTimeModalVisible(true)}>
                                <Ionicons name="time-outline" size={24} color={colors.primary} />
                                <Text style={styles.timeText}>{format(new Date(`2020-01-01T${selectedTime}`), 'h:mm a')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Account Modal */}
            <Modal
                visible={isAccountModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setIsAccountModalVisible(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-start' }}>
                    <View style={{ margin: 24, marginTop: 60, backgroundColor: colors.background, borderRadius: 16, padding: 20 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Select an account</Text>
                        {accountOptions.map(acc => (
                            <TouchableOpacity key={acc.key} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }} onPress={() => { setSelectedAccount(acc); setIsAccountModalVisible(false); }}>
                                <Ionicons name={acc.icon as any} size={28} color={colors.primary} style={{ marginRight: 16 }} />
                                <Text style={{ fontSize: 16, flex: 1 }}>{acc.name}</Text>
                                <Text style={{ fontSize: 16, color: colors.textSecondary }}>₹{acc.amount}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={{ marginTop: 16, alignItems: 'center', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.primary }}>
                            <Text style={{ color: colors.primary, fontWeight: 'bold' }}>+ Add new account</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Category Modal */}
            <Modal
                visible={isCategoryModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setIsCategoryModalVisible(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' }}>
                    <View style={{ margin: 24, marginBottom: 60, backgroundColor: colors.background, borderRadius: 16, padding: 20 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Select a category</Text>
                        {categoryOptions.map(cat => (
                            <TouchableOpacity key={cat.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }} onPress={() => { setSelectedCategory(cat); setIsCategoryModalVisible(false); }}>
                                <Ionicons name={cat.icon as any} size={28} color={cat.color} style={{ marginRight: 16 }} />
                                <Text style={{ fontSize: 16 }}>{cat.name}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={{ marginTop: 16, alignItems: 'center', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.primary }}>
                            <Text style={{ color: colors.primary, fontWeight: 'bold' }}>+ Add new category</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Date Picker Modal */}
            <Modal
                visible={isDateModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setIsDateModalVisible(false)}
            >
                <View style={{ 
                    flex: 1, 
                    backgroundColor: 'rgba(0,0,0,0.5)', 
                    justifyContent: 'center'
                }}>
                    <View style={{ 
                        backgroundColor: colors.background,
                        margin: 20,
                        borderRadius: 16,
                        padding: 20
                    }}>
                        {/* Year */}
                        <TouchableOpacity 
                            onPress={() => setShowYearPicker(true)}
                            style={{
                                alignItems: 'center',
                                marginBottom: 8
                            }}
                        >
                            <Text style={{ 
                                fontSize: 24, 
                                color: colors.text,
                                textAlign: 'center',
                            }}>
                                {format(new Date(selectedDate), 'yyyy')}
                                <Ionicons name="chevron-down" size={20} color={colors.text} style={{ marginLeft: 4 }} />
                            </Text>
                        </TouchableOpacity>

                        {/* Selected Date */}
                        <Text style={{ 
                            fontSize: 32, 
                            color: colors.text,
                            textAlign: 'center',
                            marginBottom: 24,
                            fontWeight: '300'
                        }}>
                            {format(new Date(selectedDate), 'EEE, MMM dd')}
                        </Text>

                        {/* Calendar Grid */}
                        <Calendar 
                            selected={selectedDate}
                            onSelect={date => {
                                // Preserve the selected year when changing dates
                                const selectedYear = new Date(selectedDate).getFullYear();
                                const newDate = new Date(date);
                                newDate.setFullYear(selectedYear);
                                setSelectedDate(format(newDate, 'yyyy-MM-dd'));
                            }}
                            style={{ backgroundColor: colors.background }}
                            current={selectedDate}
                            initialDate={selectedDate}
                        />

                        {/* Action Buttons */}
                        <View style={{ 
                            flexDirection: 'row', 
                            justifyContent: 'space-between',
                            marginTop: 24
                        }}>
                            <TouchableOpacity 
                                onPress={() => {
                                    // On cancel, revert to today's date
                                    const today = format(new Date(), 'yyyy-MM-dd');
                                    setSelectedDate(today);
                                    setIsDateModalVisible(false);
                                }}
                                style={{
                                    padding: 12,
                                    flex: 1,
                                    alignItems: 'center'
                                }}
                            >
                                <Text style={{ 
                                    color: colors.primary,
                                    fontSize: 16,
                                    fontWeight: '600'
                                }}>
                                    CANCEL
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={() => {
                                    // On OK, keep the selected date
                                    setIsDateModalVisible(false);
                                }}
                                style={{
                                    padding: 12,
                                    flex: 1,
                                    alignItems: 'center'
                                }}
                            >
                                <Text style={{ 
                                    color: colors.primary,
                                    fontSize: 16,
                                    fontWeight: '600'
                                }}>
                                    OK
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Year Picker Modal */}
            <Modal
                visible={showYearPicker}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowYearPicker(false)}
            >
                <View style={{ 
                    flex: 1, 
                    backgroundColor: 'rgba(0,0,0,0.5)', 
                    justifyContent: 'center'
                }}>
                    <View style={{ 
                        backgroundColor: colors.background,
                        margin: 20,
                        borderRadius: 16,
                        maxHeight: '70%'
                    }}>
                        <ScrollView>
                            {Array.from({ length: 50 }, (_, i) => {
                                const year = new Date().getFullYear() - 25 + i;
                                const currentYear = new Date(selectedDate).getFullYear();
                                return (
                                    <TouchableOpacity
                                        key={year}
                                        style={{
                                            padding: 16,
                                            borderBottomWidth: 1,
                                            borderBottomColor: colors.border,
                                            alignItems: 'center',
                                            backgroundColor: year === currentYear ? colors.secondary : 'transparent'
                                        }}
                                        onPress={() => {
                                            // Create new date preserving the day and month
                                            const currentDate = new Date(selectedDate);
                                            const newDate = new Date(
                                                year,
                                                currentDate.getMonth(),
                                                currentDate.getDate()
                                            );
                                            
                                            // If the resulting date is invalid (e.g., Feb 31), adjust to last day of month
                                            if (newDate.getMonth() !== currentDate.getMonth()) {
                                                newDate.setDate(0); // Set to last day of previous month
                                            }
                                            
                                            setSelectedDate(format(newDate, 'yyyy-MM-dd'));
                                            setShowYearPicker(false);
                                        }}
                                    >
                                        <Text style={{
                                            fontSize: 18,
                                            color: year === currentYear 
                                                ? colors.primary 
                                                : colors.text
                                        }}>
                                            {year}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Time Picker Modal */}
            <Modal
                visible={isTimeModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setIsTimeModalVisible(false)}
            >
                <View style={{ 
                    flex: 1, 
                    backgroundColor: 'rgba(0,0,0,0.5)', 
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <TimePicker
                        value={selectedTime}
                        onChange={setSelectedTime}
                        onCancel={() => {
                            // Reset to current time when canceling
                            setSelectedTime(format(new Date(), 'HH:mm'));
                            setIsTimeModalVisible(false);
                        }}
                        onOk={() => {
                            setIsTimeModalVisible(false);
                        }}
                    />
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
        paddingBottom: spacing.lg,
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
    },
    modalBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: spacing.md,
        paddingBottom: spacing.lg,
        backgroundColor: colors.background,
        maxHeight: '90%',
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