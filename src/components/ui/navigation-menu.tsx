import * as React from "react"
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  Platform,
  Animated,
} from "react-native"
import { Feather } from "@expo/vector-icons"

interface NavigationMenuProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

interface NavigationMenuListProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  activeContent?: string | null
  setActiveContent?: (content: string | null) => void
}

interface NavigationMenuItemProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

interface NavigationMenuTriggerProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  onPress?: () => void
}

interface NavigationMenuContentProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  visible?: boolean
  onClose?: () => void
}

interface NavigationMenuLinkProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  onPress?: () => void
}

const NavigationMenu = React.forwardRef<View, NavigationMenuProps>(
  ({ children, style }, ref) => {
    const [activeContent, setActiveContent] = React.useState<string | null>(null)

    return (
      <View ref={ref} style={[styles.menu, style]}>
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return null

          if (child.type === NavigationMenuList) {
            return React.cloneElement(child as React.ReactElement<NavigationMenuListProps>, {
              activeContent,
              setActiveContent,
            })
          }

          return child
        })}
      </View>
    )
  }
)

const NavigationMenuList = React.forwardRef<View, NavigationMenuListProps>(
  ({ children, style }, ref) => (
    <View ref={ref} style={[styles.list, style]}>
      {children}
    </View>
  )
)

const NavigationMenuItem = React.forwardRef<View, NavigationMenuItemProps>(
  ({ children, style }, ref) => (
    <View ref={ref} style={[styles.item, style]}>
      {children}
    </View>
  )
)

const NavigationMenuTrigger = React.forwardRef<TouchableOpacity, NavigationMenuTriggerProps>(
  ({ children, style, onPress }, ref) => (
    <TouchableOpacity
      ref={ref}
      style={[styles.trigger, style]}
      onPress={onPress}
    >
      <Text style={styles.triggerText}>{children}</Text>
      <Feather name="chevron-down" size={16} color="#000" />
    </TouchableOpacity>
  )
)

const NavigationMenuContent = React.forwardRef<View, NavigationMenuContentProps>(
  ({ children, style, visible, onClose }, ref) => {
    if (!visible) return null

    return (
      <Modal transparent visible={visible} onRequestClose={onClose}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <View ref={ref} style={[styles.content, style]}>
            {children}
          </View>
        </TouchableOpacity>
      </Modal>
    )
  }
)

const NavigationMenuLink = React.forwardRef<TouchableOpacity, NavigationMenuLinkProps>(
  ({ children, style, textStyle, onPress }, ref) => (
    <TouchableOpacity
      ref={ref}
      style={[styles.link, style]}
      onPress={onPress}
    >
      <Text style={[styles.linkText, textStyle]}>{children}</Text>
    </TouchableOpacity>
  )
)

const styles = StyleSheet.create({
  menu: {
    position: "relative",
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  item: {
    position: "relative",
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    height: 40,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  triggerText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  content: {
    position: "absolute",
    backgroundColor: "#fff",
    borderRadius: 6,
    padding: 16,
    minWidth: 200,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  link: {
    padding: 8,
    borderRadius: 4,
  },
  linkText: {
    fontSize: 14,
    color: "#000",
  },
})

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
}
