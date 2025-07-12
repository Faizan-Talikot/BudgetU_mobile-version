const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  icon: {
    type: String,
    required: true,
    default: 'wallet-outline'
  },
  color: {
    type: String,
    required: true,
    default: '#4338ca'
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

// Pre-save hook to update the updatedAt field and validate icon
categorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Ensure icon ends with -outline
  if (this.icon === 'default-icon') {
    this.icon = 'wallet-outline';
  } else if (!this.icon.endsWith('-outline')) {
    this.icon = `${this.icon}-outline`;
  }
  
  next();
});

// Create index for faster querying
categorySchema.index({ user: 1, type: 1 });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category; 