import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { storage, StorageKeys } from '../utils/storage';

interface NotificationSettings {
    pushEnabled: boolean;
    budgetAlerts: boolean;
    transactionAlerts: boolean;
    weeklyReports: boolean;
}

const defaultSettings: NotificationSettings = {
    pushEnabled: true,
    budgetAlerts: true,
    transactionAlerts: true,
    weeklyReports: true,
};

export const useNotifications = () => {
    const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
    const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
    const [notification, setNotification] = useState<Notifications.Notification>();

    useEffect(() => {
        loadSettings();
        registerForPushNotifications();

        const notificationListener = Notifications.addNotificationReceivedListener(
            notification => {
                setNotification(notification);
            }
        );

        const responseListener = Notifications.addNotificationResponseReceivedListener(
            response => {
                handleNotificationResponse(response);
            }
        );

        return () => {
            Notifications.removeNotificationSubscription(notificationListener);
            Notifications.removeNotificationSubscription(responseListener);
        };
    }, []);

    const loadSettings = async () => {
        try {
            const savedSettings = await storage.get<NotificationSettings>(
                StorageKeys.SETTINGS
            );
            if (savedSettings) {
                setSettings(savedSettings);
                await configureNotifications(savedSettings);
            }
        } catch (error) {
            console.error('Error loading notification settings:', error);
        }
    };

    const registerForPushNotifications = async () => {
        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                throw new Error('Permission not granted for notifications');
            }

            const token = await Notifications.getExpoPushTokenAsync({
                projectId: 'your-project-id', // Replace with your Expo project ID
            });
            setExpoPushToken(token.data);

            if (Platform.OS === 'android') {
                await configureAndroidChannel();
            }
        } catch (error) {
            console.error('Error registering for push notifications:', error);
        }
    };

    const configureAndroidChannel = async () => {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'Default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    };

    const configureNotifications = async (settings: NotificationSettings) => {
        if (!settings.pushEnabled) {
            await Notifications.cancelAllScheduledNotificationsAsync();
            return;
        }

        // Configure weekly reports notification
        if (settings.weeklyReports) {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: 'Weekly Budget Report',
                    body: 'Your weekly budget report is ready to view!',
                },
                trigger: {
                    weekday: 1, // Monday
                    hour: 9,
                    minute: 0,
                    repeats: true,
                },
            });
        }

        // Add other notification configurations as needed
    };

    const handleNotificationResponse = (
        response: Notifications.NotificationResponse
    ) => {
        const data = response.notification.request.content.data;

        // Handle different types of notifications
        switch (data?.type) {
            case 'budget_alert':
                // Navigate to budget details
                break;
            case 'transaction':
                // Navigate to transaction details
                break;
            case 'weekly_report':
                // Navigate to reports screen
                break;
            default:
                // Handle unknown notification type
                break;
        }
    };

    const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
        const updatedSettings = { ...settings, ...newSettings };
        setSettings(updatedSettings);

        try {
            await storage.set(StorageKeys.SETTINGS, updatedSettings);
            await configureNotifications(updatedSettings);
        } catch (error) {
            console.error('Error updating notification settings:', error);
        }
    };

    const sendLocalNotification = async (
        title: string,
        body: string,
        data?: Record<string, unknown>
    ) => {
        if (!settings.pushEnabled) return;

        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data,
                },
                trigger: null,
            });
        } catch (error) {
            console.error('Error sending local notification:', error);
        }
    };

    return {
        settings,
        expoPushToken,
        notification,
        updateSettings,
        sendLocalNotification,
    };
}; 