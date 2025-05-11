const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  isIncome: {
    type: Boolean,
    default: false
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'other'],
    default: 'other'
  },
  // Link to budget
  budgetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Budget',
    sparse: true
  },
  location: {
    type: String,
    trim: true
  },
  // For linking to bank transactions if using Plaid or similar
  externalId: {
    type: String,
    sparse: true
  },
  // Store receipt image URL
  receiptImage: {
    type: String
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for faster querying
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ category: 1, user: 1 });
transactionSchema.index({ budgetId: 1 }); // Add index for budget queries

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction; 