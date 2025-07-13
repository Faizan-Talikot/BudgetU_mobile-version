import React from 'react';
import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, shadows } from '../theme';
import { TabParamList } from './types';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Dash from '../screens/DashboardScreen';
import BudgetsScreen from '../screens/BudgetsScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import AccountsScreen from '../screens/AccountsScreen';
import CategoriesScreen from '../screens/CategoriesScreen';

const Tab = createBottomTabNavigator<TabParamList>();

interface TabBarIconProps {
    color: string;
    size: number;
}
console.log("TabNavigator rendered");

const CustomTabBar = (props: any) => {
    const insets = useSafeAreaInsets();
    return (
        <View>
            <BottomTabBar {...props} />
            {insets.bottom > 0 && (
                <View style={{ height: insets.bottom, backgroundColor: colors.background }} />
            )}
        </View>
    );
};

const TabNavigator = () => {
    return (
        <Tab.Navigator
            tabBar={props => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.background,
                    borderTopColor: colors.border,
                    height: 60,
                    paddingTop: 8,
                    ...shadows.md,
                    borderTopWidth: 1,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarLabelStyle: {
                    fontSize: typography.sizes.xs,
                    fontWeight: typography.weights.medium,
                    marginTop: 0,
                },
                tabBarIconStyle: {
                    marginBottom: 0,
                },
                tabBarHideOnKeyboard: true,
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={Dash}
                options={{
                    tabBarIcon: ({ color, size }: TabBarIconProps) => (
                        <Ionicons name="receipt-outline" size={24} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Budgets"
                component={BudgetsScreen}
                options={{
                    tabBarIcon: ({ color, size }: TabBarIconProps) => (
                        <Ionicons name="pie-chart-outline" size={24} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Transactions"
                component={TransactionsScreen}
                options={{
                    tabBarIcon: ({ color, size }: TabBarIconProps) => (
                        <Ionicons name="calculator-outline" size={24} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Accounts"
                component={AccountsScreen}
                options={{
                    tabBarIcon: ({ color, size }: TabBarIconProps) => (
                        <Ionicons name="wallet-outline" size={24} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Categories"
                component={CategoriesScreen}
                options={{
                    tabBarIcon: ({ color, size }: TabBarIconProps) => (
                        <Ionicons name="pricetag-outline" size={24} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export default TabNavigator; 