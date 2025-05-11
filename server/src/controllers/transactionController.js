const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const mongoose = require('mongoose');

// Update budget category spent amount
const updateBudgetCategorySpent = async (transaction, isDelete = false) => {
  // Only update if not income and has a budgetId
  if (transaction.isIncome || !transaction.budgetId) {
    return;
  }

  try {
    // Find the budget
    const budget = await Budget.findById(transaction.budgetId);
    if (!budget) return;

    // Find the matching category
    const category = budget.categories.find(cat => cat.name === transaction.category);
    if (!category) return;

    // Update the spent amount
    if (isDelete) {
      // If deleting, subtract the amount
      category.spent = Math.max(0, category.spent - transaction.amount);
    } else {
      // If creating or updating, add the amount
      category.spent += transaction.amount;
    }

    // Save the budget
    await budget.save();
  } catch (error) {
    console.error('Error updating budget category:', error);
  }
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
      paymentMethod,
      budgetId,
      location,
      externalId,
      receiptImage,
      notes
    } = req.body;

    // Create new transaction
    const newTransaction = new Transaction({
      user: req.userId,
      amount,
      description,
      category,
      date: date || new Date(),
      isIncome: isIncome || false,
      paymentMethod,
      budgetId,
      location,
      externalId,
      receiptImage,
      notes
    });

    // Save transaction to database
    await newTransaction.save();

    // Update budget category spent amount if applicable
    await updateBudgetCategorySpent(newTransaction);

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction: newTransaction
    });
  } catch (error) {
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