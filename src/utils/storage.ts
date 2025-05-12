import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageKeys = {
    USER_DATA: '@BudgetU:userData',
    TRANSACTIONS: '@BudgetU:transactions',
    BUDGETS: '@BudgetU:budgets',
    SETTINGS: '@BudgetU:settings',
    PENDING_SYNC: '@BudgetU:pendingSync',
    HAS_SEEN_ONBOARDING: '@BudgetU:hasSeenOnboarding',
} as const;

type StorageListener = () => void | Promise<void>;
type StorageListeners = Map<string, Set<StorageListener>>;

class Storage {
    private listeners: StorageListeners = new Map();

    async set(key: string, value: any): Promise<void> {
        await AsyncStorage.setItem(key, JSON.stringify(value));
        this.notifyListeners(key);
    }

    async get<T>(key: string): Promise<T | null> {
        const value = await AsyncStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    }

    async remove(key: string): Promise<void> {
        await AsyncStorage.removeItem(key);
        this.notifyListeners(key);
    }

    async clear(): Promise<void> {
        await AsyncStorage.clear();
        // Notify all listeners when storage is cleared
        this.listeners.forEach((_, key) => this.notifyListeners(key));
    }

    addListener(key: string, listener: StorageListener): () => void {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key)!.add(listener);

        // Return unsubscribe function
        return () => {
            const keyListeners = this.listeners.get(key);
            if (keyListeners) {
                keyListeners.delete(listener);
                if (keyListeners.size === 0) {
                    this.listeners.delete(key);
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