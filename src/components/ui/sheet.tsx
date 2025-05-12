import * as React from "react"
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Animated,
  Dimensions,
  Text,
  Platform,
} from "react-native"
import { Feather } from "@expo/vector-icons"

interface SheetProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

interface SheetTriggerProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  onPress?: () => void
}

interface SheetContentProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  visible?: boolean
  onClose?: () => void
  side?: "top" | "bottom" | "left" | "right"
  slideAnim?: Animated.Value
}

const Sheet = React.forwardRef<View, SheetProps>(
  ({ children, style }, ref) => {
    const [visible, setVisible] = React.useState(false)
    const slideAnim = React.useRef(new Animated.Value(0)).current

    const handleOpen = () => {
      setVisible(true)
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start()
    }

    const handleClose = () => {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start(() => {
        setVisible(false)
      })
    }

    return (
      <View ref={ref} style={style}>
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return null

          if (child.type === SheetTrigger) {
            return React.cloneElement(child as React.ReactElement<SheetTriggerProps>, {
              onPress: handleOpen,
            })
          }

          if (child.type === SheetContent) {
            return React.cloneElement(child as React.ReactElement<SheetContentProps>, {
              visible,
              onClose: handleClose,
              slideAnim,
            })
          }

          return child
        })}
      </View>
    )
  }
)

const SheetTrigger = React.forwardRef<TouchableOpacity, SheetTriggerProps>(
  ({ children, style, onPress }, ref) => (
    <TouchableOpacity
      ref={ref}
      style={style}
      onPress={onPress}
    >
      {children}
    </TouchableOpacity>
  )
)

const SheetContent = React.forwardRef<View, SheetContentProps & { slideAnim?: Animated.Value }>(
  ({ children, style, visible, onClose, side = "right", slideAnim }, ref) => {
    if (!visible) return null

    const { width, height } = Dimensions.get("window")
    const isVertical = side === "top" || side === "bottom"
    const dimension = isVertical ? height : width

    const getTransform = () => {
      if (!slideAnim) return []

      const translateValue = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [dimension, 0],
      })

      switch (side) {
        case "top":
          return [{ translateY: translateValue }]
        case "bottom":
          return [{ translateY: translateValue }]
        case "left":
          return [{ translateX: translateValue }]
        case "right":
          return [{ translateX: translateValue }]
        default:
          return []
      }
    }

    return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={onClose}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <Animated.View
            ref={ref}
            style={[
              styles.content,
              side === "top" && styles.contentTop,
              side === "bottom" && styles.contentBottom,
              side === "left" && styles.contentLeft,
              side === "right" && styles.contentRight,
              {
                transform: getTransform(),
              },
              style,
            ]}
          >
            {children}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Feather name="x" size={24} color="#000" />
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    )
  }
)

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  content: {
    position: "absolute",
    backgroundColor: "#fff",
    padding: 24,
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
  contentTop: {
    top: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  contentBottom: {
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  contentLeft: {
    top: 0,
    bottom: 0,
    left: 0,
    width: "75%",
    maxWidth: 400,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  contentRight: {
    top: 0,
    bottom: 0,
    right: 0,
    width: "75%",
    maxWidth: 400,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 8,
  },
})

export {
  Sheet,
  SheetTrigger,
  SheetContent,
}

