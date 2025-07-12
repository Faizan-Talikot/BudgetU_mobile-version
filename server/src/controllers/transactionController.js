const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const mongoose = require('mongoose');

// Update budget category spent amount
const updateBudgetCategorySpent = async (transaction, isDelete = false) => {
  // Only update if not income and has a budgetId
  if (transaction.isIncome || !transaction.budgetId) {
    console.log('Skipping budget update - income transaction or no budgetId:', {
      isIncome: transaction.isIncome,
      budgetId: transaction.budgetId
    });
    return;
  }

  try {
    console.log('Starting budget update with transaction:', {
      transactionId: transaction._id,
      budgetId: transaction.budgetId,
      categoryId: transaction.category,
      amount: transaction.amount,
      isDelete
    });

    // Validate that the category is an expense category
    const Category = mongoose.model('Category');
    
    // Check if this is a predefined category (string) or database category (ObjectId)
    if (mongoose.Types.ObjectId.isValid(transaction.category)) {
        // Database category - look it up
        const categoryDoc = await Category.findById(transaction.category);
        if (!categoryDoc) {
            console.error('Category not found for transaction:', transaction.category);
            return null;
        }

        if (categoryDoc.type !== 'expense') {
            console.error('Cannot update budget spent amount for income category:', {
                categoryId: transaction.category,
                categoryName: categoryDoc.name,
                categoryType: categoryDoc.type
            });
            return null;
        }
    } else {
        // Predefined category - check if it's a valid predefined expense category
        const predefinedExpenseCategories = ['Food & Dining', 'Transportation', 'Shopping', 'Bills & Utilities', 'Entertainment', 'Healthcare', 'Education', 'Personal Care'];
        if (!predefinedExpenseCategories.includes(transaction.category)) {
            console.error('Invalid predefined category for budget update:', transaction.category);
            return null;
        }
        console.log('Using predefined expense category for budget update:', transaction.category);
    }

    // Fetch the budget to log all category IDs
    const budget = await Budget.findById(transaction.budgetId);
    if (!budget) {
      console.error('Budget not found for update:', transaction.budgetId);
      return null;
    }
    console.log('Budget categories:', budget.categories.map(c => c.category && c.category.toString ? c.category.toString() : c.category));
    console.log('Incoming transaction category:', transaction.category && transaction.category.toString ? transaction.category.toString() : transaction.category);

    // Try to find the matching category index (robust to string/ObjectId)
    const txCatId = transaction.category && transaction.category.toString ? transaction.category.toString() : transaction.category;
    const catIdx = budget.categories.findIndex(c => {
      const catId = c.category && c.category.toString ? c.category.toString() : c.category;
      return catId === txCatId;
    });

    if (catIdx === -1) {
      console.error('No matching category found in budget for transaction:', txCatId);
      console.error('Budget categories:', budget.categories.map(c => c.category));
      console.error('Transaction category:', txCatId);
      
      // Don't auto-add categories - they should be added during budget creation
      console.error('Category not found in budget. Please add this category to your budget first.');
      return;
    }

    // Update spentAmount and totalSpent
    const amount = Number(transaction.amount);
    budget.categories[catIdx].spentAmount += isDelete ? -amount : amount;
    budget.totalSpent += isDelete ? -amount : amount;
    await budget.save();

    console.log('Budget updated successfully:', {
      budgetId: budget._id,
      updatedCategory: budget.categories[catIdx],
      totalSpent: budget.totalSpent
    });

    return budget;
  } catch (error) {
    console.error('Error updating budget category spent:', error);
    throw error;
  }
};

// Helper function to map account type to payment method
const mapAccountTypeToPaymentMethod = (accountType) => {
  const mapping = {
    'cash': 'cash',
    'card': 'debit_card',
    'credit': 'credit_card',
    'savings': 'bank_transfer',
    'upi': 'bank_transfer',
    'wallet': 'other'
  };
  return mapping[accountType] || 'other';
};

