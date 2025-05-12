import * as React from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  Animated,
  LayoutChangeEvent,
} from "react-native"

interface TabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

interface TabsListProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

interface TabsContentProps {
  value: string
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

const TabsContext = React.createContext<{
  value: string
  onChange: (value: string) => void
}>({
  value: "",
  onChange: () => { },
})

const Tabs = React.forwardRef<View, TabsProps>(
  ({ defaultValue, value: controlledValue, onValueChange, children, style }, ref) => {
    const [value, setValue] = React.useState(defaultValue || "")

    const onChange = React.useCallback(
      (newValue: string) => {
        setValue(newValue)
        onValueChange?.(newValue)
      },
      [onValueChange]
    )

    const contextValue = React.useMemo(
      () => ({
        value: controlledValue !== undefined ? controlledValue : value,
        onChange,
      }),
      [controlledValue, value, onChange]
    )

    return (
      <TabsContext.Provider value={contextValue}>
        <View ref={ref} style={[styles.container, style]}>
          {children}
        </View>
      </TabsContext.Provider>
    )
  }
)

const TabsList = React.forwardRef<View, TabsListProps>(
  ({ children, style }, ref) => (
    <View ref={ref} style={[styles.list, style]}>
      {children}
    </View>
  )
)

const TabsTrigger = React.forwardRef<TouchableOpacity, TabsTriggerProps>(
  ({ value, children, style }, ref) => {
    const { value: selectedValue, onChange } = React.useContext(TabsContext)
    const isSelected = value === selectedValue

    return (
      <TouchableOpacity
        ref={ref}
        style={[
          styles.trigger,
          isSelected && styles.triggerSelected,
          style,
        ]}
        onPress={() => onChange(value)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.triggerText,
          isSelected && styles.triggerTextSelected,
        ]}>
          {children}
        </Text>
      </TouchableOpacity>
    )
  }
)

const TabsContent = React.forwardRef<View, TabsContentProps>(
  ({ value, children, style }, ref) => {
    const { value: selectedValue } = React.useContext(TabsContext)
    const isSelected = value === selectedValue

    if (!isSelected) return null

    return (
      <View ref={ref} style={[styles.content, style]}>
        {children}
      </View>
    )
  }
)

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  list: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  trigger: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  triggerSelected: {
    borderBottomWidth: 2,
    borderBottomColor: "#000",
  },
  triggerText: {
    fontSize: 14,
    color: "#666",
  },
  triggerTextSelected: {
    color: "#000",
    fontWeight: "600",
  },
  content: {
    padding: 16,
  },
})

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
}
