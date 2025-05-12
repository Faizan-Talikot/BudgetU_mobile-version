import * as React from "react"
import {
  Modal,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  Animated,
  Dimensions,
  Platform,
} from "react-native"
import { Feather } from "@expo/vector-icons"

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

interface DialogContentProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

interface DialogHeaderProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

interface DialogFooterProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

interface DialogTitleProps {
  children: React.ReactNode
  style?: StyleProp<TextStyle>
}

interface DialogDescriptionProps {
  children: React.ReactNode
  style?: StyleProp<TextStyle>
}

const Dialog = React.forwardRef<View, DialogProps>(
  ({ open = false, onOpenChange, children, style }, ref) => {
    const [visible, setVisible] = React.useState(open)
    const fadeAnim = React.useRef(new Animated.Value(0)).current
    const scaleAnim = React.useRef(new Animated.Value(0.95)).current

    React.useEffect(() => {
      setVisible(open)
      if (open) {
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
    }, [open, fadeAnim, scaleAnim])

    const handleClose = () => {
      if (onOpenChange) {
        onOpenChange(false)
      }
    }

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
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {children}
          </Animated.View>
        </View>
      </Modal>
    )
  }
)

const DialogContent = React.forwardRef<View, DialogContentProps>(
  ({ children, style }, ref) => {
    return (
      <View ref={ref} style={[styles.dialogContent, style]}>
        {children}
      </View>
    )
  }
)

const DialogHeader = React.forwardRef<View, DialogHeaderProps>(
  ({ children, style }, ref) => {
    return (
      <View ref={ref} style={[styles.header, style]}>
        {children}
      </View>
    )
  }
)

const DialogFooter = React.forwardRef<View, DialogFooterProps>(
  ({ children, style }, ref) => {
    return (
      <View ref={ref} style={[styles.footer, style]}>
        {children}
      </View>
    )
  }
)

const DialogTitle = React.forwardRef<Text, DialogTitleProps>(
  ({ children, style }, ref) => {
    return (
      <Text ref={ref} style={[styles.title, style]}>
        {children}
      </Text>
    )
  }
)

const DialogDescription = React.forwardRef<Text, DialogDescriptionProps>(
  ({ children, style }, ref) => {
    return (
      <Text ref={ref} style={[styles.description, style]}>
        {children}
      </Text>
    )
  }
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  backdropTouchable: {
    flex: 1,
  },
  content: {
    width: Math.min(Dimensions.get("window").width - 32, 400),
    backgroundColor: "#fff",
    borderRadius: 8,
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
  dialogContent: {
    padding: 16,
  },
  header: {
    padding: 16,
    paddingBottom: 0,
  },
  footer: {
    padding: 16,
    paddingTop: 0,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
})

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
