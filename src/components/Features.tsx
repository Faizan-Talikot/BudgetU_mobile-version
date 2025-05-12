import { View, Text, StyleSheet } from "react-native";
import {
  Calendar,
  CreditCard,
  Wallet,
  Receipt,
  LineChart,
  Coins,
} from "lucide-react-native";
import { Card, CardContent } from "@/components/ui/card";

const Features = () => {
  const featuresList = [
    {
      icon: <Calendar size={40} color="#8B5CF6" />,
      title: "Smart Budget Creation",
      description: "Create personalized monthly budgets with category allocation based on your student lifestyle."
    },
    {
      icon: <CreditCard size={40} color="#8B5CF6" />,
      title: "Bank Integration",
      description: "Securely connect your bank accounts for automatic transaction import and categorization."
    },
    {
      icon: <Wallet size={40} color="#8B5CF6" />,
      title: "Safe-to-Spend Calculator",
      description: "Know exactly how much you can spend today while staying on budget for the month."
    },
    {
      icon: <Receipt size={40} color="#8B5CF6" />,
      title: "Expense Tracking",
      description: "Automatically categorize transactions and manually add cash expenses with receipt scanning."
    },
    {
      icon: <LineChart size={40} color="#8B5CF6" />,
      title: "Spending Insights",
      description: "Visualize your spending patterns and identify opportunities to save money."
    },
    {
      icon: <Coins size={40} color="#8B5CF6" />,
      title: "Purchase Verification",
      description: "Check if a potential purchase fits within your budget before spending."
    }
  ];

  return (
    <View style={styles.section}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            Features Designed for <Text style={styles.gradient}>Student Life</Text>
          </Text>
          <Text style={styles.subtitle}>
            BudgetU helps you manage your finances like a pro, even if you're just starting out.
          </Text>
        </View>

        <View style={styles.grid}>
          {featuresList.map((feature, index) => (
            <Card key={index} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>{feature.icon}</View>
                <Text style={styles.cardTitle}>{feature.title}</Text>
              </View>
              <CardContent style={styles.cardContent}>
                <Text style={styles.description}>
                  {feature.description}
                </Text>
              </CardContent>
            </Card>
          ))}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 24,
  },
  iconContainer: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
});

export default Features;
