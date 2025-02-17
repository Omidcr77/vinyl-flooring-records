const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const vinylRoutes = require("./routes/vinylRoutes");
const soldRoutes = require("./routes/soldRoutes");
const customerRoutes = require("./routes/customerRoutes");
const customerDetailsRoutes = require("./routes/customerDetailsRoutes");
const multer = require("multer");



const http = require("http");
const { Server } = require("socket.io");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

// Attach io to app (Ensures Socket.io works inside routes)
app.set("io", io);
// ✅ Serve static files from uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// CORS Configuration
app.use(cors({ 
    origin: "*",
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type"],
}));

app.use(express.json());

app.use("/api/soldRecords", soldRoutes); // ✅ Add Sold Records Route


// ✅ Register API Routes
app.use("/api/vinyl", vinylRoutes);
app.use("/api/sold", soldRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/customers", customerDetailsRoutes);
app.use("/api/customerDetails", customerDetailsRoutes);


// 📂 Define Storage for Uploaded Images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/customers/"); // Save inside "uploads/customers"
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Rename file with timestamp
    }
});

// 🎯 File Filter: Accept Only Images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed!"), false);
    }
};

// 📦 Multer Middleware
const upload = multer({ storage: storage, fileFilter: fileFilter });

// ✅ Serve Static Files (To Access Uploaded Images)
app.use("/uploads", express.static("uploads"));


// ✅ Serve Frontend Static Files
const frontendPath = path.join(__dirname, "../frontend");
app.use(express.static(frontendPath));

// ✅ Ensure API requests don’t return HTML by handling unknown API routes
app.use("/api/*", (req, res) => {
    res.status(404).json({ error: "API route not found." });
});

// ✅ Serve `index.html` only for non-API routes
app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

// ✅ Socket.io Connection Handling
io.on("connection", (socket) => {
    console.log("🔌 A user connected");

    // Notify when a new vinyl is added
    socket.on("newVinyl", () => {
        io.emit("updateVinyls");
    });

    // Notify when a new sale is made
    socket.on("newSale", () => {
        io.emit("updateSoldRecords");
    });

    // ✅ Notify when a new customer is added
    socket.on("newCustomer", async (customerData) => {
        try {
            const newCustomer = new Customer(customerData);
            await newCustomer.save();
            io.emit("customerAdded", newCustomer); // Notify all clients
        } catch (error) {
            console.error("Error adding customer:", error);
        }
    });

    // ✅ Notify when a customer's balance is updated
    socket.on("updateBalance", async ({ customerId, newBalance }) => {
        try {
            const customer = await Customer.findById(customerId);
            if (customer) {
                customer.balance = newBalance;
                await customer.save();
                io.emit("balanceUpdated", customer);
            }
        } catch (error) {
            console.error("Error updating balance:", error);
        }
    });

    // ✅ Notify when a customer is deleted
    socket.on("deleteCustomer", async (customerId) => {
        try {
            await Customer.findByIdAndDelete(customerId);
            io.emit("customerDeleted", customerId);
        } catch (error) {
            console.error("Error deleting customer:", error);
        }
    });

    socket.on("disconnect", () => {
        console.log("🔌 A user disconnected");
    });
});


// ✅ Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("❌ Server Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
