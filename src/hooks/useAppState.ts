import { useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useOfflineSync } from './useOfflineSync';

export const useAppState = () => {
    const [appState, setAppState] = useState(AppState.currentState);
    const { syncPendingActions } = useOfflineSync();

    useEffect(() => {
        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription.remove();
        };
    }, []);

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
        if (appState.match(/inactive|background/) && nextAppState === 'active') {
            // App has come to the foreground
            onAppForeground();
        } else if (appState === 'active' && nextAppState.match(/inactive|background/)) {
            // App has gone to the background
            onAppBackground();
        }

        setAppState(nextAppState);
    };

    const onAppForeground = async () => {
        try {
            // Sync any pending offline actions
            await syncPendingActions();

            // Add any other tasks that need to run when the app comes to the foreground
            // For example:
            // - Refresh user data
            // - Check for notifications
            // - Update app state
        } catch (error) {
            console.error('Error running foreground tasks:', error);
        }
    };

    const onAppBackground = async () => {
        try {
            // Add any tasks that need to run when the app goes to the background
            // For example:
            // - Save current app state
            // - Clear sensitive data
            // - Stop active processes
        } catch (error) {
            console.error('Error running background tasks:', error);
        }
    };

    return {
        appState,
        isActive: appState === 'active',
        isBackground: appState.match(/inactive|background/) !== null,
    };
}; 