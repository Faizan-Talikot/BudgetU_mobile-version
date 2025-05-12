import * as React from "react"
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  Animated,
  Platform,
  Dimensions,
  TouchableOpacity,
} from "react-native"
import { Feather } from "@expo/vector-icons"

interface ToastProps {
  id: string | number
  title?: string
  description?: string
  duration?: number
  onDismiss?: () => void
  style?: StyleProp<ViewStyle>
}

interface ToasterProps {
  position?: "top" | "bottom"
  gap?: number
  offset?: number
  visibleToasts?: number
  style?: StyleProp<ViewStyle>
}

const ToastContext = React.createContext<{
  toasts: ToastProps[]
  addToast: (toast: Omit<ToastProps, "id">) => void
  removeToast: (id: string | number) => void
}>({
  toasts: [],
  addToast: () => { },
  removeToast: () => { },
})

const Toaster = React.forwardRef<View, ToasterProps>(
  ({
    position = "bottom",
    gap = 8,
    offset = 32,
    visibleToasts = 3,
    style,
  }, ref) => {
    const { toasts } = React.useContext(ToastContext)
    const visibleToastsList = toasts.slice(0, visibleToasts)

    return (
      <View
        ref={ref}
        style={[
          styles.container,
          position === "top" ? { top: offset } : { bottom: offset },
          style,
        ]}
      >
        {visibleToastsList.map((toast, index) => (
          <Toast
            key={toast.id}
            {...toast}
            style={{ marginBottom: index < visibleToastsList.length - 1 ? gap : 0 }}
          />
        ))}
      </View>
    )
  }
)

const Toast = React.forwardRef<View, ToastProps>(
  ({ id, title, description, duration = 4000, onDismiss, style }, ref) => {
    const fadeAnim = React.useRef(new Animated.Value(0)).current
    const { removeToast } = React.useContext(ToastContext)

    React.useEffect(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(duration),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        removeToast(id)
        onDismiss?.()
      })
    }, [fadeAnim, duration, id, removeToast, onDismiss])

    return (
      <Animated.View
        ref={ref}
        style={[
          styles.toast,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
          style,
        ]}
      >
        <View style={styles.content}>
          {title && <Text style={styles.title}>{title}</Text>}
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            removeToast(id)
            onDismiss?.()
          }}
        >
          <Feather name="x" size={16} color="#666" />
        </TouchableOpacity>
      </Animated.View>
    )
  }
)

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 999,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    width: "90%",
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#666",
  },
  closeButton: {
    marginLeft: 12,
    padding: 4,
  },
})

export { Toaster, ToastContext }
