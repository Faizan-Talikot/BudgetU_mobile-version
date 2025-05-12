import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    FlatList,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../theme';
import { storage, StorageKeys } from '../utils/storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { TrackExpenses } from '../components/illustrations/TrackExpenses';
import { SetBudgets } from '../components/illustrations/SetBudgets';
import { VisualizeSpending } from '../components/illustrations/VisualizeSpending';
import { AchieveGoals } from '../components/illustrations/AchieveGoals';

const { width, height } = Dimensions.get('window');

const onboardingData = [
    {
        id: '1',
        title: 'Track Your Expenses',
        description: 'Keep track of your daily expenses and income with our easy-to-use interface.',
        Illustration: TrackExpenses,
    },
    {
        id: '2',
        title: 'Set Budgets',
        description: 'Create custom budgets for different categories and stay within your spending limits.',
        Illustration: SetBudgets,
    },
    {
        id: '3',
        title: 'Visualize Your Spending',
        description: 'See where your money goes with beautiful charts and detailed analytics.',
        Illustration: VisualizeSpending,
    },
    {
        id: '4',
        title: 'Achieve Your Goals',
        description: 'Set financial goals and track your progress towards achieving them.',
        Illustration: AchieveGoals,
    },
];

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const OnboardingScreen = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef<FlatList>(null);
    const navigation = useNavigation<NavigationProp>();

    const viewableItemsChanged = useRef(({ viewableItems }: any) => {
        setCurrentIndex(viewableItems[0]?.index || 0);
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const scrollTo = async () => {
        if (currentIndex < onboardingData.length - 1) {
            slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            await completeOnboarding();
        }
    };

    const completeOnboarding = async () => {
        try {
            await storage.set(StorageKeys.HAS_SEEN_ONBOARDING, true);
            navigation.replace('Login');
        } catch (error) {
            console.error('Error saving onboarding status:', error);
        }
    };

    const skip = () => {
        completeOnboarding();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.flatListContainer}>
                <FlatList
                    data={onboardingData}
                    renderItem={({ item }) => (
                        <View style={styles.slide}>
                            <View style={styles.illustrationContainer}>
                                <item.Illustration width={width * 0.8} height={height * 0.4} />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.title}>{item.title}</Text>
                                <Text style={styles.description}>{item.description}</Text>
                            </View>
                        </View>
                    )}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    bounces={false}
                    keyExtractor={(item) => item.id}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: false }
                    )}
                    onViewableItemsChanged={viewableItemsChanged}
                    viewabilityConfig={viewConfig}
                    ref={slidesRef}
                />
            </View>

            <View style={styles.bottomContainer}>
                <View style={styles.paginationDots}>
                    {onboardingData.map((_, index) => {
                        const inputRange = [
                            (index - 1) * width,
                            index * width,
                            (index + 1) * width,
                        ];

                        const dotWidth = scrollX.interpolate({
                            inputRange,
                            outputRange: [8, 16, 8],
                            extrapolate: 'clamp',
                        });

                        const opacity = scrollX.interpolate({
                            inputRange,
                            outputRange: [0.3, 1, 0.3],
                            extrapolate: 'clamp',
                        });

                        return (
                            <Animated.View
                                key={index.toString()}
                                style={[
                                    styles.dot,
                                    { width: dotWidth, opacity },
                                ]}
                            />
                        );
                    })}
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.skipButton]}
                        onPress={skip}
                    >
                        <Text style={[styles.buttonText, styles.skipButtonText]}>
                            Skip
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.nextButton]}
                        onPress={scrollTo}
                    >
                        <Text style={[styles.buttonText, styles.nextButtonText]}>
                            {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    flatListContainer: {
        flex: 1,
    },
    slide: {
        width,
        height: height * 0.75,
        alignItems: 'center',
        padding: spacing.xl,
    },
    illustrationContainer: {
        flex: 0.7,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 0.3,
    },
    title: {
        fontSize: typography.sizes['2xl'],
        fontWeight: typography.weights.bold,
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    description: {
        fontSize: typography.sizes.lg,
        color: colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: spacing.xl,
    },
    bottomContainer: {
        height: height * 0.25,
        justifyContent: 'space-between',
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xl,
    },
    paginationDots: {
        flexDirection: 'row',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary,
        marginHorizontal: 4,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing.lg,
    },
    button: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    skipButton: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
    },
    nextButton: {
        backgroundColor: colors.primary,
        minWidth: 120,
    },
    buttonText: {
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.medium,
    },
    skipButtonText: {
        color: colors.textSecondary,
    },
    nextButtonText: {
        color: colors.background,
    },
});

export default OnboardingScreen; 