import * as React from "react"
import { View, StyleSheet } from "react-native"
import { Calendar as RNCalendar } from "react-native-calendars"
import type { CalendarProps as RNCalendarProps } from "react-native-calendars"
import { colors } from "../../theme"

export interface CalendarProps {
  mode?: "single" | "multiple" | "range"
  selected?: string
  onSelect?: (date: string) => void
  className?: string
  style?: any
  theme?: RNCalendarProps["theme"]
  current?: string
  initialDate?: string
  markedDates?: Record<string, {
    selected?: boolean;
    marked?: boolean;
    dotColor?: string;
    disabled?: boolean;
    disableTouchEvent?: boolean;
    customStyles?: {
      container?: {
        backgroundColor?: string;
      };
      text?: {
        color?: string;
      };
    };
  }>
  markingType?: "dot" | "multi-dot" | "period" | "multi-period" | "custom"
  minDate?: string
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
  markedDates,
  markingType = "dot",
  minDate,
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
    dotColor: colors.primary,
    selectedDotColor: colors.background,
  }

  return (
    <View style={[styles.container, style]}>
      <RNCalendar
        {...props}
        current={current}
        initialDate={initialDate}
        onDayPress={handleDayPress}
        markedDates={markedDates || (selected ? {
          [selected]: {
            selected: true,
            selectedColor: colors.primary,
          },
        } : {})}
        markingType={markingType}
        theme={customTheme || defaultTheme}
        minDate={minDate}
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
