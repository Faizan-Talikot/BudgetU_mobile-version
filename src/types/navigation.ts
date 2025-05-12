import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
    Login: undefined;
    SignUp: undefined;
    ForgotPassword: undefined;
    Dashboard: undefined;
    Transactions: undefined;
    Budgets: undefined;
    Settings: undefined;
};

export type NavigationProps = StackNavigationProp<RootStackParamList>;

export type TransactionsScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'Transactions'
>; 