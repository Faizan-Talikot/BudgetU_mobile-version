import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert as RNAlert, ViewStyle, TextStyle } from 'react-native';
import { useForm, Controller, FieldError, Control, ControllerRenderProps, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Info, Save, RefreshCw } from "lucide-react-native";
import { useToast } from "@/components/ui/use-toast";
import { authApi, logout } from "@/lib/api";

// Validation schema
const passwordSchema = z
    .object({
        currentPassword: z.string().min(6, "Current password is required"),
        newPassword: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string().min(6, "Please confirm your new password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

type PasswordFormValues = z.infer<typeof passwordSchema>;

interface FormFieldProps {
    onChange: (value: string) => void;
    value: string;
    error?: FieldError;
    label: string;
    placeholder?: string;
}

interface FieldRenderProps {
    field: {
        onChange: (value: string) => void;
        value: string;
    };
    fieldState: {
        error?: FieldError;
    };
}

interface Styles {
    container: ViewStyle;
    alert: ViewStyle;
    alertContent: ViewStyle;
    title: TextStyle;
    description: TextStyle;
    form: ViewStyle;
    formItem: ViewStyle;
    label: TextStyle;
    input: ViewStyle;
    errorText: TextStyle;
    button: ViewStyle;
    buttonDisabled: ViewStyle;
    buttonContent: ViewStyle;
    buttonText: TextStyle;
}

const FormField = ({ onChange, value, error, label, placeholder }: FormFieldProps) => (
    <View style={styles.formItem}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
            style={styles.input}
            secureTextEntry
            placeholder={placeholder || "••••••••"}
            onChangeText={onChange}
            value={value}
        />
        {error && <Text style={styles.errorText}>{error.message}</Text>}
    </View>
);

const SecuritySettings = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const { control, handleSubmit, setError, reset } = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: PasswordFormValues) => {
        setIsLoading(true);
        try {
            await authApi.changePassword(data.currentPassword, data.newPassword);

            toast({
                title: "Password updated",
                description: "Your password has been changed successfully. Please log in again with your new password.",
            });

            setTimeout(() => {
                logout();
                // Navigate to login screen
            }, 1500);

            reset({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (error) {
            console.error("Error updating password:", error);

            if (error instanceof Error && error.message.includes("Current password is incorrect")) {
                setError("currentPassword", {
                    type: "manual",
                    message: "Current password is incorrect"
                });
            } else {
                RNAlert.alert(
                    "Update failed",
                    error instanceof Error ? error.message : "There was an error updating your password. Please try again."
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.alert}>
                <View style={styles.alertContent}>
                    <Info size={16} color="#666" />
                    <Text style={styles.title}>Password Security</Text>
                </View>
                <Text style={styles.description}>
                    Use a strong password that you don't use on other websites.
                    A strong password is at least 8 characters, includes numbers and special characters.
                </Text>
            </View>

            <View style={styles.form}>
                <Controller<PasswordFormValues>
                    control={control}
                    name="currentPassword"
                    render={({ field: { onChange, value }, fieldState: { error } }: FieldRenderProps) => (
                        <FormField
                            onChange={onChange}
                            value={value}
                            error={error}
                            label="Current Password"
                        />
                    )}
                />

                <Controller<PasswordFormValues>
                    control={control}
                    name="newPassword"
                    render={({ field: { onChange, value }, fieldState: { error } }: FieldRenderProps) => (
                        <FormField
                            onChange={onChange}
                            value={value}
                            error={error}
                            label="New Password"
                        />
                    )}
                />

                <Controller<PasswordFormValues>
                    control={control}
                    name="confirmPassword"
                    render={({ field: { onChange, value }, fieldState: { error } }: FieldRenderProps) => (
                        <FormField
                            onChange={onChange}
                            value={value}
                            error={error}
                            label="Confirm New Password"
                        />
                    )}
                />

                <TouchableOpacity
                    onPress={handleSubmit(onSubmit)}
                    disabled={isLoading}
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                >
                    <View style={styles.buttonContent}>
                        {isLoading ? (
                            <RefreshCw size={16} color="#fff" />
                        ) : (
                            <Save size={16} color="#fff" />
                        )}
                        <Text style={styles.buttonText}>Change Password</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create<Styles>({
    container: {
        gap: 24,
    },
    alert: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    alertContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    description: {
        fontSize: 14,
        color: '#666',
    },
    form: {
        gap: 16,
    },
    formItem: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000',
    },
    input: {
        borderWidth: 1,
        borderColor: '#e9ecef',
        borderRadius: 8,
        padding: 12,
    },
    errorText: {
        fontSize: 12,
        color: '#dc3545',
    },
    button: {
        backgroundColor: '#0066cc',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
});

export default SecuritySettings; 