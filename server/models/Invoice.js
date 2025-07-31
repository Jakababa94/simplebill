const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [0.01, 'Quantity must be greater than 0']
  },
  rate: {
    type: Number,
    required: true,
    min: [0, 'Rate cannot be negative']
  },
  amount: {
    type: Number,
    required: true
  }
});

const invoiceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  items: [invoiceItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  tax: {
    rate: {
      type: Number,
      default: 0,
      min: [0, 'Tax rate cannot be negative'],
      max: [100, 'Tax rate cannot exceed 100%']
    },
    amount: {
      type: Number,
      default: 0,
      min: [0, 'Tax amount cannot be negative']
    }
  },
  discount: {
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage'
    },
    value: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative']
    },
    amount: {
      type: Number,
      default: 0,
      min: [0, 'Discount amount cannot be negative']
    }
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  paidDate: Date,
  paidAmount: {
    type: Number,
    default: 0,
    min: [0, 'Paid amount cannot be negative']
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'check', 'bank_transfer', 'paypal', 'stripe', 'other']
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  terms: {
    type: String,
    maxlength: [1000, 'Terms cannot exceed 1000 characters']
  },
  reminders: [{
    sentDate: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['reminder', 'overdue', 'final_notice']
    }
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
invoiceSchema.index({ user: 1, status: 1 });
invoiceSchema.index({ user: 1, client: 1 });
invoiceSchema.index({ user: 1, dueDate: 1 });
invoiceSchema.index({ invoiceNumber: 1 });

// Generate invoice number
invoiceSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Invoice').countDocuments({ user: this.user });
    this.invoiceNumber = `INV-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Update status based on dates and payments
invoiceSchema.pre('save', function(next) {
  const now = new Date();
  
  if (this.status === 'paid') {
    // Already paid, don't change status
  } else if (this.paidAmount >= this.total) {
    this.status = 'paid';
    this.paidDate = this.paidDate || now;
  } else if (this.dueDate < now && this.status !== 'draft') {
    this.status = 'overdue';
  }
  
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
