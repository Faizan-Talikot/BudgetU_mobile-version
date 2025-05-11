import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Shield, Settings as SettingsIcon } from "lucide-react";
import { getUserData, isAuthenticated } from "@/lib/api";
import ProfileSettings from "../components/settings/ProfileSettings";
import SecuritySettings from "../components/settings/SecuritySettings";
import PreferencesSettings from "../components/settings/PreferencesSettings";

const Settings = () => {
    const [activeTab, setActiveTab] = useState("profile");
    const navigate = useNavigate();
    const [userName, setUserName] = useState("");

    // Check if user is logged in
    useEffect(() => {
        if (!isAuthenticated()) {
            navigate("/");
            return;
        }

        // Get user data
        const userData = getUserData();
        if (userData) {
            setUserName(`${userData.firstName} ${userData.lastName}`);
        }
    }, [navigate]);

    // Navigate back to dashboard
    const handleBackToDashboard = () => {
        navigate("/dashboard");
    };

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b">
                <div className="container mx-auto flex justify-between items-center h-16">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-budgetu-purple rounded-md flex items-center justify-center">
                            <span className="text-white font-bold text-lg">B</span>
                        </div>
                        <span className="font-bold text-xl">BudgetU</span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto py-8">
                <div className="flex items-center mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBackToDashboard}
                        className="gap-1"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="w-full md:w-64 space-y-4">
                        <div className="p-4 border rounded-lg">
                            <h3 className="font-medium mb-2">Account Settings</h3>
                            <p className="text-sm text-muted-foreground">{userName}</p>
                        </div>

                        <Tabs
                            value={activeTab}
                            onValueChange={setActiveTab}
                            orientation="vertical"
                            className="w-full"
                        >
                            <TabsList className="flex flex-col h-auto bg-transparent p-0 space-y-1">
                                <TabsTrigger
                                    value="profile"
                                    className="flex items-center justify-start gap-2 px-4 w-full data-[state=active]:bg-muted"
                                >
                                    <User className="h-4 w-4" />
                                    <span>Profile</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="security"
                                    className="flex items-center justify-start gap-2 px-4 w-full data-[state=active]:bg-muted"
                                >
                                    <Shield className="h-4 w-4" />
                                    <span>Security</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="preferences"
                                    className="flex items-center justify-start gap-2 px-4 w-full data-[state=active]:bg-muted"
                                >
                                    <SettingsIcon className="h-4 w-4" />
                                    <span>Preferences</span>
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        <div className="border rounded-lg">
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsContent value="profile" className="p-6">
                                    <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
                                    <ProfileSettings />
                                </TabsContent>
                                <TabsContent value="security" className="p-6">
                                    <h2 className="text-2xl font-bold mb-6">Security Settings</h2>
                                    <SecuritySettings />
                                </TabsContent>
                                <TabsContent value="preferences" className="p-6">
                                    <h2 className="text-2xl font-bold mb-6">Preferences</h2>
                                    <PreferencesSettings />
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Settings; 