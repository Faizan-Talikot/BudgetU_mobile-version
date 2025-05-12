import * as React from "react"
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native"

interface SeparatorProps {
  orientation?: "horizontal" | "vertical"
  style?: StyleProp<ViewStyle>
}

const Separator = React.forwardRef<View, SeparatorProps>(
  ({ orientation = "horizontal", style }, ref) => (
    <View
      ref={ref}
      style={[
        styles.separator,
        orientation === "horizontal" ? styles.horizontal : styles.vertical,
        style,
      ]}
    />
  )
)

const styles = StyleSheet.create({
  separator: {
    backgroundColor: "#e5e5e5",
    flexShrink: 0,
  },
  horizontal: {
    height: 1,
    width: "100%",
  },
  vertical: {
    width: 1,
    height: "100%",
  },
})

export { Separator }
