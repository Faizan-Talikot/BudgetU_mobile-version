import * as React from "react"
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native"

interface TableProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

interface TableHeaderProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

interface TableBodyProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

interface TableRowProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

interface TableHeadProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

interface TableCellProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

const Table = React.forwardRef<View, TableProps>(
  ({ children, style }, ref) => (
    <ScrollView horizontal>
      <View ref={ref} style={[styles.table, style]}>
        {children}
      </View>
    </ScrollView>
  )
)

const TableHeader = React.forwardRef<View, TableHeaderProps>(
  ({ children, style }, ref) => (
    <View ref={ref} style={[styles.header, style]}>
      {children}
    </View>
  )
)

const TableBody = React.forwardRef<View, TableBodyProps>(
  ({ children, style }, ref) => (
    <View ref={ref} style={[styles.body, style]}>
      {children}
    </View>
  )
)

const TableRow = React.forwardRef<View, TableRowProps>(
  ({ children, style }, ref) => (
    <View ref={ref} style={[styles.row, style]}>
      {children}
    </View>
  )
)

const TableHead = React.forwardRef<View, TableHeadProps>(
  ({ children, style }, ref) => (
    <View ref={ref} style={[styles.head, style]}>
      <Text style={styles.headText}>{children}</Text>
    </View>
  )
)

const TableCell = React.forwardRef<View, TableCellProps>(
  ({ children, style }, ref) => (
    <View ref={ref} style={[styles.cell, style]}>
      <Text style={styles.cellText}>{children}</Text>
    </View>
  )
)

const styles = StyleSheet.create({
  table: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 8,
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  body: {},
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  head: {
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRightWidth: 1,
    borderRightColor: "#e5e5e5",
  },
  headText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  cell: {
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: "#e5e5e5",
  },
  cellText: {
    fontSize: 14,
    color: "#374151",
  },
})

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
}
