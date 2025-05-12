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
  GestureResponderEvent,
} from "react-native"
import { Feather } from "@expo/vector-icons"

interface Position {
  x: number
  y: number
}

interface ContextMenuProps {
  trigger: React.ReactNode
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

interface ContextMenuItemProps {
  onPress?: () => void
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  icon?: keyof typeof Feather.glyphMap
  disabled?: boolean
}

interface ContextMenuSeparatorProps {
  style?: StyleProp<ViewStyle>
}

interface ContextMenuGroupProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

const ContextMenu = React.forwardRef<View, ContextMenuProps>(
  ({ trigger, children, style }, ref) => {
    const [visible, setVisible] = React.useState(false)
    const [position, setPosition] = React.useState<Position>({ x: 0, y: 0 })

    const handleLongPress = (event: GestureResponderEvent) => {
      const { pageX, pageY } = event.nativeEvent
      setPosition({ x: pageX, y: pageY })
      setVisible(true)
    }

    const handleClose = () => {
      setVisible(false)
    }

    return (
      <View ref={ref}>
        <TouchableOpacity onLongPress={handleLongPress}>
          {trigger}
        </TouchableOpacity>
        <Modal
          visible={visible}
          transparent
          animationType="fade"
          onRequestClose={handleClose}
        >
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={handleClose}
          >
            <View
              style={[
                styles.menu,
                {
                  left: Math.min(
                    position.x,
                    Dimensions.get("window").width - 200
                  ),
                  top: Math.min(
                    position.y,
                    Dimensions.get("window").height - 200
                  ),
                },
                style,
              ]}
            >
              {children}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    )
  }
)

const ContextMenuItem = React.forwardRef<TouchableOpacity, ContextMenuItemProps>(
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

const ContextMenuSeparator = React.forwardRef<View, ContextMenuSeparatorProps>(
  ({ style }, ref) => {
    return <View ref={ref} style={[styles.separator, style]} />
  }
)

const ContextMenuGroup = React.forwardRef<View, ContextMenuGroupProps>(
  ({ children, style }, ref) => {
    return (
      <View ref={ref} style={[styles.group, style]}>
        {children}
      </View>
    )
  }
)

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  menu: {
    position: "absolute",
    minWidth: 160,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
})

export {
  ContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuGroup,
}
