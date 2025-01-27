const express = require('express');
const router = express.Router();
const SoldRecord = require('../models/SoldRecord');
const VinylRoll = require('../models/VinylRoll');

// Middleware to attach io instance
router.use((req, res, next) => {
    req.io = req.app.get("io") || null;
    next();
});

// ✅ Fetch Sold Records (`GET /api/sold`)
router.get('/', async (req, res) => {
    try {
        const records = await SoldRecord.find().sort("-soldDate").select("-__v -updatedAt");
        res.status(200).json(records);
    } catch (error) {
        console.error("❌ Error fetching sold records:", error);
        res.status(500).json({ error: "Failed to fetch sold records." });
    }
});

// ✅ Mark Vinyl as Sold (`POST /api/sold/sell`)
router.post('/sell', async (req, res) => {
    try {
        const { vinylId, customerName, soldDate } = req.body;

        if (!vinylId || !customerName) {
            return res.status(400).json({ error: "vinylId and customerName are required." });
        }

        const vinyl = await VinylRoll.findById(vinylId);
        if (!vinyl) {
            return res.status(404).json({ error: "Vinyl roll not found." });
        }

        // ✅ Move the vinyl to SoldRecords
        const soldRecord = new SoldRecord({
            vinylId,
            customerName,
            soldDate: soldDate ? new Date(soldDate) : new Date(),
            vinylName: vinyl.vinylName,
            type: vinyl.type,
            color: vinyl.color,
            length: vinyl.length,
            width: vinyl.width,
            entryDate: vinyl.entryDate
        });

        await soldRecord.save();

        // ✅ Remove the sold vinyl from the active records
        await VinylRoll.findByIdAndDelete(vinylId);

        // ✅ Recalculate roll numbers for remaining vinyls
        const remainingVinyls = await VinylRoll.find().sort({ entryDate: 1 });

        for (let i = 0; i < remainingVinyls.length; i++) {
            remainingVinyls[i].rollNumber = i + 1; // Assign new sequential roll numbers
            await remainingVinyls[i].save();
        }

        // ✅ Emit events to update frontend
        req.io.emit("updateSoldRecords");
        req.io.emit("updateVinyls");

        return res.status(200).json({ message: "Vinyl sold successfully and roll numbers updated." });
    } catch (error) {
        console.error("❌ Error selling vinyl:", error);
        return res.status(500).json({ error: "Failed to mark vinyl as sold." });
    }
});

// Search Sold Records API
router.get("/search", async (req, res) => {
    try {
        const { query } = req.query; // Get search query from frontend

        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

        // Case-insensitive search for vinylName, type, color, customerName
        // Numeric fields like length, width, and dates are converted to strings for matching
        const searchResults = await SoldRecord.find({
            $or: [
                { vinylName: { $regex: query, $options: "i" } },
                { type: { $regex: query, $options: "i" } },
                { color: { $regex: query, $options: "i" } },
                { customerName: { $regex: query, $options: "i" } }, // ✅ Search by Customer Name
                { length: isNaN(query) ? null : query }, // ✅ Search by Length if query is a number
                { width: isNaN(query) ? null : query }, // ✅ Search by Width if query is a number
                { entryDate: isNaN(Date.parse(query)) ? null : new Date(query) }, // ✅ Search by Entry Date if valid date
                { soldDate: isNaN(Date.parse(query)) ? null : new Date(query) } // ✅ Search by Sold Date if valid date
            ]
        }).sort({ soldDate: -1 });

        res.json(searchResults);
    } catch (error) {
        console.error("❌ Search error:", error);
        res.status(500).json({ message: "Server error" });
    }
});



module.exports = router;
