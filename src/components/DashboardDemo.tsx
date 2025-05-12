import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PieChart } from "react-native-chart-kit";

const DashboardDemo = () => {
  // Sample data for the charts
  const spendingData = [
    { name: "Housing", value: 500, color: "#9b87f5", legendFontColor: "#7F7F7F" },
    { name: "Food", value: 300, color: "#8B5CF6", legendFontColor: "#7F7F7F" },
    { name: "Entertainment", value: 150, color: "#F97316", legendFontColor: "#7F7F7F" },
    { name: "Transport", value: 100, color: "#D6BCFA", legendFontColor: "#7F7F7F" },
    { name: "Other", value: 100, color: "#D3E4FD", legendFontColor: "#7F7F7F" },
  ];

  const categoryBudgets = [
    { category: "Housing", spent: 400, total: 500, percentage: 80 },
    { category: "Groceries", spent: 120, total: 200, percentage: 60 },
    { category: "Dining Out", spent: 85, total: 100, percentage: 85 },
    { category: "Transportation", spent: 75, total: 120, percentage: 63 },
    { category: "Entertainment", spent: 65, total: 80, percentage: 81 },
  ];

  // Safe to spend calculation
  const totalBudget = 1000;
  const totalSpent = 745;
  const daysInMonth = 30;
  const currentDay = 21;
  const daysLeft = daysInMonth - currentDay;

  const safeToSpendDaily = Math.round((totalBudget - totalSpent) / daysLeft);

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  return (
    <View style={styles.section}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            Your Financial Dashboard, <Text style={styles.gradient}>Simplified</Text>
          </Text>
          <Text style={styles.subtitle}>
            Get a clear view of your finances with intuitive visualizations and actionable insights.
          </Text>
        </View>

        <View style={styles.dashboard}>
          <View style={styles.grid}>
            {/* Safe-to-Spend Card */}
            <Card style={styles.safeToSpendCard}>
              <CardContent style={styles.cardContent}>
                <Text style={styles.cardTitle}>Safe to Spend</Text>
                <Text style={styles.amount}>${safeToSpendDaily}</Text>
                <Text style={styles.period}>per day for the next {daysLeft} days</Text>
                <View style={styles.stats}>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Monthly Budget</Text>
                    <Text style={styles.statValue}>${totalBudget}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Spent So Far</Text>
                    <Text style={styles.statValue}>${totalSpent}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={[styles.statLabel, styles.bold]}>Remaining</Text>
                    <Text style={[styles.statValue, styles.bold]}>${totalBudget - totalSpent}</Text>
                  </View>
                </View>
              </CardContent>
            </Card>

            {/* Spending Breakdown Chart */}
            <Card style={styles.chartCard}>
              <CardContent style={styles.cardContent}>
                <Text style={styles.cardTitle}>Spending Breakdown</Text>
                <View style={styles.chartContainer}>
                  <View style={styles.pieChart}>
                    <PieChart
                      data={spendingData.map(item => ({
                        name: item.name,
                        population: item.value,
                        color: item.color,
                        legendFontColor: item.legendFontColor,
                        legendFontSize: 12,
                      }))}
                      width={Dimensions.get("window").width - 32}
                      height={220}
                      chartConfig={chartConfig}
                      accessor="population"
                      backgroundColor="transparent"
                      paddingLeft="0"
                      absolute
                    />
                  </View>
                </View>
              </CardContent>
            </Card>

            {/* Category Budgets */}
            <Card style={styles.budgetsCard}>
              <CardContent style={styles.cardContent}>
                <Text style={styles.cardTitle}>Category Budgets</Text>
                <View style={styles.budgetsList}>
                  {categoryBudgets.map((item, index) => (
                    <View key={index} style={styles.budgetItem}>
                      <View style={styles.budgetHeader}>
                        <Text style={styles.budgetCategory}>{item.category}</Text>
                        <Text style={styles.budgetAmount}>
                          ${item.spent} / ${item.total}
                        </Text>
                      </View>
                      <Progress
                        value={item.percentage}
                        style={[
                          styles.budgetProgress,
                          item.percentage > 90 ? styles.redProgress :
                            item.percentage > 75 ? styles.amberProgress :
                              styles.greenProgress
                        ]}
                      />
                    </View>
                  ))}
                </View>
              </CardContent>
            </Card>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingVertical: 80,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  container: {
    paddingHorizontal: 16,
  },
  header: {
    maxWidth: 768,
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: 64,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  gradient: {
    color: '#8B5CF6',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  dashboard: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    maxWidth: 1024,
    alignSelf: 'center',
  },
  grid: {
    gap: 24,
  },
  safeToSpendCard: {
    backgroundColor: '#8B5CF6',
  },
  chartCard: {
    flex: 1,
  },
  budgetsCard: {
    width: '100%',
  },
  cardContent: {
    padding: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 16,
    color: '#fff',
  },
  amount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  period: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  stats: {
    marginTop: 16,
    gap: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statValue: {
    fontSize: 14,
    color: '#fff',
  },
  bold: {
    fontWeight: '600',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pieChart: {
    width: 128,
    height: 128,
  },
  legend: {
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
  },
  budgetsList: {
    gap: 16,
  },
  budgetItem: {
    gap: 4,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  budgetCategory: {
    fontSize: 14,
    fontWeight: '500',
  },
  budgetAmount: {
    fontSize: 14,
    color: '#666',
  },
  budgetProgress: {
    height: 8,
  },
  redProgress: {
    backgroundColor: '#fecaca',
  },
  amberProgress: {
    backgroundColor: '#fde68a',
  },
  greenProgress: {
    backgroundColor: '#bbf7d0',
  },
});

export default DashboardDemo;
