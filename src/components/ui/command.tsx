import * as React from "react"
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  Platform,
} from "react-native"
import { Feather } from "@expo/vector-icons"

interface CommandProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

interface CommandInputProps {
  value?: string
  onChangeText?: (text: string) => void
  placeholder?: string
  style?: StyleProp<ViewStyle>
  inputStyle?: StyleProp<TextStyle>
}

interface CommandItemProps {
  onPress?: () => void
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  disabled?: boolean
}

interface CommandListProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

interface CommandSeparatorProps {
  style?: StyleProp<ViewStyle>
}

interface CommandGroupProps {
  heading: string
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

const Command = React.forwardRef<View, CommandProps>(
  ({ children, style }, ref) => {
    return (
      <View ref={ref} style={[styles.container, style]}>
        {children}
      </View>
    )
  }
)

const CommandInput = React.forwardRef<TextInput, CommandInputProps>(
  ({ value, onChangeText, placeholder, style, inputStyle }, ref) => {
    return (
      <View style={[styles.inputContainer, style]}>
        <Feather name="search" size={16} color="#666" style={styles.searchIcon} />
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          style={[styles.input, inputStyle]}
          placeholderTextColor="#999"
        />
      </View>
    )
  }
)

const CommandList = React.forwardRef<View, CommandListProps>(
  ({ children, style }, ref) => {
    return (
      <View ref={ref} style={[styles.list, style]}>
        {children}
      </View>
    )
  }
)

const CommandItem = React.forwardRef<TouchableOpacity, CommandItemProps>(
  ({ onPress, children, style, disabled }, ref) => {
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
        {children}
      </TouchableOpacity>
    )
  }
)

const CommandSeparator = React.forwardRef<View, CommandSeparatorProps>(
  ({ style }, ref) => {
    return <View ref={ref} style={[styles.separator, style]} />
  }
)

const CommandGroup = React.forwardRef<View, CommandGroupProps>(
  ({ heading, children, style }, ref) => {
    return (
      <View ref={ref} style={[styles.group, style]}>
        <Text style={styles.groupHeading}>{heading}</Text>
        {children}
      </View>
    )
  }
)

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#000",
  },
  list: {
    paddingVertical: 4,
  },
  item: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  itemDisabled: {
    opacity: 0.5,
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 4,
  },
  group: {
    paddingTop: 8,
  },
  groupHeading: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666",
    paddingHorizontal: 12,
    paddingBottom: 4,
    textTransform: "uppercase",
  },
})

export {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandSeparator,
  CommandGroup,
}
