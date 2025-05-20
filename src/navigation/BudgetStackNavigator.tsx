import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CreateBudgetPeriod from '../screens/CreateBudgetPeriod';
import CreateBudgetAmount from '../screens/CreateBudgetAmount';
import CreateBudgetIncome from '../screens/CreateBudgetIncome';
import CreateBudgetCategories from '../screens/CreateBudgetCategories';
import CreateBudgetReview from '../screens/CreateBudgetReview';
import CreateBudgetSuccess from '../screens/CreateBudgetSuccess';

export type BudgetStackParamList = {
    CreateBudgetPeriod: undefined;
    CreateBudgetAmount: {
        startDate: string;
        endDate: string;
    };
    CreateBudgetIncome: {
        amount: number;
        name: string;
        startDate: string;
        endDate: string;
    };
    CreateBudgetCategories: {
        amount: number;
        name: string;
        startDate: string;
        endDate: string;
        incomeSources?: Array<{
            name: string;
            amount: number;
        }>;
    };
    CreateBudgetReview: {
        amount: number;
        name: string;
        startDate: string;
        endDate: string;
        unallocatedAmount: number;
        categories: Array<{
            name: string;
            allocated: number;
            spent: number;
            color: string;
        }>;
        incomeSources?: Array<{
            name: string;
            amount: number;
        }>;
    };
    CreateBudgetSuccess: {
        amount: number;
        name: string;
        startDate: string;
        endDate: string;
        unallocatedAmount: number;
        categories: Array<{
            name: string;
            allocated: number;
            spent: number;
            color: string;
        }>;
        incomeSources?: Array<{
            name: string;
            amount: number;
        }>;
        saveAsTemplate: boolean;
        enableReminders: boolean;
    };
};

const Stack = createNativeStackNavigator<BudgetStackParamList>();

const BudgetStackNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="CreateBudgetPeriod" component={CreateBudgetPeriod} />
            <Stack.Screen name="CreateBudgetAmount" component={CreateBudgetAmount} />
            <Stack.Screen name="CreateBudgetIncome" component={CreateBudgetIncome} />
            <Stack.Screen name="CreateBudgetCategories" component={CreateBudgetCategories} />
            <Stack.Screen name="CreateBudgetReview" component={CreateBudgetReview} />
            <Stack.Screen name="CreateBudgetSuccess" component={CreateBudgetSuccess} />
        </Stack.Navigator>
    );
};

export default BudgetStackNavigator; 