import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react-native";
import { View, Text, StyleSheet } from 'react-native';

type CallToActionProps = {
  openSignupDialog: () => void;
};

const CallToAction = ({ openSignupDialog }: CallToActionProps) => {
  return (
    <View style={styles.section}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>
              Ready to Take Control of Your Student Finances?
            </Text>
            <Text style={styles.description}>
              Join thousands of students who never run out of money before the month ends.
              Start managing your finances the smart way.
            </Text>
            <Button
              onPress={openSignupDialog}
              style={styles.button}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>Get Started For Free</Text>
                <ArrowRight size={16} color="#000" />
              </View>
            </Button>
            <Text style={styles.disclaimer}>
              No credit card required. Cancel anytime.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingVertical: 96,
  },
  container: {
    paddingHorizontal: 16,
  },
  content: {
    backgroundColor: '#8B5CF6',
    borderRadius: 24,
    padding: 48,
  },
  textContainer: {
    maxWidth: 768,
    alignSelf: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '500',
  },
  disclaimer: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});

export default CallToAction;
