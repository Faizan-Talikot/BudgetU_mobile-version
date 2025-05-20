import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { format, endOfMonth, startOfMonth, addMonths, isAfter, isBefore } from 'date-fns';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BudgetStackParamList } from '../navigation/BudgetStackNavigator';
import { Calendar } from 'react-native-calendars';
import { Button } from '../components/Button';

const CreateBudgetPeriod: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<BudgetStackParamList>>();
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
    const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
    const [dateType, setDateType] = useState<'start' | 'end'>('start');

    const handlePeriodSelect = (type: 'current' | 'next' | 'custom') => {
        const today = new Date();
        let startDate: Date;
        let endDate: Date;

        switch (type) {
            case 'current':
                startDate = today;
                endDate = endOfMonth(today);
                navigateToAmount(startDate, endDate);
                break;
            case 'next':
                startDate = startOfMonth(addMonths(today, 1));
                endDate = endOfMonth(startDate);
                navigateToAmount(startDate, endDate);
                break;
            case 'custom':
                setShowCalendar(true);
                setDateType('start');
                setSelectedStartDate(null);
                setSelectedEndDate(null);
                break;
            default:
                return;
        }
    };

    const navigateToAmount = (startDate: Date, endDate: Date) => {
        navigation.navigate('CreateBudgetAmount', {
            startDate: format(startDate, 'yyyy-MM-dd'),
            endDate: format(endDate, 'yyyy-MM-dd')
        });
    };

    const handleDateSelect = (day: any) => {
        const selectedDate = new Date(day.timestamp);
        
        if (dateType === 'start') {
            setSelectedStartDate(selectedDate);
            setDateType('end');
        } else {
            if (isBefore(selectedDate, selectedStartDate!)) {
                // If end date is before start date, swap them
                setSelectedEndDate(selectedStartDate);
                setSelectedStartDate(selectedDate);
            } else {
                setSelectedEndDate(selectedDate);
            }
            setShowCalendar(false);
            navigateToAmount(selectedStartDate!, selectedDate);
        }
    };

    const getMarkedDates = () => {
        const markedDates: any = {};
        const today = new Date();
        const formattedToday = format(today, 'yyyy-MM-dd');
        markedDates[formattedToday] = { disabled: false, startingDay: true, color: colors.primary };

        if (selectedStartDate) {
            const startStr = format(selectedStartDate, 'yyyy-MM-dd');
            markedDates[startStr] = { selected: true, startingDay: true, color: colors.primary };
        }

        return markedDates;
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
                    <Text style={styles.title}>Select Period</Text>
                    <Text style={styles.subtitle}>Choose your budget duration</Text>
                </View>
            </View>

            <View style={styles.content}>
                <TouchableOpacity 
                    style={styles.option}
                    onPress={() => handlePeriodSelect('current')}
                >
                    <View style={styles.optionIcon}>
                        <Ionicons name="calendar-outline" size={24} color={colors.primary} />
                    </View>
                    <View style={styles.optionContent}>
                        <Text style={styles.optionTitle}>Rest of Current Month</Text>
                        <Text style={styles.optionDescription}>
                            {format(new Date(), 'MMM d')} - {format(endOfMonth(new Date()), 'MMM d')}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.option}
                    onPress={() => handlePeriodSelect('next')}
                >
                    <View style={styles.optionIcon}>
                        <Ionicons name="calendar-outline" size={24} color={colors.primary} />
                    </View>
                    <View style={styles.optionContent}>
                        <Text style={styles.optionTitle}>Next Month</Text>
                        <Text style={styles.optionDescription}>
                            {format(startOfMonth(addMonths(new Date(), 1)), 'MMM d')} - {format(endOfMonth(addMonths(new Date(), 1)), 'MMM d')}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.option}
                    onPress={() => handlePeriodSelect('custom')}
                >
                    <View style={styles.optionIcon}>
                        <Ionicons name="calendar-outline" size={24} color={colors.primary} />
                    </View>
                    <View style={styles.optionContent}>
                        <Text style={styles.optionTitle}>Custom Period</Text>
                        <Text style={styles.optionDescription}>
                            Choose your own start and end dates
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <Modal
                visible={showCalendar}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowCalendar(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.calendarContainer}>
                        <View style={styles.calendarHeader}>
                            <Text style={styles.calendarTitle}>
                                Select {dateType === 'start' ? 'Start' : 'End'} Date
                            </Text>
                            <TouchableOpacity 
                                onPress={() => setShowCalendar(false)}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        
                        <Calendar
                            minDate={format(new Date(), 'yyyy-MM-dd')}
                            onDayPress={handleDateSelect}
                            markedDates={getMarkedDates()}
                            theme={{
                                selectedDayBackgroundColor: colors.primary,
                                todayTextColor: colors.primary,
                                arrowColor: colors.primary,
                                monthTextColor: colors.text,
                                textDayFontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
                                textMonthFontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
                                textDayHeaderFontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
                            }}
                        />

                        {selectedStartDate && dateType === 'end' && (
                            <View style={styles.dateInfo}>
                                <Text style={styles.dateInfoText}>
                                    Start Date: {format(selectedStartDate, 'MMM d, yyyy')}
                                </Text>
                            </View>
                        )}
                    </View>
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
        fontSize: typography.sizes['2xl'],
        fontWeight: typography.weights.bold,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: typography.sizes.base,
        color: colors.textSecondary,
    },
    content: {
        padding: spacing.lg,
        gap: spacing.lg,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.secondary,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        gap: spacing.md,
    },
    optionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionContent: {
        flex: 1,
    },
    optionTitle: {
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.medium,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    optionDescription: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        padding: spacing.lg,
    },
    calendarContainer: {
        backgroundColor: colors.background,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    calendarTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.text,
    },
    closeButton: {
        padding: spacing.xs,
    },
    dateInfo: {
        marginTop: spacing.md,
        padding: spacing.md,
        backgroundColor: colors.secondary,
        borderRadius: borderRadius.md,
    },
    dateInfoText: {
        fontSize: typography.sizes.sm,
        color: colors.text,
        textAlign: 'center',
    },
});

export default CreateBudgetPeriod; 