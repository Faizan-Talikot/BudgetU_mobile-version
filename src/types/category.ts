// Base category interface that matches the database schema
export interface BaseCategory {
    name: string;
    type: 'income' | 'expense';
    icon: string;
    color: string;
}

// Database category interface
export interface DBCategory extends BaseCategory {
    _id: string;
    user: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Client-side category interface
export interface Category {
    _id: string;
    id?: string;
    name: string;
    icon: string;
    color: string;
    type: 'income' | 'expense' | 'transfer';
    spent: number;
    allocated: number;
    isDefault?: boolean;
    isCustom?: boolean;
}

// Budget category interface (used when category is part of a budget)
export interface BudgetCategory extends Category {
    allocatedAmount: number;
    spentAmount: number;
}

// Category creation payload
export interface CreateCategoryPayload {
    name: string;
    type: 'income' | 'expense' | 'transfer';
    icon?: string;
    color?: string;
}

// Category update payload
export interface UpdateCategoryPayload {
    name?: string;
    icon?: string;
    color?: string;
    type?: 'income' | 'expense' | 'transfer';
} 