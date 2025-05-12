import * as React from "react"
import {
  View,
  TextInput,
  StyleSheet,
  ViewStyle,
  StyleProp,
  TextStyle,
  Platform,
} from "react-native"

interface InputOTPProps {
  length?: number
  value?: string
  onChange?: (value: string) => void
  style?: StyleProp<ViewStyle>
  containerClassName?: string
  className?: string
}

interface InputOTPGroupProps {
  children: React.ReactNode
  className?: string
  style?: StyleProp<ViewStyle>
}

interface InputOTPSlotProps {
  index: number
  char?: string
  isActive?: boolean
  style?: StyleProp<ViewStyle>
  children?: React.ReactNode
}

const InputOTP = React.forwardRef<View, InputOTPProps>(
  ({ length = 6, value = "", onChange, style }, ref) => {
    const [focusedIndex, setFocusedIndex] = React.useState(0)
    const inputRefs = React.useRef<Array<TextInput | null>>([])

    const handleChange = (text: string, index: number) => {
      const newValue = value.split("")
      newValue[index] = text
      onChange?.(newValue.join(""))

      if (text && index < length - 1) {
        inputRefs.current[index + 1]?.focus()
      }
    }

    const setInputRef = React.useCallback((index: number) => (el: TextInput | null) => {
      inputRefs.current[index] = el
    }, [])

    return (
      <View ref={ref} style={[styles.container, style]}>
        {Array.from({ length }).map((_, index) => (
          <InputOTPSlot
            key={index}
            index={index}
            char={value[index]}
            isActive={focusedIndex === index}
          >
            <TextInput
              ref={setInputRef(index)}
              style={styles.input}
              maxLength={1}
              keyboardType="number-pad"
              value={value[index]}
              onChangeText={(text) => handleChange(text, index)}
              onFocus={() => setFocusedIndex(index)}
            />
          </InputOTPSlot>
        ))}
      </View>
    )
  }
)

const InputOTPGroup = React.forwardRef<View, InputOTPGroupProps>(
  ({ children, className, style }, ref) => (
    <View ref={ref} style={[styles.group, style]}>
      {children}
    </View>
  )
)

const InputOTPSlot = React.forwardRef<View, InputOTPSlotProps>(
  ({ index, char, isActive, style, children }, ref) => (
    <View
      ref={ref}
      style={[
        styles.slot,
        isActive && styles.activeSlot,
        style,
      ]}
    >
      {children}
    </View>
  )
)

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  group: {
    flexDirection: "row",
    alignItems: "center",
  },
  slot: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  activeSlot: {
    borderColor: "#000",
  },
  input: {
    fontSize: 18,
    textAlign: "center",
    height: 40,
    width: 40,
  },
})

export { InputOTP, InputOTPGroup, InputOTPSlot }
