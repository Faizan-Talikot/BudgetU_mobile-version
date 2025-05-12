import { storage, StorageKeys } from '../utils/storage';
import getEnvVars from '../config/env';

const env = getEnvVars();
const API_BASE_URL = env.API_URL;

interface ApiResponse<T> {
    data: T;
    message?: string;
}

interface ApiError {
    message: string;
    code?: string;
}

interface UserData {
    token: string;
    refreshToken: string;
}

class ApiClient {
    private async getHeaders(): Promise<Headers> {
        const userData = await storage.get<UserData>(StorageKeys.USER_DATA);
        const headers = new Headers({
            'Content-Type': 'application/json',
        });

        if (userData?.token) {
            headers.append('Authorization', `Bearer ${userData.token}`);
        }

        return headers;
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                // Handle token refresh or logout
                await this.handleUnauthorized();
            }
            throw {
                message: data.message || 'An error occurred',
                code: data.code,
                status: response.status,
            };
        }

        return data;
    }

    private async handleUnauthorized(): Promise<void> {
        const userData = await storage.get<UserData>(StorageKeys.USER_DATA);
        if (userData?.refreshToken) {
            try {
                const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ refreshToken: userData.refreshToken }),
                });

                if (response.ok) {
                    const newTokens = await response.json();
                    await storage.set(StorageKeys.USER_DATA, {
                        ...userData,
                        token: newTokens.token,
                        refreshToken: newTokens.refreshToken,
                    });
                    return;
                }
            } catch (error) {
                console.error('Token refresh failed:', error);
            }
        }

        // If refresh fails or no refresh token, clear storage and force logout
        await storage.clear();
        // TODO: Implement proper navigation to login screen
    }

    async get<T>(endpoint: string): Promise<T> {
        try {
            const headers = await this.getHeaders();
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'GET',
                headers,
            });
            return this.handleResponse<T>(response);
        } catch (error) {
            console.error(`GET ${endpoint} error:`, error);
            throw error;
        }
    }

    async post<T>(endpoint: string, body: unknown): Promise<T> {
        try {
            const headers = await this.getHeaders();
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            });
            return this.handleResponse<T>(response);
        } catch (error) {
            console.error(`POST ${endpoint} error:`, error);
            throw error;
        }
    }

    async put<T>(endpoint: string, body: unknown): Promise<T> {
        try {
            const headers = await this.getHeaders();
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(body),
            });
            return this.handleResponse<T>(response);
        } catch (error) {
            console.error(`PUT ${endpoint} error:`, error);
            throw error;
        }
    }

    async delete<T>(endpoint: string): Promise<T> {
        try {
            const headers = await this.getHeaders();
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'DELETE',
                headers,
            });
            return this.handleResponse<T>(response);
        } catch (error) {
            console.error(`DELETE ${endpoint} error:`, error);
            throw error;
        }
    }
}

export const apiClient = new ApiClient(); 