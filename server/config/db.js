const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/meru_pos');

        return console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        return console.error(`Error: ${error.message}`);
    }
};

module.exports = connectDB;
