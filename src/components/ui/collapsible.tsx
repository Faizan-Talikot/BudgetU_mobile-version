import * as React from "react"
import {
    View,
    Animated,
    LayoutChangeEvent,
    StyleSheet,
    ViewStyle,
    StyleProp,
} from "react-native"

interface CollapsibleProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    children: React.ReactNode
    style?: StyleProp<ViewStyle>
}

const Collapsible = React.forwardRef<View, CollapsibleProps>(
    ({ open = false, children, style }, ref) => {
        const [height] = React.useState(new Animated.Value(0))
        const [contentHeight, setContentHeight] = React.useState(0)

        React.useEffect(() => {
            Animated.timing(height, {
                toValue: open ? contentHeight : 0,
                duration: 200,
                useNativeDriver: false,
            }).start()
        }, [open, contentHeight])

        const handleLayout = (event: LayoutChangeEvent) => {
            const { height: layoutHeight } = event.nativeEvent.layout
            setContentHeight(layoutHeight)
        }

        return (
            <Animated.View
                style={[
                    styles.container,
                    {
                        height: height,
                        opacity: height.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 1],
                        }),
                    },
                    style,
                ]}
            >
                <View ref={ref} onLayout={handleLayout} style={styles.content}>
                    {children}
                </View>
            </Animated.View>
        )
    }
)

const styles = StyleSheet.create({
    container: {
        overflow: "hidden",
    },
    content: {
        position: "absolute",
        width: "100%",
    },
})

export { Collapsible }
