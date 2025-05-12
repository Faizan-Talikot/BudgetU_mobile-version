import { ReactNode } from 'react';
import { StyleProp, ViewStyle, TextStyle } from 'react-native';

export interface ButtonProps {
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
    onPress?: () => void;
    disabled?: boolean;
}

export interface BadgeProps {
    variant?: 'default' | 'outline' | 'secondary';
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
}

export interface CardProps {
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
}

export interface InputProps {
    value?: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;
    style?: StyleProp<TextStyle>;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
}

export interface SelectProps {
    value: string;
    onValueChange: (value: string) => void;
    items: Array<{ label: string; value: string }>;
    placeholder?: string;
    style?: StyleProp<ViewStyle>;
}

export interface DialogProps {
    visible: boolean;
    onClose: () => void;
    children: ReactNode;
    title?: string;
    style?: StyleProp<ViewStyle>;
} 