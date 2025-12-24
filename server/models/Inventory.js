const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  qty: {
    type: Number,
    required: true,
    default: 0
  },
  unit: {
    type: String, // e.g., 'kg', 'liters', 'pieces'
    required: true
  },
  minQty: {
    type: Number,
    required: true,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
