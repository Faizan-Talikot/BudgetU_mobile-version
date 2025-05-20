import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../theme';
import { Card } from '../components/Card';
import { Ionicons } from '@expo/vector-icons';

interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
    type: 'income' | 'expense';
}

const categories: Category[] = [
    // Expense Categories
    {
        id: '1',
        name: 'Food & Dining',
        icon: 'restaurant-outline',
        color: '#FF6B6B',
        type: 'expense',
    },
    {
        id: '2',
        name: 'Transportation',
        icon: 'car-outline',
        color: '#4ECDC4',
        type: 'expense',
    },
    {
        id: '3',
        name: 'Shopping',
        icon: 'cart-outline',
        color: '#45B7D1',
        type: 'expense',
    },
    {
        id: '4',
        name: 'Bills & Utilities',
        icon: 'receipt-outline',
        color: '#96CEB4',
        type: 'expense',
    },
    {
        id: '5',
        name: 'Entertainment',
        icon: 'film-outline',
        color: '#D4A5A5',
        type: 'expense',
    },
    {
        id: '6',
        name: 'Healthcare',
        icon: 'medical-outline',
        color: '#FF9999',
        type: 'expense',
    },
    {
        id: '7',
        name: 'Education',
        icon: 'school-outline',
        color: '#9DC8C8',
        type: 'expense',
    },
    {
        id: '8',
        name: 'Personal Care',
        icon: 'person-outline',
        color: '#58B19F',
        type: 'expense',
    },
    // Income Categories
    {
        id: '9',
        name: 'Salary',
        icon: 'cash-outline',
        color: '#4CAF50',
        type: 'income',
    },
    {
        id: '10',
        name: 'Business',
        icon: 'briefcase-outline',
        color: '#2196F3',
        type: 'income',
    },
    {
        id: '11',
        name: 'Investments',
        icon: 'trending-up-outline',
        color: '#9C27B0',
        type: 'income',
    },
    {
        id: '12',
        name: 'Gifts',
        icon: 'gift-outline',
        color: '#E91E63',
        type: 'income',
    },
    {
        id: '13',
        name: 'Rental',
        icon: 'home-outline',
        color: '#FF9800',
        type: 'income',
    },
];

const CategoriesScreen = () => {
    const [activeType, setActiveType] = useState<'income' | 'expense'>('expense');

    const filteredCategories = categories.filter(category => category.type === activeType);

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.header}>
                    <Text style={styles.subtitle}>
                        Manage your {activeType} categories
                    </Text>
                </View>

                {/* Type Selector */}
                <View style={styles.typeSelector}>
                    <TouchableOpacity
                        style={[
                            styles.typeButton,
                            activeType === 'expense' && styles.activeTypeButton,
                        ]}
                        onPress={() => setActiveType('expense')}
                    >
                        <Text style={[
                            styles.typeButtonText,
                            activeType === 'expense' && styles.activeTypeButtonText,
                        ]}>
                            Expense
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.typeButton,
                            activeType === 'income' && styles.activeTypeButton,
                        ]}
                        onPress={() => setActiveType('income')}
                    >
                        <Text style={[
                            styles.typeButtonText,
                            activeType === 'income' && styles.activeTypeButtonText,
                        ]}>
                            Income
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.categoriesGrid}>
                    {filteredCategories.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            onPress={() => {/* TODO: Handle category selection */ }}
                            activeOpacity={0.7}
                        >
                            <Card style={styles.categoryCard}>
                                <View
                                    style={[
                                        styles.iconContainer,
                                        { backgroundColor: category.color },
                                    ]}
                                >
                                    <Ionicons
                                        name={category.icon as any}
                                        size={24}
                                        color={colors.background}
                                    />
                                </View>
                                <Text style={styles.categoryName}>{category.name}</Text>
                            </Card>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {/* TODO: Handle add category */ }}
                    activeOpacity={0.7}
                >
                    <Card style={styles.addCategoryCard}>
                        <View style={styles.addIconContainer}>
                            <Ionicons
                                name="add-outline"
                                size={24}
                                color={colors.primary}
                            />
                        </View>
                        <Text style={styles.addCategoryText}>Add {activeType} Category</Text>
                    </Card>
                </TouchableOpacity>
            </ScrollView>
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
    subtitle: {
        fontSize: typography.sizes.base,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    typeSelector: {
        flexDirection: 'row',
        marginHorizontal: spacing.lg,
        marginBottom: spacing.lg,
        backgroundColor: colors.secondary,
        borderRadius: 8,
        padding: spacing.xs,
    },
    typeButton: {
        flex: 1,
        paddingVertical: spacing.sm,
        alignItems: 'center',
        borderRadius: 6,
    },
    activeTypeButton: {
        backgroundColor: colors.background,
    },
    typeButtonText: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
        color: colors.textSecondary,
    },
    activeTypeButtonText: {
        color: colors.primary,
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: spacing.md,
        justifyContent: 'space-between',
    },
    categoryCard: {
        width: 160,
        marginBottom: spacing.md,
        alignItems: 'center',
        padding: spacing.lg,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    categoryName: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
        color: colors.text,
        textAlign: 'center',
        marginTop: spacing.xs,
    },
    addButton: {
        padding: spacing.md,
    },
    addCategoryCard: {
        alignItems: 'center',
        padding: spacing.lg,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: colors.border,
    },
    addIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
        backgroundColor: colors.secondary,
    },
    addCategoryText: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
        color: colors.primary,
        textAlign: 'center',
        marginTop: spacing.xs,
    },
});

export default CategoriesScreen; 