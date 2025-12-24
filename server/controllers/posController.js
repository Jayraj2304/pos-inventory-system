const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const Sale = require('../models/Sale');
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    service: 'gmail', // or your preferred service
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-email-password'
    }
});

exports.checkout = async (req, res) => {
    try {
        const { cart, customerEmail } = req.body; // cart: [{ productId, quantity }]

        if (!cart || cart.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        let totalAmount = 0;
        const saleItems = [];
        const toBuyList = [];

        // Process each item in the cart
        for (const cartItem of cart) {
            const product = await Product.findById(cartItem.productId).populate('recipe.inventoryItem');

            if (!product) {
                return res.status(404).json({ message: `Product not found: ${cartItem.productId}` });
            }

            // Calculate total and prepare sale item
            const itemTotal = product.price * cartItem.quantity;
            totalAmount += itemTotal;

            saleItems.push({
                product: product._id,
                quantity: cartItem.quantity,
                priceAtSale: product.price
            });

            // Update Inventory based on Recipe
            if (product.recipe && product.recipe.length > 0) {
                for (const ingredient of product.recipe) {
                    const qtyNeeded = ingredient.quantity * cartItem.quantity;

                    // Update Inventory: Subtract quantity
                    const updatedInventory = await Inventory.findByIdAndUpdate(
                        ingredient.inventoryItem._id,
                        { qty: -qtyNeeded },
                        { new: true } // Return the updated document
                    );

                    // STRICT RULE: Block order if threshold triggered
                    if (updatedInventory.qty < updatedInventory.minQty) {
                        // Note: Without transactions, this might leave partial updates. 
                        // Recommended to use billingController which has transactions.
                        throw new Error(`Stock Block: '${updatedInventory.name}' falls below limit (${updatedInventory.minQty}).`);
                    }

                    // Deficiency Alert Logic
                    // Rule: If qty <= (qtyNeeded * 2), flag for To-Buy list
                    // Note: qtyNeeded here is the total amount used in this transaction for this ingredient
                    if (updatedInventory.qty <= (qtyNeeded * 2)) {
                        // Check if already in list to avoid duplicates
                        if (!toBuyList.some(item => item.name === updatedInventory.name)) {
                            toBuyList.push({
                                name: updatedInventory.name,
                                currentQty: updatedInventory.qty,
                                threshold: qtyNeeded * 2,
                                unit: updatedInventory.unit
                            });
                        }
                    }
                }
            }
        }

        // Save the Sale Record
        const newSale = new Sale({
            items: saleItems,
            total: totalAmount,
            customerEmail: customerEmail
        });

        await newSale.save();

        // Send Email Bill if customerEmail is provided
        if (customerEmail) {
            const billText = `
        Ref: ${newSale._id}
        Date: ${new Date().toLocaleString()}
        --------------------------------
        Items:
        ${cart.map((item, idx) => `${idx + 1}. Product ID: ${item.productId} x ${item.quantity}`).join('\n')}
        
        Total: $${totalAmount}
        --------------------------------
        Thank you for shopping with us!
      `;

            const mailOptions = {
                from: process.env.EMAIL_USER || 'your-email@gmail.com',
                to: customerEmail,
                subject: 'Your Receipt from MERU POS',
                text: billText
            };

            // Sending email asynchronously without blocking response
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        }

        res.status(200).json({
            message: 'Checkout successful',
            saleId: newSale._id,
            toBuyList: toBuyList // Return the deficiency list to the FE or admin
        });

    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
