import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageKeys = {
    USER_DATA: '@BudgetU:userData',
    TRANSACTIONS: '@BudgetU:transactions',
    BUDGETS: '@BudgetU:budgets',
    SETTINGS: '@BudgetU:settings',
    PENDING_SYNC: '@BudgetU:pendingSync',
    HAS_SEEN_ONBOARDING: '@BudgetU:hasSeenOnboarding',
    CATEGORIES: '@BudgetU:categories',
    ACCOUNTS: '@BudgetU:accounts',
    TOKEN: '@BudgetU:token',
} as const;

type StorageListener = () => void | Promise<void>;
type StorageListeners = Map<string, Set<StorageListener>>;

class Storage {
    private listeners: StorageListeners = new Map();

    async set(key: string, value: any): Promise<void> {
        const storageKey = `@BudgetU:${key}`;
        await AsyncStorage.setItem(storageKey, JSON.stringify(value));
        this.notifyListeners(storageKey);
    }

    async get<T>(key: string): Promise<T | null> {
        const storageKey = `@BudgetU:${key}`;
        const value = await AsyncStorage.getItem(storageKey);
        return value ? JSON.parse(value) : null;
    }

    async remove(key: string): Promise<void> {
        const storageKey = `@BudgetU:${key}`;
        await AsyncStorage.removeItem(storageKey);
        this.notifyListeners(storageKey);
    }

    async clear(): Promise<void> {
        const keys = await AsyncStorage.getAllKeys();
        const budgetuKeys = keys.filter(key => key.startsWith('@BudgetU:'));
        await AsyncStorage.multiRemove(budgetuKeys);
        // Notify all listeners when storage is cleared
        this.listeners.forEach((_, key) => this.notifyListeners(key));
    }

    addListener(key: string, listener: StorageListener): () => void {
        const storageKey = `@BudgetU:${key}`;
        if (!this.listeners.has(storageKey)) {
            this.listeners.set(storageKey, new Set());
        }
        this.listeners.get(storageKey)!.add(listener);

        // Return unsubscribe function
        return () => {
            const keyListeners = this.listeners.get(storageKey);
            if (keyListeners) {
                keyListeners.delete(listener);
                if (keyListeners.size === 0) {
                    this.listeners.delete(storageKey);
                }
            }
        };
    }

    private notifyListeners(key: string): void {
        const keyListeners = this.listeners.get(key);
        if (keyListeners) {
            keyListeners.forEach(listener => {
                try {
                    const result = listener();
                    if (result instanceof Promise) {
                        result.catch(error => {
                            console.error('Error in storage listener:', error);
                        });
                    }
                } catch (error) {
                    console.error('Error in storage listener:', error);
                }
            });
        }
    }
}

export const storage = new Storage();

export const storageWrapper = {
    get: async (key: string): Promise<string | null> => {
        try {
            return await AsyncStorage.getItem(`budgetu-${key}`);
        } catch (error) {
            console.error('Error reading from storage:', error);
            return null;
        }
    },

    set: async (key: string, value: string): Promise<void> => {
        try {
            await AsyncStorage.setItem(`budgetu-${key}`, value);
        } catch (error) {
            console.error('Error writing to storage:', error);
        }
    },

    remove: async (key: string): Promise<void> => {
        try {
            await AsyncStorage.removeItem(`budgetu-${key}`);
        } catch (error) {
            console.error('Error removing from storage:', error);
        }
    },

    clear: async (): Promise<void> => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const budgetuKeys = keys.filter(key => key.startsWith('budgetu-'));
            await AsyncStorage.multiRemove(budgetuKeys);
        } catch (error) {
            console.error('Error clearing storage:', error);
        }
    }
}; 