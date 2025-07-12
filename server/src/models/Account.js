const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['cash', 'card', 'credit', 'savings', 'upi', 'wallet'],
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  balance: {
    type: Number,
    required: true,
    default: 0
  },
  icon: {
    type: String,
    required: true,
    default: 'wallet-outline'
  },
  isDefault: {
    type: Boolean,
    default: false
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

// Pre-save hook to update the updatedAt field and log account creation
accountSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  console.log('Saving account:', {
    name: this.name,
    type: this.type,
    user: this.user,
    isDefault: this.isDefault
  });
  next();
});

// Create index for faster querying
accountSchema.index({ user: 1 });

const Account = mongoose.model('Account', accountSchema);

module.exports = Account; 