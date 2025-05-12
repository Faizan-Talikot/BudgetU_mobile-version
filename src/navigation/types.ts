import { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
    Dashboard: undefined;
    Budgets: undefined;
    Transactions: undefined;
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
};

declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList { }
    }
} 