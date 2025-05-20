import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { Loading } from '../components/Loading';
import DrawerNavigator from './DrawerNavigator';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import BudgetStackNavigator from './BudgetStackNavigator';
import { storage, StorageKeys } from '../utils/storage';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const Navigation = () => {
    const { user, loading } = useAuth();
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
    const [isCheckingStatus, setIsCheckingStatus] = useState(true);

    const checkOnboardingStatus = async () => {
        try {
            setIsCheckingStatus(true);
            const status = await storage.get(StorageKeys.HAS_SEEN_ONBOARDING);
            setHasSeenOnboarding(!!status);
        } catch (error) {
            console.error('Error checking onboarding status:', error);
            setHasSeenOnboarding(false);
        } finally {
            setIsCheckingStatus(false);
        }
    };

    useEffect(() => {
        checkOnboardingStatus();
    }, []);

    useEffect(() => {
        const unsubscribe = storage.addListener(StorageKeys.HAS_SEEN_ONBOARDING, async () => {
            await checkOnboardingStatus();
        });

        return () => {
            unsubscribe();
        };
    }, []);

    if (loading || isCheckingStatus) {
        return <Loading message="Loading..." />;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator 
                screenOptions={{ headerShown: false }}
                initialRouteName={!hasSeenOnboarding ? "Onboarding" : !user ? "Login" : "Main"}
            >
                <Stack.Group>
                    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="SignUp" component={SignUpScreen} />
                    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                    <Stack.Screen name="Main" component={DrawerNavigator} />
                    <Stack.Screen name="CreateBudget" component={BudgetStackNavigator} />
                </Stack.Group>
            </Stack.Navigator>
        </NavigationContainer>
    );
}; 