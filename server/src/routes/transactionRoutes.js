const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticate } = require('../middleware/auth');

// All transaction routes are protected
router.use(authenticate);

// Transaction routes
router.post('/', transactionController.createTransaction);
router.get('/', transactionController.getUserTransactions);
router.get('/summary', transactionController.getSpendingSummary);
router.get('/:id', transactionController.getTransactionById);
router.put('/:id', transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router; 