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

interface RadioGroupProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

interface RadioGroupItemProps {
  value: string
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  disabled?: boolean
}

const RadioGroupContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
}>({})

const RadioGroup = React.forwardRef<View, RadioGroupProps>(
  ({ value, onValueChange, children, style }, ref) => {
    return (
      <RadioGroupContext.Provider value={{ value, onValueChange }}>
        <View ref={ref} style={[styles.group, style]}>
          {children}
        </View>
      </RadioGroupContext.Provider>
    )
  }
)

const RadioGroupItem = React.forwardRef<TouchableOpacity, RadioGroupItemProps>(
  ({ value, children, style, textStyle, disabled }, ref) => {
    const { value: selectedValue, onValueChange } = React.useContext(RadioGroupContext)
    const isSelected = value === selectedValue

    const handlePress = () => {
      if (!disabled && onValueChange) {
        onValueChange(value)
      }
    }

    return (
      <TouchableOpacity
        ref={ref}
        style={[
          styles.item,
          disabled && styles.itemDisabled,
          style,
        ]}
        onPress={handlePress}
        disabled={disabled}
      >
        <View style={[styles.radio, isSelected && styles.radioSelected]}>
          {isSelected && <View style={styles.dot} />}
        </View>
        {children && (
          <Text
            style={[
              styles.text,
              disabled && styles.textDisabled,
              textStyle,
            ]}
          >
            {children}
          </Text>
        )}
      </TouchableOpacity>
    )
  }
)

const styles = StyleSheet.create({
  group: {
    gap: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemDisabled: {
    opacity: 0.5,
  },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: "#000",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#000",
  },
  text: {
    fontSize: 14,
    color: "#000",
  },
  textDisabled: {
    color: "#999",
  },
})

export { RadioGroup, RadioGroupItem }
