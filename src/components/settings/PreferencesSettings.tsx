import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    BellRing,
    Mail,
    DollarSign,
    Clock,
    Save,
    Loader2
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <BellRing className="mr-2 h-5 w-5" />
                        Notification Preferences
                    </CardTitle>
                    <CardDescription>
                        Manage how and when you receive notifications from BudgetU
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="email-notifications" className="text-base">Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">
                                Receive important updates via email
                            </p>
                        </div>
                        <Switch
                            id="email-notifications"
                            checked={emailNotifications}
                            onCheckedChange={setEmailNotifications}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="budget-alerts" className="text-base">Budget Alerts</Label>
                            <p className="text-sm text-muted-foreground">
                                Get notified when you're approaching budget limits
                            </p>
                        </div>
                        <Switch
                            id="budget-alerts"
                            checked={budgetAlerts}
                            onCheckedChange={setBudgetAlerts}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="weekly-reports" className="text-base">Weekly Spending Reports</Label>
                            <p className="text-sm text-muted-foreground">
                                Receive a weekly summary of your spending
                            </p>
                        </div>
                        <Switch
                            id="weekly-reports"
                            checked={weeklyReports}
                            onCheckedChange={setWeeklyReports}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <DollarSign className="mr-2 h-5 w-5" />
                        Display Preferences
                    </CardTitle>
                    <CardDescription>
                        Customize how information is displayed in the app
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select value={currency} onValueChange={setCurrency}>
                            <SelectTrigger id="currency">
                                <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="USD">USD ($)</SelectItem>
                                <SelectItem value="EUR">EUR (€)</SelectItem>
                                <SelectItem value="GBP">GBP (£)</SelectItem>
                                <SelectItem value="CAD">CAD (C$)</SelectItem>
                                <SelectItem value="AUD">AUD (A$)</SelectItem>
                                <SelectItem value="JPY">JPY (¥)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="date-format">Date Format</Label>
                        <Select value={dateFormat} onValueChange={setDateFormat}>
                            <SelectTrigger id="date-format">
                                <SelectValue placeholder="Select date format" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Button
                onClick={handleSavePreferences}
                disabled={isLoading}
                className="flex items-center"
            >
                {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Save className="mr-2 h-4 w-4" />
                )}
                Save Preferences
            </Button>
        </div>
    );
};

export default PreferencesSettings; 