const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // Ensuring ID is always present
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    balance: { type: Number, required: true, default: 0 },
    img: { type: String, default: "assets/customer.jpg" },

    // ✅ Add Purchases Field
    purchases: [
        {
            date: { type: Date, required: true },       // Purchase Date
            billNumber: { type: String, required: true }, // Invoice/Bill Number
            totalAmount: { type: Number, required: true } // Total Money Spent
        }
    ],

    receipts: [
        {
            date: { type: Date },
            amount: { type: Number },
            details: { type: String }
        }
    ]
});

// ✅ Ensure balance updates properly
customerSchema.pre("save", function (next) {
    if (!this.balance) this.balance = 0; 
    next();
});

module.exports = mongoose.model("Customer", customerSchema);
