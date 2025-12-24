const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    recipe: [{
        inventoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Inventory',
            required: true
        },
        qtyNeeded: {
            type: Number,
            required: true,
            default:5
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
