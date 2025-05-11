const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const { authenticate } = require('../middleware/auth');

// All budget routes require authentication
router.use(authenticate);

// Budget routes
router.get('/', budgetController.getBudgets);
router.get('/active', budgetController.getActiveBudgets);
router.get('/:id', budgetController.getBudgetById);
router.get('/:id/summary', budgetController.getBudgetSummary);
router.post('/', budgetController.createBudget);
router.put('/:id', budgetController.updateBudget);
router.delete('/:id', budgetController.deleteBudget);

// Budget category routes
router.post('/:id/categories', budgetController.addBudgetCategory);
router.put('/:id/categories', budgetController.updateBudgetCategory);
router.delete('/:id/categories/:categoryId', budgetController.deleteBudgetCategory);

// Recurring budget route
router.post('/:id/recurring', budgetController.createRecurringBudget);

module.exports = router; 