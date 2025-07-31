const express = require('express');
const Client = require('../models/Client');
const Invoice = require('../models/Invoice');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/clients
// @desc    Get all clients for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    
    let query = { user: req.userId };
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    const clients = await Client.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Client.countDocuments(query);

    res.json({
      clients,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/clients
// @desc    Create a client
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const client = new Client({
      user: req.userId,
      ...req.body
    });

    await client.save();
    res.status(201).json(client);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
});

// @route   GET /api/clients/:id
// @desc    Get client by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Get client's invoices
    const invoices = await Invoice.find({
      client: client._id,
      user: req.userId
    }).sort({ createdAt: -1 });

    res.json({ client, invoices });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/clients/:id
// @desc    Update client
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
});

// @route   DELETE /api/clients/:id
// @desc    Delete client
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if client has invoices
    const invoiceCount = await Invoice.countDocuments({
      client: req.params.id,
      user: req.userId
    });

    if (invoiceCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete client with existing invoices'
      });
    }

    const client = await Client.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;