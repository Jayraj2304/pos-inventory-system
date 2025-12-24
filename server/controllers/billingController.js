const mongoose = require('mongoose');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const Sale = require('../models/Sale');
const sendInvoice = require('../utils/mailer');

exports.processBill = async (req, res) => {
    try {
        // 1. Validate Request
        const { items, customerEmail } = req.body;
        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items in the bill' });
        }

        let totalAmount = 0;
        const lowStockAlerts = [];
        const saleItems = [];
        const emailItems = [];

        // 2. Process Each Item
        for (const item of items) {
            // Fetch product
            const product = await Product.findById(item.productId);
            if (!product) {
                throw new Error(`Product with ID ${item.productId} not found`);
            }

            const quantitySold = item.quantity;
            const itemTotal = product.price * quantitySold;
            totalAmount += itemTotal;

            // Prepare Sale Item Data
            saleItems.push({
                product: product._id,
                quantity: quantitySold,
                priceAtSale: product.price
            });

            // Prepare Email Data
            emailItems.push({
                name: product.name,
                quantity: quantitySold,
                priceAtSale: product.price
            });

            // 3. Deduct Inventory (Recipe Logic)
            if (product.recipe && product.recipe.length > 0) {
                for (const ingredient of product.recipe) {
                    const totalQtyNeeded = ingredient.qtyNeeded * quantitySold;

                    // Update Inventory: Subtract Quantity
                    // Fetch existing item
                    const inventoryItem = await Inventory.findById(ingredient.inventoryId);

                    if (!inventoryItem) {
                        throw new Error(`Inventory item ${ingredient.inventoryId} not found`);
                    }

                    // Manual Subtraction (Beginner Logic)
                    inventoryItem.qty = inventoryItem.qty - totalQtyNeeded;

                    const updatedInventory = await inventoryItem.save();

                    // CHECK 1: Absolute Stop if stock goes below safe minimum
                    if (updatedInventory.qty < updatedInventory.minQty) {
                        throw new Error(`STOP: Stock for '${updatedInventory.name}' is too low! Limit: ${updatedInventory.minQty}, Current: ${updatedInventory.qty + totalQtyNeeded} -> ${updatedInventory.qty}. Cannot process.`);
                    }

                    // CHECK 2: Warning Alert (Optional)
                    if (updatedInventory.qty <= (ingredient.qtyNeeded * 2)) {
                        lowStockAlerts.push({
                            inventoryItem: updatedInventory.name,
                            remainingQty: updatedInventory.qty,
                            message: `Low Stock: ${updatedInventory.name} is down to ${updatedInventory.qty} ${updatedInventory.unit}.`
                        });
                    }
                }
            }
        }

        // 4. Save the Sale Record
        const newSale = new Sale({
            items: saleItems,
            total: totalAmount,
            customerEmail: customerEmail
        });

        await newSale.save();

        // 5. Send Receipt Email
        if (customerEmail) {
            // We don't await this so the user doesn't wait for email sending
            sendInvoice(customerEmail, {
                saleId: newSale._id,
                items: emailItems,
                total: totalAmount
            });
        }

        // 6. Respond to Client
        res.status(200).json({
            message: 'Order Successful!',
            saleId: newSale._id,
            total: totalAmount,
            alerts: lowStockAlerts
        });

    } catch (error) {
        console.error('Billing Error:', error.message);
        // Return a clear error message to the frontend
        res.status(500).json({ message: error.message || 'Error processing bill' });
    }
};
