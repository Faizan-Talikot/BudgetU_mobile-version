import { View, Text, StyleSheet } from "react-native";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "Is BudgetU free to use?",
      answer:
        "Yes! BudgetU offers a free plan with core budgeting and expense tracking features. Premium features like advanced insights and financial coaching are available through a subscription plan with special student pricing."
    },
    {
      question: "Is it safe to connect my bank account?",
      answer:
        "Absolutely. BudgetU uses bank-level encryption and security protocols. We connect to your accounts using trusted financial API providers like Plaid, which means we never store your login credentials."
    },
    {
      question: "Do I need a bank account to use BudgetU?",
      answer:
        "While connecting a bank account provides the best experience with automatic transaction imports, you can still use BudgetU manually by entering transactions yourself and tracking your cash spending."
    },
    {
      question: "Can I use BudgetU if I share expenses with roommates?",
      answer:
        "Yes! BudgetU allows you to mark transactions as split expenses and track your individual portion. You can also create shared expense categories to monitor group spending on utilities and other shared bills."
    },
    {
      question: "How does the Safe-to-Spend feature work?",
      answer:
        "The Safe-to-Spend calculator takes your remaining budget for the month and divides it by the number of days left, giving you a daily spending target that helps you avoid running out of money before the month ends."
    },
    {
      question: "Can I customize budget categories for my specific needs?",
      answer:
        "Definitely! While BudgetU provides student-specific templates, you can fully customize your budget categories to match your unique situation, whether you live on-campus, off-campus, or have specific expenses like textbooks or club dues."
    }
  ];

  return (
    <View style={styles.section}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            Frequently Asked <Text style={styles.gradient}>Questions</Text>
          </Text>
          <Text style={styles.subtitle}>
            Everything you need to know about using BudgetU for your student finances.
          </Text>
        </View>

        <View style={styles.content}>
          <Accordion type="single">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
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
  content: {
    maxWidth: 768,
    alignSelf: 'center',
    width: '100%',
  },
});

export default FAQ;