// Create new transaction
const createTransaction = async (req, res) => {
  try {
    const {
      amount,
      description,
      category,
      date,
      isIncome,
      account,
      budgetId,
      location,
      externalId,
      receiptImage,
      notes
    } = req.body;

    console.log('Received transaction request:', {
      amount,
      category,
      budgetId,
      isIncome
    });

    // Get account type for payment method
    const Account = mongoose.model('Account');
    const accountDoc = await Account.findById(account);
    if (!accountDoc) {
      return res.status(400).json({ message: 'Invalid account' });
    }

    // Validate budget exists if budgetId is provided
    if (budgetId) {
      const budget = await Budget.findById(budgetId);
      if (!budget) {
        return res.status(400).json({ message: 'Invalid budget ID' });
      }
      console.log('Found budget:', {
        budgetId: budget._id,
        categories: budget.categories.map(c => ({
          category: c.category,
          spentAmount: c.spentAmount
        }))
      });
    }

    // Validate category exists
    const Category = mongoose.model('Category');
    console.log('Validating category with ID:', category, 'Type:', typeof category);
    
    // Check if category ID is valid ObjectId format
    if (!mongoose.Types.ObjectId.isValid(category)) {
        // This might be a predefined category name - check if it's a valid predefined income category
        const predefinedIncomeCategories = ['Salary', 'Business', 'Investments', 'Gifts', 'Rental'];
        if (predefinedIncomeCategories.includes(category)) {
            console.log('Using predefined income category:', category);
            // For predefined categories, we'll store the name directly
        } else {
            console.error('Invalid category ID format:', category);
            return res.status(400).json({ message: 'Invalid category ID format' });
        }
    } else {
        // Valid ObjectId - check if category exists in database
        const categoryDoc = await Category.findById(category);
        console.log('Category lookup result:', categoryDoc ? 'Found' : 'Not found');
        
        if (!categoryDoc) {
            console.error('Category not found in database:', category);
            return res.status(400).json({ message: 'Invalid category' });
        }
    }

    // Create new transaction
    const newTransaction = new Transaction({
      user: req.userId,
      amount: Number(amount),
      description,
      category,
      date: date || new Date(),
      isIncome: isIncome || false,
      account,
      paymentMethod: mapAccountTypeToPaymentMethod(accountDoc.type),
      budgetId,
      location,
      externalId,
      receiptImage,
      notes
    });

    console.log('Created transaction object:', {
      id: newTransaction._id,
      amount: newTransaction.amount,
      category: newTransaction.category,
      budgetId: newTransaction.budgetId,
      isIncome: newTransaction.isIncome
    });

    // Save transaction to database
    const savedTransaction = await newTransaction.save();

    console.log('Saved transaction:', {
      id: savedTransaction._id,
      amount: savedTransaction.amount,
      category: savedTransaction.category,
      budgetId: savedTransaction.budgetId
    });

    // Update budget category spent amount if applicable
    if (budgetId && !isIncome) {
      const updatedBudget = await updateBudgetCategorySpent(savedTransaction);
      if (updatedBudget) {
        console.log('Budget after update:', {
          budgetId: updatedBudget._id,
          totalSpent: updatedBudget.totalSpent,
          categories: updatedBudget.categories.map(c => ({
            category: c.category,
            spentAmount: c.spentAmount
          }))
        });
      }
    }

    // NEW: Update budget totalIncome and availableToBudget if income
    if (budgetId && isIncome) {
      const budget = await Budget.findById(budgetId);
      if (budget) {
        budget.totalIncome += Number(amount);
        budget.availableToBudget += Number(amount);
        await budget.save();
        console.log('Budget income updated:', {
          budgetId: budget._id,
          totalIncome: budget.totalIncome,
          availableToBudget: budget.availableToBudget
        });
      }
    }

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction: savedTransaction
    });
  } catch (error) {
    console.error('Transaction creation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all transactions for a user
const getUserTransactions = async (req, res) => {
  try {
    // Get query parameters
    const { 
      startDate, 
      endDate, 
      category, 
      isIncome,
      limit = 50,
      page = 1
    } = req.query;

    // Build query
    const query = { user: req.userId };

    // Add date range filter if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Add category filter if provided
    if (category) {
      query.category = category;
    }

    // Add income/expense filter if provided
    if (isIncome !== undefined) {
      query.isIncome = isIncome === 'true';
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const total = await Transaction.countDocuments(query);

    // Get transactions
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    res.json({
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get transaction by ID
const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update transaction
const updateTransaction = async (req, res) => {
  try {
    const {
      amount,
      description,
      category,
      date,
      isIncome,
      paymentMethod,
      budgetId,
      location,
      receiptImage,
      notes
    } = req.body;

    // Find the original transaction first for budget updates
    const originalTransaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!originalTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // If this was linked to a budget, update that budget to remove the amount
    if (!originalTransaction.isIncome && originalTransaction.budgetId) {
      await updateBudgetCategorySpent(originalTransaction, true);
    }

    // Find and update transaction
    const updatedTransaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      {
        amount,
        description,
        category,
        date,
        isIncome,
        paymentMethod,
        budgetId,
        location,
        receiptImage,
        notes
      },
      { new: true }
    );

    // Update new budget category if applicable
    if (!updatedTransaction.isIncome && updatedTransaction.budgetId) {
      await updateBudgetCategorySpent(updatedTransaction);
    }

    // NEW: Update budget totalIncome and availableToBudget if income
    if (updatedTransaction.budgetId && updatedTransaction.isIncome) {
      const budget = await Budget.findById(updatedTransaction.budgetId);
      if (budget) {
        budget.totalIncome += Number(amount);
        budget.availableToBudget += Number(amount);
        await budget.save();
        console.log('Budget income updated:', {
          budgetId: budget._id,
          totalIncome: budget.totalIncome,
          availableToBudget: budget.availableToBudget
        });
      }
    }

    res.json({
      message: 'Transaction updated successfully',
      transaction: updatedTransaction
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete transaction
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // If this was linked to a budget, update that budget to remove the amount
    if (!transaction.isIncome && transaction.budgetId) {
      await updateBudgetCategorySpent(transaction, true);
    }

    // Delete the transaction
    await Transaction.deleteOne({ _id: req.params.id, user: req.userId });

    res.json({
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get spending summary by category
const getSpendingSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date range filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    // Get all transactions for the period
    const transactions = await Transaction.find({
      user: req.userId,
      ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
    });

    // Calculate totals
    let income = 0;
    let expenses = 0;

    transactions.forEach(transaction => {
      if (transaction.isIncome) {
        income += transaction.amount;
      } else {
        expenses += transaction.amount;
      }
    });

    // Calculate balance
    const balance = income - expenses;

    // Aggregate expenses by category
    const categoryData = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.userId),
          ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
          isIncome: false
        }
      },
      {
        $group: {
          _id: '$category',
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { amount: -1 }
      }
    ]);

    // Calculate percentages and format category data
    const categoryBreakdown = categoryData.map(cat => {
      const percentage = expenses > 0 ? (cat.amount / expenses) * 100 : 0;
      
      return {
        category: cat._id,
        amount: cat.amount,
        percentage,
        // Generate random color if needed
        color: generateCategoryColor(cat._id)
      };
    });

    // Send formatted response
    res.json({
      income,
      expenses,
      balance,
      categoryBreakdown
    });
  } catch (error) {
    console.error('Error in getSpendingSummary:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to generate consistent colors for categories
const generateCategoryColor = (category) => {
  const predefinedColors = {
    'Housing': '#8b5cf6',
    'Food': '#ec4899',
    'Shopping': '#14b8a6',
    'Entertainment': '#f59e0b',
    'Education': '#3b82f6',
    'Transportation': '#06b6d4',
    'Utilities': '#10b981',
    'Healthcare': '#ef4444',
    'Groceries': '#84cc16',
    'Rent': '#9333ea',
    'Other': '#6b7280'
  };

  return predefinedColors[category] || `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
};

module.exports = {
  createTransaction,
  getUserTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getSpendingSummary
}; 