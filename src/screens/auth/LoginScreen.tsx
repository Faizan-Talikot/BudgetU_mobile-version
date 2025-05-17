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
};

export default function LoginScreen() {
    const navigation = useNavigation();
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            setLoading(true);
            await signIn(email, password);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading message="Signing in..." />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
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
                    <Text style={styles.welcomeText}>Welcome Back!</Text>
                    <Text style={styles.subtitle}>Take control of your finances</Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                placeholderTextColor={THEME.textSecondary}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor={THEME.textSecondary}
                                value={password}
                                onChangeText={setPassword}
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

                        <TouchableOpacity
                            onPress={() => navigation.navigate('ForgotPassword')}
                            style={styles.forgotPassword}
                        >
                            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.signInButton}
                            onPress={handleLogin}
                        >
                            <Text style={styles.signInButtonText}>Sign In</Text>
                        </TouchableOpacity>

                        <View style={styles.dividerContainer}>
                            <View style={styles.divider} />
                            <Text style={styles.dividerText}>or continue with</Text>
                            <View style={styles.divider} />
                        </View>

                        <View style={styles.socialButtons}>
                            <TouchableOpacity style={styles.socialButton}>
                                <Ionicons name="logo-google" size={24} color={THEME.text} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialButton}>
                                <Ionicons name="logo-apple" size={24} color={THEME.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.signupContainer}>
                            <Text style={styles.signupText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                                <Text style={styles.signupLink}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.background,
    },
    content: {
        flex: 1,
    },
    headerContainer: {
        height: height * 0.35,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    logo: {
        width: width * 0.50,
        height: width * 0.50,
        // tintColor: THEME.white,
        marginBottom: spacing.lg,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: '700',
        color: THEME.white,
        marginBottom: spacing.sm,
        marginTop: -40
    },
    subtitle: {
        fontSize: 16,
        color: THEME.white,
        opacity: 0.9,
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
    inputGroup: {
        marginBottom: spacing.lg,
        position: 'relative',
    },
    input: {
        backgroundColor: THEME.background,
        borderRadius: 12,
        padding: spacing.lg,
        fontSize: 16,
        color: THEME.text,
    },
    passwordToggle: {
        position: 'absolute',
        right: spacing.md,
        top: '50%',
        transform: [{ translateY: -10 }],
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: spacing.xl,
    },
    forgotPasswordText: {
        color: THEME.textSecondary,
        fontSize: 14,
    },
    signInButton: {
        backgroundColor: THEME.primary,
        borderRadius: 12,
        padding: spacing.lg,
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    signInButtonText: {
        color: THEME.white,
        fontSize: 16,
        fontWeight: '600',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: THEME.border,
    },
    dividerText: {
        color: THEME.textSecondary,
        fontSize: 14,
        marginHorizontal: spacing.md,
    },
    socialButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.xl,
        marginBottom: spacing.xl,
    },
    socialButton: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: THEME.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: THEME.border,
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signupText: {
        color: THEME.textSecondary,
        fontSize: 14,
    },
    signupLink: {
        color: THEME.primary,
        fontSize: 14,
        fontWeight: '500',
    },
}); 