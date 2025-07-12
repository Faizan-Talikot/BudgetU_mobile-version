const mongoose = require('mongoose');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');

// Calculate the total spent amount for a budget by aggregating transactions
const calculateBudgetSpent = async (budgetId, userId) => {
  try {
    // Find all non-income transactions linked to this budget
    const transactions = await Transaction.find({
      budgetId,
      user: userId,
      isIncome: false
    });
    
    // Sum up the transaction amounts
    return transactions.reduce((total, transaction) => total + transaction.amount, 0);
  } catch (error) {
    console.error('Error calculating budget spent:', error);
    return 0;
  }
};

// Get all budgets for a user
const getBudgets = async (req, res) => {
  try {
        const budgets = await Budget.find({ user: req.userId })
            .populate('categories.category')
            .sort({ startDate: -1 });
        res.json(budgets);
  } catch (error) {
        res.status(500).json({ message: 'Error fetching budgets', error: error.message });
  }
};

// Get active budgets
const getActiveBudgets = async (req, res) => {
  try {
        const budgets = await Budget.find({ 
      user: req.userId,
            status: 'active',
            endDate: { $gte: new Date() }
        }).populate('categories.category')
          .sort({ startDate: 1 });
        
        res.json(budgets);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching active budgets', error: error.message });
    }
};

// Get a specific budget
const getBudget = async (req, res) => {
    try {
        const budget = await Budget.findOne({ 
            _id: req.params.id, 
            user: req.userId 
        }).populate('categories.category');

        if (!budget) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        res.json(budget);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching budget', error: error.message });
    }
};

// Create a new budget
const createBudget = async (req, res) => {
    try {
        const { name, totalAmount, startDate, endDate, categories } = req.body;

        // Debug logging
        console.log('Received budget data:', {
            name,
            totalAmount,
            startDate,
            endDate,
            categories,
            userId: req.userId
        });

        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start >= end) {
            return res.status(400).json({ 
                message: 'End date must be after start date' 
            });
        }

        // Check for overlapping budgets
        const overlappingBudget = await Budget.findOne({
            user: req.userId,
            $or: [
                // New budget starts during an existing budget
                {
                    startDate: { $lte: start },
                    endDate: { $gte: start }
                },
                // New budget ends during an existing budget
                {
                    startDate: { $lte: end },
                    endDate: { $gte: end }
                },
                // New budget completely contains an existing budget
                {
                    startDate: { $gte: start },
                    endDate: { $lte: end }
                }
            ]
        });

        if (overlappingBudget) {
            return res.status(400).json({
                message: 'A budget already exists for this time period',
                existingBudget: {
                    name: overlappingBudget.name,
                    startDate: overlappingBudget.startDate,
                    endDate: overlappingBudget.endDate
                }
            });
        }

        // Process categories
        const processedCategories = categories.map(cat => {
            // If it's a predefined category or already marked as predefined, use as is
            if (cat.isPredefined || (typeof cat.category === 'string' && (cat.category.startsWith('expense-') || cat.category.startsWith('income-')))) {
                return {
                    category: cat.category,
                    allocatedAmount: cat.allocatedAmount,
                    spentAmount: cat.spentAmount || 0,
                    isPredefined: true
                };
            }

            // For custom categories, validate ObjectId
            if (!mongoose.Types.ObjectId.isValid(cat.category)) {
                throw new Error(`Invalid category ID: ${cat.category}`);
            }

            return {
                category: cat.category,
                allocatedAmount: cat.allocatedAmount,
                spentAmount: cat.spentAmount || 0,
                isPredefined: false
            };
        });

        // Create budget object with processed categories
        const budgetData = {
            user: req.userId,
            name,
            amount: totalAmount,
            startDate: start,
            endDate: end,
            categories: processedCategories
        };
        console.log('Creating budget with data:', budgetData);

        // Create budget
        const budget = new Budget(budgetData);
        await budget.save();
        
        // Populate category details before sending response
        await budget.populate('categories.category');
        
        res.status(201).json(budget);
    } catch (error) {
        console.error('Budget creation error:', error);
        res.status(400).json({ message: 'Error creating budget', error: error.message });
    }
};

