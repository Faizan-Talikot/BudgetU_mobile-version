import { View, Text, StyleSheet } from "react-native";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Quote } from "lucide-react-native";

const Testimonials = () => {
  const testimonials = [
    {
      quote: "BudgetU helped me stop overdrafting my account! Now I always know how much I can safely spend.",
      name: "Jamie C.",
      role: "Sophomore, NYU",
      avatar: "JC"
    },
    {
      quote: "The category breakdown made me realize I was spending way too much on takeout. Saved over $200 last month!",
      name: "Miguel R.",
      role: "Junior, UC Berkeley",
      avatar: "MR"
    },
    {
      quote: "As an RA with a meal plan, BudgetU helps me manage my stipend and save for grad school applications.",
      name: "Taylor W.",
      role: "Senior, UMich",
      avatar: "TW"
    }
  ];

  return (
    <View style={styles.section}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            What <Text style={styles.gradient}>Students Say</Text> About BudgetU
          </Text>
          <Text style={styles.subtitle}>
            Join thousands of students who've transformed their financial habits.
          </Text>
        </View>

        <View style={styles.testimonialGrid}>
          {testimonials.map((testimonial, index) => (
            <Card key={index} style={styles.card}>
              <CardContent style={styles.cardContent}>
                <Quote size={32} color="#8B5CF6" style={styles.quoteIcon} />
                <Text style={styles.quote}>{testimonial.quote}</Text>
                <View style={styles.author}>
                  <Avatar style={styles.avatar}>
                    <AvatarFallback style={styles.avatarFallback}>
                      <Text style={styles.avatarText}>{testimonial.avatar}</Text>
                    </AvatarFallback>
                  </Avatar>
                  <View style={styles.authorInfo}>
                    <Text style={styles.authorName}>{testimonial.name}</Text>
                    <Text style={styles.authorRole}>{testimonial.role}</Text>
                  </View>
                </View>
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
  testimonialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  card: {
    flex: 1,
    minWidth: 300,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  cardContent: {
    padding: 24,
  },
  quoteIcon: {
    opacity: 0.4,
    marginBottom: 16,
  },
  quote: {
    fontSize: 18,
    marginBottom: 24,
  },
  author: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
  },
  avatarFallback: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '500',
  },
  authorInfo: {
    gap: 4,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '500',
  },
  authorRole: {
    fontSize: 14,
    color: '#666',
  },
});

export default Testimonials;
