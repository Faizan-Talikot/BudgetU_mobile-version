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

interface Category {
    id: string;
    name: string;
    amount: string;
    color: string;
    icon: string;
    isAmountConfirmed?: boolean;
}

// Predefined categories with icons and colors
const suggestedCategories: Omit<Category, 'id' | 'amount'>[] = [
    { name: 'Food & Dining', color: '#FF6B6B', icon: 'restaurant' },
    { name: 'Transportation', color: '#4ECDC4', icon: 'bus' },
    { name: 'Entertainment', color: '#45B7D1', icon: 'game-controller' },
    { name: 'Shopping', color: '#96CEB4', icon: 'cart' },
    { name: 'Bills & Utilities', color: '#FFBE0B', icon: 'receipt' },
    { name: 'Education', color: '#FF006E', icon: 'school' },
    { name: 'Health & Wellness', color: '#8338EC', icon: 'medical' },
    { name: 'Personal Care', color: '#3A86FF', icon: 'person' },
    { name: 'Savings', color: '#38B000', icon: 'wallet' },
];

const { width } = Dimensions.get('window');

const CreateBudgetCategories: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { amount: totalBudget, name: budgetName, startDate, endDate } = 
        route.params as { amount: number; name: string; startDate: string; endDate: string };

    const [categories, setCategories] = useState<Category[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

    // Calculate remaining amount
    const allocatedAmount = categories.reduce((sum, category) => {
        const amount = parseFloat(category.amount) || 0;
        return sum + amount;
    }, 0);
    const remainingAmount = totalBudget - allocatedAmount;

    // Filter out already selected categories from suggestions
    const availableSuggestedCategories = suggestedCategories.filter(
        suggested => !categories.some(cat => cat.name === suggested.name)
    );

    const handleAddSuggestedCategory = (category: Omit<Category, 'id' | 'amount'>) => {
        const newCategory: Category = {
            ...category,
            id: Math.random().toString(),
            amount: '',
        };
        setCategories([...categories, newCategory]);
    };

    const handleAddCustomCategory = () => {
        if (newCategoryName.trim()) {
            const newCategory: Category = {
                id: Math.random().toString(),
                name: newCategoryName.trim(),
                amount: '',
                color: suggestedCategories[categories.length % suggestedCategories.length].color,
                icon: 'bookmark',
            };
            setCategories([...categories, newCategory]);
            setNewCategoryName('');
            setIsAddingCategory(false);
        }
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
                category.id === id ? { ...category, amount: cleanedAmount, isAmountConfirmed: false } : category
            )
        );
    };

    const handleConfirmAmount = (id: string) => {
        const category = categories.find(c => c.id === id);
        if (!category || !category.amount) return;

        setCategories(prevCategories => 
            prevCategories.map(cat => 
                cat.id === id ? { ...cat, isAmountConfirmed: true } : cat
            )
        );
    };

    const handleRemoveCategory = (id: string) => {
        setCategories(categories.filter(category => category.id !== id));
    };

    const handleCreateBudget = () => {
        // Navigate to review screen with both allocated and unallocated amounts
        navigation.navigate('CreateBudgetReview', {
            amount: totalBudget,
            name: budgetName,
            startDate,
            endDate,
            categories: categories
                .filter(cat => cat.isAmountConfirmed && parseFloat(cat.amount) > 0)
                .map(cat => ({
                    name: cat.name,
                    allocated: parseFloat(cat.amount),
                    spent: 0,
                    color: cat.color,
                })),
            unallocatedAmount: remainingAmount
        });
    };

    const isValid = () => {
        // Allow proceeding if at least one category has a confirmed amount and valid amount
        return categories.some(cat => 
            cat.isAmountConfirmed && 
            parseFloat(cat.amount) > 0
        );
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

                {/* Add Custom Category */}
                {isAddingCategory ? (
                    <View style={styles.addCustomCategory}>
                        <TextInput
                            style={styles.customCategoryInput}
                            placeholder="Category name"
                            placeholderTextColor={colors.textSecondary}
                            value={newCategoryName}
                            onChangeText={setNewCategoryName}
                            autoFocus
                        />
                        <View style={styles.customCategoryButtons}>
                            <Button
                                variant="outline"
                                onPress={() => setIsAddingCategory(false)}
                                style={styles.customCategoryButton}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onPress={handleAddCustomCategory}
                                style={styles.customCategoryButton}
                                disabled={!newCategoryName.trim()}
                            >
                                Add
                            </Button>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.addCategoryButton}
                        onPress={() => setIsAddingCategory(true)}
                    >
                        <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
                        <Text style={styles.addCategoryText}>Add Custom Category</Text>
                    </TouchableOpacity>
                )}

                {/* Suggested Categories - Now always visible if there are available categories */}
                {availableSuggestedCategories.length > 0 && (
                    <View style={styles.suggestedCategories}>
                        <Text style={styles.suggestedTitle}>Suggested Categories</Text>
                        <View style={styles.suggestedGrid}>
                            {availableSuggestedCategories.map((category, index) => (
                                <TouchableOpacity
                                    key={index}
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
                    onPress={handleCreateBudget}
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
    addCategoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.secondary,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    addCategoryText: {
        fontSize: typography.sizes.base,
        color: colors.primary,
        fontWeight: typography.weights.medium,
    },
    addCustomCategory: {
        backgroundColor: colors.secondary,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.lg,
    },
    customCategoryInput: {
        backgroundColor: colors.background,
        borderRadius: borderRadius.md,
        padding: spacing.sm,
        fontSize: typography.sizes.base,
        color: colors.text,
        marginBottom: spacing.sm,
    },
    customCategoryButtons: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    customCategoryButton: {
        flex: 1,
    },
    suggestedCategories: {
        marginBottom: spacing.xl,
    },
    suggestedTitle: {
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.medium,
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
    },
    suggestedIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xs,
    },
    suggestedName: {
        fontSize: typography.sizes.sm,
        color: colors.text,
        textAlign: 'center',
    },
    footer: {
        padding: spacing.lg,
        paddingBottom: Platform.OS === 'ios' ? 34 : spacing.xl,
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