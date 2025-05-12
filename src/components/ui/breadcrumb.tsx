import * as React from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { Feather } from "@expo/vector-icons"

interface BreadcrumbProps {
  children: React.ReactNode
  style?: any
}

interface BreadcrumbItemProps {
  children: React.ReactNode
  style?: any
}

interface BreadcrumbLinkProps {
  children: React.ReactNode
  onPress?: () => void
  style?: any
}

const Breadcrumb = ({ children, style }: BreadcrumbProps) => {
  return (
    <View style={[styles.container, style]} accessible role="navigation">
      {children}
    </View>
  )
}

const BreadcrumbList = React.forwardRef<View, BreadcrumbProps>(
  ({ children, style }, ref) => (
    <View
      ref={ref}
      style={[styles.list, style]}
    >
      {children}
    </View>
  )
)

const BreadcrumbItem = React.forwardRef<View, BreadcrumbItemProps>(
  ({ children, style }, ref) => (
    <View
      ref={ref}
      style={[styles.item, style]}
    >
      {children}
    </View>
  )
)

const BreadcrumbLink = React.forwardRef<TouchableOpacity, BreadcrumbLinkProps>(
  ({ children, style, onPress }, ref) => (
    <TouchableOpacity
      ref={ref}
      style={[styles.link, style]}
      onPress={onPress}
    >
      <Text style={styles.linkText}>{children}</Text>
    </TouchableOpacity>
  )
)

const BreadcrumbPage = React.forwardRef<Text, BreadcrumbItemProps>(
  ({ children, style }, ref) => (
    <Text
      ref={ref}
      style={[styles.page, style]}
      accessibilityRole="text"
    >
      {children}
    </Text>
  )
)

const BreadcrumbSeparator = ({ style }: { style?: any }) => (
  <View style={[styles.separator, style]} accessibilityRole="none">
    <Feather name="chevron-right" size={14} color="#666" />
  </View>
)

const BreadcrumbEllipsis = ({ style }: { style?: any }) => (
  <View style={[styles.ellipsis, style]} accessibilityRole="none">
    <Feather name="more-horizontal" size={16} color="#666" />
  </View>
)

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  list: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  link: {
    opacity: 0.7,
  },
  linkText: {
    fontSize: 14,
    color: "#000",
  },
  page: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  separator: {
    marginHorizontal: 4,
  },
  ellipsis: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
})

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
