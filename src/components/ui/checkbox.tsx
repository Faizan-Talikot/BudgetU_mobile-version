import * as React from "react"
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from "react-native"
import { Feather } from "@expo/vector-icons"

interface CheckboxProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  style?: StyleProp<ViewStyle>
}

const Checkbox = React.forwardRef<View, CheckboxProps>(
  ({ checked = false, onCheckedChange, disabled = false, style }, ref) => {
    const handlePress = () => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(!checked)
      }
    }

    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View
          ref={ref}
          style={[
            styles.container,
            checked && styles.checked,
            disabled && styles.disabled,
            style,
          ]}
        >
          {checked && (
            <Feather name="check" size={14} color="#fff" />
          )}
        </View>
      </TouchableOpacity>
    )
  }
)

const styles = StyleSheet.create({
  container: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  checked: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  disabled: {
    opacity: 0.5,
  },
})

export { Checkbox }
