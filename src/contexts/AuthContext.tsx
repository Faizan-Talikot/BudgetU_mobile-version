import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage, StorageKeys } from '../utils/storage';
import getEnvVars from '../config/env';

const env = getEnvVars();
const API_URL = env.API_URL;

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    // Add other user properties as needed
}

interface AuthData {
    user: User;
    token: string;
    refreshToken: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const authData = await storage.get<{user: User; token: string; refreshToken: string}>(StorageKeys.USER_DATA);
            setUser(authData?.user || null);
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            setLoading(true);
            console.log('Attempting to sign in with URL:', `${API_URL}/api/users/login`);
            const response = await fetch(`${API_URL}/api/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            // Store complete auth data including tokens
            const authData = {
                user: data.user,
                token: data.token,
                refreshToken: data.refreshToken || data.token
            };
            await storage.set(StorageKeys.USER_DATA, authData);
            setUser(data.user);
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
        try {
            setLoading(true);
            console.log('Starting signup process...');
            console.log('API URL:', `${API_URL}/api/users/register`);
            
            const response = await fetch(`${API_URL}/api/users/register`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    email, 
                    password, 
                    firstName,
                    lastName
                }),
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // Store auth data with the structure that matches the backend response
            const authData = {
                user: data.user,
                token: data.token,
                // If refresh token isn't provided, we'll use the same token for now
                refreshToken: data.refreshToken || data.token
            };
            await storage.set(StorageKeys.USER_DATA, authData);
            setUser(data.user);

            // Immediately after storing auth data, verify it was saved
            const savedData = await storage.get(StorageKeys.USER_DATA);
            console.log('Stored auth data:', savedData);
        } catch (error) {
            console.error('Detailed signup error:', error);
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error('An unexpected error occurred during signup');
            }
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        try {
            setLoading(true);
            await storage.remove(StorageKeys.USER_DATA);
            setUser(null);
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signOut, signUp }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 