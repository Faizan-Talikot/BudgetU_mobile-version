import { budgetAPI } from './api';
import { format } from 'date-fns';

export interface Transaction {
    _id: string;
    type: 'income' | 'expense' | 'transfer';
    amount: number;
    description: string;
    category: string;
    date: string;
    time: string;
    account: string;
    status: 'budgeted' | 'pending_assignment' | 'unbudgeted';
    notes?: string;
}

export interface Account {
    id: string;
    name: string;
    balance: number;
    type: string;
}

export interface Budget {
    id: string;
    startDate: string;
    endDate: string;
    categories: {
        id: string;
        name: string;
        allocated: number;
        spent: number;
    }[];
}

// Helper function to convert API budget to internal format
const convertApiBudgetToInternal = (apiBudget: any): Budget => {
    return {
        id: apiBudget._id || '',
        startDate: apiBudget.startDate,
        endDate: apiBudget.endDate,
        categories: apiBudget.categories.map((cat: any) => ({
            id: cat.category,
            name: cat.name || '',
            allocated: cat.allocatedAmount,
            spent: cat.spentAmount
        }))
    };
};

class TransactionService {
    // Find matching budget for a transaction date
    private async findMatchingBudget(date: string): Promise<Budget | null> {
        try {
            const activeBudgets = await budgetAPI.getActive();
            const matchingBudget = activeBudgets.find(budget => {
                const transactionDate = new Date(date);
                const budgetStart = new Date(budget.startDate);
                const budgetEnd = new Date(budget.endDate);
                return transactionDate >= budgetStart && transactionDate <= budgetEnd;
            });
            
            return matchingBudget ? convertApiBudgetToInternal(matchingBudget) : null;
        } catch (error) {
            console.error('Error finding matching budget:', error);
            return null;
        }
    }

    // Validate transaction against budget category
    private validateBudgetCategory(budget: Budget, categoryId: string, amount: number): {
        isValid: boolean;
        message?: string;
    } {
        const category = budget.categories.find(c => c.id === categoryId);
        if (!category) {
            return {
                isValid: false,
                message: 'Category not found in budget'
            };
        }

        const remainingBudget = category.allocated - category.spent;
        if (amount > remainingBudget) {
            return {
                isValid: true, // Still valid but over budget
                message: `Transaction will exceed category budget by ${amount - remainingBudget}`
            };
        }

        return { isValid: true };
    }

    // Create a new transaction with budget detection
    async createTransaction(data: {
        amount: number;
        description: string;
        category: string;
        date: string;
        time: string;
        type: 'income' | 'expense' | 'transfer';
        account: string;
        forceUnbudgeted?: boolean;
        notes?: string;
    }): Promise<{
        transaction: Transaction;
        warnings: string[];
        budgetImpact?: {
            categoryRemaining: number;
            budgetRemaining: number;
        };
    }> {
        const warnings: string[] = [];
        let transactionStatus: Transaction['status'] = 'unbudgeted';
        let matchingBudget: Budget | null = null;

        try {
            // Step 1: Find matching budget if not forcing unbudgeted
            if (!data.forceUnbudgeted && data.type !== 'transfer') {
                matchingBudget = await this.findMatchingBudget(data.date);
                if (matchingBudget) {
                    // Validate category if expense
                    if (data.type === 'expense') {
                        const validation = this.validateBudgetCategory(
                            matchingBudget,
                            data.category,
                            data.amount
                        );
                        if (validation.message) {
                            warnings.push(validation.message);
                        }
                        if (validation.isValid) {
                            transactionStatus = 'budgeted';
                        }
                    } else {
                        transactionStatus = 'budgeted';
                    }
                } else {
                    transactionStatus = 'pending_assignment';
                    warnings.push(`No active budget found for ${format(new Date(data.date), 'MMMM yyyy')}`);
                }
            }

            // Step 2: Create transaction object
            const transaction: Transaction = {
                _id: `temp-${Date.now()}`, // Will be replaced by server
                ...data,
                status: transactionStatus
            };

            // Step 3: Calculate budget impact if budgeted
            let budgetImpact;
            if (matchingBudget && transactionStatus === 'budgeted') {
                const category = matchingBudget.categories.find(c => c.id === data.category);
                if (category) {
                    budgetImpact = {
                        categoryRemaining: category.allocated - (category.spent + data.amount),
                        budgetRemaining: matchingBudget.categories.reduce(
                            (total, cat) => total + (cat.allocated - cat.spent),
                            0
                        ) - data.amount
                    };
                }
            }

            return {
                transaction,
                warnings,
                budgetImpact
            };
        } catch (error) {
            console.error('Error creating transaction:', error);
            throw new Error('Failed to create transaction');
        }
    }

    // Get unbudgeted transactions for a period
    async getUnbudgetedTransactions(startDate: string, endDate: string): Promise<Transaction[]> {
        try {
            const response = await fetch(`/api/transactions?status=pending_assignment&startDate=${startDate}&endDate=${endDate}`);
            const data = await response.json();
            return data.transactions;
        } catch (error) {
            console.error('Error fetching unbudgeted transactions:', error);
            return [];
        }
    }

    // Assign transactions to a budget
    async assignTransactionsToBudget(
        budgetId: string,
        transactions: { transactionId: string; categoryId: string }[]
    ): Promise<{
        success: boolean;
        assignedCount: number;
        failedAssignments: { transactionId: string; reason: string }[];
    }> {
        try {
            const response = await fetch(`/api/budgets/${budgetId}/assign-transactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ transactions })
            });
            return await response.json();
        } catch (error) {
            console.error('Error assigning transactions to budget:', error);
            throw new Error('Failed to assign transactions to budget');
        }
    }

    // Update account balance
    private async updateAccountBalance(
        accountId: string,
        amount: number,
        type: 'credit' | 'debit'
    ): Promise<void> {
        try {
            const response = await fetch(`/api/accounts/${accountId}/balance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount,
                    type
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to update account balance');
            }
        } catch (error) {
            console.error('Error updating account balance:', error);
            throw error;
        }
    }
}

export const transactionService = new TransactionService(); 