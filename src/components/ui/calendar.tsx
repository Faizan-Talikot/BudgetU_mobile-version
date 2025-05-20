import * as React from "react"
import { View, StyleSheet } from "react-native"
import { Calendar as RNCalendar } from "react-native-calendars"
import type { CalendarProps as RNCalendarProps } from "react-native-calendars"
import { colors } from "../../theme"

interface CalendarProps {
  mode?: "single" | "multiple" | "range"
  selected?: any
  onSelect?: (date: any) => void
  className?: string
  style?: any
  theme?: RNCalendarProps["theme"]
  current?: string
  initialDate?: string
}

function Calendar({
  mode = "single",
  selected,
  onSelect,
  className,
  style,
  theme: customTheme,
  current,
  initialDate,
  ...props
}: CalendarProps) {
  const handleDayPress = (day: any) => {
    if (onSelect) {
      onSelect(day.dateString)
    }
  }

  const defaultTheme = {
    backgroundColor: colors.background,
    calendarBackground: colors.background,
    textSectionTitleColor: colors.textSecondary,
    selectedDayBackgroundColor: colors.primary,
    selectedDayTextColor: colors.background,
    todayTextColor: colors.primary,
    dayTextColor: colors.text,
    textDisabledColor: colors.textSecondary,
    arrowColor: colors.text,
    monthTextColor: colors.text,
    textDayFontWeight: "300" as const,
    textMonthFontWeight: "500" as const,
    textDayHeaderFontWeight: "300" as const,
    textDayFontSize: 16,
    textMonthFontSize: 18,
    textDayHeaderFontSize: 14,
  }

  return (
    <View style={[styles.container, style]}>
      <RNCalendar
        {...props}
        current={current}
        initialDate={initialDate}
        onDayPress={handleDayPress}
        markedDates={
          selected
            ? {
              [selected]: {
                selected: true,
                selectedColor: colors.primary,
              },
            }
            : {}
        }
        theme={customTheme || defaultTheme}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 8,
    overflow: "hidden",
  },
})

export { Calendar }
