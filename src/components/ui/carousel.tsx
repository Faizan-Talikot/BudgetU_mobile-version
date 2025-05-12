import * as React from "react"
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ViewStyle,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native"
import { Feather } from "@expo/vector-icons"

const { width: SCREEN_WIDTH } = Dimensions.get("window")

interface CarouselProps {
  children: React.ReactNode
  style?: ViewStyle
}

interface CarouselContextType {
  scrollRef: React.MutableRefObject<ScrollView | null>
  currentIndex: number
  setCurrentIndex: (index: number) => void
  canScrollPrev: boolean
  canScrollNext: boolean
  scrollPrev: () => void
  scrollNext: () => void
}

const CarouselContext = React.createContext<CarouselContextType | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }
  return context
}

const Carousel = React.forwardRef<View, CarouselProps>(
  ({ children, style }, ref) => {
    const scrollRef = React.useRef<ScrollView | null>(null)
    const [currentIndex, setCurrentIndex] = React.useState(0)
    const [contentWidth, setContentWidth] = React.useState(0)

    const canScrollPrev = currentIndex > 0
    const canScrollNext = currentIndex < React.Children.count(children) - 1

    const scrollPrev = React.useCallback(() => {
      if (canScrollPrev && scrollRef.current) {
        const newIndex = currentIndex - 1
        scrollRef.current.scrollTo({
          x: newIndex * SCREEN_WIDTH,
          animated: true,
        })
        setCurrentIndex(newIndex)
      }
    }, [canScrollPrev, currentIndex])

    const scrollNext = React.useCallback(() => {
      if (canScrollNext && scrollRef.current) {
        const newIndex = currentIndex + 1
        scrollRef.current.scrollTo({
          x: newIndex * SCREEN_WIDTH,
          animated: true,
        })
        setCurrentIndex(newIndex)
      }
    }, [canScrollNext, currentIndex])

    const handleScroll = React.useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetX = event.nativeEvent.contentOffset.x
        const index = Math.round(offsetX / SCREEN_WIDTH)
        if (index !== currentIndex) {
          setCurrentIndex(index)
        }
      },
      [currentIndex]
    )

    return (
      <CarouselContext.Provider
        value={{
          scrollRef,
          currentIndex,
          setCurrentIndex,
          canScrollPrev,
          canScrollNext,
          scrollPrev,
          scrollNext,
        }}
      >
        <View ref={ref} style={[styles.container, style]}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onContentSizeChange={(width) => setContentWidth(width)}
          >
            {children}
          </ScrollView>
        </View>
      </CarouselContext.Provider>
    )
  }
)

const CarouselContent = React.forwardRef<View, CarouselProps>(
  ({ children, style }, ref) => {
    return (
      <View style={[styles.content, style]} ref={ref}>
        {children}
      </View>
    )
  }
)

const CarouselItem = React.forwardRef<View, CarouselProps>(
  ({ children, style }, ref) => {
    return (
      <View
        ref={ref}
        style={[styles.item, { width: SCREEN_WIDTH }, style]}
      >
        {children}
      </View>
    )
  }
)

const CarouselPrevious = React.forwardRef<
  TouchableOpacity,
  { style?: ViewStyle }
>(({ style }, ref) => {
  const { scrollPrev, canScrollPrev } = useCarousel()

  return (
    <TouchableOpacity
      ref={ref}
      style={[styles.navButton, styles.prevButton, style]}
      onPress={scrollPrev}
      disabled={!canScrollPrev}
    >
      <Feather
        name="chevron-left"
        size={24}
        color={canScrollPrev ? "#000" : "#ccc"}
      />
    </TouchableOpacity>
  )
})

const CarouselNext = React.forwardRef<TouchableOpacity, { style?: ViewStyle }>(
  ({ style }, ref) => {
    const { scrollNext, canScrollNext } = useCarousel()

    return (
      <TouchableOpacity
        ref={ref}
        style={[styles.navButton, styles.nextButton, style]}
        onPress={scrollNext}
        disabled={!canScrollNext}
      >
        <Feather
          name="chevron-right"
          size={24}
          color={canScrollNext ? "#000" : "#ccc"}
        />
      </TouchableOpacity>
    )
  }
)

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  content: {
    flexDirection: "row",
  },
  item: {
    flex: 1,
  },
  navButton: {
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  prevButton: {
    left: 10,
  },
  nextButton: {
    right: 10,
  },
})

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}
