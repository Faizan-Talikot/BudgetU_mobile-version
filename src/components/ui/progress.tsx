import * as React from "react"
import { View, StyleSheet, ViewStyle, StyleProp, Animated } from "react-native"

interface ProgressProps {
  value?: number
  style?: StyleProp<ViewStyle>
}

const Progress = React.forwardRef<View, ProgressProps>(
  ({ value = 0, style }, ref) => {
    const progressAnim = React.useRef(new Animated.Value(0)).current

    React.useEffect(() => {
      Animated.timing(progressAnim, {
        toValue: value,
        duration: 300,
        useNativeDriver: false,
      }).start()
    }, [value, progressAnim])

    return (
      <View ref={ref} style={[styles.container, style]}>
        <Animated.View
          style={[
            styles.indicator,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>
    )
  }
)

const styles = StyleSheet.create({
  container: {
    height: 16,
    backgroundColor: "#f4f4f5",
    borderRadius: 8,
    overflow: "hidden",
  },
  indicator: {
    height: "100%",
    backgroundColor: "#000",
  },
})

export { Progress }
