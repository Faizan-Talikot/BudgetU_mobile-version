import * as React from "react"
import { View, StyleSheet } from "react-native"
import { Calendar as RNCalendar } from "react-native-calendars"
import { Feather } from "@expo/vector-icons"

interface CalendarProps {
  mode?: "single" | "multiple" | "range"
  selected?: any
  onSelect?: (date: any) => void
  className?: string
  style?: any
}

function Calendar({
  mode = "single",
  selected,
  onSelect,
  className,
  style,
  ...props
}: CalendarProps) {
  const handleDayPress = (day: any) => {
    if (onSelect) {
      onSelect(day.dateString)
    }
  }

  return (
    <View style={[styles.container, style]}>
      <RNCalendar
        {...props}
        onDayPress={handleDayPress}
        markedDates={
          selected
            ? {
              [selected]: {
                selected: true,
                selectedColor: "#000",
              },
            }
            : {}
        }
        theme={{
          backgroundColor: "#ffffff",
          calendarBackground: "#ffffff",
          textSectionTitleColor: "#666",
          selectedDayBackgroundColor: "#000",
          selectedDayTextColor: "#ffffff",
          todayTextColor: "#000",
          dayTextColor: "#2d4150",
          textDisabledColor: "#d9e1e8",
          arrowColor: "#000",
          monthTextColor: "#000",
          textDayFontWeight: "300",
          textMonthFontWeight: "bold",
          textDayHeaderFontWeight: "300",
          textDayFontSize: 16,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 14,
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    overflow: "hidden",
  },
})

export { Calendar }
