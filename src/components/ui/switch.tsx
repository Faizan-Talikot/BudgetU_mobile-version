import * as React from "react"
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Animated,
  Platform,
} from "react-native"

interface SwitchProps {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  style?: StyleProp<ViewStyle>
}

const Switch = React.forwardRef<TouchableOpacity, SwitchProps>(
  ({ checked: checkedProp, defaultChecked = false, onCheckedChange, style }, ref) => {
    const [checked, setChecked] = React.useState(defaultChecked)
    const translateX = React.useRef(new Animated.Value(checked ? 20 : 0)).current
    const backgroundColor = React.useRef(new Animated.Value(checked ? 1 : 0)).current

    const handlePress = () => {
      const newChecked = !checked
      setChecked(newChecked)
      onCheckedChange?.(newChecked)

      Animated.parallel([
        Animated.spring(translateX, {
          toValue: newChecked ? 20 : 0,
          useNativeDriver: true,
        }),
        Animated.timing(backgroundColor, {
          toValue: newChecked ? 1 : 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start()
    }

    React.useEffect(() => {
      if (checkedProp !== undefined) {
        setChecked(checkedProp)
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: checkedProp ? 20 : 0,
            useNativeDriver: true,
          }),
          Animated.timing(backgroundColor, {
            toValue: checkedProp ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
          }),
        ]).start()
      }
    }, [checkedProp])

    return (
      <TouchableOpacity
        ref={ref}
        style={[styles.container, style]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.track,
            {
              backgroundColor: backgroundColor.interpolate({
                inputRange: [0, 1],
                outputRange: ["#e5e5e5", "#22c55e"],
              }),
            },
          ]}
        >
          <Animated.View
            style={[
              styles.thumb,
              {
                transform: [{ translateX }],
              },
            ]}
          />
        </Animated.View>
      </TouchableOpacity>
    )
  }
)

const styles = StyleSheet.create({
  container: {
    padding: 2,
  },
  track: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
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
})

export { Switch }
