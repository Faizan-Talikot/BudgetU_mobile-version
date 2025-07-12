const Category = require('../models/Category');

// Get all categories for a user
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user.id });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name, type, icon, color } = req.body;

    const category = new Category({
      user: req.user.id,
      name,
      type,
      icon,
      color
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: 'Error creating category', error: error.message });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  try {
    const { name, icon, color } = req.body;
    const category = await Category.findOne({ _id: req.params.id, user: req.user.id });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.name = name || category.name;
    category.icon = icon || category.icon;
    category.color = color || category.color;

    await category.save();
    res.json(category);
  } catch (error) {
    res.status(400).json({ message: 'Error updating category', error: error.message });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, user: req.user.id });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (category.isDefault) {
      return res.status(400).json({ message: 'Cannot delete default category' });
    }

    await Category.deleteOne({ _id: category._id });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting category', error: error.message });
  }
};

// Get categories by type
exports.getCategoriesByType = async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Invalid category type' });
    }

    const categories = await Category.find({ user: req.user.id, type });
    res.json(categories);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching categories', error: error.message });
  }
}; 