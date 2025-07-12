const mongoose = require('mongoose');

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
    amount: {
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
    categories: [{
        category: {
            type: mongoose.Schema.Types.Mixed, // Allow both ObjectId and String for predefined categories
            required: true,
            validate: {
                validator: function(value) {
                    // Allow either MongoDB ObjectId or predefined category strings
                    return mongoose.Types.ObjectId.isValid(value) || 
                           (typeof value === 'string' && (value.startsWith('expense-') || value.startsWith('income-')));
                },
                message: props => `${props.value} is not a valid category ID or predefined category`
            }
        },
        allocatedAmount: {
            type: Number,
            required: true,
            min: 0
        },
        spentAmount: {
            type: Number,
            required: true,
            default: 0
        },
        isPredefined: {
            type: Boolean,
            default: false
        }
    }],
    totalSpent: {
        type: Number,
        default: 0
    },
    totalIncome: {
        type: Number,
        default: 0
    },
    availableToBudget: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'expired'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Add indexes for better query performance
budgetSchema.index({ user: 1, startDate: 1, endDate: 1 });
budgetSchema.index({ status: 1 });

// Only populate non-predefined categories
budgetSchema.pre('find', function() {
    this.populate({
        path: 'categories.category',
        match: { isPredefined: { $ne: true } }
    });
});

budgetSchema.pre('findOne', function() {
    this.populate({
        path: 'categories.category',
        match: { isPredefined: { $ne: true } }
    });
});

module.exports = mongoose.model('Budget', budgetSchema); 