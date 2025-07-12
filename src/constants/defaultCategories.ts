import { Category } from '../types/category';

export const DEFAULT_INCOME_CATEGORIES = [
    {
        _id: '507f1f77bcf86cd799439011',
        id: '507f1f77bcf86cd799439011',
        name: 'Salary',
        icon: 'cash-outline',
        color: '#4CAF50',
        type: 'income' as const,
        spent: 0,
        allocated: 0,
        isDefault: true
    },
    {
        _id: '507f1f77bcf86cd799439012',
        id: '507f1f77bcf86cd799439012',
        name: 'Business',
        icon: 'briefcase-outline',
        color: '#2196F3',
        type: 'income' as const,
        spent: 0,
        allocated: 0,
        isDefault: true
    },
    {
        _id: '507f1f77bcf86cd799439013',
        id: '507f1f77bcf86cd799439013',
        name: 'Investments',
        icon: 'trending-up-outline',
        color: '#9C27B0',
        type: 'income' as const,
        spent: 0,
        allocated: 0,
        isDefault: true
    },
    {
        _id: '507f1f77bcf86cd799439014',
        id: '507f1f77bcf86cd799439014',
        name: 'Gifts',
        icon: 'gift-outline',
        color: '#E91E63',
        type: 'income' as const,
        spent: 0,
        allocated: 0,
        isDefault: true
    },
    {
        _id: '507f1f77bcf86cd799439015',
        id: '507f1f77bcf86cd799439015',
        name: 'Rental',
        icon: 'home-outline',
        color: '#FF9800',
        type: 'income' as const,
        spent: 0,
        allocated: 0,
        isDefault: true
    },
];

export const DEFAULT_EXPENSE_CATEGORIES = [
    {
        _id: '507f1f77bcf86cd799439021',
        id: '507f1f77bcf86cd799439021',
        name: 'Food & Dining',
        icon: 'restaurant-outline',
        color: '#FF6B6B',
        type: 'expense' as const,
        spent: 0,
        allocated: 0,
        isDefault: true
    },
    {
        _id: '507f1f77bcf86cd799439022',
        id: '507f1f77bcf86cd799439022',
        name: 'Transportation',
        icon: 'car-outline',
        color: '#4ECDC4',
        type: 'expense' as const,
        spent: 0,
        allocated: 0,
        isDefault: true
    },
    {
        _id: '507f1f77bcf86cd799439023',
        id: '507f1f77bcf86cd799439023',
        name: 'Shopping',
        icon: 'cart-outline',
        color: '#45B7D1',
        type: 'expense' as const,
        spent: 0,
        allocated: 0,
        isDefault: true
    },
    {
        _id: '507f1f77bcf86cd799439024',
        id: '507f1f77bcf86cd799439024',
        name: 'Bills & Utilities',
        icon: 'receipt-outline',
        color: '#96CEB4',
        type: 'expense' as const,
        spent: 0,
        allocated: 0,
        isDefault: true
    },
    {
        _id: '507f1f77bcf86cd799439025',
        id: '507f1f77bcf86cd799439025',
        name: 'Entertainment',
        icon: 'film-outline',
        color: '#D4A5A5',
        type: 'expense' as const,
        spent: 0,
        allocated: 0,
        isDefault: true
    },
    {
        _id: '507f1f77bcf86cd799439026',
        id: '507f1f77bcf86cd799439026',
        name: 'Healthcare',
        icon: 'medical-outline',
        color: '#FF9999',
        type: 'expense' as const,
        spent: 0,
        allocated: 0,
        isDefault: true
    },
    {
        _id: '507f1f77bcf86cd799439027',
        id: '507f1f77bcf86cd799439027',
        name: 'Education',
        icon: 'school-outline',
        color: '#9DC8C8',
        type: 'expense' as const,
        spent: 0,
        allocated: 0,
        isDefault: true
    },
    {
        _id: '507f1f77bcf86cd799439028',
        id: '507f1f77bcf86cd799439028',
        name: 'Personal Care',
        icon: 'person-outline',
        color: '#58B19F',
        type: 'expense' as const,
        spent: 0,
        allocated: 0,
        isDefault: true
    },
];

export const ALL_DEFAULT_CATEGORIES = [...DEFAULT_INCOME_CATEGORIES, ...DEFAULT_EXPENSE_CATEGORIES]; 