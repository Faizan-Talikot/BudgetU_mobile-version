import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { storage, StorageKeys } from '../utils/storage';
import { apiClient } from '../api/client';

interface PendingSync {
    id: string;
    endpoint: string;
    method: 'POST' | 'PUT' | 'DELETE';
    data?: unknown;
    timestamp: number;
}

const SYNC_STORAGE_KEY = StorageKeys.PENDING_SYNC;

export const useOfflineSync = () => {
    const [isOnline, setIsOnline] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [pendingActions, setPendingActions] = useState<PendingSync[]>([]);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            setIsOnline(state.isConnected ?? false);
        });

        loadPendingActions();

        return () => {
            unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (isOnline && pendingActions.length > 0) {
            syncPendingActions();
        }
    }, [isOnline, pendingActions]);

    const loadPendingActions = async () => {
        try {
            const actions = await storage.get<PendingSync[]>(SYNC_STORAGE_KEY);
            if (actions) {
                setPendingActions(actions);
            }
        } catch (error) {
            console.error('Error loading pending actions:', error);
        }
    };

    const savePendingActions = async (actions: PendingSync[]) => {
        try {
            await storage.set(SYNC_STORAGE_KEY, actions);
            setPendingActions(actions);
        } catch (error) {
            console.error('Error saving pending actions:', error);
        }
    };

    const addPendingAction = async (
        endpoint: string,
        method: PendingSync['method'],
        data?: unknown
    ) => {
        const newAction: PendingSync = {
            id: Math.random().toString(36).substring(7),
            endpoint,
            method,
            data,
            timestamp: Date.now(),
        };

        const updatedActions = [...pendingActions, newAction];
        await savePendingActions(updatedActions);

        if (isOnline) {
            syncPendingActions();
        }
    };

    const syncPendingActions = async () => {
        if (isSyncing || pendingActions.length === 0) return;

        setIsSyncing(true);
        const failedActions: PendingSync[] = [];

        for (const action of pendingActions) {
            try {
                switch (action.method) {
                    case 'POST':
                        await apiClient.post(action.endpoint, action.data);
                        break;
                    case 'PUT':
                        await apiClient.put(action.endpoint, action.data);
                        break;
                    case 'DELETE':
                        await apiClient.delete(action.endpoint);
                        break;
                }
            } catch (error) {
                console.error(`Error syncing action ${action.id}:`, error);
                failedActions.push(action);
            }
        }

        await savePendingActions(failedActions);
        setIsSyncing(false);
    };

    return {
        isOnline,
        isSyncing,
        pendingActions,
        addPendingAction,
        syncPendingActions,
    };
}; 