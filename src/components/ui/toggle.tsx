import * as React from "react"
import { TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from "react-native"

interface ToggleProps {
  pressed?: boolean
  onPressedChange?: (pressed: boolean) => void
  disabled?: boolean
  style?: StyleProp<ViewStyle>
  children?: React.ReactNode
}

const Toggle = React.forwardRef<TouchableOpacity, ToggleProps>(
  ({ pressed, onPressedChange, disabled, style, children }, ref) => (
    <TouchableOpacity
      ref={ref}
      style={[styles.toggle, pressed && styles.pressed, style]}
      onPress={() => onPressedChange?.(!pressed)}
      disabled={disabled}
    >
      {children}
    </TouchableOpacity>
  )
)

const styles = StyleSheet.create({
  toggle: {
    padding: 10,
    borderRadius: 6,
  },
  pressed: {
    backgroundColor: '#e5e5e5',
  },
})

export { Toggle }
