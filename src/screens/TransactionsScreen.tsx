import React, { useState, useRef, useEffect } from 'react';
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
    Alert,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { format, addMonths, subMonths } from 'date-fns';
import { Calendar, type CalendarProps } from '../components/ui/calendar';
import { TimePicker } from '../components/ui/time-picker';
import { transactionService, type Transaction as ITransaction } from '../services/transactionService';
import { budgetAPI, categoryAPI, type Budget } from '../services/api';
import { accountAPI } from '../services/api';
import { transactionApi } from '../services/api';

const { width } = Dimensions.get('window');

// Local theme colors
const THEME = {
    white: '#FFFFFF',
};

// Update Transaction interface to match service exactly
type Transaction = ITransaction & {
    name?: string; // Optional for backward compatibility with dummy data
    _id?: string; // Add _id field for API response
};

// Update the Category interface in the file
interface Category {
    _id: string;
    name: string;
    icon: string;
    color: string;
    type: 'income' | 'expense' | 'transfer';
    spent: number;
    allocated: number;
    isDefault?: boolean; // Add isDefault field
    isCustom?: boolean; // Add isCustom field
}

// Update the Account interface
interface Account {
    _id: string;
    type: 'upi' | 'cash' | 'savings' | 'card' | 'credit' | 'wallet';
    name: string;
    balance: number;
    icon: string;
    isDefault: boolean;
    key: string; // Add key field for backward compatibility
    amount: number; // Add amount field for backward compatibility
}

// Update the existing Transaction type to TransactionDisplay
type TransactionDisplay = {
    _id: string;
    type: 'income' | 'expense' | 'transfer';
    amount: number;
    description: string;
    category: string;
    date: string;
    originalDate: Date; // Store original date for sorting
    time: string;
    account: string;
    status: 'budgeted' | 'unbudgeted';
    name?: string;
};

// Update the TransactionData interface to match create payload
interface TransactionData {
    amount: number;
    description: string;
    category: string;
    date: string;
    isIncome: boolean;
    account: string;
    paymentMethod?: string;
    budgetId?: string;
    notes?: string;
    status: 'budgeted' | 'unbudgeted';
}

// Update the APITransaction interface to include _id
interface APITransaction extends TransactionData {
    _id: string;
}

// Update the TransactionAPI interface to use the correct method
interface TransactionAPI {
    create: (data: TransactionData) => Promise<any>;
    delete: (id: string) => Promise<{ message: string }>;
    getUnbudgeted: (startDate: string, endDate: string) => Promise<APITransaction[]>;
    assignToBudget: (budgetId: string, transactions: APITransaction[]) => Promise<any>;
    getAll: () => Promise<APITransaction[]>;
}

// Cast the API to include the new method
const transactionApiWithDateRange = transactionApi as unknown as TransactionAPI;

// Update dummy data type


const accountOptions = [
    { _id: 'cash', key: 'cash', name: 'Cash', icon: 'cash-outline', amount: 0, type: 'cash' },
    { _id: 'upi', key: 'upi', name: 'UPI', icon: 'phone-portrait-outline', amount: 0, type: 'upi' },
    { _id: 'saving', key: 'saving', name: 'Saving', icon: 'wallet-outline', amount: 0, type: 'savings' },
];

// Add the MarkedDates type
type MarkedDates = CalendarProps['markedDates'];

// Update the CalendarProps type
type ExtendedCalendarProps = CalendarProps & {
    minDate?: string;
    markingType?: 'custom' | 'dot';
    markedDates?: Record<string, any>;
};

// Helper function to map account type to payment method
const mapAccountTypeToPaymentMethod = (accountType: string): string => {
    const mapping: Record<string, string> = {
        'cash': 'cash',
        'card': 'debit_card',
        'credit': 'credit_card',
        'savings': 'bank_transfer',
        'upi': 'bank_transfer',
        'wallet': 'other'
    };
    return mapping[accountType] || 'other';
};

// Add navigation prop type
type Props = {
    navigation: any;
}

