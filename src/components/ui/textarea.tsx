import * as React from "react"
import {
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  TextInputProps as RNTextInputProps,
} from "react-native"

interface TextareaProps extends Omit<RNTextInputProps, "style"> {
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
}

const Textarea = React.forwardRef<TextInput, TextareaProps>(
  ({ style, textStyle, ...props }, ref) => (
    <TextInput
      ref={ref}
      style={[styles.input, style]}
      multiline
      textAlignVertical="top"
      {...props}
    />
  )
)

const styles = StyleSheet.create({
  input: {
    minHeight: 80,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 8,
    backgroundColor: "#fff",
    fontSize: 14,
    color: "#000",
  },
})

export { Textarea }
