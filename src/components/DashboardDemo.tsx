
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const DashboardDemo = () => {
  // Sample data for the charts
  const spendingData = [
    { name: "Housing", value: 500, color: "#9b87f5" },
    { name: "Food", value: 300, color: "#8B5CF6" },
    { name: "Entertainment", value: 150, color: "#F97316" },
    { name: "Transport", value: 100, color: "#D6BCFA" },
    { name: "Other", value: 100, color: "#D3E4FD" },
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

  return (
    <section className="py-20 bg-secondary/50">
      <div className="budgetu-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Your Financial Dashboard, <span className="text-gradient">Simplified</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Get a clear view of your finances with intuitive visualizations and actionable insights.
          </p>
        </div>

        <div className="bg-background p-4 md:p-8 rounded-3xl border shadow-lg max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Safe-to-Spend Card */}
            <Card className="col-span-full md:col-span-5 bg-gradient-to-br from-budgetu-purple to-budgetu-vivid-purple text-white">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Safe to Spend</h3>
                <div className="text-5xl font-bold mb-2">${safeToSpendDaily}</div>
                <p className="text-sm opacity-80">per day for the next {daysLeft} days</p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Monthly Budget</span>
                    <span>${totalBudget}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Spent So Far</span>
                    <span>${totalSpent}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Remaining</span>
                    <span>${totalBudget - totalSpent}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Spending Breakdown Chart */}
            <Card className="col-span-full md:col-span-7">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Spending Breakdown</h3>
                <div className="flex items-center justify-between">
                  <div className="w-32 h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={spendingData}
                          innerRadius={25}
                          outerRadius={50}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {spendingData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {spendingData.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm">
                          {item.name}: ${item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Budgets */}
            <Card className="col-span-full">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Category Budgets</h3>
                <div className="space-y-4">
                  {categoryBudgets.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{item.category}</span>
                        <span className="text-sm text-muted-foreground">
                          ${item.spent} / ${item.total}
                        </span>
                      </div>
                      <Progress 
                        value={item.percentage} 
                        className={`h-2 ${
                          item.percentage > 90 ? "bg-red-200" : 
                          item.percentage > 75 ? "bg-amber-200" : 
                          "bg-green-200"
                        }`} 
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardDemo;
