import * as React from "react"
import {
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Animated,
  Platform,
  Dimensions,
} from "react-native"
import { Toast } from "./toast"

interface ToasterProps {
  position?: "top" | "bottom"
  gap?: number
  offset?: number
  visibleToasts?: number
  style?: StyleProp<ViewStyle>
}

interface ToastProps {
  id: string | number
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive" | "success"
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
            title={toast.title}
            description={toast.description}
            action={toast.action}
            variant={toast.variant}
            style={{ marginBottom: index < visibleToastsList.length - 1 ? gap : 0 }}
            onOpenChange={() => { }}
          />
        ))}
      </View>
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
})

export { Toaster, ToastContext }
