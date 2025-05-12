import * as React from "react"
import { Text, StyleSheet, TextStyle, StyleProp } from "react-native"

interface LabelProps {
  children: React.ReactNode
  style?: StyleProp<TextStyle>
  disabled?: boolean
}

const Label = React.forwardRef<Text, LabelProps>(
  ({ children, style, disabled }, ref) => (
    <Text
      ref={ref}
      style={[
        styles.label,
        disabled && styles.disabled,
        style,
      ]}
    >
      {children}
    </Text>
  )
)

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },
  disabled: {
    opacity: 0.5,
  },
})

export { Label }
