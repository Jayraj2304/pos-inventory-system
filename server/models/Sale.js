const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        priceAtSale: {
            type: Number, // Store price at time of sale in case product price changes later
            required: true
        }
    }],
    total: {
        type: Number,
        required: true
    },
    customerEmail: {
        type: String,
        required: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);
