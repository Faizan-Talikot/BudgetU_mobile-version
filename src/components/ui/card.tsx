import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface Styles {
  card: ViewStyle;
  header: ViewStyle;
  title: TextStyle;
  description: TextStyle;
  content: ViewStyle;
  footer: ViewStyle;
}

const Card = React.forwardRef<View, CardProps>(
  ({ children, style, ...props }, ref) => (
    <View
      ref={ref}
      style={[styles.card, style]}
      {...props}
    >
      {children}
    </View>
  )
);

const CardHeader = React.forwardRef<View, CardProps>(
  ({ children, style, ...props }, ref) => (
    <View
      ref={ref}
      style={[styles.header, style]}
      {...props}
    >
      {children}
    </View>
  )
);

const CardTitle = React.forwardRef<Text, CardProps>(
  ({ children, style, ...props }, ref) => (
    <Text
      ref={ref}
      style={[styles.title, style]}
      {...props}
    >
      {children}
    </Text>
  )
);

const CardDescription = React.forwardRef<Text, CardProps>(
  ({ children, style, ...props }, ref) => (
    <Text
      ref={ref}
      style={[styles.description, style]}
      {...props}
    >
      {children}
    </Text>
  )
);

const CardContent = React.forwardRef<View, CardProps>(
  ({ children, style, ...props }, ref) => (
    <View
      ref={ref}
      style={[styles.content, style]}
      {...props}
    >
      {children}
    </View>
  )
);

const CardFooter = React.forwardRef<View, CardProps>(
  ({ children, style, ...props }, ref) => (
    <View
      ref={ref}
      style={[styles.footer, style]}
      {...props}
    >
      {children}
    </View>
  )
);

const styles = StyleSheet.create<Styles>({
  card: {
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    padding: 24,
    gap: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    padding: 24,
    paddingTop: 0,
  },
  footer: {
    padding: 24,
    paddingTop: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardTitle.displayName = 'CardTitle';
CardDescription.displayName = 'CardDescription';
CardContent.displayName = 'CardContent';
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
