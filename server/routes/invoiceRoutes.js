const express = require('express');
const Invoice = require('../models/Invoice');
const Client = require('../models/Client');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/invoices
// @desc    Get all invoices for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, client, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    let query = { user: req.userId };
    
    if (status) {
      query.status = status;
    }
    
    if (client) {
      query.client = client;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const invoices = await Invoice.find(query)
      .populate('client', 'name email company')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Invoice.countDocuments(query);

    res.json({
      invoices,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/invoices
// @desc    Create an invoice
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    // Verify client belongs to user
    const client = await Client.findOne({
      _id: req.body.client,
      user: req.userId
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const invoice = new Invoice({
      user: req.userId,
      ...req.body
    });

    await invoice.save();
    await invoice.populate('client', 'name email company');

    // Update client's last invoice date and total billed
    await Client.findByIdAndUpdate(client._id, {
      lastInvoiceDate: new Date(),
      $inc: { totalBilled: invoice.total }
    });

    res.status(201).json(invoice);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
});

// @route   GET /api/invoices/:id
// @desc    Get invoice by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      user: req.userId
    }).populate('client');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Get payments for this invoice
    const payments = await Payment.find({
      invoice: invoice._id,
      user: req.userId
    }).sort({ createdAt: -1 });

    res.json({ invoice, payments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/invoices/:id
// @desc    Update invoice
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true, runValidators: true }
    ).populate('client', 'name email company');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
});

// @route   DELETE /api/invoices/:id
// @desc    Delete invoice
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Delete associated payments
    await Payment.deleteMany({
      invoice: invoice._id,
      user: req.userId
    });

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/invoices/:id/payments
// @desc    Add payment to invoice
// @access  Private
router.post('/:id/payments', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const payment = new Payment({
      user: req.userId,
      invoice: invoice._id,
      ...req.body
    });

    await payment.save();

    // Update invoice paid amount
    invoice.paidAmount += payment.amount;
    await invoice.save();

    // Update client's total paid
    await Client.findByIdAndUpdate(invoice.client, {
      $inc: { totalPaid: payment.amount }
    });

    res.status(201).json(payment);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
});

module.exports = router;
