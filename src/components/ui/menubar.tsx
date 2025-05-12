import * as React from "react"
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  Platform,
} from "react-native"
import { Feather } from "@expo/vector-icons"

interface MenubarProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

interface MenubarTriggerProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  onPress?: () => void
}

interface MenubarContentProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  visible?: boolean
  onClose?: () => void
}

interface MenubarItemProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  onPress?: () => void
  disabled?: boolean
  icon?: keyof typeof Feather.glyphMap
}

const Menubar = React.forwardRef<View, MenubarProps>(
  ({ children, style }, ref) => (
    <View
      ref={ref}
      style={[styles.menubar, style]}
    >
      {children}
    </View>
  )
)

const MenubarTrigger = React.forwardRef<TouchableOpacity, MenubarTriggerProps>(
  ({ children, style, onPress }, ref) => (
    <TouchableOpacity
      ref={ref}
      style={[styles.trigger, style]}
      onPress={onPress}
    >
      {children}
    </TouchableOpacity>
  )
)

const MenubarContent = React.forwardRef<View, MenubarContentProps>(
  ({ children, style, visible, onClose }, ref) => (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          ref={ref}
          style={[styles.content, style]}
        >
          {children}
        </View>
      </TouchableOpacity>
    </Modal>
  )
)

const MenubarItem = React.forwardRef<TouchableOpacity, MenubarItemProps>(
  ({ children, style, textStyle, onPress, disabled, icon }, ref) => (
    <TouchableOpacity
      ref={ref}
      style={[styles.item, disabled && styles.itemDisabled, style]}
      onPress={onPress}
      disabled={disabled}
    >
      {icon && (
        <Feather
          name={icon}
          size={16}
          color={disabled ? "#999" : "#000"}
          style={styles.icon}
        />
      )}
      <Text style={[styles.itemText, disabled && styles.itemTextDisabled, textStyle]}>
        {children}
      </Text>
    </TouchableOpacity>
  )
)

const styles = StyleSheet.create({
  menubar: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    padding: 4,
  },
  trigger: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  content: {
    position: "absolute",
    backgroundColor: "#fff",
    borderRadius: 6,
    padding: 4,
    minWidth: 180,
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
})

export {
  Menubar,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
}
