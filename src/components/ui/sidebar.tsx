import * as React from "react"
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  Animated,
  Platform,
  Dimensions,
} from "react-native"
import { Feather } from "@expo/vector-icons"

interface SidebarProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface SidebarTriggerProps {
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
  onPress?: () => void
}

interface SidebarContentProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  slideAnim?: Animated.Value
}

const SidebarContext = React.createContext<{
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}>({
  isOpen: true,
  setIsOpen: () => { },
})

const Sidebar = React.forwardRef<View, SidebarProps>(
  ({ children, style, defaultOpen = true, open: openProp, onOpenChange }, ref) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen)
    const slideAnim = React.useRef(new Animated.Value(isOpen ? 1 : 0)).current

    const handleToggle = () => {
      const newValue = !isOpen
      setIsOpen(newValue)
      onOpenChange?.(newValue)

      Animated.spring(slideAnim, {
        toValue: newValue ? 1 : 0,
        useNativeDriver: true,
      }).start()
    }

    React.useEffect(() => {
      if (openProp !== undefined) {
        setIsOpen(openProp)
        Animated.spring(slideAnim, {
          toValue: openProp ? 1 : 0,
          useNativeDriver: true,
        }).start()
      }
    }, [openProp, slideAnim])

    return (
      <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
        <View ref={ref} style={[styles.container, style]}>
          {React.Children.map(children, (child) => {
            if (!React.isValidElement(child)) return null

            if (child.type === SidebarTrigger) {
              return React.cloneElement(child as React.ReactElement<SidebarTriggerProps>, {
                onPress: handleToggle,
              })
            }

            if (child.type === SidebarContent) {
              return React.cloneElement(child as React.ReactElement<SidebarContentProps>, {
                slideAnim,
              })
            }

            return child
          })}
        </View>
      </SidebarContext.Provider>
    )
  }
)

const SidebarTrigger = React.forwardRef<TouchableOpacity, SidebarTriggerProps>(
  ({ children, style, onPress }, ref) => (
    <TouchableOpacity
      ref={ref}
      style={[styles.trigger, style]}
      onPress={onPress}
    >
      <Feather name="menu" size={24} color="#000" />
    </TouchableOpacity>
  )
)

const SidebarContent = React.forwardRef<View, SidebarContentProps & { slideAnim?: Animated.Value }>(
  ({ children, style, slideAnim }, ref) => {
    const { width } = Dimensions.get("window")
    const sidebarWidth = Math.min(300, width * 0.8)

    return (
      <Animated.View
        ref={ref}
        style={[
          styles.content,
          {
            width: sidebarWidth,
            transform: [
              {
                translateX: slideAnim?.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-sidebarWidth, 0],
                }) || 0,
              },
            ],
          },
          style,
        ]}
      >
        {children}
      </Animated.View>
    )
  }
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  trigger: {
    padding: 12,
  },
  content: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "#fff",
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
})

export {
  Sidebar,
  SidebarTrigger,
  SidebarContent,
}
