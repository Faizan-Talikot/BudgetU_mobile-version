import { storage, StorageKeys } from '../utils/storage';
import getEnvVars from '../config/env';
import { 
    ALL_DEFAULT_CATEGORIES, 
    DEFAULT_INCOME_CATEGORIES,
    DEFAULT_EXPENSE_CATEGORIES,
} from '../constants/defaultCategories';
import { Category, DBCategory, CreateCategoryPayload, UpdateCategoryPayload } from '../types/category';

const env = getEnvVars();
const API_URL = env.API_URL;

interface AuthResponse {
    token: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    message: string;
}

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
    const responseText = await response.text();
    console.log('Raw API Response:', responseText);
    
    if (!response.ok) {
        console.error('API Error Full Details:', {
            url: response.url,
            status: response.status,
            statusText: response.statusText,
            rawResponse: responseText,
            headers: Object.fromEntries(response.headers.entries())
        });
        
        let errorMessage = 'An error occurred';
        try {
            const errorJson = JSON.parse(responseText);
            errorMessage = errorJson.message || errorJson.error || JSON.stringify(errorJson);
        } catch (e) {
            errorMessage = responseText;
        }
        
        throw new Error(errorMessage);
    }
    
    let data;
    try {
        data = JSON.parse(responseText);
    } catch (e) {
        console.error('Failed to parse API response as JSON:', responseText);
        throw new Error('Invalid JSON response from server');
    }
    
    console.log('API Success:', {
        url: response.url,
        status: response.status,
        data: JSON.stringify(data, null, 2)
    });
    
    return data;
}

// Helper function to get headers with auth token
async function getHeaders(): Promise<HeadersInit> {
    const authData = await storage.get<{user: any; token: string}>(StorageKeys.USER_DATA);
    console.log('Current token:', authData?.token); // Debug log
    
    const headers: HeadersInit = {
    'Content-Type': 'application/json',
    };

    if (authData?.token) {
        headers['Authorization'] = `Bearer ${authData.token}`;
    }

    return headers;
}

export interface Account {
    _id: string;
    type: 'cash' | 'card' | 'credit' | 'savings' | 'upi' | 'wallet';
    name: string;
    balance: number;
    icon: string;
    isDefault: boolean;
}

// Store modified default categories in memory
let modifiedDefaultCategories = [...ALL_DEFAULT_CATEGORIES];

