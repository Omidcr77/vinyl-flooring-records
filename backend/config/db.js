const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        mongoose.set('strictQuery', false); // Ensures compatibility with Mongoose 7+

        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Auto-reconnect timeout
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error.message);
        console.error(error.stack); // Log full error details
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;
