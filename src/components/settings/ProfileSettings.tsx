import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera, Save, RefreshCw } from "lucide-react-native";
import { useToast } from "@/components/ui/use-toast";
import { getUserData } from "@/lib/api";
import * as ImagePicker from 'expo-image-picker';

// Validation schema
const profileSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Please enter a valid email address").min(1, "Email is required"),
    profilePicture: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface FormFieldProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    error?: string;
    disabled?: boolean;
}

interface Styles {
    container: ViewStyle;
    avatarSection: ViewStyle;
    avatarContainer: ViewStyle;
    avatar: ViewStyle;
    avatarImage: ImageStyle;
    avatarFallback: ViewStyle;
    avatarFallbackText: TextStyle;
    cameraButton: ViewStyle;
    profileInfo: ViewStyle;
    title: TextStyle;
    description: TextStyle;
    form: ViewStyle;
    formRow: ViewStyle;
    formField: ViewStyle;
    label: TextStyle;
    input: TextStyle;
    inputDisabled: TextStyle;
    errorText: TextStyle;
    button: ViewStyle;
    buttonDisabled: ViewStyle;
    buttonContent: ViewStyle;
    buttonText: TextStyle;
}

const FormField = ({ label, value, onChangeText, placeholder, error, disabled }: FormFieldProps) => (
    <View style={styles.formField}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
            style={[styles.input, disabled && styles.inputDisabled]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            editable={!disabled}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
);

const ProfileSettings = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState("");
    const { toast } = useToast();

    const { control, handleSubmit, setValue, getValues } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            profilePicture: "",
        },
    });

    useEffect(() => {
        const userData = getUserData();
        if (userData) {
            setValue("firstName", userData.firstName);
            setValue("lastName", userData.lastName);
            setValue("email", userData.email);
            setValue("profilePicture", userData.profilePicture || "");

            if (userData.profilePicture) {
                setAvatarUrl(userData.profilePicture);
            }
        }
    }, [setValue]);

    const handleAvatarChange = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissionResult.granted) {
                toast({
                    title: "Permission required",
                    description: "Please grant camera roll permissions to change your profile picture.",
                });
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled) {
                const uri = result.assets[0].uri;
                setAvatarUrl(uri);
                setValue("profilePicture", uri);
            }
        } catch (error) {
            console.error("Error picking image:", error);
            toast({
                title: "Error",
                description: "Failed to pick image. Please try again.",
            });
        }
    };

    const onSubmit = async (data: ProfileFormValues) => {
        setIsLoading(true);
        try {
            // In a real app, you would send this data to the server
            console.log("Profile data to update:", data);

            // Update local storage for demo purposes
            const userData = getUserData();
            if (userData) {
                const updatedUser = {
                    ...userData,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    profilePicture: data.profilePicture,
                };
                localStorage.setItem("budgetu-user", JSON.stringify(updatedUser));
            }

            toast({
                title: "Profile updated",
                description: "Your profile information has been updated successfully.",
            });
        } catch (error) {
            console.error("Error updating profile:", error);
            toast({
                title: "Update failed",
                description: "There was an error updating your profile. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.avatarSection}>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        {avatarUrl ? (
                            <Image
                                source={{ uri: avatarUrl }}
                                style={styles.avatarImage}
                            />
                        ) : (
                            <View style={styles.avatarFallback}>
                                <Text style={styles.avatarFallbackText}>
                                    {getValues("firstName").charAt(0)}
                                    {getValues("lastName").charAt(0)}
                                </Text>
                            </View>
                        )}
                    </View>
                    <TouchableOpacity
                        style={styles.cameraButton}
                        onPress={handleAvatarChange}
                    >
                        <Camera size={16} color="#fff" />
                    </TouchableOpacity>
                </View>
                <View style={styles.profileInfo}>
                    <Text style={styles.title}>Profile Picture</Text>
                    <Text style={styles.description}>
                        Tap the camera icon to upload a new profile picture
                    </Text>
                </View>
            </View>

            <View style={styles.form}>
                <View style={styles.formRow}>
                    <Controller
                        control={control}
                        name="firstName"
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <FormField
                                label="First Name"
                                value={value}
                                onChangeText={onChange}
                                placeholder="John"
                                error={error?.message}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="lastName"
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <FormField
                                label="Last Name"
                                value={value}
                                onChangeText={onChange}
                                placeholder="Doe"
                                error={error?.message}
                            />
                        )}
                    />
                </View>
                <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <FormField
                            label="Email"
                            value={value}
                            onChangeText={onChange}
                            placeholder="you@example.com"
                            error={error?.message}
                            disabled
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
                        <Text style={styles.buttonText}>Save Changes</Text>
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
    avatarSection: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: '#f1f5f9',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    avatarFallback: {
        width: '100%',
        height: '100%',
        backgroundColor: '#6366f1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarFallbackText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#0066cc',
        padding: 8,
        borderRadius: 16,
    },
    profileInfo: {
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
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
    formRow: {
        flexDirection: 'row',
        gap: 16,
    },
    formField: {
        flex: 1,
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000',
    },
    input: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#000',
    },
    inputDisabled: {
        backgroundColor: '#f1f5f9',
        color: '#64748b',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    errorText: {
        fontSize: 12,
        color: '#dc2626',
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

export default ProfileSettings; 