// Update a budget
const updateBudget = async (req, res) => {
    try {
        const { name, totalAmount, totalIncome, availableToBudget, categories } = req.body;
        const budget = await Budget.findOne({ 
            _id: req.params.id, 
            user: req.userId 
        });

        if (!budget) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        // Update basic fields
        if (name) budget.name = name;
        if (totalAmount) budget.amount = totalAmount;
        if (totalIncome !== undefined) budget.totalIncome = totalIncome;
        if (availableToBudget !== undefined) budget.availableToBudget = availableToBudget;
        
        // Update categories if provided - ONLY allow expense categories
        if (categories) {
            // Validate that all categories are expense categories
            const Category = mongoose.model('Category');
            const categoryValidationPromises = categories.map(async (cat) => {
                // Skip validation for predefined categories (they should already be validated)
                if (typeof cat.category === 'string' && (cat.category.startsWith('expense-') || cat.category.startsWith('income-'))) {
                    // Only allow expense predefined categories
                    if (cat.category.startsWith('income-')) {
                        throw new Error(`Income categories cannot be added to budget: ${cat.category}`);
                    }
                    return true;
                }
                
                // For database categories, validate the type
                if (mongoose.Types.ObjectId.isValid(cat.category)) {
                    const categoryDoc = await Category.findById(cat.category);
                    if (!categoryDoc) {
                        throw new Error(`Category not found: ${cat.category}`);
                    }
                    if (categoryDoc.type !== 'expense') {
                        throw new Error(`Only expense categories can be added to budget. Category "${categoryDoc.name}" is of type "${categoryDoc.type}"`);
                    }
                    return true;
                }
                
                throw new Error(`Invalid category ID: ${cat.category}`);
            });
            
            await Promise.all(categoryValidationPromises);
            
            budget.categories = categories.map(cat => ({
                category: cat.category,
                allocatedAmount: cat.allocatedAmount,
                spentAmount: cat.spentAmount || 0
            }));
        }

        await budget.save();
        await budget.populate('categories.category');
        
        res.json(budget);
    } catch (error) {
        console.error('Budget update error:', error);
        res.status(400).json({ message: 'Error updating budget', error: error.message });
    }
};

// Delete a budget
const deleteBudget = async (req, res) => {
    try {
        const budget = await Budget.findOne({ 
            _id: req.params.id, 
            user: req.userId 
        });

        if (!budget) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        await Budget.deleteOne({ _id: budget._id });
        res.json({ message: 'Budget deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting budget', error: error.message });
    }
};

// Update budget status
const updateBudgetStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const budget = await Budget.findOne({ 
            _id: req.params.id, 
            user: req.userId 
        });

        if (!budget) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        if (!['active', 'completed', 'expired'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        budget.status = status;
        await budget.save();
        
        res.json(budget);
  } catch (error) {
        res.status(400).json({ message: 'Error updating budget status', error: error.message });
  }
};

// Get budget summary
const getBudgetSummary = async (req, res) => {
  try {
    const budget = await Budget.findOne({ 
      _id: req.params.id,
      user: req.userId 
    });
    
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    
    const budgetObj = budget.toObject();
    
    // Calculate total spent from transactions
    budgetObj.spent = await calculateBudgetSpent(budget._id, req.userId);
    
    // Also update the spent amount for each category
    if (budgetObj.categories && budgetObj.categories.length > 0) {
      // Get all transactions for this budget
      const transactions = await Transaction.find({
        budgetId: budget._id,
        user: req.userId,
        isIncome: false
      });
      
      // Create a map to track spending by category
      const categorySpending = {};
      transactions.forEach(transaction => {
        if (!categorySpending[transaction.category]) {
          categorySpending[transaction.category] = 0;
        }
        categorySpending[transaction.category] += transaction.amount;
      });
      
      // Update each category's spent amount
      budgetObj.categories = budgetObj.categories.map(category => {
        return {
          ...category,
          spent: categorySpending[category.name] || 0
        };
      });
    }
    
    res.json(budgetObj);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getBudgets,
  getActiveBudgets,
    getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
    updateBudgetStatus,
    getBudgetSummary
}; 