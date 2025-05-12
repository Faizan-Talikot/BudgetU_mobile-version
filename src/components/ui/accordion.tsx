import React, { createContext, useContext, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ViewStyle, TextStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface AccordionContextValue {
  value: string[];
  onValueChange: (value: string[]) => void;
  type: 'single' | 'multiple';
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

interface AccordionProps {
  type?: 'single' | 'multiple';
  value?: string[];
  onValueChange?: (value: string[]) => void;
  children: React.ReactNode;
}

const Accordion = ({
  type = 'single',
  value,
  onValueChange,
  children,
}: AccordionProps) => {
  const [internalValue, setInternalValue] = useState<string[]>([]);

  const contextValue = {
    value: value ?? internalValue,
    onValueChange: onValueChange ?? setInternalValue,
    type,
  };

  return (
    <AccordionContext.Provider value={contextValue}>
      <View style={styles.accordion}>{children}</View>
    </AccordionContext.Provider>
  );
};

interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

const AccordionItem = ({ value, children, style }: AccordionItemProps) => {
  const context = useContext(AccordionContext);
  if (!context) throw new Error('AccordionItem must be used within Accordion');

  const isExpanded = context.value.includes(value);

  return (
    <View style={[styles.item, style]}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            isExpanded,
            value,
          });
        }
        return child;
      })}
    </View>
  );
};

interface AccordionTriggerProps {
  children: React.ReactNode;
  isExpanded?: boolean;
  value?: string;
  style?: ViewStyle;
}

const AccordionTrigger = ({ children, isExpanded, value, style }: AccordionTriggerProps) => {
  const context = useContext(AccordionContext);
  if (!context) throw new Error('AccordionTrigger must be used within AccordionItem');

  const rotateAnimation = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(rotateAnimation, {
      toValue: isExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isExpanded]);

  const rotate = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const handlePress = () => {
    if (!value) return;

    if (context.type === 'single') {
      context.onValueChange(isExpanded ? [] : [value]);
    } else {
      context.onValueChange(
        isExpanded
          ? context.value.filter(v => v !== value)
          : [...context.value, value]
      );
    }
  };

  return (
    <TouchableOpacity
      style={[styles.trigger, style]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text style={styles.triggerText}>{children}</Text>
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Feather name="chevron-down" size={20} color="#000" />
      </Animated.View>
    </TouchableOpacity>
  );
};

interface AccordionContentProps {
  children: React.ReactNode;
  isExpanded?: boolean;
  style?: ViewStyle;
}

const AccordionContent = ({ children, isExpanded, style }: AccordionContentProps) => {
  const heightAnimation = React.useRef(new Animated.Value(0)).current;
  const [contentHeight, setContentHeight] = useState(0);

  React.useEffect(() => {
    if (contentHeight > 0) {
      Animated.timing(heightAnimation, {
        toValue: isExpanded ? contentHeight : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [isExpanded, contentHeight]);

  if (!isExpanded && contentHeight === 0) return null;

  return (
    <Animated.View
      style={[
        styles.content,
        { height: heightAnimation },
        style,
      ]}
    >
      <View
        onLayout={(event) => {
          const height = event.nativeEvent.layout.height;
          if (height > 0 && contentHeight === 0) {
            setContentHeight(height);
          }
        }}
      >
        {children}
      </View>
    </Animated.View>
  );
};

interface Styles {
  accordion: ViewStyle;
  item: ViewStyle;
  trigger: ViewStyle;
  triggerText: TextStyle;
  content: ViewStyle;
}

const styles = StyleSheet.create<Styles>({
  accordion: {
    width: '100%',
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  triggerText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  content: {
    overflow: 'hidden',
  },
});

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
};
