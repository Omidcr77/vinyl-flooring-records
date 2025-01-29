const express = require('express');
const router = express.Router();
const VinylRoll = require('../models/VinylRoll');

// Middleware to attach io instance (Ensures io is available)
router.use((req, res, next) => {
    req.io = req.app.get("io"); // Attach socket instance
    next();
});

// ✅ Create a new vinyl roll
router.post('/', async (req, res) => {
    try {
        const { vinylName, type, color, length, width, entryDate, details } = req.body;

        // Get last roll number and increment
        const lastRoll = await VinylRoll.findOne().sort("-rollNumber").select("rollNumber");
        const rollNumber = lastRoll ? lastRoll.rollNumber + 1 : 1;

        const newRoll = new VinylRoll({
            rollNumber,
            vinylName,
            type,
            color,
            length,
            width,
            entryDate: entryDate || new Date(),
            details
        });

        const savedRoll = await newRoll.save();
        
        // Emit event for frontend update
        req.io.emit("updateVinyls");

        res.status(201).json(savedRoll);
    } catch (error) {
        console.error("❌ Error adding vinyl:", error);
        res.status(500).json({ error: "Failed to add vinyl roll." });
    }
});

// ✅ Get all vinyl rolls (Search Included)
router.get('/', async (req, res) => {
    try {
        let query = {};

        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, "i"); // Case-insensitive search
            const searchQuery = req.query.search.trim();

            // Check if search query is a number (for length/width)
            const searchNumber = !isNaN(searchQuery) ? parseFloat(searchQuery) : null;

            // Check if search query is a valid date
            const searchDate = isNaN(Date.parse(searchQuery)) ? null : new Date(searchQuery);

            query = { 
                $or: [
                    { vinylName: searchRegex }, 
                    { type: searchRegex }, 
                    { color: searchRegex },
                    { length: searchNumber }, // ✅ Search by Length if number
                    { width: searchNumber },  // ✅ Search by Width if number
                    { entryDate: searchDate } // ✅ Search by Entry Date if valid date
                ] 
            };
        }

        // ✅ Ensure results are always sorted by roll number
        const records = await VinylRoll.find(query).sort("rollNumber");

        res.status(200).json(records);
    } catch (error) {
        console.error("❌ Error fetching vinyl rolls:", error);
        res.status(500).json({ error: "Failed to fetch vinyl rolls." });
    }
});

// ✅ Update (Edit) a Vinyl Roll
router.put('/:id', async (req, res) => {
    try {
        const vinylId = req.params.id;
        const updatedData = req.body;

        const updatedVinyl = await VinylRoll.findByIdAndUpdate(vinylId, updatedData, { new: true });

        if (!updatedVinyl) {
            return res.status(404).json({ error: "Vinyl roll not found." });
        }

        req.io.emit("updateVinyls"); // Notify frontend about update

        return res.status(200).json(updatedVinyl);
    } catch (error) {
        console.error("❌ Error updating vinyl:", error);
        return res.status(500).json({ error: "Failed to update vinyl." });
    }
});

// ✅ Get a single vinyl roll by ID
router.get('/:id', async (req, res) => {
    try {
        const vinyl = await VinylRoll.findById(req.params.id);
        if (!vinyl) {
            return res.status(404).json({ error: "Vinyl roll not found" });
        }
        res.status(200).json(vinyl);
    } catch (error) {
        console.error("❌ Error fetching vinyl details:", error);
        res.status(500).json({ error: "Failed to fetch vinyl details." });
    }
});

// ✅ Delete a vinyl roll & Renumber Remaining
router.delete('/:id', async (req, res) => {
    try {
        const vinyl = await VinylRoll.findById(req.params.id);
        if (!vinyl) {
            return res.status(404).json({ error: "Vinyl roll not found." });
        }

        // ✅ Step 1: Delete the Vinyl Roll
        await VinylRoll.findByIdAndDelete(req.params.id);

        // ✅ Step 2: Fetch Remaining Rolls Sorted by Roll Number
        const remainingRolls = await VinylRoll.find().sort({ rollNumber: 1 });

        // ✅ Step 3: Temporarily Remove `unique` Constraint (Workaround)
        await VinylRoll.collection.dropIndex("rollNumber_1").catch(err => console.log("No existing index to drop"));

        // ✅ Step 4: Renumber Rolls Sequentially to Avoid Duplicates
        for (let i = 0; i < remainingRolls.length; i++) {
            await VinylRoll.findByIdAndUpdate(remainingRolls[i]._id, { rollNumber: i + 1 });
        }

        // ✅ Step 5: Restore `unique` Index for Future Inserts
        await VinylRoll.collection.createIndex({ rollNumber: 1 }, { unique: true });

        // ✅ Emit update to frontend
        req.io.emit("updateVinyls");

        return res.json({ message: "Vinyl roll deleted and renumbered successfully" });
    } catch (error) {
        console.error("❌ Error deleting vinyl:", error);
        return res.status(500).json({ error: "Failed to delete vinyl roll." });
    }
});



module.exports = router;
