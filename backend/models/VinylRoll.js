const mongoose = require('mongoose');

const VinylRollSchema = new mongoose.Schema({
    rollNumber: { 
        type: Number, 
        unique: true, 
        required: true, 
        index: true // Indexing for faster queries
    },
    vinylName: {
    type: String,
     required: true 
}, // ✅ NEW FIELD: Vinyl Name

    type: { 
        type: String, 
        required: true, 
        trim: true 
    },
    color: { 
        type: String, 
        required: true, 
        trim: true 
    },
    length: { 
        type: Number, 
        required: true,
        min: 0.1 // Prevents invalid lengths
    },
    width: { 
        type: Number, 
        required: true,
        min: 0.1 // Prevents invalid widths
    },
    entryDate: { 
        type: Date, 
        default: Date.now, 
        required: true 
    },
    details: { 
        type: String, 
        trim: true,
        default: "" // Ensures empty values don't cause issues
    }
}, { 
    timestamps: true, 
    autoIndex: true // Enable indexing for better performance
});

// Atomic Roll Number Assignment to Prevent Race Conditions
VinylRollSchema.pre("save", async function (next) {
    if (!this.rollNumber) {
        try {
            const lastRoll = await this.constructor.findOne().sort("-rollNumber").select("rollNumber");
            this.rollNumber = lastRoll ? lastRoll.rollNumber + 1 : 1;
        } catch (error) {
            return next(error);
        }
    }
    next();
});

module.exports = mongoose.model('VinylRoll', VinylRollSchema);
