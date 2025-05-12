import * as React from "react"
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native"

interface ToggleGroupProps {
  type?: "single" | "multiple"
  value?: string | string[]
  defaultValue?: string | string[]
  onValueChange?: (value: string | string[]) => void
  disabled?: boolean
  style?: StyleProp<ViewStyle>
  children: React.ReactNode
}

interface ToggleGroupItemProps {
  value: string
  disabled?: boolean
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
}

const ToggleGroupContext = React.createContext<{
  type: "single" | "multiple"
  value: string | string[]
  onChange: (value: string) => void
  disabled?: boolean
}>({
  type: "single",
  value: "",
  onChange: () => { },
})

const ToggleGroup = React.forwardRef<View, ToggleGroupProps>(
  ({
    type = "single",
    value: controlledValue,
    defaultValue,
    onValueChange,
    disabled,
    style,
    children,
  }, ref) => {
    const [value, setValue] = React.useState<string | string[]>(
      defaultValue || (type === "single" ? "" : [])
    )

    const onChange = React.useCallback(
      (itemValue: string) => {
        let newValue: string | string[]

        if (type === "single") {
          newValue = itemValue === value ? "" : itemValue
        } else {
          const currentValue = value as string[]
          newValue = currentValue.includes(itemValue)
            ? currentValue.filter((v) => v !== itemValue)
            : [...currentValue, itemValue]
        }

        setValue(newValue)
        onValueChange?.(newValue)
      },
      [type, value, onValueChange]
    )

    const contextValue = React.useMemo(
      () => ({
        type,
        value: controlledValue !== undefined ? controlledValue : value,
        onChange,
        disabled,
      }),
      [type, controlledValue, value, onChange, disabled]
    )

    return (
      <ToggleGroupContext.Provider value={contextValue}>
        <View ref={ref} style={[styles.container, style]}>
          {children}
        </View>
      </ToggleGroupContext.Provider>
    )
  }
)

const ToggleGroupItem = React.forwardRef<TouchableOpacity, ToggleGroupItemProps>(
  ({ value, disabled, children, style, textStyle }, ref) => {
    const { type, value: selectedValue, onChange, disabled: groupDisabled } = React.useContext(ToggleGroupContext)
    const isSelected = type === "single"
      ? value === selectedValue
      : (selectedValue as string[]).includes(value)
    const isDisabled = disabled || groupDisabled

    return (
      <TouchableOpacity
        ref={ref}
        style={[
          styles.item,
          isSelected && styles.itemSelected,
          isDisabled && styles.itemDisabled,
          style,
        ]}
        onPress={() => !isDisabled && onChange(value)}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.itemText,
            isSelected && styles.itemTextSelected,
            isDisabled && styles.itemTextDisabled,
            textStyle,
          ]}
        >
          {children}
        </Text>
      </TouchableOpacity>
    )
  }
)

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 8,
    backgroundColor: "#f4f4f5",
    padding: 2,
  },
  item: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  itemSelected: {
    backgroundColor: "#fff",
  },
  itemDisabled: {
    opacity: 0.5,
  },
  itemText: {
    fontSize: 14,
    color: "#666",
  },
  itemTextSelected: {
    color: "#000",
    fontWeight: "600",
  },
  itemTextDisabled: {
    color: "#999",
  },
})

export {
  ToggleGroup,
  ToggleGroupItem,
}
