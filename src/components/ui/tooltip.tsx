import * as React from "react"
import {
  View,
  Modal,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  Animated,
  Dimensions,
  LayoutChangeEvent,
} from "react-native"

interface TooltipProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

interface TooltipTriggerProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  onPress?: () => void
}

interface TooltipContentProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  visible?: boolean
  onClose?: () => void
  position?: { x: number; y: number }
}

const TooltipContext = React.createContext<{
  visible: boolean
  setVisible: (visible: boolean) => void
  position: { x: number; y: number }
  setPosition: (position: { x: number; y: number }) => void
}>({
  visible: false,
  setVisible: () => { },
  position: { x: 0, y: 0 },
  setPosition: () => { },
})

const Tooltip = React.forwardRef<View, TooltipProps>(
  ({ children, style }, ref) => {
    const [visible, setVisible] = React.useState(false)
    const [position, setPosition] = React.useState({ x: 0, y: 0 })

    return (
      <TooltipContext.Provider value={{ visible, setVisible, position, setPosition }}>
        <View ref={ref} style={style}>
          {children}
        </View>
      </TooltipContext.Provider>
    )
  }
)

const TooltipTrigger = React.forwardRef<TouchableOpacity, TooltipTriggerProps>(
  ({ children, style, onPress }, ref) => {
    const { setVisible, setPosition } = React.useContext(TooltipContext)

    const handlePress = (event: any) => {
      const { pageX, pageY } = event.nativeEvent
      setPosition({ x: pageX, y: pageY })
      setVisible(true)
      onPress?.()
    }

    return (
      <TouchableOpacity
        ref={ref}
        style={style}
        onPress={handlePress}
      >
        {children}
      </TouchableOpacity>
    )
  }
)

const TooltipContent = React.forwardRef<View, TooltipContentProps>(
  ({ children, style, textStyle, visible, onClose, position }, ref) => {
    const context = React.useContext(TooltipContext)
    const isVisible = visible ?? context.visible
    const tooltipPosition = position ?? context.position
    const fadeAnim = React.useRef(new Animated.Value(0)).current

    React.useEffect(() => {
      if (isVisible) {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start()
      }
    }, [isVisible])

    if (!isVisible) return null

    const handleClose = () => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        context.setVisible(false)
        onClose?.()
      })
    }

    return (
      <Modal
        transparent
        visible={isVisible}
        onRequestClose={handleClose}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <Animated.View
            ref={ref}
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    scale: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.95, 1],
                    }),
                  },
                ],
                top: tooltipPosition.y + 20,
                left: tooltipPosition.x,
              },
              style,
            ]}
          >
            {typeof children === 'string' ? (
              <Text style={[styles.text, textStyle]}>{children}</Text>
            ) : (
              children
            )}
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    )
  }
)

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    position: 'absolute',
    backgroundColor: '#000',
    borderRadius: 4,
    padding: 8,
    maxWidth: 250,
  },
  text: {
    color: '#fff',
    fontSize: 12,
  },
})

export { Tooltip, TooltipTrigger, TooltipContent }
