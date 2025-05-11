const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  spent: {
    type: Number,
    default: 0,
    min: 0
  },
  color: {
    type: String,
    default: '#4338ca' // Default color
  },
  icon: {
    type: String,
    default: 'dollar-sign' // Default icon
  },
  isEssential: {
    type: Boolean,
    default: false
  }
});

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  categories: [categorySchema],
  isActive: {
    type: Boolean,
    default: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPeriod: {
    type: String,
    enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
    default: 'monthly'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to update the updatedAt field
budgetSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate total budget allocation across categories
budgetSchema.methods.getTotalAllocated = function() {
  return this.categories.reduce((total, category) => total + category.amount, 0);
};

// Calculate remaining budget
budgetSchema.methods.getRemainingAmount = function() {
  return this.totalAmount - this.getTotalSpent();
};

// Calculate total spent across categories
budgetSchema.methods.getTotalSpent = function() {
  return this.categories.reduce((total, category) => total + category.spent, 0);
};

// Calculate percentage spent
budgetSchema.methods.getPercentageSpent = function() {
  return (this.getTotalSpent() / this.totalAmount) * 100;
};

// Create a copy of this budget with new dates (for recurring budgets)
budgetSchema.methods.createNextRecurring = async function() {
  if (!this.isRecurring) return null;
  
  const startDate = new Date(this.endDate);
  startDate.setDate(startDate.getDate() + 1);
  
  let endDate = new Date(startDate);
  
  // Set end date based on recurring period
  switch(this.recurringPeriod) {
    case 'weekly':
      endDate.setDate(endDate.getDate() + 6); // 7 days - 1
      break;
    case 'monthly':
      endDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0); // Last day of month
      break;
    case 'quarterly':
      endDate = new Date(endDate.setMonth(endDate.getMonth() + 3));
      endDate.setDate(endDate.getDate() - 1);
      break;
    case 'yearly':
      endDate = new Date(endDate.setFullYear(endDate.getFullYear() + 1));
      endDate.setDate(endDate.getDate() - 1);
      break;
  }
  
  // Create new budget with resetted spending
  const newBudget = new Budget({
    user: this.user,
    name: `${this.name.split(' ')[0]} ${startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
    totalAmount: this.totalAmount,
    startDate,
    endDate,
    isActive: true,
    isRecurring: this.isRecurring,
    recurringPeriod: this.recurringPeriod,
    categories: this.categories.map(cat => ({
      name: cat.name,
      amount: cat.amount,
      spent: 0,
      color: cat.color,
      icon: cat.icon,
      isEssential: cat.isEssential
    }))
  });
  
  await newBudget.save();
  return newBudget;
};

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget; 