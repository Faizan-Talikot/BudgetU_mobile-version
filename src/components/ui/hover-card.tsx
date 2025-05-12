import * as React from "react"
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Animated,
  LayoutChangeEvent,
} from "react-native"

interface HoverCardProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

interface HoverCardTriggerProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  onPressIn?: () => void
  onPressOut?: () => void
}

interface HoverCardContentProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  visible?: boolean
  onClose?: () => void
  fadeAnim?: Animated.Value
  scaleAnim?: Animated.Value
}

const HoverCard = React.forwardRef<View, HoverCardProps>(
  ({ children, style }, ref) => {
    const [visible, setVisible] = React.useState(false)
    const fadeAnim = React.useRef(new Animated.Value(0)).current
    const scaleAnim = React.useRef(new Animated.Value(0.95)).current
    const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

    const handleLayout = (event: LayoutChangeEvent) => {
      const { height } = event.nativeEvent.layout
      // Handle layout changes if needed
    }

    const handleOpen = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
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
      timeoutRef.current = setTimeout(() => {
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
      }, 300)
    }

    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    }, [])

    return (
      <View ref={ref} style={style}>
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return null

          if (child.type === HoverCardTrigger) {
            return React.cloneElement(child as React.ReactElement<HoverCardTriggerProps>, {
              onPressIn: handleOpen,
              onPressOut: handleClose,
            })
          }

          if (child.type === HoverCardContent) {
            return React.cloneElement(child as React.ReactElement<HoverCardContentProps>, {
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

const HoverCardTrigger = React.forwardRef<TouchableOpacity, HoverCardTriggerProps>(
  ({ children, style, onPressIn, onPressOut }, ref) => (
    <TouchableOpacity
      ref={ref}
      style={style}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      {children}
    </TouchableOpacity>
  )
)

const HoverCardContent = React.forwardRef<View, HoverCardContentProps>(
  ({ children, style, visible, fadeAnim, scaleAnim }, ref) => {
    if (!visible) return null

    return (
      <Modal transparent visible={visible}>
        <View style={styles.overlay}>
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
        </View>
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
    maxWidth: "80%",
  },
})

export { HoverCard, HoverCardTrigger, HoverCardContent }
