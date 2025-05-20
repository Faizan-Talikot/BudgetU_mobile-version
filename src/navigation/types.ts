import { BudgetStackParamList } from './BudgetStackNavigator';

type NavigatorScreenParams<T> = {
    screen: keyof T;
    params?: T[keyof T];
};

export type TabParamList = {
    Dashboard: undefined;
    Budgets: undefined;
    Transactions: undefined;
    Accounts: undefined;
    Categories: undefined;
};

export type DrawerParamList = {
    MainTabs: NavigatorScreenParams<TabParamList>;
    Settings: undefined;
};

export type RootStackParamList = {
    Onboarding: undefined;
    Login: undefined;
    SignUp: undefined;
    ForgotPassword: undefined;
    Main: NavigatorScreenParams<DrawerParamList>;
    CreateBudget: NavigatorScreenParams<BudgetStackParamList>;
};

declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList { }
    }
} 