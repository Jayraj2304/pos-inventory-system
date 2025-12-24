const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');

// @route   GET /api/inventory
// @desc    Get all inventory items
// @access  Public
router.get('/', async (req, res) => {
    try {
        const items = await Inventory.find();
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/inventory
// @desc    Add new inventory item
// @access  Public
router.post('/', async (req, res) => {
    const { name, qty, unit, minQty } = req.body;

    try {
        // Check if item exists (case-insensitive)
        let item = await Inventory.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });

        if (item) {
            // Update existing item quantity
            item.qty += Number(qty);
            // Optionally update other fields if provided, but primary goal is restock
            if (minQty) item.minQty = Number(minQty);

            const updatedItem = await item.save();
            return res.json(updatedItem); // 200 OK
        }

        const newItem = new Inventory({
            name,
            qty,
            unit,
            minQty
        });

        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

const Product = require('../models/Product');

// @route   DELETE /api/inventory/:id
// @desc    Delete inventory item
// @access  Public
router.delete('/:id', async (req, res) => {
    try {
        const item = await Inventory.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        // Check if item is used in any Product recipe
        const productUsingItem = await Product.findOne({ 'recipe.inventoryId': req.params.id });
        if (productUsingItem) {
            return res.status(400).json({
                message: `Cannot delete: Item is currently used in product "${productUsingItem.name}". Remove it from the recipe first.`
            });
        }

        await Inventory.deleteOne({ _id: req.params.id });
        res.json({ message: 'Item removed' });
    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ message: err.message });
    }
});

// @route   PUT /api/inventory/:id
// @desc    Update inventory item
// @access  Public
router.put('/:id', async (req, res) => {
    const { name, qty, unit, minQty } = req.body;
    try {
        const item = await Inventory.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        if (name) item.name = name;
        if (qty !== undefined) item.qty = Number(qty);
        if (unit) item.unit = unit;
        if (minQty !== undefined) item.minQty = Number(minQty);

        const updatedItem = await item.save();
        res.json(updatedItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   GET /api/inventory/shortages
// @desc    Get inventory items that are at or below minimum threshold
// @access  Public
router.get('/shortages', async (req, res) => {
    try {
        // Find items where qty <= minQty
        const shortages = await Inventory.find({ $expr: { $lte: ["$qty", "$minQty"] } });
        res.json(shortages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
