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
  Dimensions,
  Platform,
  Animated,
} from "react-native"
import { Feather } from "@expo/vector-icons"

interface Position {
  x: number
  y: number
}

interface DropdownMenuProps {
  trigger: React.ReactNode
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

interface DropdownMenuItemProps {
  onPress?: () => void
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  icon?: keyof typeof Feather.glyphMap
  disabled?: boolean
}

interface DropdownMenuSeparatorProps {
  style?: StyleProp<ViewStyle>
}

interface DropdownMenuGroupProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

interface DropdownMenuLabelProps {
  children: React.ReactNode
  style?: StyleProp<TextStyle>
}

const DropdownMenu = React.forwardRef<View, DropdownMenuProps>(
  ({ trigger, children, style }, ref) => {
    const [visible, setVisible] = React.useState(false)
    const [position, setPosition] = React.useState<Position>({ x: 0, y: 0 })
    const fadeAnim = React.useRef(new Animated.Value(0)).current
    const scaleAnim = React.useRef(new Animated.Value(0.95)).current

    const handlePress = (event: any) => {
      const { pageX, pageY, height } = event.nativeEvent
      setPosition({ x: pageX, y: pageY + height })
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
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 0.95,
          useNativeDriver: true,
        }),
      ]).start(() => setVisible(false))
    }

    return (
      <View ref={ref}>
        <TouchableOpacity onPress={handlePress}>
          {trigger}
        </TouchableOpacity>
        <Modal
          visible={visible}
          transparent
          animationType="none"
          onRequestClose={handleClose}
        >
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={handleClose}
          >
            <Animated.View
              style={[
                styles.menu,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                  left: Math.min(
                    position.x,
                    Dimensions.get("window").width - 200
                  ),
                  top: Math.min(
                    position.y,
                    Dimensions.get("window").height - 300
                  ),
                },
                style,
              ]}
            >
              {children}
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      </View>
    )
  }
)

const DropdownMenuItem = React.forwardRef<TouchableOpacity, DropdownMenuItemProps>(
  ({ onPress, children, style, textStyle, icon, disabled }, ref) => {
    return (
      <TouchableOpacity
        ref={ref}
        onPress={onPress}
        disabled={disabled}
        style={[
          styles.item,
          disabled && styles.itemDisabled,
          style,
        ]}
      >
        {icon && (
          <Feather
            name={icon}
            size={16}
            color={disabled ? "#999" : "#000"}
            style={styles.icon}
          />
        )}
        <Text
          style={[
            styles.itemText,
            disabled && styles.itemTextDisabled,
            textStyle,
          ]}
        >
          {children}
        </Text>
      </TouchableOpacity>
    )
  }
)

const DropdownMenuSeparator = React.forwardRef<View, DropdownMenuSeparatorProps>(
  ({ style }, ref) => {
    return <View ref={ref} style={[styles.separator, style]} />
  }
)

const DropdownMenuGroup = React.forwardRef<View, DropdownMenuGroupProps>(
  ({ children, style }, ref) => {
    return (
      <View ref={ref} style={[styles.group, style]}>
        {children}
      </View>
    )
  }
)

const DropdownMenuLabel = React.forwardRef<Text, DropdownMenuLabelProps>(
  ({ children, style }, ref) => {
    return (
      <Text ref={ref} style={[styles.label, style]}>
        {children}
      </Text>
    )
  }
)

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  menu: {
    position: "absolute",
    minWidth: 160,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 4,
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
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 4,
  },
  itemDisabled: {
    opacity: 0.5,
  },
  icon: {
    marginRight: 8,
  },
  itemText: {
    fontSize: 14,
    color: "#000",
  },
  itemTextDisabled: {
    color: "#999",
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 4,
  },
  group: {
    paddingVertical: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
})

export {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel,
}
