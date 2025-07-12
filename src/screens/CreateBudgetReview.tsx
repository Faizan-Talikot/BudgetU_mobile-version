import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    ScrollView,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { useNavigation, useRoute } from '@react-navigation/native';
import { format } from 'date-fns';

interface Category {
    name: string;
    allocated: number;
    spent: number;
    color: string;
}

interface IncomeSource {
    name: string;
    amount: number;
}

const CreateBudgetReview: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { 
        amount: totalBudget, 
        name: budgetName, 
        startDate, 
        endDate,
        categories,
        incomeSources,
        unallocatedAmount,
    } = route.params as { 
        amount: number; 
        name: string; 
        startDate: string; 
        endDate: string;
        categories: Category[];
        incomeSources?: IncomeSource[];
        unallocatedAmount: number;
    };

    const [saveAsTemplate, setSaveAsTemplate] = useState(false);
    const [enableReminders, setEnableReminders] = useState(true);

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const durationInDays = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const dailyBudget = totalBudget / durationInDays;

    const handleContinue = () => {
        console.log('Review screen passing data:', {
            amount: totalBudget,
            name: budgetName,
            startDate,
            endDate,
            unallocatedAmount,
            categories,
            saveAsTemplate,
            enableReminders,
            existingIncome: route.params.existingIncome
        });

        navigation.navigate('CreateBudgetSuccess', {
            amount: totalBudget,
            name: budgetName,
            startDate,
            endDate,
            unallocatedAmount,
            categories,
            saveAsTemplate,
            enableReminders,
            existingIncome: route.params.existingIncome
        });
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
                    <Text style={styles.title}>Review Budget</Text>
                    <Text style={styles.subtitle}>Review your budget details before creating</Text>
                </View>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Budget Overview</Text>
                    <View style={styles.budgetCard}>
                        {route.params.existingIncome > 0 && (
                            <View style={styles.budgetRow}>
                                <Text style={styles.budgetLabel}>Total Income</Text>
                                <Text style={[styles.budgetValue, { color: colors.success }]}>
                                    ₹{route.params.existingIncome.toLocaleString()}
                                </Text>
                            </View>
                        )}
                        <View style={styles.budgetRow}>
                            <Text style={styles.budgetLabel}>Total Budget</Text>
                            <Text style={styles.budgetValue}>₹{totalBudget.toLocaleString()}</Text>
                        </View>
                        <View style={styles.budgetRow}>
                            <Text style={styles.budgetLabel}>Duration</Text>
                            <Text style={styles.budgetValue}>
                                {format(startDateObj, 'MMM d')} - {format(endDateObj, 'MMM d, yyyy')}
                            </Text>
                        </View>
                        <View style={styles.budgetRow}>
                            <Text style={styles.budgetLabel}>Daily Budget</Text>
                            <Text style={styles.budgetValue}>₹{dailyBudget.toLocaleString()}</Text>
                        </View>
                        {unallocatedAmount > 0 && (
                            <View style={[styles.budgetRow, styles.unallocatedRow]}>
                                <Text style={[styles.budgetLabel, styles.unallocatedLabel]}>
                                    Unallocated Funds
                                </Text>
                                <Text style={[styles.budgetValue, styles.unallocatedValue]}>
                                    ₹{unallocatedAmount.toLocaleString()}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Categories</Text>
                    {categories.map((category, index) => (
                        <View key={index} style={styles.categoryCard}>
                            <View style={styles.categoryHeader}>
                                <View style={[styles.categoryIcon, { backgroundColor: category.color }]} />
                                <Text style={styles.categoryName}>{category.name}</Text>
                            </View>
                            <Text style={styles.categoryAmount}>
                                ₹{category.allocated.toLocaleString()}
                            </Text>
                        </View>
                    ))}
                </View>

                <View style={styles.section}>
                    <View style={styles.optionRow}>
                        <Text style={styles.optionLabel}>Save as Template</Text>
                        <Switch
                            value={saveAsTemplate}
                            onValueChange={setSaveAsTemplate}
                            trackColor={{ false: colors.border, true: colors.primary }}
                        />
                    </View>
                    <View style={styles.optionRow}>
                        <Text style={styles.optionLabel}>Enable Reminders</Text>
                        <Switch
                            value={enableReminders}
                            onValueChange={setEnableReminders}
                            trackColor={{ false: colors.border, true: colors.primary }}
                        />
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Button
                    variant="primary"
                    onPress={handleContinue}
                    fullWidth
                >
                    Create Budget
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
    content: {
        flex: 1,
    },
    section: {
        marginBottom: spacing.xl,
        paddingHorizontal: spacing.lg,
    },
    sectionTitle: {
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.medium,
        color: colors.text,
        marginBottom: spacing.md,
    },
    budgetCard: {
        backgroundColor: colors.secondary,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
    },
    budgetRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    budgetLabel: {
        fontSize: typography.sizes.base,
        color: colors.text,
    },
    budgetValue: {
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.medium,
        color: colors.text,
    },
    unallocatedRow: {
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    unallocatedLabel: {
        color: colors.primary,
        fontWeight: typography.weights.medium,
    },
    unallocatedValue: {
        color: colors.primary,
        fontWeight: typography.weights.bold,
    },
    categoryCard: {
        backgroundColor: colors.secondary,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    categoryIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
    },
    categoryName: {
        fontSize: typography.sizes.base,
        color: colors.text,
    },
    categoryAmount: {
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.medium,
        color: colors.text,
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    optionLabel: {
        fontSize: typography.sizes.base,
        color: colors.text,
    },
    footer: {
        padding: spacing.lg,
        paddingBottom: Platform.OS === 'ios' ? 34 : spacing.xl,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
});

export default CreateBudgetReview; 