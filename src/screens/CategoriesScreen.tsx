import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../theme';
import { Card } from '../components/Card';
import { Ionicons } from '@expo/vector-icons';

const categories = [
    {
        id: '1',
        name: 'Food & Dining',
        icon: 'restaurant-outline',
        color: '#FF6B6B',
    },
    {
        id: '2',
        name: 'Transportation',
        icon: 'car-outline',
        color: '#4ECDC4',
    },
    {
        id: '3',
        name: 'Shopping',
        icon: 'cart-outline',
        color: '#45B7D1',
    },
    {
        id: '4',
        name: 'Bills & Utilities',
        icon: 'receipt-outline',
        color: '#96CEB4',
    },
    {
        id: '5',
        name: 'Entertainment',
        icon: 'film-outline',
        color: '#D4A5A5',
    },
    {
        id: '6',
        name: 'Healthcare',
        icon: 'medical-outline',
        color: '#FF9999',
    },
    {
        id: '7',
        name: 'Education',
        icon: 'school-outline',
        color: '#9DC8C8',
    },
    {
        id: '8',
        name: 'Personal Care',
        icon: 'person-outline',
        color: '#58B19F',
    },
];

const CategoriesScreen = () => {
    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.header}>
                    <Text style={styles.subtitle}>
                        Manage your expense categories
                    </Text>
                </View>

                <View style={styles.categoriesGrid}>
                    {categories.map((category) => (
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
                        <Text style={styles.addCategoryText}>Add Category</Text>
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