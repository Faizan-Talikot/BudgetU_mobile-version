import { apiConfig } from './config';

// API base URL
const API_URL = apiConfig.API_URL;

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
    try {
        const contentType = response.headers.get('content-type');

        // Check if response is JSON
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();

            if (!response.ok) {
                const errorMsg = data.message || 'An error occurred';
                console.error(`API Error (${response.status}): ${errorMsg}`, data);
                throw new Error(errorMsg);
            }

            return data;
        } else {
            // Handle non-JSON responses
            const text = await response.text();

            if (!response.ok) {
                console.error(`API Error (${response.status}): Non-JSON response`, text);
                throw new Error(`Server error (${response.status})`);
            }

            return { message: text };
        }
    } catch (error) {
        console.error('Error processing API response:', error);
        throw error;
    }
};

// Auth API
export const authApi = {
    login: async (email: string, password: string) => {
        const response = await fetch(`${API_URL}/users/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        return handleResponse(response);
    },

    register: async (userData: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
    }) => {
        const response = await fetch(`${API_URL}/users/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        });

        return handleResponse(response);
    },

    getProfile: async () => {
        const token = localStorage.getItem("budgetu-token");

        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await fetch(`${API_URL}/users/profile`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return handleResponse(response);
    },

    changePassword: async (currentPassword: string, newPassword: string) => {
        const token = localStorage.getItem("budgetu-token");

        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await fetch(`${API_URL}/users/change-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ currentPassword, newPassword }),
        });

        return handleResponse(response);
    },
};

// Budget API
export const budgetApi = {
    // Get all budgets
    getBudgets: async () => {
        const token = localStorage.getItem("budgetu-token");

        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await fetch(`${API_URL}/budgets`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return handleResponse(response);
    },

    // Get active budgets
    getActiveBudgets: async () => {
        const token = localStorage.getItem("budgetu-token");

        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await fetch(`${API_URL}/budgets/active`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return handleResponse(response);
    },

    // Get budget by ID
    getBudgetById: async (id: string) => {
        const token = localStorage.getItem("budgetu-token");

        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await fetch(`${API_URL}/budgets/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return handleResponse(response);
    },

    // Get budget summary
    getBudgetSummary: async (id: string) => {
        const token = localStorage.getItem("budgetu-token");

        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await fetch(`${API_URL}/budgets/${id}/summary`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return handleResponse(response);
    },

    // Create a new budget
    createBudget: async (budgetData: {
        name: string;
        totalAmount: number;
        startDate: string;
        endDate: string;
        categories?: Array<{
            name: string;
            amount: number;
            color?: string;
            icon?: string;
            isEssential?: boolean;
        }>;
        isRecurring?: boolean;
        recurringPeriod?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    }) => {
        const token = localStorage.getItem("budgetu-token");

        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await fetch(`${API_URL}/budgets`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(budgetData),
        });

        return handleResponse(response);
    },

    // Update a budget
    updateBudget: async (id: string, budgetData: {
        name?: string;
        totalAmount?: number;
        startDate?: string;
        endDate?: string;
        categories?: Array<{
            name: string;
            amount: number;
            color?: string;
            icon?: string;
            isEssential?: boolean;
        }>;
        isActive?: boolean;
        isRecurring?: boolean;
        recurringPeriod?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    }) => {
        const token = localStorage.getItem("budgetu-token");

        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await fetch(`${API_URL}/budgets/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(budgetData),
        });

        return handleResponse(response);
    },

    // Delete a budget
    deleteBudget: async (id: string) => {
        const token = localStorage.getItem("budgetu-token");

        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await fetch(`${API_URL}/budgets/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return handleResponse(response);
    },

    // Add a category to a budget
    addBudgetCategory: async (id: string, categoryData: {
        name: string;
        amount: number;
        color?: string;
        icon?: string;
        isEssential?: boolean;
    }) => {
        const token = localStorage.getItem("budgetu-token");

        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await fetch(`${API_URL}/budgets/${id}/categories`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(categoryData),
        });

        return handleResponse(response);
    },

    // Update a budget category
    updateBudgetCategory: async (id: string, categoryData: {
        categoryId: string;
        name?: string;
        amount?: number;
        color?: string;
        icon?: string;
        isEssential?: boolean;
    }) => {
        const token = localStorage.getItem("budgetu-token");

        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await fetch(`${API_URL}/budgets/${id}/categories`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(categoryData),
        });

        return handleResponse(response);
    },

    // Delete a budget category
    deleteBudgetCategory: async (budgetId: string, categoryId: string) => {
        const token = localStorage.getItem("budgetu-token");

        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await fetch(`${API_URL}/budgets/${budgetId}/categories/${categoryId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return handleResponse(response);
    },

    // Create next recurring budget
    createRecurringBudget: async (id: string) => {
        const token = localStorage.getItem("budgetu-token");

        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await fetch(`${API_URL}/budgets/${id}/recurring`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return handleResponse(response);
    },
};

// Transaction API
export const transactionApi = {
    // Get all transactions with filtering
    getTransactions: async (filters = {}) => {
        const token = localStorage.getItem("budgetu-token");

        if (!token) {
            throw new Error("No authentication token found");
        }

        // Convert filters object to query string
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                queryParams.append(key, String(value));
            }
        });

        const response = await fetch(`${API_URL}/transactions?${queryParams.toString()}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return handleResponse(response);
    },

    // Get transaction by ID
    getTransactionById: async (id: string) => {
        const token = localStorage.getItem("budgetu-token");

        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await fetch(`${API_URL}/transactions/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return handleResponse(response);
    },

    // Create a new transaction
    createTransaction: async (transactionData: {
        amount: number;
        description: string;
        category: string;
        date?: string;
        isIncome?: boolean;
        paymentMethod?: string;
        budgetId?: string;
        location?: string;
        receiptImage?: string;
        notes?: string;
    }) => {
        const token = localStorage.getItem("budgetu-token");

        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await fetch(`${API_URL}/transactions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(transactionData),
        });

        return handleResponse(response);
    },

    // Update a transaction
    updateTransaction: async (id: string, transactionData: {
        amount?: number;
        description?: string;
        category?: string;
        date?: string;
        isIncome?: boolean;
        paymentMethod?: string;
        budgetId?: string;
        location?: string;
        receiptImage?: string;
        notes?: string;
    }) => {
        const token = localStorage.getItem("budgetu-token");

        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await fetch(`${API_URL}/transactions/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(transactionData),
        });

        return handleResponse(response);
    },

    // Delete a transaction
    deleteTransaction: async (id: string) => {
        const token = localStorage.getItem("budgetu-token");

        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await fetch(`${API_URL}/transactions/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return handleResponse(response);
    },

    // Get spending summary by category
    getSpendingSummary: async (startDate?: string, endDate?: string) => {
        const token = localStorage.getItem("budgetu-token");

        if (!token) {
            throw new Error("No authentication token found");
        }

        // Create query string if dates are provided
        let queryString = "";
        if (startDate || endDate) {
            const params = new URLSearchParams();
            if (startDate) params.append("startDate", startDate);
            if (endDate) params.append("endDate", endDate);
            queryString = `?${params.toString()}`;
        }

        const response = await fetch(`${API_URL}/transactions/summary${queryString}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return handleResponse(response);
    },

    // Upload receipt image
    uploadReceiptImage: async (file: File) => {
        const token = localStorage.getItem("budgetu-token");

        if (!token) {
            throw new Error("No authentication token found");
        }

        const formData = new FormData();
        formData.append("receipt", file);

        const response = await fetch(`${API_URL}/transactions/upload-receipt`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        return handleResponse(response);
    },
};

// Helper to check if user is authenticated
export const isAuthenticated = () => {
    return !!localStorage.getItem("budgetu-token");
};

// Helper to get user data from localStorage
export const getUserData = () => {
    const userJson = localStorage.getItem("budgetu-user");
    return userJson ? JSON.parse(userJson) : null;
};

// Helper to logout user
export const logout = () => {
    localStorage.removeItem("budgetu-token");
    localStorage.removeItem("budgetu-user");
};

export default {
    auth: authApi,
    budget: budgetApi,
    transaction: transactionApi,
    isAuthenticated,
    getUserData,
    logout,
}; 