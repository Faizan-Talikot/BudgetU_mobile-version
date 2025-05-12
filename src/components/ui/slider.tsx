import * as React from "react"
import {
  View,
  PanResponder,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Animated,
  LayoutChangeEvent,
  PanResponderGestureState,
} from "react-native"

interface SliderProps {
  value?: number[]
  defaultValue?: number[]
  min?: number
  max?: number
  step?: number
  onValueChange?: (value: number[]) => void
  style?: StyleProp<ViewStyle>
}

const Slider = React.forwardRef<View, SliderProps>(
  ({
    value,
    defaultValue = [0],
    min = 0,
    max = 100,
    step = 1,
    onValueChange,
    style,
  }, ref) => {
    const [sliderWidth, setSliderWidth] = React.useState(0)
    const [values, setValues] = React.useState(defaultValue)
    const thumbAnims = React.useRef(values.map(() => new Animated.Value(0))).current

    const handleLayout = (event: LayoutChangeEvent) => {
      setSliderWidth(event.nativeEvent.layout.width)
    }

    const getValueFromPosition = (position: number) => {
      const percentage = Math.max(0, Math.min(1, position / sliderWidth))
      const rawValue = percentage * (max - min) + min
      const steppedValue = Math.round(rawValue / step) * step
      return Math.max(min, Math.min(max, steppedValue))
    }

    const createPanResponder = (index: number) =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gestureState: PanResponderGestureState) => {
          const newValue = getValueFromPosition(gestureState.moveX)
          const newValues = [...values]
          newValues[index] = newValue
          setValues(newValues)
          onValueChange?.(newValues)

          Animated.spring(thumbAnims[index], {
            toValue: ((newValue - min) / (max - min)) * sliderWidth,
            useNativeDriver: true,
          }).start()
        },
      })

    const panResponders = React.useMemo(
      () => values.map((_, index) => createPanResponder(index)),
      [values, sliderWidth]
    )

    React.useEffect(() => {
      if (value !== undefined) {
        setValues(value)
        value.forEach((v, i) => {
          Animated.spring(thumbAnims[i], {
            toValue: ((v - min) / (max - min)) * sliderWidth,
            useNativeDriver: true,
          }).start()
        })
      }
    }, [value, min, max, sliderWidth])

    return (
      <View
        ref={ref}
        style={[styles.container, style]}
        onLayout={handleLayout}
      >
        <View style={styles.track} />
        {values.map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.thumb,
              {
                transform: [{ translateX: thumbAnims[index] }],
              },
            ]}
            {...panResponders[index].panHandlers}
          />
        ))}
      </View>
    )
  }
)

const styles = StyleSheet.create({
  container: {
    height: 20,
    justifyContent: "center",
  },
  track: {
    height: 4,
    backgroundColor: "#e5e5e5",
    borderRadius: 2,
  },
  thumb: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
})

export { Slider }
