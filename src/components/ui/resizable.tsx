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
import { Feather } from "@expo/vector-icons"

interface ResizableProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  minWidth?: number
  maxWidth?: number
  defaultWidth?: number
  onWidthChange?: (width: number) => void
}

interface ResizablePanelProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  defaultSize?: number
  minSize?: number
  maxSize?: number
}

interface ResizableHandleProps {
  style?: StyleProp<ViewStyle>
}

const ResizableContext = React.createContext<{
  width: number
  setWidth: (width: number) => void
}>({
  width: 0,
  setWidth: () => { },
})

const Resizable = React.forwardRef<View, ResizableProps>(
  ({ children, style, minWidth = 100, maxWidth = 500, defaultWidth = 200, onWidthChange }, ref) => {
    const [width, setWidth] = React.useState(defaultWidth)

    React.useEffect(() => {
      onWidthChange?.(width)
    }, [width, onWidthChange])

    return (
      <ResizableContext.Provider value={{ width, setWidth }}>
        <View ref={ref} style={[styles.container, style]}>
          {children}
        </View>
      </ResizableContext.Provider>
    )
  }
)

const ResizablePanel = React.forwardRef<View, ResizablePanelProps>(
  ({ children, style, defaultSize = 100, minSize = 50, maxSize = 500 }, ref) => {
    const { width } = React.useContext(ResizableContext)

    return (
      <View ref={ref} style={[{ width }, style]}>
        {children}
      </View>
    )
  }
)

const ResizableHandle = React.forwardRef<View, ResizableHandleProps>(
  ({ style }, ref) => {
    const { width, setWidth } = React.useContext(ResizableContext)
    const panResponder = React.useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gestureState: PanResponderGestureState) => {
          const newWidth = width + gestureState.dx
          setWidth(Math.max(100, Math.min(500, newWidth)))
        },
      })
    ).current

    return (
      <View
        ref={ref}
        style={[styles.handle, style]}
        {...panResponder.panHandlers}
      >
        <Feather name="menu" size={16} color="#666" />
      </View>
    )
  }
)

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
  },
  handle: {
    width: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f4f5",
  },
})

export { Resizable, ResizablePanel, ResizableHandle }
