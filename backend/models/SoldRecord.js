const mongoose = require('mongoose');

const SoldRecordSchema = new mongoose.Schema({
    vinylId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "VinylRoll", 
        required: false // Allows null values if manually entered
    },
    customerName: { 
        type: String, 
        required: true, 
        trim: true,
        default: "Unknown Customer" 
    },
    soldDate: { 
        type: Date, 
        default: Date.now 
    },
    vinylName: { type: String, required: true }, // ✅ NEW FIELD: Vinyl Name

    type: { 
        type: String, 
        required: true 
    },
    color: { 
        type: String, 
        required: true 
    },
    length: { 
        type: Number, 
        required: true 
    },
    width: { 
        type: Number, 
        required: true 
    },
    entryDate: { 
        type: Date, 
        required: true,
        default: function () { return this.soldDate; } // Default to sold date if missing
    }
}, { timestamps: true });

// Indexing for optimized queries
SoldRecordSchema.index({ soldDate: -1 });

module.exports = mongoose.model('SoldRecord', SoldRecordSchema);
