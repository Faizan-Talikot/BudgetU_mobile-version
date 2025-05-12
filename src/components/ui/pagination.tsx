import * as React from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native"
import { Feather } from "@expo/vector-icons"

interface PaginationProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

interface PaginationLinkProps {
  children?: React.ReactNode
  isActive?: boolean
  onPress?: () => void
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
}

const Pagination = React.forwardRef<View, PaginationProps>(
  ({ children, style }, ref) => (
    <View
      ref={ref}
      style={[styles.container, style]}
      accessibilityRole="tab"
    >
      {children}
    </View>
  )
)

const PaginationContent = React.forwardRef<View, PaginationProps>(
  ({ children, style }, ref) => (
    <View ref={ref} style={[styles.content, style]}>
      {children}
    </View>
  )
)

const PaginationItem = React.forwardRef<View, PaginationProps>(
  ({ children, style }, ref) => (
    <View ref={ref} style={[styles.item, style]}>
      {children}
    </View>
  )
)

const PaginationLink = React.forwardRef<TouchableOpacity, PaginationLinkProps>(
  ({ children, isActive, style, textStyle, onPress }, ref) => (
    <TouchableOpacity
      ref={ref}
      style={[
        styles.link,
        isActive && styles.linkActive,
        style,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.linkText,
          isActive && styles.linkTextActive,
          textStyle,
        ]}
      >
        {children}
      </Text>
    </TouchableOpacity>
  )
)

const PaginationPrevious = React.forwardRef<TouchableOpacity, PaginationLinkProps>(
  ({ style, onPress }, ref) => (
    <TouchableOpacity
      ref={ref}
      style={[styles.navButton, style]}
      onPress={onPress}
    >
      <Feather name="chevron-left" size={16} color="#000" />
      <Text style={styles.navText}>Previous</Text>
    </TouchableOpacity>
  )
)

const PaginationNext = React.forwardRef<TouchableOpacity, PaginationLinkProps>(
  ({ style, onPress }, ref) => (
    <TouchableOpacity
      ref={ref}
      style={[styles.navButton, style]}
      onPress={onPress}
    >
      <Text style={styles.navText}>Next</Text>
      <Feather name="chevron-right" size={16} color="#000" />
    </TouchableOpacity>
  )
)

const PaginationEllipsis = React.forwardRef<View, { style?: StyleProp<ViewStyle> }>(
  ({ style }, ref) => (
    <View ref={ref} style={[styles.ellipsis, style]}>
      <Feather name="more-horizontal" size={16} color="#666" />
    </View>
  )
)

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
  },
  link: {
    minWidth: 40,
    height: 40,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    backgroundColor: "transparent",
  },
  linkActive: {
    backgroundColor: "#f4f4f5",
  },
  linkText: {
    fontSize: 14,
    color: "#666",
  },
  linkTextActive: {
    color: "#000",
    fontWeight: "500",
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  navText: {
    fontSize: 14,
    color: "#000",
  },
  ellipsis: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
})

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
