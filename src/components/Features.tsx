
import { 
  BarChart3, 
  Calendar, 
  Coins, 
  CreditCard, 
  LineChart, 
  PiggyBank, 
  Receipt, 
  Wallet 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Features = () => {
  const featuresList = [
    {
      icon: <Calendar className="h-10 w-10 text-budgetu-purple" />,
      title: "Smart Budget Creation",
      description: "Create personalized monthly budgets with category allocation based on your student lifestyle."
    },
    {
      icon: <CreditCard className="h-10 w-10 text-budgetu-purple" />,
      title: "Bank Integration",
      description: "Securely connect your bank accounts for automatic transaction import and categorization."
    },
    {
      icon: <Wallet className="h-10 w-10 text-budgetu-purple" />,
      title: "Safe-to-Spend Calculator",
      description: "Know exactly how much you can spend today while staying on budget for the month."
    },
    {
      icon: <Receipt className="h-10 w-10 text-budgetu-purple" />,
      title: "Expense Tracking",
      description: "Automatically categorize transactions and manually add cash expenses with receipt scanning."
    },
    {
      icon: <LineChart className="h-10 w-10 text-budgetu-purple" />,
      title: "Spending Insights",
      description: "Visualize your spending patterns and identify opportunities to save money."
    },
    {
      icon: <Coins className="h-10 w-10 text-budgetu-purple" />,
      title: "Purchase Verification",
      description: "Check if a potential purchase fits within your budget before spending."
    }
  ];

  return (
    <section className="py-20 bg-secondary/50" id="features">
      <div className="budgetu-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Features Designed for <span className="text-gradient">Student Life</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            BudgetU helps you manage your finances like a pro, even if you're just starting out.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresList.map((feature, index) => (
            <Card key={index} className="card-hover">
              <CardHeader>
                <div className="mb-4">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
