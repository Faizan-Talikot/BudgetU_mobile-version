import * as React from "react"
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Dimensions,
  Platform,
  Animated,
} from "react-native"

interface PopoverProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

interface PopoverTriggerProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  onPress?: () => void
}

interface PopoverContentProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  visible?: boolean
  onClose?: () => void
  fadeAnim?: Animated.Value
  scaleAnim?: Animated.Value
}

const Popover = React.forwardRef<View, PopoverProps>(
  ({ children, style }, ref) => {
    const [visible, setVisible] = React.useState(false)
    const fadeAnim = React.useRef(new Animated.Value(0)).current
    const scaleAnim = React.useRef(new Animated.Value(0.95)).current

    const handleOpen = () => {
      setVisible(true)
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start()
    }

    const handleClose = () => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 0.95,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setVisible(false)
      })
    }

    return (
      <View ref={ref} style={style}>
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return null

          if (child.type === PopoverTrigger) {
            return React.cloneElement(child as React.ReactElement<PopoverTriggerProps>, {
              onPress: handleOpen,
            })
          }

          if (child.type === PopoverContent) {
            return React.cloneElement(child as React.ReactElement<PopoverContentProps>, {
              visible,
              onClose: handleClose,
              fadeAnim,
              scaleAnim,
            })
          }

          return child
        })}
      </View>
    )
  }
)

const PopoverTrigger = React.forwardRef<TouchableOpacity, PopoverTriggerProps>(
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

const PopoverContent = React.forwardRef<View, PopoverContentProps>(
  ({ children, style, visible, onClose, fadeAnim, scaleAnim }, ref) => {
    if (!visible) return null

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
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim || new Animated.Value(1) }],
              },
              style,
            ]}
          >
            {children}
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    )
  }
)

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    width: "80%",
    maxWidth: 400,
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

export { Popover, PopoverTrigger, PopoverContent }
