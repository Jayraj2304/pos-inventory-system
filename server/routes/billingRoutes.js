const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');

// @route   POST /api/billing/checkout
// @desc    Process a bill / checkout
// @access  Public
router.post('/checkout', billingController.processBill);

module.exports = router;
