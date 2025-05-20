import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Platform,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../theme';
import { Button } from '../components/Button';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackParamList } from '../navigation/types';

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

const CreateBudgetSuccess: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute();
    const { 
        amount: totalBudget, 
        name: budgetName, 
        startDate, 
        endDate,
        categories,
        incomeSources,
        unallocatedAmount,
        saveAsTemplate,
        enableReminders,
    } = route.params as { 
        amount: number; 
        name: string; 
        startDate: string; 
        endDate: string;
        categories: Category[];
        incomeSources?: IncomeSource[];
        unallocatedAmount: number;
        saveAsTemplate: boolean;
        enableReminders: boolean;
    };

    const handleViewBudget = () => {
        // Navigate back to the Budgets tab
        navigation.navigate('Main', {
            screen: 'MainTabs',
            params: {
                screen: 'Budgets'
            }
        });
    };

    const handleGoHome = () => {
        // Navigate back to the Dashboard tab
        navigation.navigate('Main', {
            screen: 'MainTabs',
            params: {
                screen: 'Dashboard'
            }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.successIcon}>
                    <Ionicons name="checkmark-circle" size={80} color={colors.success} />
                </View>
                <Text style={styles.title}>Budget Created!</Text>
                <Text style={styles.subtitle}>
                    Your budget for {format(new Date(startDate), 'MMMM yyyy')} has been created successfully.
                </Text>
                
                <View style={styles.summaryCard}>
                    <Text style={styles.cardTitle}>{budgetName}</Text>
                    <View style={styles.cardRow}>
                        <Text style={styles.cardLabel}>Total Budget</Text>
                        <Text style={styles.cardValue}>₹{totalBudget.toLocaleString()}</Text>
                    </View>
                    <View style={styles.cardRow}>
                        <Text style={styles.cardLabel}>Categories</Text>
                        <Text style={styles.cardValue}>{categories.length}</Text>
                    </View>
                    {unallocatedAmount > 0 && (
                        <View style={[styles.cardRow, styles.unallocatedRow]}>
                            <Text style={[styles.cardLabel, styles.unallocatedLabel]}>
                                Unallocated Funds
                            </Text>
                            <Text style={[styles.cardValue, styles.unallocatedValue]}>
                                ₹{unallocatedAmount.toLocaleString()}
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.footer}>
                <Button
                    variant="outline"
                    onPress={handleViewBudget}
                    fullWidth
                    style={styles.footerButton}
                >
                    View Budget
                </Button>
                <Button
                    variant="primary"
                    onPress={handleGoHome}
                    fullWidth
                    style={styles.footerButton}
                >
                    Go to Dashboard
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
    content: {
        flex: 1,
        alignItems: 'center',
        padding: spacing.xl,
    },
    successIcon: {
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: typography.sizes['2xl'],
        fontWeight: typography.weights.bold,
        color: colors.text,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: typography.sizes.base,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    summaryCard: {
        backgroundColor: colors.secondary,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        width: '100%',
    },
    cardTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.text,
        marginBottom: spacing.md,
    },
    cardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    cardLabel: {
        fontSize: typography.sizes.base,
        color: colors.text,
    },
    cardValue: {
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.medium,
        color: colors.text,
    },
    unallocatedRow: {
        marginTop: spacing.sm,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    unallocatedLabel: {
        color: colors.primary,
    },
    unallocatedValue: {
        color: colors.primary,
        fontWeight: typography.weights.bold,
    },
    footer: {
        padding: spacing.lg,
        paddingBottom: Platform.OS === 'ios' ? 34 : spacing.xl,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        gap: spacing.md,
    },
    footerButton: {
        marginBottom: spacing.sm,
    },
});

export default CreateBudgetSuccess; 