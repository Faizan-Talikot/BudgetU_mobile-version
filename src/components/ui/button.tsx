import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, TouchableOpacityProps } from 'react-native';

export interface ButtonProps extends TouchableOpacityProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
}

interface Styles {
  button: ViewStyle;
  buttonText: TextStyle;
  // Variants
  default: ViewStyle;
  destructive: ViewStyle;
  outline: ViewStyle;
  secondary: ViewStyle;
  ghost: ViewStyle;
  link: ViewStyle;
  // Sizes
  sizeDefault: ViewStyle;
  sizeSm: ViewStyle;
  sizeLg: ViewStyle;
  sizeIcon: ViewStyle;
  // Text variants
  defaultText: TextStyle;
  destructiveText: TextStyle;
  outlineText: TextStyle;
  secondaryText: TextStyle;
  ghostText: TextStyle;
  linkText: TextStyle;
}

const sizeMap = {
  default: 'sizeDefault',
  sm: 'sizeSm',
  lg: 'sizeLg',
  icon: 'sizeIcon',
} as const;

const Button = React.forwardRef<TouchableOpacity, ButtonProps>(
  ({ variant = 'default', size = 'default', style, children, disabled, ...props }, ref) => {
    const getVariantStyle = () => {
      return [
        styles.button,
        styles[variant],
        styles[sizeMap[size]],
        disabled && { opacity: 0.5 },
        style,
      ];
    };

    const getTextStyle = () => {
      return [styles.buttonText, styles[`${variant}Text`]];
    };

    return (
      <TouchableOpacity
        ref={ref}
        style={getVariantStyle()}
        disabled={disabled}
        {...props}
      >
        {typeof children === 'string' ? (
          <Text style={getTextStyle()}>{children}</Text>
        ) : (
          children
        )}
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create<Styles>({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Variants
  default: {
    backgroundColor: '#0066cc',
  },
  destructive: {
    backgroundColor: '#dc2626',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  secondary: {
    backgroundColor: '#f1f5f9',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  link: {
    backgroundColor: 'transparent',
  },
  // Sizes
  sizeDefault: {
    height: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sizeSm: {
    height: 36,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sizeLg: {
    height: 44,
    paddingHorizontal: 32,
    paddingVertical: 10,
  },
  sizeIcon: {
    height: 40,
    width: 40,
    padding: 8,
  },
  // Text variants
  defaultText: {
    color: '#fff',
  },
  destructiveText: {
    color: '#fff',
  },
  outlineText: {
    color: '#000',
  },
  secondaryText: {
    color: '#000',
  },
  ghostText: {
    color: '#000',
  },
  linkText: {
    color: '#0066cc',
    textDecorationLine: 'underline',
  },
});

Button.displayName = 'Button';

export { Button };
