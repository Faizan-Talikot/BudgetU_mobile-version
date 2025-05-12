import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';

interface AlertProps {
  variant?: 'default' | 'destructive';
  style?: ViewStyle;
  children: React.ReactNode;
}

interface AlertTitleProps {
  style?: TextStyle;
  children: React.ReactNode;
}

interface AlertDescriptionProps {
  style?: TextStyle;
  children: React.ReactNode;
}

const Alert: React.FC<AlertProps> = ({
  variant = 'default',
  style,
  children,
}) => {
  return (
    <View
      style={[
        styles.alert,
        variant === 'destructive' ? styles.alertDestructive : styles.alertDefault,
        style,
      ]}
      accessibilityRole="alert"
    >
      {children}
    </View>
  );
};

const AlertTitle: React.FC<AlertTitleProps> = ({
  style,
  children,
}) => {
  return (
    <Text style={[styles.title, style]}>
      {children}
    </Text>
  );
};

const AlertDescription: React.FC<AlertDescriptionProps> = ({
  style,
  children,
}) => {
  return (
    <Text style={[styles.description, style]}>
      {children}
    </Text>
  );
};

interface Styles {
  alert: ViewStyle;
  alertDefault: ViewStyle;
  alertDestructive: ViewStyle;
  title: TextStyle;
  description: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  alert: {
    width: '100%',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  alertDefault: {
    backgroundColor: '#fff',
    borderColor: '#e2e8f0',
  },
  alertDestructive: {
    backgroundColor: '#fff',
    borderColor: '#dc2626',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

Alert.displayName = 'Alert';
AlertTitle.displayName = 'AlertTitle';
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
