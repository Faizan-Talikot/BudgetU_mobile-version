import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    ScrollView,
    TextInput,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { useNavigation, useRoute } from '@react-navigation/native';

interface IncomeSource {
    id: string;
    name: string;
    amount: string;
}

const defaultSources = [
    { name: 'Part-time Job', icon: 'briefcase' },
    { name: 'Parents/Family', icon: 'people' },
    { name: 'Financial Aid', icon: 'school' },
    { name: 'Savings', icon: 'wallet' },
    { name: 'Scholarships', icon: 'ribbon' },
    { name: 'Other', icon: 'add-circle' },
];

const CreateBudgetIncome: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { amount: totalBudget, name: budgetName, startDate, endDate } = 
        route.params as { amount: number; name: string; startDate: string; endDate: string };

    const [sources, setSources] = useState<IncomeSource[]>([]);
    const [newSourceName, setNewSourceName] = useState('');
    const [isAddingSource, setIsAddingSource] = useState(false);

    // Calculate total allocated amount
    const allocatedAmount = sources.reduce((sum, source) => {
        const amount = parseFloat(source.amount) || 0;
        return sum + amount;
    }, 0);
    const remainingAmount = totalBudget - allocatedAmount;

    const handleAddDefaultSource = (name: string) => {
        const newSource: IncomeSource = {
            id: Math.random().toString(),
            name,
            amount: '',
        };
        setSources([...sources, newSource]);
    };

    const handleAddCustomSource = () => {
        if (newSourceName.trim()) {
            const newSource: IncomeSource = {
                id: Math.random().toString(),
                name: newSourceName.trim(),
                amount: '',
            };
            setSources([...sources, newSource]);
            setNewSourceName('');
            setIsAddingSource(false);
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
        const otherSourcesTotal = sources
            .filter(s => s.id !== id)
            .reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
            
        if (newAmount + otherSourcesTotal > totalBudget) {
            Alert.alert(
                'Exceeds Budget',
                'The amount entered would exceed your total budget.'
            );
            return;
        }

        setSources(sources.map(source => 
            source.id === id ? { ...source, amount: cleanedAmount } : source
        ));
    };

    const handleRemoveSource = (id: string) => {
        setSources(sources.filter(source => source.id !== id));
    };

    const handleContinue = () => {
        // @ts-ignore - we know this route exists
        navigation.navigate('CreateBudgetCategories', {
            amount: totalBudget,
            name: budgetName,
            startDate,
            endDate,
            incomeSources: sources.map(source => ({
                name: source.name,
                amount: parseFloat(source.amount) || 0,
            })),
        });
    };

    const handleSkip = () => {
        // @ts-ignore - we know this route exists
        navigation.navigate('CreateBudgetCategories', {
            amount: totalBudget,
            name: budgetName,
            startDate,
            endDate,
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
                    <Text style={styles.title}>Income Sources</Text>
                    <Text style={styles.subtitle}>Break down where your money comes from (optional)</Text>
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
                {/* Existing Sources */}
                {sources.map((source) => (
                    <View key={source.id} style={styles.sourceItem}>
                        <View style={styles.sourceHeader}>
                            <Text style={styles.sourceName}>{source.name}</Text>
                            <TouchableOpacity
                                onPress={() => handleRemoveSource(source.id)}
                                style={styles.removeButton}
                            >
                                <Ionicons name="close" size={20} color={colors.error} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.amountInputContainer}>
                            <Text style={styles.currencySymbol}>₹</Text>
                            <TextInput
                                style={styles.amountInput}
                                placeholder="0"
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="decimal-pad"
                                value={source.amount}
                                onChangeText={(text) => handleUpdateAmount(source.id, text)}
                            />
                        </View>
                    </View>
                ))}

                {/* Add Custom Source */}
                {isAddingSource ? (
                    <View style={styles.addCustomSource}>
                        <TextInput
                            style={styles.customSourceInput}
                            placeholder="Source name"
                            placeholderTextColor={colors.textSecondary}
                            value={newSourceName}
                            onChangeText={setNewSourceName}
                            autoFocus
                        />
                        <View style={styles.customSourceButtons}>
                            <Button
                                variant="outline"
                                onPress={() => setIsAddingSource(false)}
                                style={styles.customSourceButton}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onPress={handleAddCustomSource}
                                style={styles.customSourceButton}
                                disabled={!newSourceName.trim()}
                            >
                                Add
                            </Button>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.addSourceButton}
                        onPress={() => setIsAddingSource(true)}
                    >
                        <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
                        <Text style={styles.addSourceText}>Add Custom Source</Text>
                    </TouchableOpacity>
                )}

                {/* Default Sources */}
                {sources.length === 0 && (
                    <View style={styles.defaultSources}>
                        <Text style={styles.defaultSourcesTitle}>Quick Add</Text>
                        <View style={styles.defaultSourcesGrid}>
                            {defaultSources.map((source, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.defaultSourceItem}
                                    onPress={() => handleAddDefaultSource(source.name)}
                                >
                                    <View style={styles.defaultSourceIcon}>
                                        <Ionicons name={source.icon as any} size={24} color={colors.primary} />
                                    </View>
                                    <Text style={styles.defaultSourceName}>{source.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>

            <View style={styles.footer}>
                <Button
                    variant="outline"
                    onPress={handleSkip}
                    style={styles.skipButton}
                >
                    Skip
                </Button>
                <Button
                    variant="primary"
                    onPress={handleContinue}
                    disabled={allocatedAmount > totalBudget}
                >
                    Continue
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
    sourceItem: {
        backgroundColor: colors.secondary,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    sourceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    sourceName: {
        fontSize: typography.sizes.base,
        color: colors.text,
        fontWeight: typography.weights.medium,
    },
    removeButton: {
        padding: spacing.xs,
    },
    amountInputContainer: {
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
    addSourceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.secondary,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    addSourceText: {
        fontSize: typography.sizes.base,
        color: colors.primary,
        fontWeight: typography.weights.medium,
    },
    addCustomSource: {
        backgroundColor: colors.secondary,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.lg,
    },
    customSourceInput: {
        backgroundColor: colors.background,
        borderRadius: borderRadius.md,
        padding: spacing.sm,
        fontSize: typography.sizes.base,
        color: colors.text,
        marginBottom: spacing.sm,
    },
    customSourceButtons: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    customSourceButton: {
        flex: 1,
    },
    defaultSources: {
        marginBottom: spacing.xl,
    },
    defaultSourcesTitle: {
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.medium,
        color: colors.text,
        marginBottom: spacing.md,
    },
    defaultSourcesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    defaultSourceItem: {
        width: '30%',
        aspectRatio: 1,
        backgroundColor: colors.secondary,
        borderRadius: borderRadius.lg,
        padding: spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    defaultSourceIcon: {
        marginBottom: spacing.xs,
    },
    defaultSourceName: {
        fontSize: typography.sizes.sm,
        color: colors.text,
        textAlign: 'center',
    },
    footer: {
        padding: spacing.lg,
        paddingBottom: Platform.OS === 'ios' ? 34 : spacing.xl,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        flexDirection: 'row',
        gap: spacing.md,
    },
    skipButton: {
        flex: 1,
    },
});

export default CreateBudgetIncome; 