const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");

// ✅ Get Customer Details by ID
router.get("/:id", async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) return res.status(404).json({ message: "Customer not found" });
        res.status(200).json(customer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Add a Receipt (Subtract from Balance)
router.post("/:id/receipts", async (req, res) => {
    try {
        const { date, amount, details } = req.body;
        const customer = await Customer.findById(req.params.id);

        if (!customer) return res.status(404).json({ message: "Customer not found" });

        const parsedAmount = parseFloat(amount);

        console.log("💰 Before Subtracting Receipt:", customer.balance); // Debugging Log

        // ✅ Subtract the amount
        customer.balance -= parsedAmount;

        console.log("💰 After Subtracting Receipt:", customer.balance); // Debugging Log

        // ✅ Add receipt to the array
        customer.receipts.push({ date, amount, details });

        // ✅ Save the updated customer
        await customer.save();

        req.app.get("io").emit("customerUpdated", customer); // Notify frontend

        res.status(200).json(customer); // Send back updated customer data
    } catch (err) {
        console.error("❌ Error in subtracting receipt:", err.message);
        res.status(500).json({ error: err.message });
    }
});








// ✅ Delete a Vinyl Purchase (Reverse Balance Change)
router.delete("/:id/vinyls", async (req, res) => {
    try {
        const { type, entryDate, price } = req.body;
        const customer = await Customer.findById(req.params.id);
        if (!customer) return res.status(404).json({ message: "Customer not found" });

        customer.vinyls = customer.vinyls.filter(v => !(v.type === type && v.entryDate === entryDate));

        customer.balance -= parseFloat(price); // ✅ Reverse balance change
        await customer.save();

        req.app.get("io").emit("customerUpdated", customer);

        res.status(200).json(customer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Add a Purchase Record (Increase Balance)
router.post("/:id/purchases", async (req, res) => {
    try {
        const { date, billNumber, totalAmount } = req.body;
        const customer = await Customer.findById(req.params.id);
        if (!customer) return res.status(404).json({ message: "Customer not found" });

        // Ensure `purchases` field exists
        if (!customer.purchases) {
            customer.purchases = [];
        }

        // Add purchase history
        customer.purchases.push({ date, billNumber, totalAmount });

        // Increase customer balance
        customer.balance += parseFloat(totalAmount);

        await customer.save();

        req.app.get("io").emit("customerUpdated", customer); // Notify frontend

        res.status(200).json(customer);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


module.exports = router;
