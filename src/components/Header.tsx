import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react-native";
import { Input } from "@/components/ui/input";
import { useForm, Controller } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { authApi } from "@/lib/api";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

type HeaderProps = {
  isSignupOpen: boolean;
  setIsSignupOpen: React.Dispatch<React.SetStateAction<boolean>>;
  navigation?: any; // Add proper type based on your navigation setup
};

const Header = ({ isSignupOpen, setIsSignupOpen, navigation }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const navItems = [
    { label: "Features", href: "#features" },
    { label: "How it Works", href: "#how-it-works" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "FAQ", href: "#faq" },
  ];

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await authApi.login(data.email, data.password);
      // Store token and user info
      // Navigate to dashboard
      setIsLoginOpen(false);
      navigation?.navigate('Dashboard');
      toast({
        title: "Login successful",
        description: "Welcome back to BudgetU!",
      });
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      const result = await authApi.register(data);
      // Store token and user info
      // Navigate to dashboard
      setIsSignupOpen(false);
      navigation?.navigate('Dashboard');
      toast({
        title: "Account created",
        description: "Welcome to BudgetU!",
      });
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Signup failed",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderLoginModal = () => (
    <Modal
      visible={isLoginOpen}
      transparent
      animationType="slide"
      onRequestClose={() => setIsLoginOpen(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Log in to your account</Text>
          <Controller
            control={loginForm.control}
            name="email"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View style={styles.formField}>
                <Text style={styles.label}>Email</Text>
                <Input
                  placeholder="you@example.com"
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                {error && <Text style={styles.errorText}>{error.message}</Text>}
              </View>
            )}
          />
          <Controller
            control={loginForm.control}
            name="password"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View style={styles.formField}>
                <Text style={styles.label}>Password</Text>
                <Input
                  placeholder="••••••••"
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry
                />
                {error && <Text style={styles.errorText}>{error.message}</Text>}
              </View>
            )}
          />
          <Button
            onPress={loginForm.handleSubmit(handleLogin)}
            disabled={isLoading}
            style={styles.submitButton}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Logging in..." : "Log in"}
            </Text>
          </Button>
          <TouchableOpacity
            onPress={() => {
              setIsLoginOpen(false);
              setIsSignupOpen(true);
            }}
            style={styles.switchButton}
          >
            <Text style={styles.switchText}>Don't have an account? Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderSignupModal = () => (
    <Modal
      visible={isSignupOpen}
      transparent
      animationType="slide"
      onRequestClose={() => setIsSignupOpen(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Create your account</Text>
          <View style={styles.nameFields}>
            <Controller
              control={signupForm.control}
              name="firstName"
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <View style={[styles.formField, styles.halfWidth]}>
                  <Text style={styles.label}>First Name</Text>
                  <Input
                    placeholder="John"
                    onChangeText={onChange}
                    value={value}
                  />
                  {error && <Text style={styles.errorText}>{error.message}</Text>}
                </View>
              )}
            />
            <Controller
              control={signupForm.control}
              name="lastName"
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <View style={[styles.formField, styles.halfWidth]}>
                  <Text style={styles.label}>Last Name</Text>
                  <Input
                    placeholder="Doe"
                    onChangeText={onChange}
                    value={value}
                  />
                  {error && <Text style={styles.errorText}>{error.message}</Text>}
                </View>
              )}
            />
          </View>
          <Controller
            control={signupForm.control}
            name="email"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View style={styles.formField}>
                <Text style={styles.label}>Email</Text>
                <Input
                  placeholder="you@example.com"
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                {error && <Text style={styles.errorText}>{error.message}</Text>}
              </View>
            )}
          />
          <Controller
            control={signupForm.control}
            name="password"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View style={styles.formField}>
                <Text style={styles.label}>Password</Text>
                <Input
                  placeholder="••••••••"
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry
                />
                {error && <Text style={styles.errorText}>{error.message}</Text>}
              </View>
            )}
          />
          <Button
            onPress={signupForm.handleSubmit(handleSignup)}
            disabled={isLoading}
            style={styles.submitButton}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Creating account..." : "Create account"}
            </Text>
          </Button>
          <TouchableOpacity
            onPress={() => {
              setIsSignupOpen(false);
              setIsLoginOpen(true);
            }}
            style={styles.switchButton}
          >
            <Text style={styles.switchText}>Already have an account? Log in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.header}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.logo}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoText}>B</Text>
          </View>
          <Text style={styles.logoTitle}>BudgetU</Text>
        </TouchableOpacity>

        {/* Desktop menu */}
        <View style={styles.desktopNav}>
          {navItems.map((item) => (
            <TouchableOpacity key={item.label} style={styles.navItem}>
              <Text style={styles.navText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.buttons}>
          <Button
            onPress={() => setIsLoginOpen(true)}
            variant="outline"
            style={styles.loginButton}
          >
            <Text>Log In</Text>
          </Button>
          <Button
            onPress={() => setIsSignupOpen(true)}
            style={styles.signupButton}
          >
            <Text style={styles.signupButtonText}>Sign Up Free</Text>
          </Button>
        </View>

        {/* Mobile menu button */}
        <TouchableOpacity
          style={styles.mobileMenuButton}
          onPress={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}
        </TouchableOpacity>

        {/* Mobile menu */}
        <Modal
          visible={mobileMenuOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setMobileMenuOpen(false)}
        >
          <View style={styles.mobileMenu}>
            {navItems.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.mobileMenuItem}
                onPress={() => setMobileMenuOpen(false)}
              >
                <Text style={styles.mobileMenuText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.mobileButtons}>
              <Button
                onPress={() => {
                  setMobileMenuOpen(false);
                  setIsLoginOpen(true);
                }}
                variant="outline"
                style={styles.mobileButton}
              >
                <Text>Log In</Text>
              </Button>
              <Button
                onPress={() => {
                  setMobileMenuOpen(false);
                  setIsSignupOpen(true);
                }}
                style={styles.mobileButton}
              >
                <Text style={styles.signupButtonText}>Sign Up Free</Text>
              </Button>
            </View>
          </View>
        </Modal>

        {renderLoginModal()}
        {renderSignupModal()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 64,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    height: 32,
    width: 32,
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  logoTitle: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  desktopNav: {
    flexDirection: 'row',
    gap: 24,
    display: 'none', // Show only on larger screens
  },
  navItem: {
    padding: 8,
  },
  navText: {
    color: '#666',
  },
  buttons: {
    flexDirection: 'row',
    gap: 16,
    display: 'none', // Show only on larger screens
  },
  loginButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  signupButton: {
    backgroundColor: '#8B5CF6',
  },
  signupButtonText: {
    color: '#fff',
  },
  mobileMenuButton: {
    padding: 8,
  },
  mobileMenu: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 64,
  },
  mobileMenuItem: {
    padding: 16,
  },
  mobileMenuText: {
    fontSize: 18,
    fontWeight: '500',
  },
  mobileButtons: {
    padding: 16,
    gap: 8,
  },
  mobileButton: {
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  formField: {
    marginBottom: 16,
  },
  nameFields: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  switchButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  switchText: {
    color: '#8B5CF6',
    fontSize: 14,
  },
});

export default Header;
