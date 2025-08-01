const express = require('express');
const Invoice = require('../models/Invoice');
const Client = require('../models/Client');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.userId;

    // Get invoice statistics
    const invoiceStats = await Invoice.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$total' }
        }
      }
    ]);

    // Get total revenue (paid invoices)
    const totalRevenue = await Invoice.aggregate([
      { $match: { user: userId, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    // Get pending amount
    const pendingAmount = await Invoice.aggregate([
      { $match: { user: userId, status: { $in: ['sent', 'viewed'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    // Get overdue amount
    const overdueAmount = await Invoice.aggregate([
      { $match: { user: userId, status: 'overdue' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    // Get client count
    const clientCount = await Client.countDocuments({ user: userId });

    // Get recent invoices
    const recentInvoices = await Invoice.find({ user: userId })
      .populate('client', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      invoiceStats,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingAmount: pendingAmount[0]?.total || 0,
      overdueAmount: overdueAmount[0]?.total || 0,
      clientCount,
      recentInvoices
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/revenue-chart
// @desc    Get revenue chart data
// @access  Private
router.get('/revenue-chart', auth, async (req, res) => {
  try {
    const { period = '6' } = req.query; // months
    const months = parseInt(period);
    
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const revenueData = await Invoice.aggregate([
      {
        $match: {
          user: req.userId,
          status: 'paid',
          paidDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$paidDate' },
            month: { $month: '$paidDate' }
          },
          revenue: { $sum: '$total' },
          invoiceCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.json(revenueData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
