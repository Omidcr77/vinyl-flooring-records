const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Customer = require("../models/Customer");

router.get("/", async (req, res) => {
    try {
        const customers = await Customer.find();
        res.status(200).json(customers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Get a single customer by ID
router.get("/:id", async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) return res.status(404).json({ message: "Customer not found" });
        res.status(200).json(customer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ GET all customers
router.get("/", async (req, res) => {
    try {
        const customers = await Customer.find();
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ POST new customer
router.post("/", async (req, res) => {
    try {
        const newCustomer = new Customer(req.body);
        await newCustomer.save();
        req.app.get("io").emit("customerAdded", newCustomer);
        res.status(201).json(newCustomer);
    } catch (error) {
        res.status(500).json({ error: "Failed to add customer" });
    }
});

module.exports = router;

// ✅ Update customer details (e.g., balance, address)
router.put("/:id", async (req, res) => {
    try {
        const updatedCustomer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedCustomer) return res.status(404).json({ message: "Customer not found" });

        // Emit update event
        req.app.get("io").emit("balanceUpdated", updatedCustomer);

        res.status(200).json(updatedCustomer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Delete a customer
router.delete("/:id", async (req, res) => {
    try {
        const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);
        if (!deletedCustomer) return res.status(404).json({ message: "Customer not found" });

        // Emit deletion event
        req.app.get("io").emit("customerDeleted", req.params.id);

        res.status(200).json({ message: "Customer deleted successfully" });
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

// ✅ Multer storage setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Store images in uploads/
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({ storage });

// ✅ Upload profile picture and update customer record
router.post("/:id/upload", upload.single("profilePic"), async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) return res.status(404).json({ message: "Customer not found" });

        // ✅ Update image path in DB
        customer.img = req.file.filename;
        await customer.save();

        res.status(200).json({ message: "Image uploaded", imagePath: `/uploads/${req.file.filename}` });
    } catch (error) {
        console.error("❌ Error uploading image:", error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
