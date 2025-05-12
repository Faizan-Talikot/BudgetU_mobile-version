import * as React from "react"
import {
  View,
  Modal,
  TouchableOpacity,
  Animated,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Dimensions,
  Platform,
  PanResponder,
} from "react-native"

interface DrawerProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
  side?: "left" | "right" | "top" | "bottom"
  style?: StyleProp<ViewStyle>
}

interface DrawerContentProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")

const DRAWER_SIZES = {
  left: { width: Math.min(SCREEN_WIDTH * 0.8, 400), height: SCREEN_HEIGHT },
  right: { width: Math.min(SCREEN_WIDTH * 0.8, 400), height: SCREEN_HEIGHT },
  top: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.4 },
  bottom: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.4 },
}

const Drawer = React.forwardRef<View, DrawerProps>(
  ({ open = false, onOpenChange, children, side = "left", style }, ref) => {
    const [visible, setVisible] = React.useState(open)
    const fadeAnim = React.useRef(new Animated.Value(0)).current
    const slideAnim = React.useRef(new Animated.Value(0)).current

    React.useEffect(() => {
      setVisible(open)
      if (open) {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 1,
            useNativeDriver: true,
          }),
        ]).start()
      } else {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
          }),
        ]).start(() => setVisible(false))
      }
    }, [open, fadeAnim, slideAnim])

    const handleClose = () => {
      if (onOpenChange) {
        onOpenChange(false)
      }
    }

    const getSlideTransform = () => {
      const size = DRAWER_SIZES[side]
      switch (side) {
        case "left":
          return {
            transform: [
              {
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-size.width, 0],
                }),
              },
            ],
          }
        case "right":
          return {
            transform: [
              {
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [size.width, 0],
                }),
              },
            ],
          }
        case "top":
          return {
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-size.height, 0],
                }),
              },
            ],
          }
        case "bottom":
          return {
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [size.height, 0],
                }),
              },
            ],
          }
      }
    }

    const panResponder = React.useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gestureState) => {
          const size = DRAWER_SIZES[side]
          let delta = 0

          switch (side) {
            case "left":
              delta = Math.min(0, gestureState.dx) / size.width
              break
            case "right":
              delta = Math.max(0, gestureState.dx) / size.width
              break
            case "top":
              delta = Math.min(0, gestureState.dy) / size.height
              break
            case "bottom":
              delta = Math.max(0, gestureState.dy) / size.height
              break
          }

          slideAnim.setValue(1 + delta)
        },
        onPanResponderRelease: (_, gestureState) => {
          const size = DRAWER_SIZES[side]
          let velocity = 0
          let distance = 0

          switch (side) {
            case "left":
              velocity = -gestureState.vx
              distance = -gestureState.dx
              break
            case "right":
              velocity = gestureState.vx
              distance = gestureState.dx
              break
            case "top":
              velocity = -gestureState.vy
              distance = -gestureState.dy
              break
            case "bottom":
              velocity = gestureState.vy
              distance = gestureState.dy
              break
          }

          const shouldClose =
            velocity > 0.5 || distance > size.width * 0.5

          if (shouldClose) {
            handleClose()
          } else {
            Animated.spring(slideAnim, {
              toValue: 1,
              useNativeDriver: true,
            }).start()
          }
        },
      })
    ).current

    return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={handleClose}
      >
        <View ref={ref} style={[styles.container, style]}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.backdropTouchable}
              onPress={handleClose}
              activeOpacity={1}
            />
          </Animated.View>
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.drawer,
              styles[side],
              DRAWER_SIZES[side],
              getSlideTransform(),
            ]}
          >
            {children}
          </Animated.View>
        </View>
      </Modal>
    )
  }
)

const DrawerContent = React.forwardRef<View, DrawerContentProps>(
  ({ children, style }, ref) => {
    return (
      <View ref={ref} style={[styles.content, style]}>
        {children}
      </View>
    )
  }
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  backdropTouchable: {
    flex: 1,
  },
  drawer: {
    position: "absolute",
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
  left: {
    left: 0,
    top: 0,
  },
  right: {
    right: 0,
    top: 0,
  },
  top: {
    top: 0,
    left: 0,
  },
  bottom: {
    bottom: 0,
    left: 0,
  },
  content: {
    flex: 1,
    padding: 16,
  },
})

export { Drawer, DrawerContent }
