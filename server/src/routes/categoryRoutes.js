const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate } = require('../middleware/auth');

// All routes are protected with auth middleware
router.use(authenticate);

// Get all categories
router.get('/', categoryController.getCategories);

// Get categories by type (income/expense)
router.get('/type/:type', categoryController.getCategoriesByType);

// Create new category
router.post('/', categoryController.createCategory);

// Update category
router.put('/:id', categoryController.updateCategory);

// Delete category
router.delete('/:id', categoryController.deleteCategory);

module.exports = router; 