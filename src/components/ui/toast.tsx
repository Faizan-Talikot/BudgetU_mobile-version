import * as React from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  Animated,
  Platform,
} from "react-native"
import { Feather } from "@expo/vector-icons"

export type ToastProps = {
  id?: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive" | "success"
  onOpenChange?: (open: boolean) => void
  style?: StyleProp<ViewStyle>
  open?: boolean
}

export type ToastActionElement = React.ReactElement

const Toast = React.forwardRef<View, ToastProps>(
  ({ title, description, action, variant = "default", style, onOpenChange }, ref) => {
    const fadeAnim = React.useRef(new Animated.Value(0)).current

    React.useEffect(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(4000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onOpenChange?.(false)
      })
    }, [fadeAnim, onOpenChange])

    return (
      <Animated.View
        ref={ref}
        style={[
          styles.container,
          styles[variant],
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
          {action}
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => onOpenChange?.(false)}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Feather name="x" size={16} color="#666" />
        </TouchableOpacity>
      </Animated.View>
    )
  }
)

const styles = StyleSheet.create({
  container: {
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
  default: {
    backgroundColor: "#fff",
  },
  destructive: {
    backgroundColor: "#fee2e2",
  },
  success: {
    backgroundColor: "#dcfce7",
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

export { Toast }
