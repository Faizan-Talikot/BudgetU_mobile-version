const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

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

// Get all budgets for current user
const getBudgets = async (req, res) => {
  try {
    let budgets = await Budget.find({ user: req.userId }).sort({ createdAt: -1 });
    
    // Calculate the spent amount for each budget based on linked transactions
    const budgetsWithSpent = await Promise.all(budgets.map(async budget => {
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
      
      return budgetObj;
    }));
    
    res.json(budgetsWithSpent);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get active budgets
const getActiveBudgets = async (req, res) => {
  try {
    let budgets = await Budget.find({ 
      user: req.userId,
      isActive: true 
    }).sort({ startDate: -1 });
    
    // Calculate the spent amount for each budget based on linked transactions
    const budgetsWithSpent = await Promise.all(budgets.map(async budget => {
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
      
      return budgetObj;
    }));
    
    res.json(budgetsWithSpent);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a specific budget by ID
const getBudgetById = async (req, res) => {
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

// Create a new budget
const createBudget = async (req, res) => {
  try {
    const { 
      name, 
      totalAmount, 
      startDate, 
      endDate, 
      categories, 
      isRecurring,
      recurringPeriod 
    } = req.body;

    // Default categories if none provided
    const defaultCategories = [
      { name: "Housing", amount: totalAmount * 0.4, spent: 0, color: "#8b5cf6", icon: "home" },
      { name: "Food", amount: totalAmount * 0.3, spent: 0, color: "#ec4899", icon: "utensils" },
      { name: "Shopping", amount: totalAmount * 0.1, spent: 0, color: "#14b8a6", icon: "shopping-bag" },
      { name: "Entertainment", amount: totalAmount * 0.1, spent: 0, color: "#f59e0b", icon: "coffee" },
      { name: "Education", amount: totalAmount * 0.1, spent: 0, color: "#3b82f6", icon: "book" },
    ];

    const newBudget = new Budget({
      user: req.userId,
      name,
      totalAmount,
      startDate,
      endDate,
      categories: categories || defaultCategories,
      isRecurring: isRecurring || false,
      recurringPeriod: recurringPeriod || 'monthly'
    });

    await newBudget.save();
    res.status(201).json(newBudget);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a budget
const updateBudget = async (req, res) => {
  try {
    const { 
      name, 
      totalAmount, 
      startDate, 
      endDate, 
      categories, 
      isActive,
      isRecurring,
      recurringPeriod 
    } = req.body;

    const budget = await Budget.findOne({ _id: req.params.id, user: req.userId });
    
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    // Update fields
    if (name) budget.name = name;
    if (totalAmount) budget.totalAmount = totalAmount;
    if (startDate) budget.startDate = startDate;
    if (endDate) budget.endDate = endDate;
    if (categories) budget.categories = categories;
    if (isActive !== undefined) budget.isActive = isActive;
    if (isRecurring !== undefined) budget.isRecurring = isRecurring;
    if (recurringPeriod) budget.recurringPeriod = recurringPeriod;

    await budget.save();
    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a budget
const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ 
      _id: req.params.id,
      user: req.userId 
    });
    
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    
    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a budget category
const updateBudgetCategory = async (req, res) => {
  try {
    const { categoryId, name, amount, color, icon, isEssential } = req.body;
    
    const budget = await Budget.findOne({ _id: req.params.id, user: req.userId });
    
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    
    const category = budget.categories.id(categoryId);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Update category fields
    if (name) category.name = name;
    if (amount) category.amount = amount;
    if (color) category.color = color;
    if (icon) category.icon = icon;
    if (isEssential !== undefined) category.isEssential = isEssential;
    
    await budget.save();
    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add a new category to a budget
const addBudgetCategory = async (req, res) => {
  try {
    const { name, amount, color, icon, isEssential } = req.body;
    
    const budget = await Budget.findOne({ _id: req.params.id, user: req.userId });
    
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    
    budget.categories.push({
      name,
      amount,
      spent: 0,
      color: color || '#4338ca',
      icon: icon || 'dollar-sign',
      isEssential: isEssential || false
    });
    
    await budget.save();
    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a category from a budget
const deleteBudgetCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    const budget = await Budget.findOne({ _id: req.params.id, user: req.userId });
    
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    
    budget.categories.id(categoryId).remove();
    await budget.save();
    
    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get budget summary with spending data
const getBudgetSummary = async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, user: req.userId });
    
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    
    // Get transactions that fall within this budget's date range
    const transactions = await Transaction.find({
      user: req.userId,
      date: { $gte: budget.startDate, $lte: budget.endDate },
      isIncome: false // Only count expenses, not income
    });
    
    // Calculate category spending
    const categorySpending = {};
    budget.categories.forEach(cat => {
      categorySpending[cat.name] = { allocated: cat.amount, spent: 0 };
    });
    
    // Map transactions to categories
    transactions.forEach(transaction => {
      // If category exists in the budget, add to its spending
      if (categorySpending[transaction.category]) {
        categorySpending[transaction.category].spent += transaction.amount;
      } else {
        // Handle transactions with categories not in the budget
        categorySpending['Other'] = categorySpending['Other'] || { allocated: 0, spent: 0 };
        categorySpending['Other'].spent += transaction.amount;
      }
    });
    
    // Calculate totals
    const totalAllocated = budget.getTotalAllocated();
    const totalSpent = Object.values(categorySpending).reduce((sum, cat) => sum + cat.spent, 0);
    const totalRemaining = totalAllocated - totalSpent;
    
    res.json({
      id: budget._id,
      name: budget.name,
      startDate: budget.startDate,
      endDate: budget.endDate,
      totalAmount: budget.totalAmount,
      totalAllocated,
      totalSpent,
      totalRemaining,
      categories: categorySpending,
      isActive: budget.isActive
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new recurring budget instance
const createRecurringBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, user: req.userId });
    
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    
    if (!budget.isRecurring) {
      return res.status(400).json({ message: 'This is not a recurring budget' });
    }
    
    // Create next recurring budget
    const newBudget = await budget.createNextRecurring();
    
    // Mark current budget as inactive
    budget.isActive = false;
    await budget.save();
    
    res.status(201).json(newBudget);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getBudgets,
  getActiveBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
  updateBudgetCategory,
  addBudgetCategory,
  deleteBudgetCategory,
  getBudgetSummary,
  createRecurringBudget
}; 