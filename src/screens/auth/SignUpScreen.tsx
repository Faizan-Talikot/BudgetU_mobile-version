import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Dimensions,
    Image,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import { Loading } from '../../components/Loading';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const THEME = {
    primary: '#1B3A4B',
    secondary: '#3B82F6',
    accent: '#60A5FA',
    background: '#F8FAFC',
    white: '#FFFFFF',
    text: '#1B3A4B',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    error: '#EF4444',
};

const SignUpScreen = () => {
    const navigation = useNavigation();
    const { signUp } = useAuth();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const validateForm = () => {
        let isValid = true;
        const newErrors = {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
        };

        // First Name validation
        if (!firstName.trim()) {
            newErrors.firstName = 'First name is required';
            isValid = false;
        }

        // Last Name validation
        if (!lastName.trim()) {
            newErrors.lastName = 'Last name is required';
            isValid = false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!emailRegex.test(email)) {
            newErrors.email = 'Invalid email format';
            isValid = false;
        }

        // Password validation
        if (!password) {
            newErrors.password = 'Password is required';
            isValid = false;
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
            isValid = false;
        }

        // Confirm password validation
        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSignUp = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);
            console.log('Attempting to sign up with:', { email, firstName, lastName });
            await signUp(email, password, firstName, lastName);
            Alert.alert(
                'Success',
                'Account created successfully!',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.error('SignUp Screen Error:', error);
            const errorMessage = error instanceof Error 
                ? error.message 
                : 'Failed to create account. Please check your internet connection and try again.';
            
            Alert.alert(
                'Registration Failed',
                errorMessage,
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading message="Creating your account..." />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <ScrollView 
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.headerContainer}>
                        <LinearGradient
                            colors={[THEME.primary, THEME.secondary]}
                            style={StyleSheet.absoluteFill}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                        <Image
                            source={require('../../assets/images/app_logo_budgetU_bgremove.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={styles.welcomeText}>Create Account</Text>
                        <Text style={styles.subtitle}>Join BudgetU and take control of your finances</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.form}>
                            <View style={styles.nameRow}>
                                <View style={[styles.inputGroup, styles.nameInput]}>
                                    <TextInput
                                        style={[styles.input, errors.firstName && styles.inputError]}
                                        placeholder="First Name"
                                        placeholderTextColor={THEME.textSecondary}
                                        value={firstName}
                                        onChangeText={(text) => {
                                            setFirstName(text);
                                            setErrors(prev => ({ ...prev, firstName: '' }));
                                        }}
                                    />
                                    {errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}
                                </View>

                                <View style={[styles.inputGroup, styles.nameInput]}>
                                    <TextInput
                                        style={[styles.input, errors.lastName && styles.inputError]}
                                        placeholder="Last Name"
                                        placeholderTextColor={THEME.textSecondary}
                                        value={lastName}
                                        onChangeText={(text) => {
                                            setLastName(text);
                                            setErrors(prev => ({ ...prev, lastName: '' }));
                                        }}
                                    />
                                    {errors.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <TextInput
                                    style={[styles.input, errors.email && styles.inputError]}
                                    placeholder="Email"
                                    placeholderTextColor={THEME.textSecondary}
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        setErrors(prev => ({ ...prev, email: '' }));
                                    }}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                />
                                {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
                            </View>

                            <View style={styles.inputGroup}>
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={[styles.input, errors.password && styles.inputError]}
                                        placeholder="Password"
                                        placeholderTextColor={THEME.textSecondary}
                                        value={password}
                                        onChangeText={(text) => {
                                            setPassword(text);
                                            setErrors(prev => ({ ...prev, password: '' }));
                                        }}
                                        secureTextEntry={!showPassword}
                                    />
                                    <TouchableOpacity 
                                        onPress={() => setShowPassword(!showPassword)}
                                        style={styles.passwordToggle}
                                    >
                                        <Ionicons
                                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                                            size={20}
                                            color={THEME.textSecondary}
                                        />
                                    </TouchableOpacity>
                                </View>
                                {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
                            </View>

                            <View style={styles.inputGroup}>
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={[styles.input, errors.confirmPassword && styles.inputError]}
                                        placeholder="Confirm Password"
                                        placeholderTextColor={THEME.textSecondary}
                                        value={confirmPassword}
                                        onChangeText={(text) => {
                                            setConfirmPassword(text);
                                            setErrors(prev => ({ ...prev, confirmPassword: '' }));
                                        }}
                                        secureTextEntry={!showConfirmPassword}
                                    />
                                    <TouchableOpacity 
                                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={styles.passwordToggle}
                                    >
                                        <Ionicons
                                            name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                                            size={20}
                                            color={THEME.textSecondary}
                                        />
                                    </TouchableOpacity>
                                </View>
                                {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
                            </View>

                            <TouchableOpacity
                                style={styles.signUpButton}
                                onPress={handleSignUp}
                            >
                                <Text style={styles.signUpButtonText}>Create Account</Text>
                            </TouchableOpacity>

                            <View style={styles.loginContainer}>
                                <Text style={styles.loginText}>Already have an account? </Text>
                                <TouchableOpacity onPress={() => navigation.goBack()}>
                                    <Text style={styles.loginLink}>Sign In</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
            </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.background,
    },
    content: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    headerContainer: {
        height: height * 0.32,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    logo: {
        width: width * 0.5,
        height: width * 0.5,
        marginBottom: spacing.lg,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: '700',
        color: THEME.white,
        marginBottom: spacing.sm,
        marginTop: -40,
    },
    subtitle: {
        fontSize: 16,
        color: THEME.white,
        opacity: 0.9,
        textAlign: 'center',
        paddingHorizontal: spacing.xl,
    },
    formContainer: {
        flex: 1,
        backgroundColor: THEME.white,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: spacing.xl,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    form: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
    },
    nameInput: {
        flex: 1,
        marginRight: spacing.md,
    },
    inputGroup: {
        marginBottom: spacing.lg,
    },
    passwordContainer: {
        position: 'relative',
    },
    input: {
        backgroundColor: THEME.background,
        borderRadius: 12,
        padding: spacing.lg,
        fontSize: 16,
        color: THEME.text,
    },
    inputError: {
        borderWidth: 1,
        borderColor: THEME.error,
    },
    errorText: {
        color: THEME.error,
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    passwordToggle: {
        position: 'absolute',
        right: spacing.md,
        top: '50%',
        transform: [{ translateY: -10 }],
    },
    signUpButton: {
        backgroundColor: THEME.primary,
        borderRadius: 12,
        padding: spacing.lg,
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    signUpButtonText: {
        color: THEME.white,
        fontSize: 16,
        fontWeight: '600',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginText: {
        color: THEME.textSecondary,
        fontSize: 14,
    },
    loginLink: {
        color: THEME.primary,
        fontSize: 14,
        fontWeight: '500',
    },
});

export default SignUpScreen;
