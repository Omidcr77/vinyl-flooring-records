require("dotenv").config();
const mongoose = require("mongoose");
const VinylRoll = require("./models/VinylRoll"); // Ensure this path is correct

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// New Vinyl Records to Add
const newVinylRecords = [
    { vinylName: "Classic Oak", type: "Vinyl", color: "Brown", length: 50, width: 2, details: "High-quality oak texture" },
    { vinylName: "Modern Grey", type: "PVC", color: "Grey", length: 42, width: 3, details: "Minimalist modern design" },
    { vinylName: "Rustic Wood", type: "Linoleum", color: "Beige", length: 30, width: 1.5, details: "Rustic feel with durability" },
    { vinylName: "Marble Touch", type: "Vinyl", color: "White", length: 55, width: 2.5, details: "Elegant marble-like finish" },
    { vinylName: "Dark Walnut", type: "PVC", color: "Black", length: 48, width: 2, details: "Rich walnut-inspired pattern" },
    { vinylName: "Golden Maple", type: "Linoleum", color: "Yellow", length: 60, width: 3, details: "Warm maple wood effect" },
    { vinylName: "Ocean Blue", type: "Vinyl", color: "Blue", length: 45, width: 2.2, details: "Deep blue ocean-inspired design" },
    { vinylName: "Urban Concrete", type: "PVC", color: "Grey", length: 35, width: 1.8, details: "Industrial-style concrete look" },
    { vinylName: "Cherry Red", type: "Linoleum", color: "Red", length: 40, width: 2, details: "Vibrant cherry wood imitation" },
    { vinylName: "Elegant Beige", type: "Vinyl", color: "Beige", length: 52, width: 2.5, details: "Subtle and timeless design" }
];

// Function to Get Next Available Roll Number
const getNextRollNumber = async () => {
    const lastRoll = await VinylRoll.findOne().sort("-rollNumber").select("rollNumber");
    return lastRoll ? lastRoll.rollNumber + 1 : 1;
};

// Insert Data into MongoDB
const insertVinyls = async () => {
    try {
        const nextRollNumber = await getNextRollNumber();
        const vinylsWithNumbers = newVinylRecords.map((vinyl, index) => ({
            ...vinyl,
            rollNumber: nextRollNumber + index, // Assign unique rollNumber
            entryDate: new Date()
        }));

        await VinylRoll.insertMany(vinylsWithNumbers);
        console.log(`✅ Successfully added ${vinylsWithNumbers.length} vinyl records.`);
    } catch (error) {
        console.error("❌ Error inserting records:", error);
    } finally {
        mongoose.connection.close();
    }
};

// Run the Insert Function
insertVinyls();