const TransactionsScreen: React.FC<Props> = ({ navigation }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [activeFilter, setActiveFilter] = useState('All');
    const [currentDate, setCurrentDate] = useState(new Date());
    const fabAnim = useRef(new Animated.Value(1)).current;
    const lastScrollY = useRef(0);
    const [transactionType, setTransactionType] = useState('EXPENSE');
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [expression, setExpression] = useState('');
    const [calcError, setCalcError] = useState('');
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [selectedFromAccount, setSelectedFromAccount] = useState<Account | null>(null);
    const [selectedToAccount, setSelectedToAccount] = useState<Account | null>(null);
    const [isAccountModalVisible, setIsAccountModalVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [isDateModalVisible, setIsDateModalVisible] = useState(false);
    const [selectedTime, setSelectedTime] = useState(format(new Date(), 'HH:mm'));
    const [isTimeModalVisible, setIsTimeModalVisible] = useState(false);
    const [showYearPicker, setShowYearPicker] = useState(false);
    const [budgetWarnings, setBudgetWarnings] = useState<string[]>([]);
    const [budgetImpact, setBudgetImpact] = useState<{
        categoryRemaining: number;
        budgetRemaining: number;
    } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
    const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [isCalculatorExpanded, setIsCalculatorExpanded] = useState(false);
    const [budgetDates, setBudgetDates] = useState<{start: string; end: string}[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
    const [isFromAccountModalVisible, setIsFromAccountModalVisible] = useState(false);
    const [isToAccountModalVisible, setIsToAccountModalVisible] = useState(false);

    // Add state for real transactions and summary
    const [transactions, setTransactions] = useState<TransactionDisplay[]>([]);
    const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [summaryData, setSummaryData] = useState({ expense: 0, income: 0, total: 0 });

    // State for all categories from backend
    const [allCategories, setAllCategories] = useState<Category[]>([]);

    // Fetch all categories from backend on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const cats = await categoryAPI.getAll();
                setAllCategories(cats);
            } catch (e) {
                setAllCategories([]);
            }
        };
        fetchCategories();
    }, []);

    // Fetch transactions function
    const fetchTransactions = async () => {
        setIsLoadingTransactions(true);
        try {
            const apiTxs = await transactionApiWithDateRange.getAll();
            const mapped = apiTxs.map((tx: APITransaction): TransactionDisplay => ({
                _id: tx._id,
                type: (tx.isIncome ? 'income' : 'expense') as 'income' | 'expense' | 'transfer',
                amount: tx.amount,
                description: tx.description,
                category: tx.category,
                date: format(new Date(tx.date), 'MMM dd, EEEE'),
                originalDate: new Date(tx.date), // Store original date for sorting
                time: format(new Date(tx.date), 'hh:mm a'),
                account: tx.account || '',
                status: tx.status || 'budgeted',
            }));
            
            // Sort transactions by original date (latest first) before setting state
            const sortedTransactions = mapped.sort((a, b) => 
                b.originalDate.getTime() - a.originalDate.getTime()
            );
            
            setTransactions(sortedTransactions);
            let expense = 0, income = 0;
            sortedTransactions.forEach(tx => {
                if (tx.type === 'income') income += tx.amount;
                else if (tx.type === 'expense') expense += tx.amount;
            });
            setSummaryData({ expense, income, total: income - expense });
        } catch (e) {
            setTransactions([]);
            setSummaryData({ expense: 0, income: 0, total: 0 });
        } finally {
            setIsLoadingTransactions(false);
            setIsRefreshing(false);
        }
    };

    // Fetch transactions on mount
    useEffect(() => {
        fetchTransactions();
    }, []);

    // Fetch accounts on mount
    useEffect(() => {
        loadAccounts();
    }, []);

    // Group transactions by date for display
    const transactionsByDate = transactions.reduce((acc, tx) => {
        if (!acc[tx.date]) acc[tx.date] = [];
        acc[tx.date].push(tx);
        return acc;
    }, {} as Record<string, TransactionDisplay[]>);

    // Sort transactions within each date group by time (latest first)
    Object.keys(transactionsByDate).forEach(date => {
        transactionsByDate[date].sort((a, b) => {
            // Use original date for accurate sorting
            return b.originalDate.getTime() - a.originalDate.getTime(); // Descending order (latest first)
        });
    });

    // Create a mapping of formatted dates to original dates for proper sorting
    const dateMapping = new Map<string, Date>();
    Object.keys(transactionsByDate).forEach(formattedDate => {
        // Get the first transaction's original date for this formatted date
        const firstTx = transactionsByDate[formattedDate][0];
        if (firstTx) {
            dateMapping.set(formattedDate, firstTx.originalDate);
        }
    });

    // Update selected category when transaction type changes
    useEffect(() => {
        const defaultCategory = allCategories.find(cat => cat.type === transactionType.toLowerCase());
        if (defaultCategory) {
            setSelectedCategory(defaultCategory);
        }
    }, [transactionType]);

    // Update useEffect to only run when isModalVisible changes
    useEffect(() => {
        if (isModalVisible) {
            loadAccounts();
            const now = new Date();
            const currentDate = format(now, 'yyyy-MM-dd');
            const currentTime = format(now, 'HH:mm');
            
            setSelectedDate(currentDate);
            setSelectedTime(currentTime);
            loadBudgetDates();
            loadCategoriesForDate(currentDate);
        }
    }, [isModalVisible]);

    // Update navigation focus effect
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (isModalVisible && selectedDate) {
                loadCategoriesForDate(selectedDate);
            }
        });

        return unsubscribe;
    }, [navigation, isModalVisible, selectedDate]);

    // Update transaction type effect
    useEffect(() => {
        if (isModalVisible && selectedDate) {
            loadCategoriesForDate(selectedDate);
        }
    }, [isModalVisible, selectedDate, transactionType]);

    // Add navigation blur effect to clean up modal state
    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            setIsModalVisible(false);
            setAmount('');
            setNotes('');
            setExpression('');
            setCalcError('');
            setSelectedCategory(null);
        });

        return unsubscribe;
    }, [navigation]);

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

    const renderTransaction = (transaction: TransactionDisplay) => (
        <Card key={transaction._id} style={styles.transactionCard}>
            <View style={styles.transaction}>
                <View style={[
                    styles.transactionIconContainer,
                    transaction.type === 'expense' ? styles.expenseIcon : transaction.type === 'income' ? styles.incomeIcon : styles.transferIcon
                ]}>
                    <Ionicons 
                        name={transaction.type === 'expense' ? "arrow-down" : transaction.type === 'income' ? "arrow-up" : "swap-horizontal"} 
                        size={20} 
                        color={THEME.white}
                    />
                </View>
                <View style={styles.transactionMiddle}>
                    <Text style={styles.transactionName}>{transaction.description}</Text>
                    <Text style={styles.transactionCategory}>
                        {(() => {
                            const acc = accounts.find(acc => String(acc._id) === String(transaction.account));
                            return acc?.name || transaction.account;
                        })()}
                    </Text>
                </View>
                <View style={styles.transactionRight}>
                    <Text style={[
                        styles.amountText,
                        transaction.type === 'expense' ? styles.expenseText : transaction.type === 'income' ? styles.incomeText : styles.transferText
                    ]}>
                        {transaction.type === 'expense' ? '-' : transaction.type === 'income' ? '+' : ''}₹{transaction.amount.toFixed(2)}
                    </Text>
                    <Text style={styles.timeText}>{transaction.time}</Text>
                </View>
            </View>
        </Card>
    );

    // Update handleCloseModal to reset all states
    const handleCloseModal = () => {
        setIsModalVisible(false);
        setExpression('');
        setAmount('');
        setCalcError('');
        setNotes('');
        setSelectedCategory(null);
    };

    const renderAccountSelector = (
        account: typeof accountOptions[0], 
        onPress: () => void,
        label: string
    ) => (
        <TouchableOpacity style={styles.selectionRow} onPress={onPress}>
            <View style={styles.selectionIcon}>
                <Ionicons 
                    name={(account?.icon || 'wallet-outline') as any} 
                    size={24} 
                    color={colors.primary} 
                />
            </View>
            <View style={styles.selectionContent}>
                <Text style={styles.selectionLabel}>{label}</Text>
                <View style={styles.selectionValue}>
                    <Text style={styles.selectionText}>{account?.name || 'Select Account'}</Text>
                    <Text style={styles.amountLabel}>₹{account?.amount || 0}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    // Update the helper functions to handle number conversion
    const getProjectedAmount = (cat: Category) => {
        const currentSpent = Number(cat.spent) || 0;
        if (!amount) return currentSpent;
        
        const currentAmount = parseFloat(amount || '0');
        if (transactionType.toLowerCase() === 'expense') {
            return cat._id === selectedCategory?._id ? (currentSpent + currentAmount) : currentSpent;
        }
        return currentSpent;
    };

    const getProjectedPercentage = (cat: Category) => {
        const spent = getProjectedAmount(cat);
        const allocated = Number(cat.allocated) || 0;
        
        if (allocated <= 0) return '0%';
        const percentage = (spent / allocated) * 100;
        return `${Math.round(percentage)}%`;
    };

    const formatAmountDisplay = (cat: Category) => {
        const spent = getProjectedAmount(cat);
        const allocated = Number(cat.allocated) || 0;
        
        // For income categories, don't show amount display
        if (transactionType.toLowerCase() === 'income') {
            return '';
        }
        
        // If no budget allocated or no budget exists, just show spent amount
        if (!currentBudget || allocated <= 0) {
            return `₹${spent.toFixed(2)}`;
        }
        
        // Show full budget information only when we have a budget
        const percentage = getProjectedPercentage(cat);
        return `₹${spent.toFixed(2)} / ₹${allocated.toFixed(2)} (${percentage})`;
    };

    // Update the renderAccountsOrCategory function to use the new format
    const renderAccountsOrCategory = () => {
        if (transactionType === 'TRANSFER') {
            return (
                <View style={styles.selectionContainer}>
                    {renderAccountSelector(
                        selectedFromAccount || accountOptions[0],
                        () => setIsFromAccountModalVisible(true),
                        'From Account'
                    )}
                    <View style={styles.transferArrowContainer}>
                        <Ionicons name="arrow-forward" size={20} color={colors.primary} />
                    </View>
                    {renderAccountSelector(
                        selectedToAccount || accountOptions[1],
                        () => setIsToAccountModalVisible(true),
                        'To Account'
                    )}
                </View>
            );
        }

        return (
            <View style={styles.selectionContainer}>
                {renderAccountSelector(
                    selectedAccount || accountOptions[0],
                    () => setIsAccountModalVisible(true),
                    'Account'
                )}
                <TouchableOpacity 
                    style={styles.selectionRow}
                    onPress={handleCategoryModalOpen}
                >
                    {isLoadingCategories ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                        <>
                            <View style={styles.selectionIcon}>
                    <Ionicons 
                                    name={(selectedCategory?.icon || 'help-circle-outline') as any} 
                        size={24} 
                                    color={selectedCategory?.color || colors.primary} 
                                />
                            </View>
                            <View style={styles.selectionContent}>
                                <Text style={styles.selectionLabel}>Category</Text>
                                <View style={styles.selectionValue}>
                                    <Text style={styles.selectionText}>
                                        {selectedCategory?.name || 'Select Category'}
                                    </Text>
                                    {selectedCategory && (
                                        <Text style={[
                                            styles.amountLabel,
                                            currentBudget && 
                                            Number(selectedCategory.allocated) > 0 && 
                                            getProjectedAmount(selectedCategory) > Number(selectedCategory.allocated) && 
                                            styles.errorText
                                        ]}>
                                            {formatAmountDisplay(selectedCategory)}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    // Update the handleSave function to refresh budget data and update spent amounts after transaction creation
    const handleSave = async () => {
        try {
            setIsProcessing(true);

            // Validate required fields
            if (!amount || !selectedCategory?.name || !selectedAccount?._id) {
                Alert.alert('Error', 'Please fill in all required fields');
                return;
            }

            // Parse amount and validate
            const parsedAmount = parseFloat(amount);
            if (isNaN(parsedAmount) || parsedAmount <= 0) {
                Alert.alert('Error', 'Please enter a valid amount');
                return;
            }

            // --- PATCH: Handle predefined vs custom categories ---
            let categoryId = selectedCategory._id;
            
            console.log('Selected category for transaction:', JSON.stringify(selectedCategory, null, 2));
            console.log('Is default category?', selectedCategory.isDefault);
            
            // For predefined categories, send the name instead of fake ID
            if (selectedCategory.isDefault) {
                categoryId = selectedCategory.name;
                console.log('Using category name for predefined category:', categoryId);
            } else {
                console.log('Using category ID for custom category:', categoryId);
            }

            // Create transaction data
            const transactionData = {
                amount: parsedAmount,
                description: notes || selectedCategory.name,
                category: categoryId.toString(),
                date: `${selectedDate}T${selectedTime}:00`, // Combine date and time without timezone
                isIncome: transactionType.toLowerCase() === 'income',
                account: selectedAccount._id.toString(),
                paymentMethod: mapAccountTypeToPaymentMethod(selectedAccount.type),
                budgetId: currentBudget?._id?.toString(),
                notes: notes || undefined,
                status: currentBudget ? 'budgeted' as const : 'unbudgeted' as const
            };

            console.log('Sending transaction data:', JSON.stringify(transactionData, null, 2));
            console.log('Category ID being sent:', categoryId, 'Type:', typeof categoryId);

            // Create transaction
            try {
                // Create transaction directly - budget update is handled by backend
                const savedTransaction = await transactionApiWithDateRange.create(transactionData);
                console.log('Successfully created transaction:', JSON.stringify(savedTransaction, null, 2));

                // Calculate new balance
                const currentBalance = selectedAccount.balance || 0;
                const newBalance = transactionType.toLowerCase() === 'expense'
                    ? currentBalance - parsedAmount
                    : currentBalance + parsedAmount;

                // Update account balance
                await accountAPI.updateBalance(selectedAccount._id.toString(), {
                    amount: newBalance
                });

                // Refresh accounts list
                loadAccounts();

                // Get fresh budget data
                const updatedBudgets = await budgetAPI.getActive();
                const updatedBudget = updatedBudgets.find(budget => {
                    const transactionDate = new Date(selectedDate);
                    const budgetStart = new Date(budget.startDate);
                    const budgetEnd = new Date(budget.endDate);
                    return transactionDate >= budgetStart && transactionDate <= budgetEnd;
                });

                if (updatedBudget) {
                    setCurrentBudget(updatedBudget);
                    console.log('Updated budget after transaction:', JSON.stringify(updatedBudget, null, 2));

                    // Get fresh categories
                    const allCategories = await categoryAPI.getAll();
                    console.log('Fresh categories after transaction:', JSON.stringify(allCategories, null, 2));

                    // Get spent amounts from updated budget
                    const spentAmounts = updatedBudget.categories.reduce((acc: Record<string, number>, budgetCat) => {
                        acc[budgetCat.category] = Number(budgetCat.spentAmount) || 0;
                        return acc;
                    }, {});
                    console.log('Updated spent amounts after transaction:', JSON.stringify(spentAmounts, null, 2));

                    // Update categories with new spent amounts
                    const budgetCategories = updatedBudget.categories
                        .map(budgetCat => {
                            const fullCategory = allCategories.find(c => c._id === budgetCat.category);
                            if (!fullCategory) return null;

                            // Only include categories of the current type
                            if (transactionType.toLowerCase() !== 'transfer' && 
                                fullCategory.type !== transactionType.toLowerCase()) {
                                return null;
                            }

                            return {
                                ...fullCategory,
                                spent: spentAmounts[budgetCat.category] || 0,
                                allocated: Number(budgetCat.allocatedAmount) || 0
                            };
                        })
                        .filter((cat): cat is Category => cat !== null);

                        // Update categories state
                        setAvailableCategories(budgetCategories);
                }

                // Show success message and reset form
                Alert.alert('Success', 'Transaction saved successfully');
                // Reset form fields
                setAmount('');
                setNotes('');
                setSelectedCategory(null);
                setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
                await fetchTransactions();
                navigation.goBack();
        } catch (error) {
                console.error('Error saving transaction:', error);
            Alert.alert('Error', 'Failed to save transaction. Please try again.');
            }

        } catch (error) {
            console.error('Error saving transaction:', error);
            Alert.alert('Error', 'Failed to save transaction. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    // Update Category Modal to use the same formatting
    const renderCategoryModal = () => {
        return (
        <Modal
            visible={isCategoryModalVisible}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setIsCategoryModalVisible(false)}
        >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' }}>
                <View style={{ margin: 24, marginBottom: 60, backgroundColor: colors.background, borderRadius: 16, padding: 20 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
                        Select {transactionType.toLowerCase()} category
                        {currentBudget && ' from budget'}
                    </Text>
                    {isLoadingCategories ? (
                        <ActivityIndicator size="large" color={colors.primary} />
                    ) : availableCategories.length === 0 ? (
                        <Text style={{ textAlign: 'center', color: colors.textSecondary, padding: 20 }}>
                            {currentBudget 
                                ? `No ${transactionType.toLowerCase()} categories available in current budget` 
                                : `No ${transactionType.toLowerCase()} categories available`}
                        </Text>
                    ) : (
                        <ScrollView style={{ maxHeight: 300 }}>
                                {availableCategories.map((cat) => (
                                <TouchableOpacity
                                        key={cat._id}
                                        style={[
                                            styles.categoryItem,
                                            selectedCategory?._id === cat._id && styles.selectedCategoryItem
                                        ]}
                                    onPress={() => { 
                                            console.log('Selected category:', JSON.stringify(cat, null, 2));
                                        setSelectedCategory(cat); 
                                        setIsCategoryModalVisible(false); 
                                    }}
                                >
                                    <Ionicons 
                                        name={(cat?.icon || 'help-circle-outline') as any} 
                                        size={28} 
                                        color={cat?.color || colors.primary} 
                                        style={{ marginRight: 16 }} 
                    />
                    <View style={{ flex: 1 }}>
                                            <Text style={styles.categoryName}>
                                                {cat?.name || 'Unknown Category'}
                                            </Text>
                                            <Text style={[
                                                styles.categoryAmount,
                                                currentBudget && 
                                                Number(cat.allocated) > 0 && 
                                                getProjectedAmount(cat) > Number(cat.allocated) && 
                                                styles.errorText
                                            ]}>
                                                {formatAmountDisplay(cat)}
                                            </Text>
                    </View>
                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>
            </View>
        </Modal>
    );
    };

    // Add function to load budget dates
    const loadBudgetDates = async () => {
        try {
            const activeBudgets = await budgetAPI.getActive();
            const dates = activeBudgets.map(budget => ({
                start: format(new Date(budget.startDate), 'yyyy-MM-dd'),
                end: format(new Date(budget.endDate), 'yyyy-MM-dd')
            }));
            setBudgetDates(dates);
        } catch (error) {
            console.error('Error loading budget dates:', error);
        }
    };

    // Update the loadCategoriesForDate function
    const loadCategoriesForDate = async (date: string) => {
        try {
            setIsLoadingCategories(true);
            
            // Get all categories from API first
            const allCategories = await categoryAPI.getAll();
            console.log('All categories from API:', JSON.stringify(allCategories, null, 2));
            
            // Get active budgets
            const activeBudgets = await budgetAPI.getActive();
            console.log('Active budgets:', JSON.stringify(activeBudgets, null, 2));

            const matchingBudget = activeBudgets.find(budget => {
                const transactionDate = new Date(date);
                const budgetStart = new Date(budget.startDate);
                const budgetEnd = new Date(budget.endDate);
                return transactionDate >= budgetStart && transactionDate <= budgetEnd;
            });
            console.log('Matching budget:', JSON.stringify(matchingBudget, null, 2));

            setCurrentBudget(matchingBudget || null);

            // For income type, always show all income categories
            if (transactionType.toLowerCase() === 'income') {
                // Get predefined income categories from constants
                const { DEFAULT_INCOME_CATEGORIES } = require('../constants/defaultCategories');
                
                // Get existing custom income categories from database
                const existingCategories = allCategories.filter(cat => cat.type === 'income');
                const predefinedCategoryNames = DEFAULT_INCOME_CATEGORIES.map((cat: any) => cat.name);
                
                // Filter out database categories that match predefined names (prioritize predefined)
                const uniqueDatabaseCategories = existingCategories.filter(
                    (cat: any) => !predefinedCategoryNames.includes(cat.name)
                );
                
                // Combine predefined and unique database categories
                const incomeCategories = [
                    ...DEFAULT_INCOME_CATEGORIES.map((cat: any) => ({
                        ...cat,
                        spent: 0,
                        allocated: 0,
                        isDefault: true
                    })),
                    ...uniqueDatabaseCategories.map((cat: any) => ({
                        ...cat,
                        spent: 0,
                        allocated: 0,
                        isDefault: false
                    }))
                ];
                
                console.log('Income categories (predefined + unique database):', JSON.stringify(incomeCategories, null, 2));
                setAvailableCategories(incomeCategories);
                
                // Update selected category if needed
                if (!selectedCategory || selectedCategory.type !== 'income') {
                    setSelectedCategory(incomeCategories[0]);
                }
                return;
            }

            // For expense categories, handle budget logic
            if (!matchingBudget) {
                // No budget - show all expense categories
                const expenseCategories = allCategories
                    .filter(cat => cat.type === 'expense')
                    .map(cat => ({
                        ...cat,
                        spent: 0,
                        allocated: 0
                    }));
                console.log('All expense categories (no budget):', JSON.stringify(expenseCategories, null, 2));
                setAvailableCategories(expenseCategories);
                
                if (!selectedCategory || selectedCategory.type !== 'expense') {
                    setSelectedCategory(expenseCategories[0]);
                }
                return;
            }

            // We have a matching budget - get categories with spent amounts
            const spentAmounts = matchingBudget.categories.reduce((acc: Record<string, number>, budgetCat) => {
                acc[budgetCat.category] = Number(budgetCat.spentAmount) || 0;
                return acc;
            }, {});
            console.log('Budget spent amounts:', JSON.stringify(spentAmounts, null, 2));

            // Map budget categories to full category info
            const budgetCategories = matchingBudget.categories
                .map(budgetCat => {
                    const fullCategory = allCategories.find(c => c._id === budgetCat.category);
                    if (!fullCategory || fullCategory.type !== 'expense') return null;
                    
                    return {
                        ...fullCategory,
                        spent: Number(budgetCat.spentAmount) || 0,
                        allocated: Number(budgetCat.allocatedAmount) || 0
                    };
                })
                .filter((cat): cat is Category => cat !== null);

            console.log('Budget categories:', JSON.stringify(budgetCategories, null, 2));

            if (budgetCategories.length === 0) {
                // No expense categories in budget - show all expense categories
                const expenseCategories = allCategories
                    .filter(cat => cat.type === 'expense')
                    .map(cat => ({
                        ...cat,
                        spent: spentAmounts[cat._id] || 0,
                        allocated: 0
                    }));
                setAvailableCategories(expenseCategories);
                
                if (!selectedCategory || selectedCategory.type !== 'expense') {
                    setSelectedCategory(expenseCategories[0]);
                }
            } else {
                // Use budget categories with spent amounts
            setAvailableCategories(budgetCategories);

                // Update selected category if needed
                if (selectedCategory) {
                    const updatedCategory = budgetCategories.find(cat => cat._id === selectedCategory._id);
                    if (updatedCategory) {
                        setSelectedCategory(updatedCategory);
                    } else {
                        setSelectedCategory(budgetCategories[0]);
                    }
                } else {
                    setSelectedCategory(budgetCategories[0]);
                }
            }

        } catch (error) {
            console.error('Error loading categories:', error);
            Alert.alert('Error', 'Failed to load categories');
        } finally {
            setIsLoadingCategories(false);
        }
    };

    // Update the refreshCategoryData function to use the same logic
    const refreshCategoryData = async () => {
        if (selectedDate) {
            await loadCategoriesForDate(selectedDate);
        }
    };

    // Update the renderCalendar function
    const renderCalendar = () => {
        const markedDates: Record<string, { 
            selected?: boolean; 
            marked?: boolean; 
            dotColor?: string;
            disabled?: boolean;
            disableTouchEvent?: boolean;
            customStyles?: {
                container?: {
                    backgroundColor?: string;
                },
                text?: {
                    color?: string;
                }
            }
        }> = {};
        
        // Disable past dates
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const currentDate = new Date();
        currentDate.setDate(1); // Start from first of current month
        
        while (currentDate < today) {
            const dateStr = format(currentDate, 'yyyy-MM-dd');
            markedDates[dateStr] = {
                disabled: true,
                disableTouchEvent: true,
                customStyles: {
                    text: {
                        color: colors.textSecondary
                    }
                }
            };
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        // Mark budget dates
        budgetDates.forEach(({start, end}) => {
            const startDate = new Date(start);
            const endDate = new Date(end);
            let currentDate = new Date(startDate);
            
            while (currentDate <= endDate) {
                const dateStr = format(currentDate, 'yyyy-MM-dd');
                // Only mark if date is not in past
                if (currentDate >= today) {
                markedDates[dateStr] = {
                        ...markedDates[dateStr],
                    marked: true,
                    dotColor: colors.primary,
                        customStyles: {
                            container: dateStr === selectedDate ? {
                                backgroundColor: colors.primary
                            } : undefined,
                            text: dateStr === selectedDate ? {
                                color: colors.background
                            } : {
                                color: colors.text
                            }
                        }
                    };
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }
        });
        
        // If selected date is not in a budget period but is valid (not in past)
        const selectedDateObj = new Date(selectedDate);
        if (!markedDates[selectedDate] && selectedDateObj >= today) {
            markedDates[selectedDate] = {
                customStyles: {
                    container: {
                        backgroundColor: colors.primary
                    },
                    text: {
                        color: colors.background
                    }
                }
            };
        }

        return (
            <View style={styles.calendarContainer}>
                <Calendar 
                    selected={selectedDate}
                    onSelect={(date: string) => {
                        const selectedDate = new Date(date);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        
                        if (selectedDate >= today) {
                        setSelectedDate(date);
                        loadCategoriesForDate(date);
                        }
                    }}
                    style={styles.calendar}
                    current={selectedDate}
                    initialDate={selectedDate}
                    markedDates={markedDates}
                    markingType="custom"
                    minDate={format(today, 'yyyy-MM-dd')}
                />
            </View>
        );
    };

    // Update date picker modal
    const renderDatePicker = () => (
        <Modal
            visible={isDateModalVisible}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setIsDateModalVisible(false)}
        >
            <View style={styles.datePickerModal}>
                <View style={styles.datePickerContent}>
                    <TouchableOpacity 
                        onPress={() => setShowYearPicker(true)}
                        style={styles.yearSelector}
                    >
                        <Text style={styles.yearText}>
                            {format(new Date(selectedDate), 'yyyy')}
                            <Ionicons name="chevron-down" size={20} color={colors.text} />
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.selectedDateText}>
                        {format(new Date(selectedDate), 'EEE, MMM dd')}
                    </Text>

                    {renderCalendar()}

                    <View style={styles.datePickerActions}>
                        <TouchableOpacity 
                            onPress={() => {
                                setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
                                setIsDateModalVisible(false);
                            }}
                            style={styles.datePickerButton}
                        >
                            <Text style={styles.datePickerButtonText}>CANCEL</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => setIsDateModalVisible(false)}
                            style={styles.datePickerButton}
                        >
                            <Text style={styles.datePickerButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    // Update calculator modal
    const renderCalculator = () => (
        <Modal
            visible={isCalculatorExpanded}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setIsCalculatorExpanded(false)}
        >
            <TouchableOpacity 
                style={styles.calculatorOverlay}
                activeOpacity={1}
                onPress={() => setIsCalculatorExpanded(false)}
            >
                <View style={styles.calculatorContainer}>
                    <View style={styles.calculatorHandle} />
                    <View style={styles.calculatorHeader}>
                        <Text style={styles.calculatorAmount}>{expression || amount || '0'}</Text>
                        <TouchableOpacity 
                            onPress={() => {
                                handleEvaluate();
                                setIsCalculatorExpanded(false);
                            }}
                        >
                            <Text style={styles.calculatorDone}>Done</Text>
                        </TouchableOpacity>
                    </View>
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
                            <TouchableOpacity style={[styles.keypadButton, styles.operatorButton]} onPress={() => handleOperatorPress('÷')}>
                                <Text style={styles.operatorButtonText}>÷</Text>
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
                            <TouchableOpacity style={[styles.keypadButton, styles.operatorButton]} onPress={() => handleOperatorPress('×')}>
                                <Text style={styles.operatorButtonText}>×</Text>
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
                            <TouchableOpacity style={[styles.keypadButton, styles.operatorButton]} onPress={() => handleOperatorPress('-')}>
                                <Text style={styles.operatorButtonText}>-</Text>
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
                                <Ionicons name="backspace-outline" size={24} color={colors.text} />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.keypadButton, styles.operatorButton]} onPress={() => handleOperatorPress('+')}>
                                <Text style={styles.operatorButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );

    const loadAccounts = async () => {
        try {
            setIsLoadingAccounts(true);
            const fetchedAccounts = await accountAPI.getAll();
            // Add backward compatibility fields
            const accountsWithCompat = fetchedAccounts.map(acc => ({
                ...acc,
                key: acc._id,
                amount: acc.balance
            }));
            setAccounts(accountsWithCompat);
            console.log('Loaded accounts:', accountsWithCompat);
            
            // Set default selected account
            if (accountsWithCompat.length > 0) {
                setSelectedAccount(accountsWithCompat[0]);
            }
        } catch (error) {
            console.error('Error loading accounts:', error);
        } finally {
            setIsLoadingAccounts(false);
        }
    };

    // Update the Account Modal to use real accounts
    const renderAccountModal = () => (
        <Modal
            visible={isAccountModalVisible}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setIsAccountModalVisible(false)}
        >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-start' }}>
                <View style={{ margin: 24, marginTop: 60, backgroundColor: colors.background, borderRadius: 16, padding: 20 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Select an account</Text>
                    {isLoadingAccounts ? (
                        <ActivityIndicator size="large" color={colors.primary} />
                    ) : accounts.length === 0 ? (
                        <Text style={{ textAlign: 'center', color: colors.textSecondary }}>No accounts available</Text>
                    ) : (
                        accounts.map(acc => (
                            <TouchableOpacity 
                                key={acc._id} 
                                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }} 
                                onPress={() => { 
                                    setSelectedAccount(acc); 
                                    setIsAccountModalVisible(false); 
                                }}
                            >
                                <Ionicons name={acc.icon as any} size={28} color={colors.primary} style={{ marginRight: 16 }} />
                                <Text style={{ fontSize: 16, flex: 1 }}>{acc.name}</Text>
                                <Text style={{ fontSize: 16, color: colors.textSecondary }}>₹{acc.balance}</Text>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </View>
        </Modal>
    );

    // Update From Account Modal
    const renderFromAccountModal = () => (
        <Modal
            visible={isFromAccountModalVisible}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setIsFromAccountModalVisible(false)}
        >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-start' }}>
                <View style={{ margin: 24, marginTop: 60, backgroundColor: colors.background, borderRadius: 16, padding: 20 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Select from account</Text>
                    {isLoadingAccounts ? (
                        <ActivityIndicator size="large" color={colors.primary} />
                    ) : accounts.length === 0 ? (
                        <Text style={{ textAlign: 'center', color: colors.textSecondary }}>No accounts available</Text>
                    ) : (
                        accounts
                            .filter(acc => String(acc._id) !== String(selectedToAccount?._id))
                            .map(acc => (
                                <TouchableOpacity 
                                    key={acc._id} 
                                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }} 
                                    onPress={() => { 
                                        setSelectedFromAccount(acc); 
                                        setIsFromAccountModalVisible(false); 
                                    }}
                                >
                                    <Ionicons name={acc.icon as any} size={28} color={colors.primary} style={{ marginRight: 16 }} />
                                    <Text style={{ fontSize: 16, flex: 1 }}>{acc.name}</Text>
                                    <Text style={{ fontSize: 16, color: colors.textSecondary }}>₹{acc.balance}</Text>
                                </TouchableOpacity>
                            ))
                    )}
                </View>
            </View>
        </Modal>
    );

    // Update To Account Modal
    const renderToAccountModal = () => (
        <Modal
            visible={isToAccountModalVisible}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setIsToAccountModalVisible(false)}
        >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-start' }}>
                <View style={{ margin: 24, marginTop: 60, backgroundColor: colors.background, borderRadius: 16, padding: 20 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Select to account</Text>
                    {isLoadingAccounts ? (
                        <ActivityIndicator size="large" color={colors.primary} />
                    ) : accounts.length === 0 ? (
                        <Text style={{ textAlign: 'center', color: colors.textSecondary }}>No accounts available</Text>
                    ) : (
                        accounts
                            .filter(acc => String(acc._id) !== String(selectedFromAccount?._id))
                            .map(acc => (
                                <TouchableOpacity 
                                    key={acc._id} 
                                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }} 
                                    onPress={() => { 
                                        setSelectedToAccount(acc); 
                                        setIsToAccountModalVisible(false); 
                                    }}
                                >
                                    <Ionicons name={acc.icon as any} size={28} color={colors.primary} style={{ marginRight: 16 }} />
                                    <Text style={{ fontSize: 16, flex: 1 }}>{acc.name}</Text>
                                    <Text style={{ fontSize: 16, color: colors.textSecondary }}>₹{acc.balance}</Text>
                                </TouchableOpacity>
                            ))
                    )}
                </View>
            </View>
        </Modal>
    );

    // Update the handleCategoryModalOpen function
    const handleCategoryModalOpen = async () => {
        try {
            // For income type, combine predefined and custom categories
            if (transactionType.toLowerCase() === 'income') {
                const allCategories = await categoryAPI.getAll();
                const { DEFAULT_INCOME_CATEGORIES } = require('../constants/defaultCategories');
                
                // Get existing custom income categories from database
                const existingCategories = allCategories.filter(cat => cat.type === 'income');
                const predefinedCategoryNames = DEFAULT_INCOME_CATEGORIES.map((cat: any) => cat.name);
                
                // Filter out database categories that match predefined names (prioritize predefined)
                const uniqueDatabaseCategories = existingCategories.filter(
                    (cat: any) => !predefinedCategoryNames.includes(cat.name)
                );
                
                // Combine predefined and unique database categories
                const incomeCategories = [
                    ...DEFAULT_INCOME_CATEGORIES.map((cat: any) => ({
                        ...cat,
                        spent: 0,
                        allocated: 0,
                        isDefault: true
                    })),
                    ...uniqueDatabaseCategories.map((cat: any) => ({
                        ...cat,
                        spent: 0,
                        allocated: 0,
                        isDefault: false
                    }))
                ];
                
                setAvailableCategories(incomeCategories);
                setIsCategoryModalVisible(true);
                return;
            }

            // For expense type, get fresh budget data
            const updatedBudgets = await budgetAPI.getActive();
            const updatedBudget = updatedBudgets.find(budget => {
                const transactionDate = new Date(selectedDate);
                const budgetStart = new Date(budget.startDate);
                const budgetEnd = new Date(budget.endDate);
                return transactionDate >= budgetStart && transactionDate <= budgetEnd;
            });

            // Get fresh categories
            const allCategories = await categoryAPI.getAll();
            console.log('Fresh categories:', JSON.stringify(allCategories, null, 2));

            if (!updatedBudget) {
                // No budget - show all expense categories
                const expenseCategories = allCategories
                    .filter(cat => cat.type === 'expense')
                    .map(cat => ({
                        ...cat,
                        spent: 0,
                        allocated: 0
                    }));
                setAvailableCategories(expenseCategories);
                setIsCategoryModalVisible(true);
                return;
            }

            setCurrentBudget(updatedBudget);
            console.log('Updated budget data:', JSON.stringify(updatedBudget, null, 2));

            // Get spent amounts from budget
            const spentAmounts = updatedBudget.categories.reduce((acc: Record<string, number>, budgetCat) => {
                acc[budgetCat.category] = Number(budgetCat.spentAmount) || 0;
                return acc;
            }, {});
            console.log('Updated spent amounts:', JSON.stringify(spentAmounts, null, 2));

            // Update categories with spent amounts from budget
            const budgetCategories = updatedBudget.categories
                .map(budgetCat => {
                    const fullCategory = allCategories.find(c => c._id === budgetCat.category);
                    if (!fullCategory || fullCategory.type !== transactionType.toLowerCase()) return null;

                    return {
                        ...fullCategory,
                        spent: spentAmounts[budgetCat.category] || 0,
                        allocated: Number(budgetCat.allocatedAmount) || 0
                    };
                })
                .filter((cat): cat is Category => cat !== null);

            console.log('Updated budget categories:', JSON.stringify(budgetCategories, null, 2));

            if (budgetCategories.length === 0) {
                // No categories in budget - show all expense categories with spent amounts
                const expenseCategories = allCategories
                    .filter(cat => cat.type === 'expense')
                    .map(cat => ({
                        ...cat,
                        spent: spentAmounts[cat._id] || 0,
                        allocated: 0
                    }));
                setAvailableCategories(expenseCategories);
            } else {
                setAvailableCategories(budgetCategories);
            }

            // Update selected category if it exists in the updated categories
            if (selectedCategory) {
                const updatedSelectedCategory = budgetCategories.find(cat => cat._id === selectedCategory._id);
                if (updatedSelectedCategory) {
                    setSelectedCategory(updatedSelectedCategory);
                }
            }
        } catch (error) {
            console.error('Error refreshing categories:', error);
        }

        // Show the modal
        setIsCategoryModalVisible(true);
    };

    // Get filtered categories based on transaction type
    const filteredCategories = allCategories.filter(
        (category: Category) => category.type === transactionType.toLowerCase()
    );

    return (
        <SafeAreaView style={[styles.container, { paddingBottom: 0 }]}>
                <ScrollView
                style={styles.scrollView}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                contentContainerStyle={{ paddingBottom: spacing.xl }}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={() => {
                            setIsRefreshing(true);
                            fetchTransactions();
                        }}
                        colors={[colors.primary]}
                    />
                }
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
                    {isLoadingTransactions ? (
                        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 32 }} />
                    ) : Object.keys(transactionsByDate).length === 0 ? (
                        <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 32 }}>
                            No transactions
                        </Text>
                    ) : (
                        Object.entries(transactionsByDate)
                            .sort(([dateA], [dateB]) => {
                                // Sort dates in descending order (latest first) using the date mapping
                                const originalDateA = dateMapping.get(dateA);
                                const originalDateB = dateMapping.get(dateB);
                                if (!originalDateA || !originalDateB) return 0;
                                return originalDateB.getTime() - originalDateA.getTime();
                            })
                            .map(([date, txs]) => (
                            <View key={date}>
                                <Text style={styles.dateHeader}>{date}</Text>
                                {txs.map(transaction => renderTransaction(transaction))}
                            </View>
                        ))
                    )}
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
            {isModalVisible && (
            <Modal
                    visible={true}
                animationType="slide"
                    transparent={false}
                onRequestClose={handleCloseModal}
                statusBarTranslucent={true}
            >
                    <SafeAreaView style={styles.modalContainer}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <TouchableOpacity 
                                onPress={handleCloseModal}
                                style={styles.headerButton}
                            >
                                <Ionicons name="close" size={24} color={colors.text} />
                                <Text style={styles.headerButtonText}>CANCEL</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={handleSave}
                                style={[styles.headerButton, styles.saveButton]}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <ActivityIndicator size="small" color={colors.primary} />
                                ) : (
                                    <>
                                <Text style={[styles.headerButtonText, styles.saveButtonText]}>SAVE</Text>
                                        <Ionicons name="checkmark" size={24} color={colors.primary} />
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Modal Content */}
                        <KeyboardAvoidingView 
                            behavior={Platform.OS === "ios" ? "padding" : "height"}
                            style={styles.modalContent}
                            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
                        >
                            <ScrollView 
                                style={styles.modalScroll}
                                contentContainerStyle={styles.modalScrollContent}
                                keyboardShouldPersistTaps="handled"
                            >
                                {/* Amount Section */}
                                <View style={styles.amountContainer}>
                                    <Text style={styles.amountText}>
                                        {amount || '0'}
                                    </Text>
                                    <TouchableOpacity 
                                        onPress={() => setIsCalculatorExpanded(!isCalculatorExpanded)}
                                        style={styles.calculatorButton}
                                    >
                                        <Ionicons 
                                            name="calculator" 
                                            size={24} 
                                            color={colors.primary} 
                                        />
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
                                            onPress={() => {
                                                setTransactionType(type);
                                                setSelectedCategory(allCategories.find((cat: Category) => cat.type === type.toLowerCase()) || allCategories[0]);
                                            }}
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

                                {/* Date & Time Section */}
                                <View style={styles.selectionContainer}>
                                    <TouchableOpacity 
                                        style={styles.selectionRow}
                                        onPress={() => setIsDateModalVisible(true)}
                                    >
                                        <View style={styles.selectionIcon}>
                                            <Ionicons name="calendar-outline" size={24} color={colors.primary} />
                                        </View>
                                        <View style={styles.selectionContent}>
                                            <Text style={styles.selectionLabel}>Date</Text>
                                            <View style={styles.selectionValue}>
                                                <Text style={styles.selectionText}>
                                                    {format(new Date(selectedDate), 'MMM dd, yyyy')}
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity 
                                        style={[styles.selectionRow, { borderBottomWidth: 0 }]}
                                        onPress={() => setIsTimeModalVisible(true)}
                                    >
                                        <View style={styles.selectionIcon}>
                                            <Ionicons name="time-outline" size={24} color={colors.primary} />
                                        </View>
                                        <View style={styles.selectionContent}>
                                            <Text style={styles.selectionLabel}>Time</Text>
                                            <View style={styles.selectionValue}>
                                                <Text style={styles.selectionText}>
                                                    {format(new Date(`2020-01-01T${selectedTime}`), 'h:mm a')}
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                </View>

                                {/* Account & Category Section */}
                                <View style={styles.selectionContainer}>
                        {renderAccountsOrCategory()}
                                </View>

                        {/* Notes Input */}
                                <View style={styles.notesContainer}>
                        <TextInput
                            style={styles.notesInput}
                            placeholder="Add notes"
                            placeholderTextColor={colors.textSecondary}
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                        />
                            </View>
                            </ScrollView>
                        </KeyboardAvoidingView>
                    </SafeAreaView>
                </Modal>
            )}

            {/* Calculator Modal */}
            {renderCalculator()}

            {/* Date Picker Modal */}
            {renderDatePicker()}

            {/* Other Modals */}
            {renderCategoryModal()}

            {/* Account Modal */}
            {renderAccountModal()}

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
                            setSelectedTime(format(new Date(), 'HH:mm'));
                            setIsTimeModalVisible(false);
                        }}
                        onOk={() => {
                            setIsTimeModalVisible(false);
                        }}
                            />
                        </View>
            </Modal>

            {/* From Account Modal */}
            {renderFromAccountModal()}

            {/* To Account Modal */}
            {renderToAccountModal()}
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
        minHeight: 80,
    },
    transactionIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.lg,
        flexShrink: 0,
    },
    expenseIcon: {
        backgroundColor: '#DC2626',
    },
    incomeIcon: {
        backgroundColor: '#059669',
    },
    transferIcon: {
        backgroundColor: '#FF9800',
    },
    transactionMiddle: {
        flex: 1,
        justifyContent: 'center',
        height: 44,
        gap: 4,
    },
    transactionName: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.text,
        lineHeight: 20,
    },
    transactionCategory: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 16,
        textTransform: 'capitalize',
    },
    transactionRight: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'center',
        height: 44,
        gap: 4,
        flexShrink: 0,
    },
    amountText: {
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 20,
    },
    timeText: {
        fontSize: 13,
        color: colors.textSecondary,
        lineHeight: 16,
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
        backgroundColor: colors.background,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    headerButtonText: {
        fontSize: typography.sizes.lg,
        color: colors.text,
    },
    saveButton: {
        gap: spacing.xs,
    },
    saveButtonText: {
        color: colors.primary,
    },
    modalContent: {
        flex: 1,
    },
    modalScroll: {
        flex: 1,
    },
    modalScrollContent: {
        padding: spacing.md,
        paddingBottom: spacing.xl * 2,
    },
    amountContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.secondary,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.lg,
    },
    calculatorButton: {
        padding: spacing.sm,
    },
    transactionTypeContainer: {
        flexDirection: 'row',
        backgroundColor: colors.secondary,
        borderRadius: borderRadius.full,
        padding: spacing.xs,
        marginBottom: spacing.lg,
    },
    transactionTypeButton: {
        flex: 1,
        paddingVertical: spacing.sm,
        alignItems: 'center',
        borderRadius: borderRadius.full,
    },
    activeTransactionType: {
        backgroundColor: colors.background,
    },
    transactionTypeText: {
        color: colors.textSecondary,
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.medium,
    },
    activeTransactionTypeText: {
        color: colors.primary,
    },
    selectionContainer: {
        backgroundColor: colors.secondary,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.lg,
    },
    selectionRow: {
        flexDirection: 'row',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    selectionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    selectionContent: {
        flex: 1,
    },
    selectionLabel: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    selectionValue: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    amountLabel: {
        color: colors.textSecondary,
    },
    notesContainer: {
        backgroundColor: colors.secondary,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginTop: spacing.md,
        minHeight: 100,
    },
    notesInput: {
        color: colors.text,
        fontSize: typography.sizes.sm,
        textAlignVertical: 'top',
        height: 80,
    },
    calculatorOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    calculatorContainer: {
        backgroundColor: colors.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: spacing.lg,
        paddingTop: spacing.md,
    },
    calculatorHandle: {
        width: 40,
        height: 4,
        backgroundColor: colors.border,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: spacing.md,
    },
    datePickerModal: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
    },
    datePickerContent: {
        backgroundColor: colors.background,
        margin: spacing.lg,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
    },
    yearSelector: {
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    yearText: {
        fontSize: typography.sizes.xl,
        color: colors.text,
    },
    selectedDateText: {
        fontSize: typography.sizes['2xl'],
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.lg,
        fontWeight: '300',
    },
    calendar: {
        backgroundColor: colors.background,
    },
    datePickerActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.lg,
    },
    datePickerButton: {
        padding: spacing.md,
        flex: 1,
        alignItems: 'center',
    },
    datePickerButtonText: {
        color: colors.primary,
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.medium,
    },
    transferArrowContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginHorizontal: -10,
        zIndex: 1,
    },
    transferText: {
        color: '#FF9800',
    },
    warningContainer: {
        backgroundColor: colors.warning,
        padding: spacing.sm,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
    },
    warningText: {
        color: colors.background,
        fontSize: typography.sizes.sm,
    },
    budgetAmount: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginLeft: spacing.sm,
    },
    errorText: {
        color: 'red',
        fontSize: typography.sizes.sm,
        textAlign: 'right',
    },
    selectionText: {
        fontSize: typography.sizes.base,
        color: colors.text,
    },
    calendarContainer: {
        position: 'relative',
    },
    dateMark: {
        position: 'absolute',
        width: 6,
        height: 6,
        borderRadius: 3,
        bottom: 6,
    },
    calculatorHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
        paddingHorizontal: spacing.md,
    },
    calculatorAmount: {
        fontSize: typography.sizes['2xl'],
        fontWeight: typography.weights.bold,
        color: colors.text,
    },
    calculatorDone: {
        fontSize: typography.sizes.lg,
        color: colors.primary,
        fontWeight: typography.weights.medium,
    },
    keypad: {
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
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
    dateHeader: {
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.bold,
        color: colors.text,
        marginBottom: spacing.xs,
        marginTop: spacing.lg,
        paddingHorizontal: spacing.sm,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: borderRadius.lg,
        marginBottom: 8,
    },
    selectedCategoryItem: {
        backgroundColor: colors.primary + '15', // 15% opacity
    },
    categoryName: {
        fontSize: 16,
        color: colors.text,
        marginBottom: 4,
    },
    categoryAmount: {
        fontSize: 14,
        color: colors.textSecondary,
    },
});

export default TransactionsScreen; 