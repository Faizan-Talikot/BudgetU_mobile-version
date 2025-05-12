import React, { createContext, useContext, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ViewStyle,
  TextStyle,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';

interface AlertDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

interface AlertDialogContext {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AlertDialogContext = createContext<AlertDialogContext | null>(null);

const AlertDialog: React.FC<AlertDialogProps> = ({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  children,
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

  const open = controlledOpen ?? uncontrolledOpen;
  const onOpenChange = controlledOnOpenChange ?? setUncontrolledOpen;

  return (
    <AlertDialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </AlertDialogContext.Provider>
  );
};

interface AlertDialogTriggerProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const AlertDialogTrigger: React.FC<AlertDialogTriggerProps> = ({
  children,
  style,
}) => {
  const context = useContext(AlertDialogContext);
  if (!context) throw new Error('AlertDialogTrigger must be used within AlertDialog');

  return (
    <TouchableOpacity
      style={style}
      onPress={() => context.onOpenChange(true)}
      activeOpacity={0.7}
    >
      {children}
    </TouchableOpacity>
  );
};

interface AlertDialogContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const AlertDialogContent: React.FC<AlertDialogContentProps> = ({
  children,
  style,
}) => {
  const context = useContext(AlertDialogContext);
  if (!context) throw new Error('AlertDialogContent must be used within AlertDialog');

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current;

  React.useEffect(() => {
    if (context.open) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 20,
          stiffness: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 0.95,
          damping: 20,
          stiffness: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [context.open]);

  return (
    <Modal
      visible={context.open}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={() => context.onOpenChange(false)}
    >
      <TouchableWithoutFeedback onPress={() => context.onOpenChange(false)}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.content,
                style,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              {children}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

interface AlertDialogHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const AlertDialogHeader: React.FC<AlertDialogHeaderProps> = ({
  children,
  style,
}) => (
  <View style={[styles.header, style]}>
    {children}
  </View>
);

interface AlertDialogFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const AlertDialogFooter: React.FC<AlertDialogFooterProps> = ({
  children,
  style,
}) => (
  <View style={[styles.footer, style]}>
    {children}
  </View>
);

interface AlertDialogTitleProps {
  children: React.ReactNode;
  style?: TextStyle;
}

const AlertDialogTitle: React.FC<AlertDialogTitleProps> = ({
  children,
  style,
}) => (
  <Text style={[styles.title, style]}>
    {children}
  </Text>
);

interface AlertDialogDescriptionProps {
  children: React.ReactNode;
  style?: TextStyle;
}

const AlertDialogDescription: React.FC<AlertDialogDescriptionProps> = ({
  children,
  style,
}) => (
  <Text style={[styles.description, style]}>
    {children}
  </Text>
);

interface AlertDialogActionProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

const AlertDialogAction: React.FC<AlertDialogActionProps> = ({
  children,
  onPress,
  style,
}) => {
  const context = useContext(AlertDialogContext);
  if (!context) throw new Error('AlertDialogAction must be used within AlertDialog');

  return (
    <TouchableOpacity
      style={[styles.action, style]}
      onPress={() => {
        onPress?.();
        context.onOpenChange(false);
      }}
      activeOpacity={0.7}
    >
      {typeof children === 'string' ? (
        <Text style={styles.actionText}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

interface AlertDialogCancelProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

const AlertDialogCancel: React.FC<AlertDialogCancelProps> = ({
  children,
  onPress,
  style,
}) => {
  const context = useContext(AlertDialogContext);
  if (!context) throw new Error('AlertDialogCancel must be used within AlertDialog');

  return (
    <TouchableOpacity
      style={[styles.cancel, style]}
      onPress={() => {
        onPress?.();
        context.onOpenChange(false);
      }}
      activeOpacity={0.7}
    >
      {typeof children === 'string' ? (
        <Text style={styles.cancelText}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Styles {
  overlay: ViewStyle;
  content: ViewStyle;
  header: ViewStyle;
  footer: ViewStyle;
  title: TextStyle;
  description: TextStyle;
  action: ViewStyle;
  actionText: TextStyle;
  cancel: ViewStyle;
  cancelText: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 24,
    width: SCREEN_WIDTH - 32,
    maxWidth: 500,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  header: {
    marginBottom: 16,
  },
  footer: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  action: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    minWidth: 80,
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  cancel: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '500',
  },
});

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};