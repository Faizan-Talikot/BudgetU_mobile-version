import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    FlatList,
    Animated,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, shadows } from '../theme';
import { storage, StorageKeys } from '../utils/storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { TrackExpenses } from '../components/illustrations/TrackExpenses';
import { SetBudgets } from '../components/illustrations/SetBudgets';
import { VisualizeSpending } from '../components/illustrations/VisualizeSpending';
import { AchieveGoals } from '../components/illustrations/AchieveGoals';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const onboardingData = [
    {
        id: '1',
        title: 'Track Your Expenses',
        description: 'Effortlessly monitor your daily spending and income with our intuitive interface.',
        Illustration: TrackExpenses,
        gradient: ['#7C3AED', '#9F67FF'],
    },
    {
        id: '2',
        title: 'Smart Budgeting',
        description: 'Create personalized budgets and stay on top of your financial goals with real-time tracking.',
        Illustration: SetBudgets,
        gradient: ['#3B82F6', '#60A5FA'],
    },
    {
        id: '3',
        title: 'Visual Insights',
        description: 'Transform your spending data into beautiful, easy-to-understand visual insights.',
        Illustration: VisualizeSpending,
        gradient: ['#10B981', '#34D399'],
    },
    {
        id: '4',
        title: 'Achieve More',
        description: 'Turn your financial dreams into reality with smart goal tracking and personalized recommendations.',
        Illustration: AchieveGoals,
        gradient: ['#F59E0B', '#FBBF24'],
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
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <FlatList
                data={onboardingData}
                renderItem={({ item }) => (
                    <View style={styles.slide}>
                        <LinearGradient
                            colors={item.gradient}
                            style={styles.gradientBackground}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                        <SafeAreaView style={styles.slideContent}>
                            <View style={styles.illustrationContainer}>
                                <item.Illustration width={width * 0.8} height={height * 0.4} />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.title}>{item.title}</Text>
                                <Text style={styles.description}>{item.description}</Text>
                            </View>
                        </SafeAreaView>
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

            <SafeAreaView style={styles.bottomContainer}>
                <View style={styles.paginationContainer}>
                    <View style={styles.paginationDots}>
                        {onboardingData.map((_, index) => {
                            const inputRange = [
                                (index - 1) * width,
                                index * width,
                                (index + 1) * width,
                            ];

                            const dotWidth = scrollX.interpolate({
                                inputRange,
                                outputRange: [8, 24, 8],
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
                                        { backgroundColor: onboardingData[currentIndex].gradient[0] }
                                    ]}
                                />
                            );
                        })}
                    </View>
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
                        style={[
                            styles.button,
                            styles.nextButton,
                            { backgroundColor: onboardingData[currentIndex].gradient[0] }
                        ]}
                        onPress={scrollTo}
                    >
                        <Text style={[styles.buttonText, styles.nextButtonText]}>
                            {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    slide: {
        width,
        height: '100%',
    },
    gradientBackground: {
        ...StyleSheet.absoluteFillObject,
    },
    slideContent: {
        flex: 1,
        alignItems: 'center',
        padding: spacing.xl,
    },
    illustrationContainer: {
        flex: 0.6,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: height * 0.1,
    },
    textContainer: {
        flex: 0.4,
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '100%',
        paddingHorizontal: spacing.xl,
    },
    title: {
        fontSize: typography.sizes['3xl'],
        fontWeight: typography.weights.bold,
        color: colors.background,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    description: {
        fontSize: typography.sizes.lg,
        color: colors.background,
        textAlign: 'center',
        opacity: 0.9,
        lineHeight: 24,
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xl,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        ...shadows.lg,
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.lg,
    },
    paginationDots: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
    },
    dot: {
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    button: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: 12,
        minWidth: 120,
        alignItems: 'center',
        justifyContent: 'center',
    },
    skipButton: {
        backgroundColor: 'transparent',
    },
    nextButton: {
        ...shadows.sm,
    },
    buttonText: {
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.semibold,
    },
    skipButtonText: {
        color: colors.textSecondary,
    },
    nextButtonText: {
        color: colors.background,
    },
});

export default OnboardingScreen; 