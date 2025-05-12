import * as React from "react"
import { View, StyleSheet, ViewStyle, StyleProp, Animated } from "react-native"

interface SkeletonProps {
  style?: StyleProp<ViewStyle>
}

const Skeleton = React.forwardRef<View, SkeletonProps>(
  ({ style }, ref) => {
    const pulseAnim = React.useRef(new Animated.Value(0)).current

    React.useEffect(() => {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      )

      pulse.start()

      return () => {
        pulse.stop()
      }
    }, [pulseAnim])

    return (
      <Animated.View
        ref={ref}
        style={[
          styles.skeleton,
          {
            opacity: pulseAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.5, 1],
            }),
          },
          style,
        ]}
      />
    )
  }
)

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: "#e5e5e5",
    borderRadius: 4,
  },
})

export { Skeleton }
