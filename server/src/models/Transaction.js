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
    type: mongoose.Schema.Types.Mixed, // Allow both ObjectId and String for predefined categories
    required: true,
    validate: {
      validator: function(value) {
        // Allow either MongoDB ObjectId or predefined category strings
        return mongoose.Types.ObjectId.isValid(value) || 
               (typeof value === 'string' && ['Salary', 'Business', 'Investments', 'Gifts', 'Rental'].includes(value));
      },
      message: props => `${props.value} is not a valid category ID or predefined category`
    }
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
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
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to update account balance
transactionSchema.pre('save', async function(next) {
  try {
    this.updatedAt = Date.now();

    if (this.isModified('amount') || this.isNew) {
      const Account = mongoose.model('Account');
      const account = await Account.findById(this.account);
      
      if (!account) {
        throw new Error('Account not found');
      }

      if (this.isNew) {
        // New transaction
        account.balance += this.isIncome ? this.amount : -this.amount;
      } else if (this.isModified('amount')) {
        // Updated transaction
        const oldDoc = await this.constructor.findById(this._id);
        const oldAmount = oldDoc ? oldDoc.amount : 0;
        const oldIsIncome = oldDoc ? oldDoc.isIncome : this.isIncome;
        
        // Remove old amount effect
        account.balance -= oldIsIncome ? oldAmount : -oldAmount;
        // Add new amount effect
        account.balance += this.isIncome ? this.amount : -this.amount;
      }

      await account.save();
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-remove hook to update account balance when transaction is deleted
transactionSchema.pre('remove', async function(next) {
  try {
    const Account = mongoose.model('Account');
    const account = await Account.findById(this.account);
    
    if (!account) {
      throw new Error('Account not found');
    }

    // Remove transaction amount from account balance
    account.balance -= this.isIncome ? this.amount : -this.amount;
    await account.save();
    
    next();
  } catch (error) {
    next(error);
  }
});

// Create indexes for faster querying
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ category: 1, user: 1 });
transactionSchema.index({ account: 1, user: 1 });
transactionSchema.index({ budgetId: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction; 