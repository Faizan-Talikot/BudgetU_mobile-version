import * as React from "react"
import {
  ScrollView,
  StyleSheet,
  ViewStyle,
  StyleProp,
  View,
} from "react-native"

interface ScrollAreaProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  contentContainerStyle?: StyleProp<ViewStyle>
}

const ScrollArea = React.forwardRef<ScrollView, ScrollAreaProps>(
  ({ children, style, contentContainerStyle }, ref) => {
    return (
      <View style={[styles.container, style]}>
        <ScrollView
          ref={ref}
          style={styles.scrollView}
          contentContainerStyle={[styles.content, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          bounces={false}
        >
          {children}
        </ScrollView>
      </View>
    )
  }
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
})

export { ScrollArea }
