const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// @route   GET /api/products
// @desc    Get all products with populated recipe ingredients
// @access  Public
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().populate('recipe.inventoryId', 'name unit qty minQty');
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/products
// @desc    Create a new product with recipe
// @access  Public
router.post('/', async (req, res) => {
    const { name, price, recipe } = req.body;

    try {
        const newProduct = new Product({
            name,
            price,
            recipe
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Public
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        await Product.deleteOne({ _id: req.params.id });
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Public
router.put('/:id', async (req, res) => {
    const { name, price, recipe } = req.body;
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (name) product.name = name;
        if (price !== undefined) product.price = Number(price);
        if (recipe) product.recipe = recipe;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
