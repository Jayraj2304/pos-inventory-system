const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');

// @route   GET /api/sales
// @desc    Get all sales with populated product details
// @access  Public
router.get('/', async (req, res) => {
    try {
        // Populate products in items to get names if needed
        const sales = await Sale.find().populate('items.product').sort({ createdAt: -1 });
        res.json(sales);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
