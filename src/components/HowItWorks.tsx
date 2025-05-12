import { View, Text, StyleSheet } from "react-native";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react-native";

type HowItWorksProps = {
  openSignupDialog: () => void;
};

const HowItWorks = ({ openSignupDialog }: HowItWorksProps) => {
  const steps = [
    {
      number: "01",
      title: "Connect Your Bank Accounts",
      description: "Securely link your accounts to automatically import and categorize transactions."
    },
    {
      number: "02",
      title: "Set Up Your Monthly Budget",
      description: "Choose a template or create a custom budget with categories that match your student lifestyle."
    },
    {
      number: "03",
      title: "Track Your Spending",
      description: "View transactions automatically categorized and see your spending patterns in real-time."
    },
    {
      number: "04",
      title: "Make Smarter Spending Decisions",
      description: "Use the Safe-to-Spend calculator to know if you can afford that coffee or night out."
    }
  ];

  return (
    <View style={styles.section}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            How <Text style={styles.gradient}>BudgetU</Text> Works
          </Text>
          <Text style={styles.subtitle}>
            Getting started is simple - you'll be managing your money like a pro in minutes.
          </Text>
        </View>

        <View style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <View key={index} style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{step.number}</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            onPress={openSignupDialog}
            style={styles.button}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonText}>Get Started Now</Text>
              <ArrowRight size={16} color="#fff" style={styles.buttonIcon} />
            </View>
          </Button>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingVertical: 80,
  },
  container: {
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 64,
    maxWidth: 768,
    alignSelf: 'center',
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
  stepsContainer: {
    gap: 24,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    gap: 24,
  },
  stepNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#8B5CF6',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
  },
  buttonContainer: {
    marginTop: 48,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#F97316',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginLeft: 8,
  },
});

export default HowItWorks;
