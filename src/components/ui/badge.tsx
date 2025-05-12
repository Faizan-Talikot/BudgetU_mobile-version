import * as React from "react"
import { View, Text, StyleSheet } from "react-native"

type BadgeVariant = "default" | "secondary" | "destructive" | "outline"

interface BadgeProps {
  variant?: BadgeVariant
  style?: any
  children?: React.ReactNode
}

const Badge = ({ variant = "default", style, children }: BadgeProps) => {
  return (
    <View style={[styles.base, styles[variant], style]}>
      <Text style={[styles.text, styles[`${variant}Text`]]}>{children}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 20,
  },
  default: {
    backgroundColor: "#000",
  },
  secondary: {
    backgroundColor: "#666",
  },
  destructive: {
    backgroundColor: "#ef4444",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#000",
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
  },
  defaultText: {
    color: "#fff",
  },
  secondaryText: {
    color: "#fff",
  },
  destructiveText: {
    color: "#fff",
  },
  outlineText: {
    color: "#000",
  },
})

export { Badge }