// Account APIs
export const accountAPI = {
    getAll: async () => {
        const response = await fetch(`${API_URL}/api/accounts`, {
            headers: await getHeaders(),
        });
        return handleResponse<Account[]>(response);
    },

    create: async (data: Omit<Account, '_id'>) => {
        const response = await fetch(`${API_URL}/api/accounts`, {
            method: 'POST',
            headers: await getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse<Account>(response);
    },

    update: async (id: string, data: Partial<Omit<Account, '_id' | 'isDefault'>>) => {
        const response = await fetch(`${API_URL}/api/accounts/${id}`, {
            method: 'PUT',
            headers: await getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse<Account>(response);
    },

    delete: async (id: string) => {
        const response = await fetch(`${API_URL}/api/accounts/${id}`, {
            method: 'DELETE',
            headers: await getHeaders(),
        });
        return handleResponse<{message: string}>(response);
    },

    getBalance: async (id: string) => {
        const response = await fetch(`${API_URL}/api/accounts/${id}/balance`, {
            headers: await getHeaders(),
        });
        return handleResponse<{balance: number}>(response);
    },

    updateBalance: async (id: string, data: { amount: number }) => {
        // Use the main account update endpoint with PUT method
        const response = await fetch(`${API_URL}/api/accounts/${id}`, {
            method: 'PUT',
            headers: await getHeaders(),
            body: JSON.stringify({ balance: data.amount }),
        });
        return handleResponse<Account>(response);
    }
};

// Category APIs
export const categoryAPI = {
    getAll: async () => {
        try {
            // Get custom categories from the server
            const response = await fetch(`${API_URL}/api/categories`, {
                headers: await getHeaders(),
            });
            const customCategories = await handleResponse<DBCategory[]>(response);
            
            // Add isCustom flag to custom categories
            const markedCustomCategories = customCategories.map(cat => ({
                ...cat,
                id: cat._id,
                isCustom: true
            }));
            
            // Create a Map to store unique categories by name (case-insensitive)
            const uniqueCategories = new Map();
            
            // Add custom categories first (they have proper MongoDB ObjectIds)
            markedCustomCategories.forEach(cat => {
                uniqueCategories.set(cat.name.toLowerCase(), cat);
            });
            
            // Add default categories only if they don't exist in custom categories
            modifiedDefaultCategories.forEach(cat => {
                if (!uniqueCategories.has(cat.name.toLowerCase())) {
                    // Find if there's a matching custom category by type and name
                    const matchingCustomCat = markedCustomCategories.find(
                        c => c.type === cat.type && c.name.toLowerCase() === cat.name.toLowerCase()
                    );

                    if (matchingCustomCat) {
                        // Use the matching custom category's ObjectId
                        uniqueCategories.set(cat.name.toLowerCase(), {
                            ...cat,
                            _id: matchingCustomCat._id,
                            isDefault: true
                        });
                    } else {
                        // For default categories without a match, keep their original structure
                        uniqueCategories.set(cat.name.toLowerCase(), {
                            ...cat,
                            _id: cat.id,
                            isDefault: true
                        });
                    }
                }
            });
            
            // Convert Map values back to array and sort
            return Array.from(uniqueCategories.values())
                .sort((a, b) => {
                    // Sort by custom status first (custom categories first)
                    if (a.isCustom && !b.isCustom) return -1;
                    if (!a.isCustom && b.isCustom) return 1;
                    // Then sort alphabetically by name
                    return a.name.localeCompare(b.name);
                });
        } catch (error) {
            console.error('Error fetching categories:', error);
            // If server request fails, return modified default categories
            return modifiedDefaultCategories.map(cat => ({
                ...cat,
                _id: cat.id,
                isDefault: true
            }));
        }
    },

    getByType: async (type: Category['type']) => {
        try {
            // Get custom categories of specified type from server
            const response = await fetch(`${API_URL}/api/categories/type/${type}`, {
                headers: await getHeaders(),
            });
            const customCategories = await handleResponse<DBCategory[]>(response);
            
            // Add isCustom flag to custom categories
            const markedCustomCategories = customCategories.map(cat => ({
                ...cat,
                id: cat._id,
                isCustom: true
            }));
            
            // Get modified default categories of specified type
            const defaultCategories = modifiedDefaultCategories.filter(cat => cat.type === type);
            
            // Create a Map to store unique categories by name (case-insensitive)
            const uniqueCategories = new Map();
            
            // Add default categories first
            defaultCategories.forEach(cat => {
                uniqueCategories.set(cat.name.toLowerCase(), cat);
            });
            
            // Add custom categories only if they don't exist in default categories
            markedCustomCategories.forEach(cat => {
                if (!uniqueCategories.has(cat.name.toLowerCase())) {
                    uniqueCategories.set(cat.name.toLowerCase(), cat);
                }
            });
            
            // Convert Map values back to array and sort to ensure default categories appear first
            return Array.from(uniqueCategories.values())
                .sort((a, b) => {
                    // Sort by default status first (default categories first)
                    if (a.isDefault && !b.isDefault) return -1;
                    if (!a.isDefault && b.isDefault) return 1;
                    // Then sort alphabetically by name
                    return a.name.localeCompare(b.name);
                });
        } catch (error) {
            console.error('Error fetching categories by type:', error);
            // If server request fails, return modified default categories of specified type
            return modifiedDefaultCategories.filter(cat => cat.type === type);
        }
    },

    create: async (data: CreateCategoryPayload) => {
        // If it's meant to be a custom category, save to server
        const response = await fetch(`${API_URL}/api/categories`, {
            method: 'POST',
            headers: await getHeaders(),
            body: JSON.stringify(data),
        });
        const newCategory = await handleResponse<DBCategory>(response);
        return { ...newCategory, id: newCategory._id, isCustom: true };
    },

    update: async (id: string, data: Partial<UpdateCategoryPayload>) => {
        // Check if it's a default category
        const defaultIndex = modifiedDefaultCategories.findIndex(cat => cat.id === id);
        if (defaultIndex !== -1) {
            // Get the existing category to ensure type safety
            const existingCategory = modifiedDefaultCategories[defaultIndex];
            
            // Create updated category with type safety
            const updatedCategory = {
                _id: existingCategory._id,
                id: existingCategory.id,
                name: data.name || existingCategory.name,
                icon: data.icon || existingCategory.icon,
                color: data.color || existingCategory.color,
                type: (data.type || existingCategory.type) as typeof existingCategory.type, // Preserve the exact type
                spent: existingCategory.spent,
                allocated: existingCategory.allocated,
                isDefault: true
            };
            
            // Update in memory with type assertion
            modifiedDefaultCategories[defaultIndex] = updatedCategory;
            return updatedCategory;
        }

        // If not default, update in database
        const response = await fetch(`${API_URL}/api/categories/${id}`, {
            method: 'PUT',
            headers: await getHeaders(),
            body: JSON.stringify(data),
        });
        const updatedCategory = await handleResponse<DBCategory>(response);
        return { ...updatedCategory, id: updatedCategory._id, isCustom: true };
    },

    delete: async (id: string) => {
        // Check if it's a default category
        const defaultIndex = modifiedDefaultCategories.findIndex(cat => cat.id === id);
        if (defaultIndex !== -1) {
            // Remove from memory
            modifiedDefaultCategories = modifiedDefaultCategories.filter(cat => cat.id !== id);
            return { message: 'Category deleted successfully' };
        }

        // If not default, delete from database
        const response = await fetch(`${API_URL}/api/categories/${id}`, {
            method: 'DELETE',
            headers: await getHeaders(),
        });
        return handleResponse<{message: string}>(response);
    },

    // New method to reset default categories to original state
    resetDefaults: () => {
        modifiedDefaultCategories = [...ALL_DEFAULT_CATEGORIES];
        return modifiedDefaultCategories;
    }
};

// Auth APIs
export const authAPI = {
    register: async (data: { firstName: string; lastName: string; email: string; password: string }) => {
        const response = await fetch(`${API_URL}/api/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        const result = await handleResponse<AuthResponse>(response);
        // Save token after successful registration
        await storage.set(StorageKeys.USER_DATA, { user: result.user, token: result.token });
        return result;
    },

    login: async (data: { email: string; password: string }) => {
        const response = await fetch(`${API_URL}/api/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        const result = await handleResponse<AuthResponse>(response);
        // Save token after successful login
        await storage.set(StorageKeys.USER_DATA, { user: result.user, token: result.token });
        return result;
    },

    logout: async () => {
        await storage.remove(StorageKeys.USER_DATA);
    },
};

export interface Budget {
    _id?: string;
    name: string;
    amount: number;
    startDate: Date;
    endDate: Date;
    categories: {
        category: string;
        allocatedAmount: number;
        spentAmount: number;
    }[];
    totalSpent: number;
    totalIncome: number;
    availableToBudget: number;
    status: 'active' | 'completed' | 'expired';
    createdAt?: Date;
    updatedAt?: Date;
}

export interface BudgetCreateData {
    name: string;
    totalAmount: number;
    startDate: Date;
    endDate: Date;
    categories: {
        category: string;
        allocatedAmount: number;
        spentAmount: number;
        isPredefined?: boolean;
    }[];
    totalIncome: number;
    availableToBudget: number;
}

// Budget APIs
export const budgetAPI = {
    getAll: async () => {
        const response = await fetch(`${API_URL}/api/budgets`, {
            headers: await getHeaders(),
        });
        return handleResponse<Budget[]>(response);
    },

    getActive: async () => {
        const response = await fetch(`${API_URL}/api/budgets/active`, {
            headers: await getHeaders(),
        });
        return handleResponse<Budget[]>(response);
    },

    getById: async (id: string) => {
        const response = await fetch(`${API_URL}/api/budgets/${id}`, {
            headers: await getHeaders(),
        });
        return handleResponse<Budget>(response);
    },

    create: async (data: BudgetCreateData) => {
        try {
            console.log('Creating budget with data:', data);
            
            // Ensure totalIncome and availableToBudget are included
            const budgetData = {
                ...data,
                totalIncome: data.totalIncome || 0,
                availableToBudget: data.availableToBudget || 0,
            };

            console.log('Sending budget data to API:', budgetData);

            const response = await fetch(`${API_URL}/api/budgets`, {
                method: 'POST',
                headers: await getHeaders(),
                body: JSON.stringify(budgetData),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error response from API:', errorData);
                if (response.status === 400 && errorData.message?.includes('budget already exists')) {
                    throw {
                        code: 'OVERLAPPING_BUDGET',
                        message: 'A budget already exists for this time period',
                        existingBudget: errorData.existingBudget
                    };
                }
                throw errorData;
            }
            
            const budget = await handleResponse<Budget>(response);
            console.log('Budget created response:', budget);
            
            // If the response shows totalIncome or availableToBudget as 0 but we have values,
            // update the budget immediately after creation
            if (budget && 
                ((budget.totalIncome === 0 && budgetData.totalIncome > 0) || 
                 (budget.availableToBudget === 0 && budgetData.availableToBudget !== 0))) {
                console.log('Updating budget with income and available:', {
                    totalIncome: budgetData.totalIncome,
                    availableToBudget: budgetData.availableToBudget
                });
                return await budgetAPI.update(budget._id!, {
                    totalIncome: budgetData.totalIncome,
                    availableToBudget: budgetData.availableToBudget
                });
            }
            
            return budget;
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'OVERLAPPING_BUDGET') {
                throw error;
            }
            console.error('Error creating budget:', error);
            throw new Error('Failed to create budget. Please try again.');
        }
    },

    update: async (id: string, data: {
        name?: string;
        totalAmount?: number;
        totalIncome?: number;
        availableToBudget?: number;
        totalSpent?: number;
        categories?: Array<{
            category: string;
            allocatedAmount: number;
            spentAmount: number;
        }>;
        status?: 'active' | 'completed' | 'expired';
    }) => {
        const response = await fetch(`${API_URL}/api/budgets/${id}`, {
            method: 'PUT',
            headers: await getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse<Budget>(response);
    },

    delete: async (id: string) => {
        const response = await fetch(`${API_URL}/api/budgets/${id}`, {
            method: 'DELETE',
            headers: await getHeaders(),
        });
        return handleResponse<{message: string}>(response);
    },

    updateStatus: async (id: string, status: Budget['status']) => {
        const response = await fetch(`${API_URL}/api/budgets/${id}/status`, {
            method: 'PATCH',
            headers: await getHeaders(),
            body: JSON.stringify({ status }),
        });
        return handleResponse<Budget>(response);
    }
};

export interface TransactionResponse {
    _id: string;
    amount: number;
    description: string;
    category: string;
    date: string;
    isIncome: boolean;
    paymentMethod: string;
    budgetId?: string;
    status?: 'budgeted' | 'pending_assignment' | 'unbudgeted';
    notes?: string;
}

// Add TransactionCreateData interface
interface TransactionCreateData {
    amount: number;
    description: string;
    category: string;
    date: string;
    isIncome: boolean;
    account: string;
    paymentMethod: string;
    budgetId?: string;
    notes?: string;
    status: 'budgeted' | 'unbudgeted';
}

interface UnbudgetedTransactionsResponse {
    transactions: TransactionResponse[];
}

interface AssignTransactionsResponse {
    success: boolean;
    assignedCount: number;
    failedAssignments: { transactionId: string; reason: string }[];
}

export const transactionApi = {
    create: async (data: TransactionCreateData): Promise<TransactionResponse> => {
        try {
            const response = await fetch(`${API_URL}/api/transactions`, {
                method: 'POST',
                headers: await getHeaders(),
                body: JSON.stringify(data),
            });

            const result = await handleResponse<TransactionResponse>(response);
            return result;
        } catch (error) {
            console.error('Error creating transaction:', error);
            throw error;
        }
    },

    delete: async (id: string): Promise<{ message: string }> => {
        const headers = await getHeaders();
        const response = await fetch(`${API_URL}/api/transactions/${id}`, {
            method: "DELETE",
            headers,
        });

        return handleResponse(response);
    },

    // Get all transactions for the user
    getAll: async (): Promise<TransactionResponse[]> => {
        const response = await fetch(`${API_URL}/api/transactions`, {
            headers: await getHeaders(),
        });
        const data = await handleResponse<{ transactions: TransactionResponse[] }>(response);
        return data.transactions;
    },

    // Get transactions for a specific date range
    getByDateRange: async (startDate: string, endDate: string): Promise<{
        pagination: {
            page: number;
            pages: number;
            total: number;
        };
        transactions: TransactionResponse[];
    }> => {
        const headers = await getHeaders();
        const response = await fetch(
            `${API_URL}/api/transactions?startDate=${startDate}&endDate=${endDate}`,
            {
                headers,
            }
        );
        return handleResponse(response);
    },

    // Get unbudgeted transactions
    getUnbudgeted: async (startDate: string, endDate: string): Promise<TransactionResponse[]> => {
        const headers = await getHeaders();
        const response = await fetch(
            `${API_URL}/api/transactions/unbudgeted?startDate=${startDate}&endDate=${endDate}`,
            {
                headers,
            }
        );

        const data = await handleResponse(response) as UnbudgetedTransactionsResponse;
        return data.transactions;
    },

    // Assign transactions to budget
    assignToBudget: async (
        budgetId: string,
        transactions: { transactionId: string; categoryId: string }[]
    ): Promise<AssignTransactionsResponse> => {
        const headers = await getHeaders();
        const response = await fetch(`${API_URL}/api/transactions/assign/${budgetId}`, {
            method: "POST",
            headers,
            body: JSON.stringify({ transactions }),
        });

        return handleResponse(response);
    },
}; 