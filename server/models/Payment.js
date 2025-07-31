const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0.01, 'Payment amount must be greater than 0']
  },
  method: {
    type: String,
    enum: ['cash', 'check', 'bank_transfer', 'paypal', 'm-pesa', 'other'],
    required: true
  },
  transactionId: String,
  notes: String,
  processedDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'completed'
  }
}, {
  timestamps: true
});

// Index for efficient queries
paymentSchema.index({ user: 1, invoice: 1 });
paymentSchema.index({ user: 1, processedDate: -1 });

module.exports = mongoose.model('Payment', paymentSchema);