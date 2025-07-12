import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    ScrollView,
    TextInput,
    Alert,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { useNavigation, useRoute } from '@react-navigation/native';
import { categoryAPI } from '../services/api';
import { Category, DBCategory, CreateCategoryPayload } from '../types/category';

// Update the BudgetCategoryWithAmount interface
interface BudgetCategoryWithAmount {
    id: string;
    dbId?: string;  // Store the database ID separately from the client-side id
    name: string;
    type: 'income' | 'expense';
    icon: string;
    color: string;
    amount: string;
    isAmountConfirmed?: boolean;
    isCustom?: boolean;
    isDefault?: boolean;  // Whether it's a default/predefined category
    allocated: number;
    spent?: number;
    categoryId: string;
    isPredefined: boolean;
}

// Type guard to check if a category is a DBCategory
const isDBCategory = (category: any): category is DBCategory => {
    return (
        '_id' in category &&
        'user' in category &&
        'createdAt' in category &&
        'updatedAt' in category
    );
};

// Type guard to check if a category is a predefined category
const isPredefinedCategory = (category: any): boolean => {
    return category.isDefault === true;
};

const { width } = Dimensions.get('window');

const CreateBudgetCategories: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { amount: totalBudget, name: budgetName, startDate, endDate, existingIncome } = 
        route.params as { 
            amount: number; 
            name: string; 
            startDate: string; 
            endDate: string;
            existingIncome?: number;
        };

    const [categories, setCategories] = useState<BudgetCategoryWithAmount[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [availableCategories, setAvailableCategories] = useState<DBCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeCategories = async () => {
            try {
                const allCategories = await categoryAPI.getAll();
                // Filter out income categories
                const expenseCategories = allCategories.filter(cat => cat.type === 'expense');
                setAvailableCategories(expenseCategories);
                setIsLoading(false);
            } catch (error) {
                console.error('Error loading categories:', error);
                setIsLoading(false);
            }
        };
        
        initializeCategories();
    }, []);

    // Calculate remaining amount
    const allocatedAmount = categories.reduce((sum, category) => {
        const amount = parseFloat(category.amount) || 0;
        return sum + amount;
    }, 0);
    const remainingAmount = totalBudget - allocatedAmount;

    // Filter out already selected categories from suggestions
    const availableSuggestedCategories = availableCategories.filter(
        dbCat => !categories.some(cat => 
            (cat.isDefault && cat.id === (dbCat as any).id) || 
            (!cat.isDefault && cat.dbId === dbCat._id)
        )
    );

    const handleAddSuggestedCategory = async (category: DBCategory & { id?: string }) => {
        // For predefined categories, use the predefined ID
        const isPredefined = category.isDefault;
        let categoryId = isPredefined ? (category.id || '') : category._id;

        if (!categoryId) {
            console.error('Invalid category ID:', category);
            Alert.alert('Error', 'Invalid category data');
            return;
        }

        // Check if category is already selected
        if (categories.some(cat =>
            (isPredefined && cat.id === categoryId) ||
            (!isPredefined && cat.dbId === categoryId)
        )) {
            Alert.alert('Already Selected', 'This category has already been added to your budget.');
            return;
        }

        // --- FIXED: Check if predefined category already exists in DB before creating ---
        if (isPredefined) {
            try {
                console.log('Checking if predefined category already exists in DB:', category.name, 'Type:', category.type);
                
                // Check if this predefined category already exists in the user's database
                // We need to look at ALL categories (both predefined and user-created) that the user has
                const allUserCategories = await categoryAPI.getAll();
                const existingCategory = allUserCategories.find(cat => 
                    cat.name.toLowerCase() === category.name.toLowerCase() && 
                    cat.type === category.type &&
                    cat.isCustom // This means it was created by the user (not predefined)
                );

                if (existingCategory) {
                    // Use the existing category from database
                    console.log('Found existing category in DB, using it:', existingCategory._id);
                    categoryId = existingCategory._id;
                } else {
                    // Create new category in DB only if it doesn't exist
                    console.log('Creating predefined category in DB:', category.name, 'Type:', category.type);
                    const created = await categoryAPI.create({
                        name: category.name,
                        type: category.type,
                        icon: category.icon,
                        color: category.color
                    });
                    categoryId = created._id; // Use the real database ID
                    console.log('Created category with ID:', categoryId);
                }
            } catch (e) {
                console.error('Error handling predefined category:', e);
                Alert.alert('Error', 'Failed to process category');
                return;
            }
        }

        const newCategory: BudgetCategoryWithAmount = {
            id: categoryId, // Use the real database ID
            dbId: categoryId, // Store the database ID for all categories
            name: category.name,
            type: category.type,
            icon: category.icon === 'default-icon' ? 'wallet-outline' : category.icon,
            color: category.color || colors.primary,
            amount: '',
            isCustom: !isPredefined,
            isDefault: isPredefined,
            allocated: 0,
            categoryId: categoryId, // Use the real database ID
            isPredefined: false
        };
        setCategories(prev => [...prev, newCategory]);
    };

    const handleUpdateAmount = (id: string, amount: string) => {
        // Remove any non-numeric characters except decimal point
        const cleanedAmount = amount.replace(/[^0-9.]/g, '');
        
        // Ensure only one decimal point
        const parts = cleanedAmount.split('.');
        if (parts.length > 2) return;
        
        // Limit decimal places to 2
        if (parts[1] && parts[1].length > 2) return;

        const newAmount = parseFloat(cleanedAmount) || 0;
        
        // Check if the new amount would exceed the total budget
        const otherCategoriesTotal = categories
            .filter(c => c.id !== id)
            .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
            
        if (newAmount + otherCategoriesTotal > totalBudget) {
            Alert.alert(
                'Exceeds Budget',
                'The amount entered would exceed your total budget.'
            );
            return;
        }

        setCategories(prevCategories => 
            prevCategories.map(category => 
                category.id === id ? { 
                    ...category, 
                    amount: cleanedAmount, 
                    allocated: newAmount, // Update allocated field as well
                    isAmountConfirmed: false 
                } : category
            )
        );
    };

    const handleConfirmAmount = (id: string) => {
        const category = categories.find(c => c.id === id);
        if (!category || !category.amount) return;

        const confirmedAmount = parseFloat(category.amount) || 0;

        setCategories(prevCategories => 
            prevCategories.map(cat => 
                cat.id === id ? { 
                    ...cat, 
                    allocated: confirmedAmount, // Update allocated field when confirming
                    isAmountConfirmed: true 
                } : cat
            )
        );
    };

    const handleRemoveCategory = (id: string) => {
        setCategories(categories.filter(category => category.id !== id));
    };

    const handleContinue = () => {
        // Calculate unallocated amount
        const totalAllocated = categories.reduce((sum, cat) => sum + parseFloat(cat.amount) || 0, 0);
        const unallocatedAmount = totalBudget - totalAllocated;

        console.log('Categories screen passing data:', {
            amount: totalBudget,
            name: budgetName,
            startDate,
            endDate,
            unallocatedAmount,
            categories: categories.map(cat => ({
                name: cat.name,
                allocated: parseFloat(cat.amount) || 0,
                spent: cat.spent || 0,
                color: cat.color,
                categoryId: cat.id,
                isPredefined: cat.isDefault || false
            })),
            existingIncome: existingIncome
        });

        // Navigate to review screen
        navigation.navigate('CreateBudget' as any, {
            screen: 'CreateBudgetReview',
            params: {
                amount: totalBudget,
                name: budgetName,
                startDate,
                endDate,
                unallocatedAmount,
                categories: categories.map(cat => ({
                    name: cat.name,
                    allocated: parseFloat(cat.amount) || 0,
                    spent: cat.spent || 0,
                    color: cat.color,
                    categoryId: cat.id,
                    isPredefined: cat.isDefault || false
                })),
                existingIncome: existingIncome
            }
        });
    };

    const isValid = () => {
        return categories.some(cat => 
            cat.isAmountConfirmed && 
            parseFloat(cat.amount) > 0
        );
    };

    // Add error handling for empty categories
    useEffect(() => {
        if (!isLoading && availableCategories.length === 0) {
            Alert.alert(
                'No Categories Available',
                'Please create some categories first before creating a budget.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack()
                    }
                ]
            );
        }
    }, [isLoading, availableCategories]);

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
                    <Text style={styles.title}>Add Categories</Text>
                    <Text style={styles.subtitle}>Divide your budget into spending categories</Text>
                </View>
            </View>

            <View style={styles.budgetSummary}>
                <View style={styles.budgetInfo}>
                    <Text style={styles.budgetLabel}>Total Budget</Text>
                    <Text style={styles.budgetAmount}>₹{totalBudget.toLocaleString()}</Text>
                </View>
                <View style={styles.budgetDivider} />
                <View style={styles.budgetInfo}>
                    <Text style={styles.budgetLabel}>Remaining</Text>
                    <Text style={[
                        styles.budgetAmount,
                        { color: remainingAmount === 0 ? colors.success : colors.primary }
                    ]}>
                        ₹{remainingAmount.toLocaleString()}
                    </Text>
                </View>
            </View>

            <ScrollView style={styles.content}>
                {/* Existing Categories */}
                {categories.map((category) => (
                    <View key={category.id} style={styles.categoryItem}>
                        <View style={styles.categoryHeader}>
                            <View style={styles.categoryTitleSection}>
                                <Ionicons name={category.icon as any} size={24} color={category.color} />
                                <Text style={styles.categoryName}>{category.name}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => handleRemoveCategory(category.id)}
                                style={styles.removeButton}
                            >
                                <Ionicons name="close" size={20} color={colors.error} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.amountSection}>
                            <View style={styles.amountInputContainer}>
                                <Text style={styles.currencySymbol}>₹</Text>
                                <TextInput
                                    style={styles.amountInput}
                                    placeholder="0"
                                    placeholderTextColor={colors.textSecondary}
                                    keyboardType="decimal-pad"
                                    value={category.amount}
                                    onChangeText={(text) => handleUpdateAmount(category.id, text)}
                                    editable={!category.isAmountConfirmed}
                                />
                            </View>
                            {!category.isAmountConfirmed ? (
                                <TouchableOpacity
                                    style={[
                                        styles.confirmButton,
                                        (!category.amount || parseFloat(category.amount) <= 0) && styles.confirmButtonDisabled
                                    ]}
                                    onPress={() => handleConfirmAmount(category.id)}
                                    disabled={!category.amount || parseFloat(category.amount) <= 0}
                                >
                                    <Ionicons name="checkmark" size={24} color={colors.background} />
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={styles.editButton}
                                    onPress={() => {
                                        setCategories(prev => 
                                            prev.map(cat => 
                                                cat.id === category.id ? { ...cat, isAmountConfirmed: false } : cat
                                            )
                                        );
                                    }}
                                >
                                    <Ionicons name="pencil" size={20} color={colors.primary} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                ))}

                {/* Suggested Categories */}
                {showSuggestions && (
                    <View style={styles.suggestedCategories}>
                        <Text style={styles.suggestedTitle}>Suggested Categories</Text>
                        <View style={styles.suggestedGrid}>
                            {availableSuggestedCategories.map((category) => (
                                <TouchableOpacity
                                    key={category._id}
                                    style={styles.suggestedItem}
                                    onPress={() => handleAddSuggestedCategory(category)}
                                >
                                    <View style={[styles.suggestedIcon, { backgroundColor: category.color }]}>
                                        <Ionicons name={category.icon as any} size={24} color={colors.background} />
                                    </View>
                                    <Text style={styles.suggestedName}>{category.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>

            <View style={styles.footer}>
                <Button
                    variant="primary"
                    onPress={handleContinue}
                    fullWidth
                    disabled={!isValid()}
                >
                    {remainingAmount > 0 ? 'Continue with Unallocated Funds' : 'Continue'}
                </Button>
            </View>
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
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: typography.sizes.base,
        color: colors.textSecondary,
    },
    budgetSummary: {
        flexDirection: 'row',
        marginHorizontal: spacing.lg,
        padding: spacing.md,
        backgroundColor: colors.secondary,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.lg,
    },
    budgetInfo: {
        flex: 1,
        alignItems: 'center',
    },
    budgetDivider: {
        width: 1,
        backgroundColor: colors.border,
        marginHorizontal: spacing.md,
    },
    budgetLabel: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    budgetAmount: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.text,
    },
    content: {
        flex: 1,
        padding: spacing.lg,
    },
    categoryItem: {
        backgroundColor: colors.secondary,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    categoryTitleSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    categoryName: {
        fontSize: typography.sizes.base,
        color: colors.text,
        fontWeight: typography.weights.medium,
    },
    removeButton: {
        padding: spacing.xs,
    },
    amountSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    amountInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        borderRadius: borderRadius.md,
        padding: spacing.sm,
    },
    currencySymbol: {
        fontSize: typography.sizes.lg,
        color: colors.text,
        marginRight: spacing.xs,
    },
    amountInput: {
        flex: 1,
        fontSize: typography.sizes.lg,
        color: colors.text,
        padding: 0,
    },
    suggestedCategories: {
        marginBottom: spacing.xl,
    },
    suggestedTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.text,
        marginBottom: spacing.md,
    },
    suggestedGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    suggestedItem: {
        width: (width - spacing.lg * 2 - spacing.md * 2) / 3,
        alignItems: 'center',
        gap: spacing.xs,
    },
    suggestedIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    suggestedName: {
        fontSize: typography.sizes.sm,
        color: colors.text,
        textAlign: 'center',
    },
    footer: {
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    confirmButton: {
        backgroundColor: colors.success,
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmButtonDisabled: {
        backgroundColor: colors.textSecondary,
        opacity: 0.5,
    },
    editButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.secondary,
    },
});

export default CreateBudgetCategories; 