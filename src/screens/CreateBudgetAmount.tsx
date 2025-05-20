import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    TextInput,
    KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { useNavigation, useRoute } from '@react-navigation/native';
import { format } from 'date-fns';

const CreateBudgetAmount: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const [amount, setAmount] = useState('');
    const [name, setName] = useState('');

    // Get dates from route params
    const { startDate, endDate } = route.params as { startDate: string; endDate: string };
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    // Format the default budget name based on the date range
    const defaultBudgetName = `${format(startDateObj, 'MMMM yyyy')} Budget`;

    const handleAmountChange = (text: string) => {
        // Remove any non-numeric characters except decimal point
        const cleanedText = text.replace(/[^0-9.]/g, '');
        
        // Ensure only one decimal point
        const parts = cleanedText.split('.');
        if (parts.length > 2) {
            return;
        }
        
        // Limit decimal places to 2
        if (parts[1] && parts[1].length > 2) {
            return;
        }

        setAmount(cleanedText);
    };

    const isValidAmount = () => {
        const numAmount = parseFloat(amount);
        return !isNaN(numAmount) && numAmount > 0;
    };

    const handleContinue = () => {
        if (isValidAmount()) {
            // @ts-ignore - we know this route exists
            navigation.navigate('CreateBudgetCategories', {
                startDate,
                endDate,
                amount: parseFloat(amount),
                name: name.trim() || defaultBudgetName,
            });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View style={styles.header}>
                    <TouchableOpacity 
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.title}>Set your budget</Text>
                        <Text style={styles.subtitle}>How much do you want to budget for this period?</Text>
                    </View>
                </View>

                <View style={styles.content}>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Budget Name (Optional)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder={defaultBudgetName}
                            placeholderTextColor={colors.textSecondary}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Total Budget Amount</Text>
                        <View style={styles.amountInputContainer}>
                            <Text style={styles.currencySymbol}>₹</Text>
                            <TextInput
                                style={styles.amountInput}
                                placeholder="0.00"
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="decimal-pad"
                                value={amount}
                                onChangeText={handleAmountChange}
                            />
                        </View>
                    </View>

                    <View style={styles.infoCard}>
                        <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
                        <Text style={styles.infoText}>
                            This is the total amount you plan to spend during your budget period from{' '}
                            <Text style={styles.infoHighlight}>
                                {format(startDateObj, 'MMM d')} to {format(endDateObj, 'MMM d')}
                            </Text>
                            . You'll be able to divide this amount across different spending categories in the next step.
                        </Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Button
                        variant="primary"
                        onPress={handleContinue}
                        fullWidth
                        disabled={!isValidAmount()}
                    >
                        Continue
                    </Button>
                </View>
            </KeyboardAvoidingView>
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
        padding: spacing.lg,
    },
    formGroup: {
        marginBottom: spacing.xl,
    },
    label: {
        fontSize: typography.sizes.sm,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    input: {
        backgroundColor: colors.secondary,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        fontSize: typography.sizes.base,
        color: colors.text,
    },
    amountInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.secondary,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
    },
    currencySymbol: {
        fontSize: typography.sizes.xl,
        color: colors.text,
        marginRight: spacing.xs,
    },
    amountInput: {
        flex: 1,
        fontSize: typography.sizes.xl,
        color: colors.text,
        padding: 0,
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: colors.secondary,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        gap: spacing.sm,
    },
    infoText: {
        flex: 1,
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    infoHighlight: {
        color: colors.primary,
        fontWeight: typography.weights.medium,
    },
    footer: {
        padding: spacing.lg,
        paddingBottom: Platform.OS === 'ios' ? 34 : spacing.xl,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
});

export default CreateBudgetAmount; 