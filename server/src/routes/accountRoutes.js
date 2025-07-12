const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const { authenticate } = require('../middleware/auth');

// All routes are protected with auth middleware
router.use(authenticate);

// Get all accounts
router.get('/', accountController.getAccounts);

// Create new account
router.post('/', accountController.createAccount);

// Update account
router.put('/:id', accountController.updateAccount);

// Delete account
router.delete('/:id', accountController.deleteAccount);

// Get account balance
router.get('/:id/balance', accountController.getAccountBalance);

module.exports = router; 