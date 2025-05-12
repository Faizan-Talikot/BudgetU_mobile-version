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
  ScrollView,
} from "react-native"
import { Feather } from "@expo/vector-icons"

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  placeholder?: string
  style?: StyleProp<ViewStyle>
  disabled?: boolean
}

interface SelectItemProps {
  value: string
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
}

const Select = React.forwardRef<View, SelectProps>(
  ({ value, onValueChange, children, placeholder, style, disabled }, ref) => {
    const [open, setOpen] = React.useState(false)
    const selectedItem = React.Children.toArray(children).find(
      (child) => React.isValidElement<SelectItemProps>(child) && child.props.value === value
    ) as React.ReactElement<SelectItemProps> | undefined

    const handleOpen = () => {
      if (!disabled) {
        setOpen(true)
      }
    }

    const handleClose = () => {
      setOpen(false)
    }

    const handleSelect = (newValue: string) => {
      onValueChange?.(newValue)
      handleClose()
    }

    return (
      <View ref={ref}>
        <TouchableOpacity
          style={[
            styles.trigger,
            disabled && styles.triggerDisabled,
            style,
          ]}
          onPress={handleOpen}
          disabled={disabled}
        >
          <Text
            style={[
              styles.triggerText,
              !selectedItem && styles.placeholder,
              disabled && styles.triggerTextDisabled,
            ]}
          >
            {selectedItem ? selectedItem.props.children : placeholder}
          </Text>
          <Feather
            name="chevron-down"
            size={16}
            color={disabled ? "#999" : "#000"}
          />
        </TouchableOpacity>

        <Modal
          visible={open}
          transparent
          animationType="fade"
          onRequestClose={handleClose}
        >
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={handleClose}
          >
            <View style={styles.content}>
              <ScrollView style={styles.scrollView}>
                {React.Children.map(children, (child) => {
                  if (React.isValidElement<SelectItemProps>(child)) {
                    return React.cloneElement(child as React.ReactElement<SelectItemProps & { onPress?: () => void }>, {
                      onPress: () => handleSelect(child.props.value),
                    })
                  }
                  return null
                })}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    )
  }
)

const SelectItem = React.forwardRef<TouchableOpacity, SelectItemProps & { onPress?: () => void }>(
  ({ children, style, textStyle, onPress }, ref) => (
    <TouchableOpacity
      ref={ref}
      style={[styles.item, style]}
      onPress={onPress}
    >
      <Text style={[styles.itemText, textStyle]}>{children}</Text>
    </TouchableOpacity>
  )
)

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 40,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 6,
  },
  triggerDisabled: {
    opacity: 0.5,
  },
  triggerText: {
    fontSize: 14,
    color: "#000",
  },
  triggerTextDisabled: {
    color: "#999",
  },
  placeholder: {
    color: "#999",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  content: {
    width: "100%",
    maxHeight: 300,
    backgroundColor: "#fff",
    borderRadius: 6,
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
  scrollView: {
    padding: 4,
  },
  item: {
    padding: 10,
    borderRadius: 4,
  },
  itemText: {
    fontSize: 14,
    color: "#000",
  },
})

export { Select, SelectItem }
