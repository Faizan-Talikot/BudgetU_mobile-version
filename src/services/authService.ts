import { storage } from '../utils/storage';
import { API_URL } from '../config';

export const authService = {
    login: async (email: string, password: string) => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Store token and user data
            await storage.set('token', data.token);
            await storage.set('user', data.user);

            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    register: async (userData: {
        email: string;
        password: string;
        name: string;
        currency?: string;
    }) => {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            return data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    logout: async () => {
        try {
            await storage.remove('token');
            await storage.remove('user');
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    },

    isAuthenticated: async () => {
        try {
            const token = await storage.get<string>('token');
            return !!token;
        } catch (error) {
            console.error('Auth check error:', error);
            return false;
        }
    },

    getToken: async () => {
        try {
            return await storage.get<string>('token');
        } catch (error) {
            console.error('Get token error:', error);
            return null;
        }
    },

    getUserData: async () => {
        try {
            return await storage.get('user');
        } catch (error) {
            console.error('Get user data error:', error);
            return null;
        }
    },
}; 