const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
    getBudgets,
    getBudget,
    createBudget,
    updateBudget,
    deleteBudget,
    getActiveBudgets,
    updateBudgetStatus,
    getBudgetSummary
} = require('../controllers/budgetController');

// Debug log to check imported functions
console.log('Imported functions:', {
    getBudgets: !!getBudgets,
    getBudget: !!getBudget,
    createBudget: !!createBudget,
    updateBudget: !!updateBudget,
    deleteBudget: !!deleteBudget,
    getActiveBudgets: !!getActiveBudgets,
    updateBudgetStatus: !!updateBudgetStatus,
    getBudgetSummary: !!getBudgetSummary
});

// Get all budgets (non-parameterized route first)
router.get('/', authenticate, getBudgets);

// Get active budgets (non-parameterized route)
router.get('/active', authenticate, getActiveBudgets);

// Create new budget (non-parameterized route)
router.post('/', authenticate, createBudget);

// Routes with parameters
router.get('/:id', authenticate, getBudget);
router.get('/:id/summary', authenticate, getBudgetSummary);
router.put('/:id', authenticate, updateBudget);
router.delete('/:id', authenticate, deleteBudget);
router.patch('/:id/status', authenticate, updateBudgetStatus);

module.exports = router; 