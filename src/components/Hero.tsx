import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react-native";

type HeroProps = {
  openSignupDialog: () => void;
};

const Hero = ({ openSignupDialog }: HeroProps) => {
  const handleHowItWorks = () => {
    // In React Native, we'll handle this differently
    // You might want to use scrollTo with a ref or navigation
  };

  return (
    <View style={styles.section}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.textContent}>
            <Text style={styles.title}>
              Never Run Out of Money{'\n'}
              <Text style={styles.gradient}>Before Month-End</Text> Again
            </Text>
            <Text style={styles.subtitle}>
              BudgetU helps college students take control of their finances with smart budgeting,
              expense tracking, and real-time spending guidance.
            </Text>
            <View style={styles.buttonContainer}>
              <Button
                onPress={openSignupDialog}
                style={styles.primaryButton}
              >
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>Start Budgeting</Text>
                  <ArrowRight size={16} color="#fff" style={styles.buttonIcon} />
                </View>
              </Button>
              <Button
                variant="outline"
                onPress={handleHowItWorks}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>See How It Works</Text>
              </Button>
            </View>
            <Text style={styles.disclaimer}>
              No credit card required. Free plan available.
            </Text>
          </View>
          <View style={styles.imageContainer}>
            <View style={styles.gradientBackground}>
              <Image
                source={{ uri: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&q=80&w=800&ixlib=rb-4.0.3" }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
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
  content: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 48,
  },
  textContent: {
    alignItems: 'center',
    maxWidth: 768,
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
    marginBottom: 32,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  primaryButton: {
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
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  secondaryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 14,
    color: '#666',
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  gradientBackground: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 24,
    padding: 32,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 400,
    borderRadius: 12,
  },
});

export default Hero;
