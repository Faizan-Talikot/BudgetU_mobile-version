import * as React from "react"
import { View, StyleSheet, useColorScheme, Dimensions } from "react-native"
import Svg, { Path, Line, Text, Circle } from "react-native-svg"

const { width: SCREEN_WIDTH } = Dimensions.get("window")

interface ChartConfig {
  [key: string]: {
    label?: React.ReactNode
    color?: string
    theme?: {
      light: string
      dark: string
    }
  }
}

interface ChartProps {
  config: ChartConfig
  data: Array<{ x: number; y: number }>
  style?: any
}

interface Point {
  x: number
  y: number
}

const ChartContainer = React.forwardRef<View, ChartProps>(
  ({ config, data, style }, ref) => {
    const colorScheme = useColorScheme()
    const theme = colorScheme || "light"

    const chartWidth = SCREEN_WIDTH - 40
    const chartHeight = 200
    const padding = 20

    const xMin = Math.min(...data.map(d => d.x))
    const xMax = Math.max(...data.map(d => d.x))
    const yMin = Math.min(...data.map(d => d.y))
    const yMax = Math.max(...data.map(d => d.y))

    const xScale = (x: number) =>
      ((x - xMin) / (xMax - xMin)) * (chartWidth - 2 * padding) + padding

    const yScale = (y: number) =>
      chartHeight - (((y - yMin) / (yMax - yMin)) * (chartHeight - 2 * padding) + padding)

    const points: Point[] = data.map(d => ({
      x: xScale(d.x),
      y: yScale(d.y),
    }))

    const linePath = points
      .map((point, i) => `${i === 0 ? "M" : "L"} ${point.x} ${point.y}`)
      .join(" ")

    return (
      <View ref={ref} style={[styles.container, style]}>
        <Svg width={chartWidth} height={chartHeight}>
          {/* X-axis */}
          <Line
            x1={padding}
            y1={chartHeight - padding}
            x2={chartWidth - padding}
            y2={chartHeight - padding}
            stroke={theme === "dark" ? "#666" : "#e5e5e5"}
            strokeWidth="1"
          />

          {/* Y-axis */}
          <Line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={chartHeight - padding}
            stroke={theme === "dark" ? "#666" : "#e5e5e5"}
            strokeWidth="1"
          />

          {/* Line chart */}
          <Path
            d={linePath}
            fill="none"
            stroke="#000"
            strokeWidth="2"
          />

          {/* Data points */}
          {points.map((point, index) => (
            <Circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#000"
            />
          ))}
        </Svg>
      </View>
    )
  }
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    padding: 20,
  },
})

export { ChartContainer }
