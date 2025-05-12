import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectItem } from "@/components/ui/select";
import {
    Bell,
    Mail,
    DollarSign,
    Clock,
    Save,
    RefreshCw
} from "lucide-react-native";
import { useToast } from "@/components/ui/use-toast";

interface Styles {
    container: ViewStyle;
    titleContainer: ViewStyle;
    title: TextStyle;
    description: TextStyle;
    settingRow: ViewStyle;
    settingContent: ViewStyle;
    settingLabel: TextStyle;
    settingDescription: TextStyle;
    selectContainer: ViewStyle;
    button: ViewStyle;
    buttonDisabled: ViewStyle;
    buttonContent: ViewStyle;
    buttonText: TextStyle;
}

const PreferencesSettings = () => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    // Notification preferences
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [budgetAlerts, setBudgetAlerts] = useState(true);
    const [weeklyReports, setWeeklyReports] = useState(false);

    // Display preferences
    const [currency, setCurrency] = useState("USD");
    const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");

    // Handle save preferences
    const handleSavePreferences = () => {
        setIsLoading(true);

        // In a real app, these would be saved to the backend
        const preferences = {
            notifications: {
                email: emailNotifications,
                budgetAlerts,
                weeklyReports,
            },
            display: {
                currency,
                dateFormat,
            }
        };

        console.log("Saving preferences:", preferences);

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            toast({
                title: "Preferences saved",
                description: "Your preferences have been updated successfully.",
            });
        }, 1000);
    };

    return (
        <View style={styles.container}>
            <Card>
                <CardHeader>
                    <View style={styles.titleContainer}>
                        <Bell size={20} color="#000" />
                        <Text style={styles.title}>Notification Preferences</Text>
                    </View>
                    <Text style={styles.description}>
                        Manage how and when you receive notifications from BudgetU
                    </Text>
                </CardHeader>
                <CardContent>
                    <View style={styles.settingRow}>
                        <View style={styles.settingContent}>
                            <Label style={styles.settingLabel}>Email Notifications</Label>
                            <Text style={styles.settingDescription}>
                                Receive important updates via email
                            </Text>
                        </View>
                        <Switch
                            checked={emailNotifications}
                            onCheckedChange={setEmailNotifications}
                        />
                    </View>
                    <View style={styles.settingRow}>
                        <View style={styles.settingContent}>
                            <Label style={styles.settingLabel}>Budget Alerts</Label>
                            <Text style={styles.settingDescription}>
                                Get notified when you're approaching budget limits
                            </Text>
                        </View>
                        <Switch
                            checked={budgetAlerts}
                            onCheckedChange={setBudgetAlerts}
                        />
                    </View>
                    <View style={styles.settingRow}>
                        <View style={styles.settingContent}>
                            <Label style={styles.settingLabel}>Weekly Spending Reports</Label>
                            <Text style={styles.settingDescription}>
                                Receive a weekly summary of your spending
                            </Text>
                        </View>
                        <Switch
                            checked={weeklyReports}
                            onCheckedChange={setWeeklyReports}
                        />
                    </View>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <View style={styles.titleContainer}>
                        <DollarSign size={20} color="#000" />
                        <Text style={styles.title}>Display Preferences</Text>
                    </View>
                    <Text style={styles.description}>
                        Customize how information is displayed in the app
                    </Text>
                </CardHeader>
                <CardContent>
                    <View style={styles.selectContainer}>
                        <Label style={styles.settingLabel}>Currency</Label>
                        <Select value={currency} onValueChange={setCurrency}>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                            <SelectItem value="CAD">CAD (C$)</SelectItem>
                            <SelectItem value="AUD">AUD (A$)</SelectItem>
                            <SelectItem value="JPY">JPY (¥)</SelectItem>
                        </Select>
                    </View>
                    <View style={styles.selectContainer}>
                        <Label style={styles.settingLabel}>Date Format</Label>
                        <Select value={dateFormat} onValueChange={setDateFormat}>
                            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </Select>
                    </View>
                </CardContent>
            </Card>

            <TouchableOpacity
                onPress={handleSavePreferences}
                disabled={isLoading}
                style={[styles.button, isLoading && styles.buttonDisabled]}
            >
                <View style={styles.buttonContent}>
                    {isLoading ? (
                        <RefreshCw size={16} color="#fff" />
                    ) : (
                        <Save size={16} color="#fff" />
                    )}
                    <Text style={styles.buttonText}>Save Preferences</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create<Styles>({
    container: {
        gap: 20,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    description: {
        fontSize: 14,
        color: '#666',
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    settingContent: {
        flex: 1,
        marginRight: 16,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    settingDescription: {
        fontSize: 14,
        color: '#666',
    },
    selectContainer: {
        marginBottom: 16,
    },
    button: {
        backgroundColor: '#0066cc',
        padding: 12,
        borderRadius: 8,
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

export default PreferencesSettings; 